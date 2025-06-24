# Site Control MCP

A powerful Model Context Protocol (MCP) server for managing website content through Contentful CMS. Originally built for AI tool websites, this server provides comprehensive content management capabilities across multiple AI clients.

## 🚀 Features

- **AI Tool Management**: Add, update, and organize AI tools in your content database
- **SEO Optimization**: Manage meta descriptions, keywords, and page optimization
- **Content Quality Control**: Automated checks for missing data, broken links, and outdated content
- **Bulk Operations**: Update multiple items simultaneously
- **Multi-Client Support**: Works with Claude Desktop, Windsurf, Cursor, and Claude Code

## 🛠️ Supported Clients

- **Claude Desktop** - Desktop application
- **Claude Code** - VS Code extension  
- **Windsurf** - Codeium's AI editor
- **Cursor** - AI-powered editor

## 📦 Installation

### Method 1: Global NPM Installation
```bash
npm install -g @endlessblink/site-control-mcp
```

### Method 2: Clone Repository
```bash
git clone https://github.com/endlessblink/Site-Control-MCP.git
cd Site-Control-MCP
npm install
```

### Method 3: Direct Download
Download the latest release and extract to your preferred location.

## 🔒 Security Notice

**⚠️ This repository is public!** Never commit actual API keys, tokens, or credentials.

- All config files use placeholder values
- Copy `local-config-template.json` for your actual setup
- See `SECURITY.md` for detailed security guidelines
- Use environment variables for sensitive data

## ⚙️ Setup

### 1. Environment Configuration
Copy `.env.example` to `.env` and configure:

```bash
CONTENTFUL_SPACE_ID=your_space_id_here
CONTENTFUL_DELIVERY_TOKEN=your_delivery_token_here
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token_here
CONTENTFUL_ENVIRONMENT=master
```

### 2. Client Configuration

Choose your preferred AI client and follow the setup guide:

#### Claude Desktop
Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "site-control-mcp": {
      "command": "site-control-mcp",
      "env": {
        "CONTENTFUL_SPACE_ID": "your_space_id",
        "CONTENTFUL_DELIVERY_TOKEN": "your_delivery_token",
        "CONTENTFUL_MANAGEMENT_TOKEN": "your_management_token"
      }
    }
  }
}
```

#### Windsurf / Cursor
Create `.windsurf/settings.json` or `.cursor/settings.json`:
```json
{
  "mcp": {
    "servers": {
      "site-control-mcp": {
        "command": "node",
        "args": ["./path/to/server.js"],
        "env": { ... }
      }
    }
  }
}
```

See `MULTI_CLIENT_SETUP.md` for detailed configuration instructions.

## 🎯 Usage Examples

Once configured, you can use natural language commands in your AI client:

### Content Management
```bash
# Check content status
"Show me the status of all AI tools on my site"

# Add new tools
"Add Perplexity AI as a new search and research tool"

# Update existing content
"Update ChatGPT pricing to $25/month for Team plan"
```

### Bulk Operations
```bash
# Fix missing data
"Add missing URLs to all tools that don't have them"
"Add default features to tools without feature lists"

# Content quality
"Find all tools that haven't been updated in 30 days"
"Check for broken URLs across all content"
```

### SEO Management
```bash
# Optimize pages
"Update meta descriptions for the AI tools page"
"Generate new keywords for the models page"
"Optimize page titles for better SEO"
```

## 📋 Available MCP Tools

- `add_ai_tool` - Add new AI tools to your database
- `update_ai_tool` - Update existing tool information
- `list_ai_tools` - List and filter tools
- `add_ai_model` - Add AI model information
- `check_content_quality` - Validate content completeness
- `search_content` - Search across all content
- `update_seo` - Manage SEO metadata

## 🔧 Development

### Running Locally
```bash
# Start the MCP server
npm start

# Development mode
npm run dev
```

### Testing
```bash
# Test MCP connectivity
npm test

# Manual testing
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node server.js
```

## 📚 Documentation

- `MCP_USAGE_GUIDE.md` - Comprehensive usage instructions
- `MULTI_CLIENT_SETUP.md` - Client-specific setup guides

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/endlessblink/Site-Control-MCP/issues)
- **Documentation**: See included markdown files
- **Examples**: Check the usage guide for common scenarios

## 🔗 Related Projects

- [Bina Bekitzur](https://github.com/endlessblink/bina-ai-spark) - The AI tools website this MCP was originally built for
- [Model Context Protocol](https://github.com/modelcontextprotocol) - Official MCP specification

---

Made with ❤️ for the AI development community