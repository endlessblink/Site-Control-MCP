# 🔒 Security Guidelines

## ⚠️ Important Security Notice

This MCP server is **publicly available** on GitHub. Please follow these security best practices:

## 🚫 What NOT to Include

❌ **Never commit these to the repository:**
- Contentful API tokens (delivery or management)
- Space IDs 
- Any API keys or secrets
- Production environment variables
- User credentials

## ✅ Safe Configuration Practices

### 1. Use Environment Variables
Always configure sensitive data through environment variables, not hardcoded values:

```bash
# ✅ Good - Use environment variables
export CONTENTFUL_SPACE_ID="your_actual_space_id"
export CONTENTFUL_DELIVERY_TOKEN="your_actual_token"
export CONTENTFUL_MANAGEMENT_TOKEN="your_actual_token"
```

```json
// ❌ Bad - Hardcoded in config
{
  "env": {
    "CONTENTFUL_SPACE_ID": "actual_space_id_here"
  }
}
```

### 2. Use .env Files (Locally Only)
Create `.env` files for local development, but **never commit them**:

```bash
# Copy the example
cp .env.example .env

# Edit with your actual values
nano .env
```

The `.env` file is already in `.gitignore` to prevent accidental commits.

### 3. Template Configurations
All provided config files use placeholder values like:
- `your_space_id_here`
- `your_delivery_token_here` 
- `your_management_token_here`

Replace these with your actual values in your local setup.

## 🔐 Token Security

### Contentful Token Permissions
- **Delivery Token**: Read-only access to published content
- **Management Token**: Full read/write access to space

### Token Management
1. Use separate tokens for development and production
2. Regularly rotate tokens
3. Use minimum required permissions
4. Monitor token usage in Contentful dashboard

## 🚨 If You Accidentally Commit Secrets

1. **Immediately revoke** the exposed tokens in Contentful
2. **Generate new tokens** with different values
3. **Update your local configuration** with new tokens
4. **Consider the exposed tokens compromised permanently**

## 📋 Security Checklist

Before using this MCP server:

- [ ] All config files use placeholder values
- [ ] Actual tokens stored in environment variables or local .env
- [ ] .env file is in .gitignore
- [ ] No hardcoded credentials in any files
- [ ] Tokens have minimum required permissions
- [ ] Different tokens for dev/staging/production

## 🛡️ Best Practices

1. **Principle of Least Privilege**: Only grant necessary permissions
2. **Environment Separation**: Use different tokens for different environments
3. **Regular Audits**: Review and rotate tokens periodically
4. **Monitor Usage**: Check Contentful logs for unusual activity
5. **Secure Storage**: Use secure credential management tools

## 📞 Incident Response

If you suspect a security incident:

1. **Immediately revoke** any potentially compromised tokens
2. **Review access logs** in Contentful dashboard
3. **Generate new credentials** 
4. **Update all affected systems**
5. **Document the incident** for future prevention

## 🔗 Additional Resources

- [Contentful Security Best Practices](https://www.contentful.com/developers/docs/concepts/security/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Environment Variable Security](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

**Remember**: Security is everyone's responsibility. When in doubt, ask!