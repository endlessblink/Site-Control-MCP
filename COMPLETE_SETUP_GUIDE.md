# 🚀 Complete MCP Setup Guide - All Clients

Based on successful MCP integration patterns from memory, here's the **proven setup** for Site Control MCP across all AI clients.

## 🎯 Key Success Factors (From Memory Analysis)

1. **Use absolute paths** - Never use relative paths
2. **Convert Windows paths to WSL format** for Claude Code  
3. **Use `node` directly** - Avoid `cmd` wrappers
4. **Environment variables in `env` object** - Not in command args
5. **Test with simple servers first** - Then add complex ones

## 📁 Repository Location

**Current MCP Server Path**: 
```
/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Web Dev/Bina-Bekitzur-Main/Site-Control-MCP-Export/
```

**For Windows clients**: 
```
D:\MY PROJECTS\AI\LLM\AI Code Gen\my-builds\Web Dev\Bina-Bekitzur-Main\Site-Control-MCP-Export\
```

## ⚙️ Client-Specific Setup

### 1. Claude Code (WSL) ✅

**File**: `~/.claude.json`

```json
{
  "mcpServers": {
    "site-control-mcp": {
      "command": "node",
      "args": [
        "/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Web Dev/Bina-Bekitzur-Main/Site-Control-MCP-Export/server.js"
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

**Setup Steps**:
```bash
# 1. Backup existing config
cp ~/.claude.json ~/.claude.json.backup

# 2. Edit config
nano ~/.claude.json

# 3. Validate JSON
cat ~/.claude.json | jq '.'

# 4. Test path exists
ls -la "/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Web Dev/Bina-Bekitzur-Main/Site-Control-MCP-Export/server.js"

# 5. Restart Claude Code
```

### 2. Claude Desktop ✅

**Windows Path**: `%APPDATA%\Claude\claude_desktop_config.json`
**Mac/Linux Path**: `~/.config/claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "site-control-mcp": {
      "command": "node",
      "args": [
        "D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Web Dev\\Bina-Bekitzur-Main\\Site-Control-MCP-Export\\server.js"
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

### 3. Windsurf ✅

**File**: `.windsurf/settings.json` (in project root)

```json
{
  "mcp": {
    "servers": {
      "site-control-mcp": {
        "command": "node",
        "args": [
          "D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Web Dev\\Bina-Bekitzur-Main\\Site-Control-MCP-Export\\server.js"
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

### 4. Cursor ✅

**File**: `.cursor/settings.json` (in project root)

```json
{
  "mcpServers": {
    "site-control-mcp": {
      "command": "node",
      "args": [
        "D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Web Dev\\Bina-Bekitzur-Main\\Site-Control-MCP-Export\\server.js"
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

## 🔑 Environment Setup

### Option 1: Direct in Config (Recommended)
Add tokens directly in the `env` object as shown above.

### Option 2: Global Environment Variables
Set these system-wide:

**Windows (PowerShell as Admin)**:
```powershell
[Environment]::SetEnvironmentVariable("CONTENTFUL_SPACE_ID", "hd99ode6traw", "User")
[Environment]::SetEnvironmentVariable("CONTENTFUL_DELIVERY_TOKEN", "your_token", "User")
[Environment]::SetEnvironmentVariable("CONTENTFUL_MANAGEMENT_TOKEN", "your_token", "User")
```

**Linux/WSL**:
```bash
echo 'export CONTENTFUL_SPACE_ID="hd99ode6traw"' >> ~/.bashrc
echo 'export CONTENTFUL_DELIVERY_TOKEN="your_token"' >> ~/.bashrc
echo 'export CONTENTFUL_MANAGEMENT_TOKEN="your_token"' >> ~/.bashrc
source ~/.bashrc
```

### Option 3: .env File
Copy `.env.example` to `.env` in MCP server directory:
```bash
cd "/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Web Dev/Bina-Bekitzur-Main/Site-Control-MCP-Export"
cp .env.example .env
nano .env
```

## 🧪 Testing & Verification

### 1. Test Server Manually
```bash
cd "/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Web Dev/Bina-Bekitzur-Main/Site-Control-MCP-Export"
node server.js
```

### 2. Test MCP Protocol
```bash
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node server.js
```

### 3. Verify Dependencies
```bash
npm list contentful contentful-management dotenv
```

### 4. Test in Each Client

**Claude Code**:
```bash
# In Claude Code chat
"List all available MCP tools"
```

**Claude Desktop/Windsurf/Cursor**:
```bash
# In chat interface
"Show me what MCP servers are available"
"List AI tools from site management"
```

## 🚨 Common Issues & Solutions

### Issue 1: "MCP server not found"
**Solution**: Check absolute path exists
```bash
ls -la "/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Web Dev/Bina-Bekitzur-Main/Site-Control-MCP-Export/server.js"
```

### Issue 2: "Permission denied"
**Solution**: Make server executable
```bash
chmod +x "/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Web Dev/Bina-Bekitzur-Main/Site-Control-MCP-Export/server.js"
```

### Issue 3: "Module not found"
**Solution**: Install dependencies
```bash
cd "/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Web Dev/Bina-Bekitzur-Main/Site-Control-MCP-Export"
npm install
```

### Issue 4: "Authentication failed"
**Solution**: Verify Contentful tokens
- Check space ID: `hd99ode6traw`
- Verify delivery token has read access
- Verify management token has write access

### Issue 5: "JSON parse error"
**Solution**: Validate config file
```bash
# For Claude Code
cat ~/.claude.json | jq '.'

# For Windows clients
type "%APPDATA%\Claude\claude_desktop_config.json" | jq .
```

## ✅ Success Indicators

When properly configured, you should see:

1. **MCP server appears in tools list**
2. **Can execute commands like**:
   - "Show me the status of all AI tools"
   - "List available content management tools"
   - "Add a new AI tool"

3. **No error messages** in client console
4. **Consistent behavior** across all clients

## 🔄 Alternative: Global Installation

For easier setup across all clients:

```bash
# Install globally from GitHub
npm install -g https://github.com/endlessblink/Site-Control-MCP.git

# Then use in configs:
{
  "mcpServers": {
    "site-control-mcp": {
      "command": "site-control-mcp",
      "env": { ... }
    }
  }
}
```

## 🎯 Quick Start Commands

Once configured, try these in any client:

```bash
"Show me the status of all AI tools on my site"
"Add Perplexity AI as a new search tool"
"Update ChatGPT pricing to latest rates"
"Find tools that need URLs added"
"Run a content quality check"
```

---

**Based on proven patterns from successful MCP deployments** ✅