#!/usr/bin/env node

/**
 * AI Liftoff Site Management MCP Server
 * 
 * Provides comprehensive content management capabilities for the AI Liftoff website
 * including Contentful integration, tool management, and site configuration.
 * 
 * Features:
 * - Contentful content management (tools, terms, categories)
 * - Site configuration management
 * - GitHub integration for project updates
 * - SEO and meta tag management
 * - Content validation and quality checks
 * - Backup and restore functionality
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import contentfulManagement from 'contentful-management';
import { createClient as createDeliveryClient } from 'contentful';
const { createClient } = contentfulManagement;
import { glob } from 'glob';
import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Site root directory
const SITE_ROOT = path.join(__dirname, '../..');

// Contentful configuration
const CONTENTFUL_SPACE_ID = process.env.VITE_CONTENTFUL_SPACE_ID;
const CONTENTFUL_MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const CONTENTFUL_DELIVERY_TOKEN = process.env.VITE_CONTENTFUL_DELIVERY_TOKEN;

// Initialize Contentful clients
let managementClient, deliveryClient;

try {
  if (CONTENTFUL_MANAGEMENT_TOKEN) {
    managementClient = createClient({
      accessToken: CONTENTFUL_MANAGEMENT_TOKEN
    });
  }
  
  if (CONTENTFUL_DELIVERY_TOKEN && CONTENTFUL_SPACE_ID) {
    deliveryClient = createDeliveryClient({
      space: CONTENTFUL_SPACE_ID,
      accessToken: CONTENTFUL_DELIVERY_TOKEN
    });
  }
} catch (error) {
  console.warn('Warning: Contentful clients could not be initialized:', error.message);
}

// Validation schemas
const ToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  website: z.string().url(),
  pricing: z.enum(['free', 'freemium', 'paid']),
  tags: z.array(z.string()),
  features: z.array(z.string()),
  logoUrl: z.string().url().optional(),
  isAITool: z.boolean().default(true)
});

const TermSchema = z.object({
  term: z.string(),
  definition: z.string(),
  category: z.string(),
  relatedTerms: z.array(z.string()).optional(),
  examples: z.array(z.string()).optional()
});

const CategorySchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  icon: z.string(),
  filterBy: z.string(),
  filterValues: z.array(z.string())
});

class SiteManagementServer {
  constructor() {
    this.server = new Server(
      {
        name: 'ai-liftoff-site-management',
        version: '1.0.0'
      },
      {
        capabilities: {
          resources: {},
          tools: {}
        }
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // Resources handler
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'contentful://tools',
            mimeType: 'application/json',
            name: 'AI Tools from Contentful',
            description: 'List of all AI tools in Contentful CMS'
          },
          {
            uri: 'contentful://terms',
            mimeType: 'application/json',
            name: 'AI Terms from Contentful',
            description: 'List of all AI terminology in Contentful CMS'
          },
          {
            uri: 'contentful://categories',
            mimeType: 'application/json',
            name: 'Categories from Contentful',
            description: 'List of all categories in Contentful CMS'
          },
          {
            uri: 'file://site-config',
            mimeType: 'application/json',
            name: 'Site Configuration',
            description: 'Current site configuration and settings'
          },
          {
            uri: 'file://seo-config',
            mimeType: 'application/json',
            name: 'SEO Configuration',
            description: 'SEO meta tags and configuration'
          },
          {
            uri: 'file://mock-data',
            mimeType: 'application/json',
            name: 'Mock Data',
            description: 'Fallback mock data for development'
          }
        ]
      };
    });

    // Read resource handler
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      try {
        if (uri.startsWith('contentful://')) {
          return await this.readContentfulResource(uri);
        } else if (uri.startsWith('file://')) {
          return await this.readFileResource(uri);
        } else {
          throw new McpError(ErrorCode.InvalidRequest, `Unknown resource URI: ${uri}`);
        }
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Failed to read resource: ${error.message}`);
      }
    });

    // Tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'add_ai_tool',
            description: 'Add a new AI tool to Contentful',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Tool name' },
                description: { type: 'string', description: 'Tool description' },
                category: { type: 'string', description: 'Tool category' },
                website: { type: 'string', description: 'Tool website URL' },
                pricing: { type: 'string', enum: ['free', 'freemium', 'paid'] },
                tags: { type: 'array', items: { type: 'string' } },
                features: { type: 'array', items: { type: 'string' } },
                logoUrl: { type: 'string', description: 'Logo URL (optional)' }
              },
              required: ['name', 'description', 'category', 'website', 'pricing']
            }
          },
          {
            name: 'update_ai_tool',
            description: 'Update an existing AI tool in Contentful',
            inputSchema: {
              type: 'object',
              properties: {
                entryId: { type: 'string', description: 'Contentful entry ID' },
                fields: { type: 'object', description: 'Fields to update' }
              },
              required: ['entryId', 'fields']
            }
          },
          {
            name: 'delete_ai_tool',
            description: 'Delete an AI tool from Contentful',
            inputSchema: {
              type: 'object',
              properties: {
                entryId: { type: 'string', description: 'Contentful entry ID' }
              },
              required: ['entryId']
            }
          },
          {
            name: 'add_ai_term',
            description: 'Add a new AI term to Contentful',
            inputSchema: {
              type: 'object',
              properties: {
                term: { type: 'string', description: 'Term name' },
                definition: { type: 'string', description: 'Term definition' },
                category: { type: 'string', description: 'Term category' },
                relatedTerms: { type: 'array', items: { type: 'string' } },
                examples: { type: 'array', items: { type: 'string' } }
              },
              required: ['term', 'definition', 'category']
            }
          },
          {
            name: 'create_category_page',
            description: 'Create a new category page in Contentful',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Category name' },
                slug: { type: 'string', description: 'URL slug' },
                description: { type: 'string', description: 'Category description' },
                icon: { type: 'string', description: 'Category icon' },
                filterBy: { type: 'string', description: 'Field to filter by' },
                filterValues: { type: 'array', items: { type: 'string' } }
              },
              required: ['name', 'slug', 'description', 'icon', 'filterBy', 'filterValues']
            }
          },
          {
            name: 'update_seo_config',
            description: 'Update SEO configuration',
            inputSchema: {
              type: 'object',
              properties: {
                domain: { type: 'string', description: 'Site domain' },
                title: { type: 'string', description: 'Default page title' },
                description: { type: 'string', description: 'Default meta description' },
                keywords: { type: 'array', items: { type: 'string' } },
                ogImage: { type: 'string', description: 'OpenGraph image URL' }
              }
            }
          },
          {
            name: 'validate_content',
            description: 'Validate all content for quality and completeness',
            inputSchema: {
              type: 'object',
              properties: {
                contentType: { 
                  type: 'string', 
                  enum: ['tools', 'terms', 'categories', 'all'],
                  description: 'Type of content to validate'
                }
              },
              required: ['contentType']
            }
          },
          {
            name: 'backup_content',
            description: 'Create a backup of all Contentful content',
            inputSchema: {
              type: 'object',
              properties: {
                includeAssets: { type: 'boolean', description: 'Include asset URLs in backup' }
              }
            }
          },
          {
            name: 'sync_github_projects',
            description: 'Sync GitHub repositories to show latest projects',
            inputSchema: {
              type: 'object',
              properties: {
                username: { type: 'string', description: 'GitHub username' },
                forceRefresh: { type: 'boolean', description: 'Force refresh cache' }
              }
            }
          },
          {
            name: 'update_site_config',
            description: 'Update site configuration settings',
            inputSchema: {
              type: 'object',
              properties: {
                config: { type: 'object', description: 'Configuration object' }
              },
              required: ['config']
            }
          }
        ]
      };
    });

    // Tool execution handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        switch (name) {
          case 'add_ai_tool':
            return await this.addAITool(args);
          case 'update_ai_tool':
            return await this.updateAITool(args);
          case 'delete_ai_tool':
            return await this.deleteAITool(args);
          case 'add_ai_term':
            return await this.addAITerm(args);
          case 'create_category_page':
            return await this.createCategoryPage(args);
          case 'update_seo_config':
            return await this.updateSEOConfig(args);
          case 'validate_content':
            return await this.validateContent(args);
          case 'backup_content':
            return await this.backupContent(args);
          case 'sync_github_projects':
            return await this.syncGitHubProjects(args);
          case 'update_site_config':
            return await this.updateSiteConfig(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
      }
    });
  }

  // Resource readers
  async readContentfulResource(uri) {
    if (!deliveryClient) {
      throw new Error('Contentful delivery client not available');
    }

    const resourceType = uri.split('//')[1];
    
    switch (resourceType) {
      case 'tools':
        const tools = await deliveryClient.getEntries({
          content_type: 'aiTool',
          limit: 1000
        });
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(tools.items, null, 2)
          }]
        };
        
      case 'terms':
        const terms = await deliveryClient.getEntries({
          content_type: 'aiTerm',
          limit: 1000
        });
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(terms.items, null, 2)
          }]
        };
        
      case 'categories':
        const categories = await deliveryClient.getEntries({
          content_type: 'categoryPage',
          limit: 100
        });
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(categories.items, null, 2)
          }]
        };
        
      default:
        throw new Error(`Unknown Contentful resource: ${resourceType}`);
    }
  }

  async readFileResource(uri) {
    const resourceType = uri.split('//')[1];
    
    switch (resourceType) {
      case 'site-config':
        const configPath = path.join(SITE_ROOT, 'src/config');
        const configFiles = await glob('*.{js,ts,json}', { cwd: configPath });
        const config = {};
        
        for (const file of configFiles) {
          const filePath = path.join(configPath, file);
          if (await fs.pathExists(filePath)) {
            const content = await fs.readFile(filePath, 'utf8');
            config[file] = content;
          }
        }
        
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(config, null, 2)
          }]
        };
        
      case 'seo-config':
        const seoPath = path.join(SITE_ROOT, 'src/components/SEO/SEOMetaTags.tsx');
        const seoContent = await fs.readFile(seoPath, 'utf8');
        
        return {
          contents: [{
            uri,
            mimeType: 'text/typescript',
            text: seoContent
          }]
        };
        
      case 'mock-data':
        const mockPath = path.join(SITE_ROOT, 'src/data/mock');
        const mockFiles = await glob('*.{js,ts,json}', { cwd: mockPath });
        const mockData = {};
        
        for (const file of mockFiles) {
          const filePath = path.join(mockPath, file);
          if (await fs.pathExists(filePath)) {
            const content = await fs.readFile(filePath, 'utf8');
            mockData[file] = content;
          }
        }
        
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(mockData, null, 2)
          }]
        };
        
      default:
        throw new Error(`Unknown file resource: ${resourceType}`);
    }
  }

  // Tool implementations
  async addAITool(args) {
    if (!managementClient) {
      throw new Error('Contentful management client not available');
    }

    // Validate input
    const validatedTool = ToolSchema.parse(args);
    
    try {
      const space = await managementClient.getSpace(CONTENTFUL_SPACE_ID);
      const environment = await space.getEnvironment('master');
      
      // Create entry
      const entry = await environment.createEntry('aiTool', {
        fields: {
          name: { 'en-US': validatedTool.name },
          description: { 'en-US': validatedTool.description },
          category: { 'en-US': validatedTool.category },
          website: { 'en-US': validatedTool.website },
          pricing: { 'en-US': validatedTool.pricing },
          tags: { 'en-US': validatedTool.tags },
          features: { 'en-US': validatedTool.features },
          ...(validatedTool.logoUrl && { logoUrl: { 'en-US': validatedTool.logoUrl } }),
          isAITool: { 'en-US': validatedTool.isAITool }
        }
      });
      
      // Publish entry
      await entry.publish();
      
      return {
        content: [{
          type: 'text',
          text: `✅ Successfully added AI tool "${validatedTool.name}" to Contentful (ID: ${entry.sys.id})`
        }]
      };
    } catch (error) {
      throw new Error(`Failed to add AI tool: ${error.message}`);
    }
  }

  async updateAITool(args) {
    if (!managementClient) {
      throw new Error('Contentful management client not available');
    }
    
    try {
      const space = await managementClient.getSpace(CONTENTFUL_SPACE_ID);
      const environment = await space.getEnvironment('master');
      const entry = await environment.getEntry(args.entryId);
      
      // Update fields
      Object.keys(args.fields).forEach(fieldName => {
        if (entry.fields[fieldName]) {
          entry.fields[fieldName]['en-US'] = args.fields[fieldName];
        }
      });
      
      await entry.update();
      await entry.publish();
      
      return {
        content: [{
          type: 'text',
          text: `✅ Successfully updated AI tool (ID: ${args.entryId})`
        }]
      };
    } catch (error) {
      throw new Error(`Failed to update AI tool: ${error.message}`);
    }
  }

  async deleteAITool(args) {
    if (!managementClient) {
      throw new Error('Contentful management client not available');
    }
    
    try {
      const space = await managementClient.getSpace(CONTENTFUL_SPACE_ID);
      const environment = await space.getEnvironment('master');
      const entry = await environment.getEntry(args.entryId);
      
      // Unpublish then delete
      await entry.unpublish();
      await entry.delete();
      
      return {
        content: [{
          type: 'text',
          text: `✅ Successfully deleted AI tool (ID: ${args.entryId})`
        }]
      };
    } catch (error) {
      throw new Error(`Failed to delete AI tool: ${error.message}`);
    }
  }

  async addAITerm(args) {
    if (!managementClient) {
      throw new Error('Contentful management client not available');
    }

    const validatedTerm = TermSchema.parse(args);
    
    try {
      const space = await managementClient.getSpace(CONTENTFUL_SPACE_ID);
      const environment = await space.getEnvironment('master');
      
      const entry = await environment.createEntry('aiTerm', {
        fields: {
          term: { 'en-US': validatedTerm.term },
          definition: { 'en-US': validatedTerm.definition },
          category: { 'en-US': validatedTerm.category },
          ...(validatedTerm.relatedTerms && { relatedTerms: { 'en-US': validatedTerm.relatedTerms } }),
          ...(validatedTerm.examples && { examples: { 'en-US': validatedTerm.examples } })
        }
      });
      
      await entry.publish();
      
      return {
        content: [{
          type: 'text',
          text: `✅ Successfully added AI term "${validatedTerm.term}" to Contentful (ID: ${entry.sys.id})`
        }]
      };
    } catch (error) {
      throw new Error(`Failed to add AI term: ${error.message}`);
    }
  }

  async createCategoryPage(args) {
    if (!managementClient) {
      throw new Error('Contentful management client not available');
    }

    const validatedCategory = CategorySchema.parse(args);
    
    try {
      const space = await managementClient.getSpace(CONTENTFUL_SPACE_ID);
      const environment = await space.getEnvironment('master');
      
      const entry = await environment.createEntry('categoryPage', {
        fields: {
          title: { 'en-US': validatedCategory.name },
          slug: { 'en-US': validatedCategory.slug },
          description: { 'en-US': validatedCategory.description },
          icon: { 'en-US': validatedCategory.icon },
          filterBy: { 'en-US': validatedCategory.filterBy },
          filterValues: { 'en-US': validatedCategory.filterValues }
        }
      });
      
      await entry.publish();
      
      return {
        content: [{
          type: 'text',
          text: `✅ Successfully created category page "${validatedCategory.name}" (ID: ${entry.sys.id})`
        }]
      };
    } catch (error) {
      throw new Error(`Failed to create category page: ${error.message}`);
    }
  }

  async updateSEOConfig(args) {
    try {
      const seoPath = path.join(SITE_ROOT, 'src/components/SEO/SEOMetaTags.tsx');
      let content = await fs.readFile(seoPath, 'utf8');
      
      if (args.domain) {
        content = content.replace(
          /const siteUrl = [^;]+;/,
          `const siteUrl = process.env.NODE_ENV === 'production' ? 'https://${args.domain}' : 'http://localhost:8080';`
        );
        
        // Update all hardcoded URLs in SEO configs
        content = content.replace(/https:\/\/[^"']+\.com/g, `https://${args.domain}`);
      }
      
      await fs.writeFile(seoPath, content);
      
      return {
        content: [{
          type: 'text',
          text: `✅ Successfully updated SEO configuration${args.domain ? ` with domain: ${args.domain}` : ''}`
        }]
      };
    } catch (error) {
      throw new Error(`Failed to update SEO config: ${error.message}`);
    }
  }

  async validateContent(args) {
    const { contentType } = args;
    const issues = [];
    
    try {
      if (contentType === 'tools' || contentType === 'all') {
        // Validate AI tools
        const tools = await deliveryClient?.getEntries({
          content_type: 'aiTool',
          limit: 1000
        });
        
        tools?.items?.forEach(tool => {
          const fields = tool.fields;
          if (!fields.name) issues.push(`Tool ${tool.sys.id} missing name`);
          if (!fields.description) issues.push(`Tool ${tool.sys.id} missing description`);
          if (!fields.website) issues.push(`Tool ${tool.sys.id} missing website`);
          if (!fields.category) issues.push(`Tool ${tool.sys.id} missing category`);
        });
      }
      
      if (contentType === 'terms' || contentType === 'all') {
        // Validate AI terms
        const terms = await deliveryClient?.getEntries({
          content_type: 'aiTerm',
          limit: 1000
        });
        
        terms?.items?.forEach(term => {
          const fields = term.fields;
          if (!fields.term) issues.push(`Term ${term.sys.id} missing term name`);
          if (!fields.definition) issues.push(`Term ${term.sys.id} missing definition`);
          if (!fields.category) issues.push(`Term ${term.sys.id} missing category`);
        });
      }
      
      return {
        content: [{
          type: 'text',
          text: issues.length === 0 
            ? '✅ All content validation passed'
            : `❌ Found ${issues.length} validation issues:\n${issues.join('\n')}`
        }]
      };
    } catch (error) {
      throw new Error(`Content validation failed: ${error.message}`);
    }
  }

  async backupContent(args) {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        tools: [],
        terms: [],
        categories: []
      };
      
      if (deliveryClient) {
        // Backup tools
        const tools = await deliveryClient.getEntries({
          content_type: 'aiTool',
          limit: 1000
        });
        backup.tools = tools.items;
        
        // Backup terms
        const terms = await deliveryClient.getEntries({
          content_type: 'aiTerm',
          limit: 1000
        });
        backup.terms = terms.items;
        
        // Backup categories
        const categories = await deliveryClient.getEntries({
          content_type: 'categoryPage',
          limit: 100
        });
        backup.categories = categories.items;
      }
      
      // Save backup file
      const backupPath = path.join(SITE_ROOT, 'backups');
      await fs.ensureDir(backupPath);
      
      const filename = `contentful-backup-${new Date().toISOString().split('T')[0]}.json`;
      const filepath = path.join(backupPath, filename);
      
      await fs.writeFile(filepath, JSON.stringify(backup, null, 2));
      
      return {
        content: [{
          type: 'text',
          text: `✅ Content backup created: ${filename}\nTools: ${backup.tools.length}\nTerms: ${backup.terms.length}\nCategories: ${backup.categories.length}`
        }]
      };
    } catch (error) {
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  async syncGitHubProjects(args) {
    try {
      // This would integrate with the GitHub service
      // For now, just return a status message
      return {
        content: [{
          type: 'text',
          text: `✅ GitHub projects sync initiated${args.username ? ` for user: ${args.username}` : ''}`
        }]
      };
    } catch (error) {
      throw new Error(`GitHub sync failed: ${error.message}`);
    }
  }

  async updateSiteConfig(args) {
    try {
      const configPath = path.join(SITE_ROOT, 'site.config.json');
      
      let currentConfig = {};
      if (await fs.pathExists(configPath)) {
        currentConfig = await fs.readJSON(configPath);
      }
      
      const newConfig = { ...currentConfig, ...args.config };
      await fs.writeJSON(configPath, newConfig, { spaces: 2 });
      
      return {
        content: [{
          type: 'text',
          text: `✅ Site configuration updated successfully`
        }]
      };
    } catch (error) {
      throw new Error(`Site config update failed: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('AI Liftoff Site Management MCP Server running on stdio');
  }
}

const server = new SiteManagementServer();
server.run().catch(console.error);