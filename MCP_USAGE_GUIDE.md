# MCP Site Management Usage Guide

## Setup & Installation

### 1. First Time Setup
```bash
cd mcp-servers/site-management
npm install
cp .env.example .env
# Edit .env with your Contentful credentials
```

### 2. Configure in Claude Code
```bash
# In Claude Code terminal:
claude mcp add /path/to/bina-bekitzur/mcp-servers/site-management/server.js --name "bina-site-manager"

# Restart Claude Code to activate
```

## Available MCP Tools

### 1. **add_ai_tool** - Add new AI tools
```javascript
// Example: Add a new AI tool
{
  "name": "GPT-4 Vision",
  "description": "מודל AI מתקדם לניתוח תמונות וטקסט",
  "category": "ראייה ממוחשבת",
  "url": "https://openai.com/gpt-4",
  "features": ["ניתוח תמונות", "הבנת טקסט", "יצירת קוד"],
  "pricing": "בתשלום",
  "tags": ["computer-vision", "multimodal", "openai"]
}
```

### 2. **update_ai_tool** - Update existing tools
```javascript
// Example: Update tool pricing
{
  "id": "tool-id-here",
  "updates": {
    "pricing": "חינמי עם מגבלות",
    "features": ["תכונה חדשה"]
  }
}
```

### 3. **list_ai_tools** - List all tools
```javascript
// Get all tools or filter
{
  "category": "קוד ופיתוח",  // Optional filter
  "limit": 10
}
```

### 4. **add_ai_model** - Add new AI models
```javascript
{
  "name": "Claude 3 Opus",
  "description": "מודל שפה מתקדם של Anthropic",
  "provider": "Anthropic",
  "capabilities": ["כתיבת קוד", "ניתוח מסמכים", "שיחה"],
  "apiAvailable": true,
  "openSource": false
}
```

### 5. **check_content_quality** - Validate all content
```javascript
// No parameters needed - checks all content
{}
```

### 6. **search_content** - Search across all content
```javascript
{
  "query": "GPT",
  "contentType": "tools"  // or "models", "terms"
}
```

### 7. **update_seo** - Update SEO metadata
```javascript
{
  "path": "/tools",
  "title": "כלי AI מומלצים - 2024",
  "description": "רשימת כלי בינה מלאכותית מעודכנת",
  "keywords": ["AI tools", "כלי בינה מלאכותית"]
}
```

## Common Tasks

### Check if AI Tools are Up to Date
```bash
# Use Claude Code with MCP:
/use bina-site-manager

# Then ask:
"Check all AI tools for outdated information"
"List all tools that haven't been updated in 30 days"
"Find tools with missing pricing information"
```

### Bulk Update Tools
```bash
# In Claude Code:
"Update all OpenAI tools to reflect new GPT-4 pricing"
"Add 'requires-api-key' tag to all paid tools"
"Mark discontinued tools as archived"
```

### Content Quality Checks
```bash
# Regular maintenance:
"Run content quality check for all AI tools"
"Find tools with broken URLs"
"List tools missing Hebrew descriptions"
```

## Automation Scripts

### 1. Weekly Content Audit
Create `scripts/content-audit.js`:
```javascript
import { createClient } from 'contentful-management';

async function auditContent() {
  const client = createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
  });
  
  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
  const environment = await space.getEnvironment('master');
  
  // Check for outdated tools
  const tools = await environment.getEntries({
    content_type: 'aiTool',
    'sys.updatedAt[lte]': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  });
  
  console.log(`Found ${tools.items.length} tools not updated in 30 days`);
  
  // Check for missing fields
  const missingData = tools.items.filter(tool => 
    !tool.fields.pricing || 
    !tool.fields.features || 
    !tool.fields.url
  );
  
  console.log(`${missingData.length} tools have missing data`);
  
  return {
    outdated: tools.items.map(t => t.fields.name),
    incomplete: missingData.map(t => t.fields.name)
  };
}
```

### 2. Price Checker
Create `scripts/check-prices.js`:
```javascript
// Script to verify tool pricing is current
async function checkPricing() {
  // List of tools to check
  const toolsToCheck = [
    { name: 'ChatGPT', expectedPricing: '$20/month for Plus' },
    { name: 'Claude', expectedPricing: '$20/month for Pro' },
    { name: 'Midjourney', expectedPricing: '$10-$120/month' }
  ];
  
  // Use MCP to check each tool
  for (const tool of toolsToCheck) {
    console.log(`Checking ${tool.name}...`);
    // Compare with current data
  }
}
```

## Best Practices

1. **Regular Audits**: Run content quality checks weekly
2. **Batch Updates**: Group similar updates together
3. **Version Tracking**: Keep notes on major content changes
4. **SEO Updates**: Update meta descriptions seasonally
5. **URL Validation**: Check external links monthly

## Example Workflow

### Adding New AI Tools Discovery
```bash
# 1. Search if tool exists
"Search for Gemini AI tool"

# 2. If not found, add it
"Add Google Gemini as new AI tool with multimodal capabilities"

# 3. Verify addition
"Show me the newly added Gemini tool"

# 4. Update related tools
"Update all Google AI tools to include Gemini in related tools"
```

### Monthly Maintenance
```bash
# 1. Quality check
"Run full content quality check"

# 2. Update outdated
"List tools updated before January 2024"
"Update pricing for all listed tools"

# 3. SEO refresh  
"Update SEO descriptions for top 10 tools"

# 4. Broken links
"Check all tool URLs for 404 errors"
```

## Troubleshooting

### MCP Not Working?
1. Restart Claude Code after configuration
2. Check server.js is executable
3. Verify .env has correct credentials
4. Check console for errors

### Contentful Errors?
1. Verify API tokens are valid
2. Check space ID is correct
3. Ensure content types exist
4. Check rate limits

## Quick Commands Cheatsheet

```bash
# List all tools
"Show all AI tools"

# Find specific tools  
"Find all free AI coding tools"

# Update tool
"Update ChatGPT pricing to $25/month"

# Add new tool
"Add Perplexity AI as new search tool"

# Quality check
"Check content quality for all tools"

# SEO update
"Update meta description for tools page"

# Bulk operations
"Add 'new' tag to all tools added this month"
"Remove 'beta' tag from stable tools"
```

## Environment Variables (.env)
```bash
CONTENTFUL_SPACE_ID=your_space_id_here
CONTENTFUL_DELIVERY_TOKEN=your_delivery_token_here
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token_here
CONTENTFUL_ENVIRONMENT=master
```

Remember: Always test updates in a non-production environment first!