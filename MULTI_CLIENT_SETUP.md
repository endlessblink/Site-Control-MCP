# Multi-Client MCP Setup Guide

## Current Server Location
📍 **Local Path:** `/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Web Dev/Bina-Bekitzur-Main/mcp-servers/site-management/`

## Backup Strategy Recommendation

### Option 1: Separate Repository (Recommended)
Create a dedicated repository for the MCP server:

```bash
# Create new repository
mkdir bina-site-management-mcp
cd bina-site-management-mcp
git init
git remote add origin https://github.com/endlessblink/bina-site-management-mcp.git

# Copy MCP server files
cp -r "/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Web Dev/Bina-Bekitzur-Main/mcp-servers/site-management/*" .

# Commit and push
git add .
git commit -m "Initial MCP server for Bina site management"
git push -u origin main
```

**Benefits:**
- ✅ Standalone server - can be used across multiple projects
- ✅ Version control for MCP server separately
- ✅ Easy to share and distribute
- ✅ Can be installed globally via npm/git

### Option 2: Keep in Main Repository
Keep the server in the main site repository as a submodule:

```bash
# In main repository
git add mcp-servers/
git commit -m "Add MCP site management server"
git push
```

**Benefits:**
- ✅ Everything in one place
- ✅ Site and MCP server versioned together
- ✅ Simpler deployment

## Client-Specific Setup Instructions

### 1. Claude Desktop Client

**File Location:** `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or `~/.config/claude/claude_desktop_config.json` (Linux/Mac)

```json
{
  "mcpServers": {
    "bina-site-manager": {
      "command": "node",
      "args": [
        "/absolute/path/to/bina-bekitzur/mcp-servers/site-management/server.js"
      ],
      "env": {
        "CONTENTFUL_SPACE_ID": "hd99ode6traw",
        "CONTENTFUL_DELIVERY_TOKEN": "your_delivery_token_here",
        "CONTENTFUL_MANAGEMENT_TOKEN": "your_management_token_here",
        "CONTENTFUL_ENVIRONMENT": "master"
      }
    }
  }
}
```

**Setup Steps:**
1. Edit the config file above
2. Update the path to match your system
3. Add your Contentful tokens
4. Restart Claude Desktop

### 2. Windsurf

**File Location:** Create `.windsurf/settings.json` in your project root

```json
{
  "mcp": {
    "servers": {
      "bina-site-manager": {
        "command": "node",
        "args": [
          "./mcp-servers/site-management/server.js"
        ],
        "env": {
          "CONTENTFUL_SPACE_ID": "hd99ode6traw",
          "CONTENTFUL_DELIVERY_TOKEN": "your_delivery_token_here",
          "CONTENTFUL_MANAGEMENT_TOKEN": "your_management_token_here",
          "CONTENTFUL_ENVIRONMENT": "master"
        }
      }
    }
  }
}
```

**Setup Steps:**
1. Create `.windsurf` folder in project root
2. Add `settings.json` with the config above
3. Update tokens in the configuration
4. Restart Windsurf

### 3. Cursor

**File Location:** `.cursor/settings.json` in your project root

```json
{
  "mcpServers": {
    "bina-site-manager": {
      "command": "node",
      "args": [
        "./mcp-servers/site-management/server.js"
      ],
      "env": {
        "CONTENTFUL_SPACE_ID": "hd99ode6traw",
        "CONTENTFUL_DELIVERY_TOKEN": "your_delivery_token_here",
        "CONTENTFUL_MANAGEMENT_TOKEN": "your_management_token_here",
        "CONTENTFUL_ENVIRONMENT": "master"
      }
    }
  }
}
```

**Setup Steps:**
1. Create `.cursor` folder in project root
2. Add `settings.json` with the config above
3. Update tokens in the configuration
4. Restart Cursor

### 4. Universal Installation (npm package)

To make it accessible everywhere, we can also publish as npm package:

```bash
# In MCP server directory
npm init -y
npm publish --access public

# Then install globally
npm install -g @endlessblink/bina-site-management-mcp

# Use in any client config:
{
  "mcpServers": {
    "bina-site-manager": {
      "command": "bina-site-mcp",
      "env": { ... }
    }
  }
}
```

## Environment Variables Setup

### Option 1: Global Environment
Set these environment variables on your system:

```bash
# Windows (in PowerShell as Administrator)
[Environment]::SetEnvironmentVariable("CONTENTFUL_SPACE_ID", "hd99ode6traw", "User")
[Environment]::SetEnvironmentVariable("CONTENTFUL_DELIVERY_TOKEN", "your_token", "User")
[Environment]::SetEnvironmentVariable("CONTENTFUL_MANAGEMENT_TOKEN", "your_token", "User")

# Linux/Mac (add to ~/.bashrc or ~/.zshrc)
export CONTENTFUL_SPACE_ID="hd99ode6traw"
export CONTENTFUL_DELIVERY_TOKEN="your_token"
export CONTENTFUL_MANAGEMENT_TOKEN="your_token"
```

### Option 2: .env File
Keep `.env` file in MCP server directory:

```bash
CONTENTFUL_SPACE_ID=hd99ode6traw
CONTENTFUL_DELIVERY_TOKEN=your_delivery_token_here
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token_here
CONTENTFUL_ENVIRONMENT=master
```

## Testing the Setup

In any configured client, try these commands:

```bash
# Test connection
"List all available MCP tools"

# Test functionality
"Show me the status of AI tools in my site"
"Add a new AI tool called 'Test Tool'"
"Update ChatGPT pricing information"
```

## Troubleshooting

### Common Issues:

1. **"MCP server not found"**
   - Check the file path is absolute and correct
   - Ensure Node.js is installed
   - Verify the server.js file exists

2. **"Authentication failed"**
   - Check Contentful tokens are correct
   - Verify space ID matches
   - Ensure tokens have proper permissions

3. **"Server won't start"**
   - Check npm dependencies are installed
   - Look for syntax errors in server.js
   - Verify .env file is properly formatted

### Debug Commands:

```bash
# Test server manually
cd mcp-servers/site-management
node server.js

# Check if contentful connection works
npm run test:contentful

# Verify MCP protocol
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node server.js
```

## Backup & Sharing

### Recommended Setup:

1. **Create separate repository** for MCP server
2. **Add as git submodule** to main project
3. **Publish to npm** for global installation
4. **Document all client configs** in this file

This gives you maximum flexibility and ensures the MCP server can be used across all your development environments!