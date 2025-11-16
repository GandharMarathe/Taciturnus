# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Security Features

- Input validation and sanitization (XSS prevention)
- Rate limiting on API endpoints
- Firebase Admin SDK (no credential exposure)
- Environment-based configuration
- Error handling without information leakage

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via:
1. GitHub Security Advisories (preferred)
2. Email to the maintainers (if available)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You should receive a response within 48 hours. If the issue is confirmed, we will:
1. Work on a fix
2. Release a security patch
3. Credit you in the release notes (if desired)

## Best Practices for Users

1. **Never commit `.env` files**
   - Use `.env.example` as template
   - Keep credentials secure

2. **Use Firebase Admin SDK**
   - Don't use client SDK on server
   - Rotate credentials regularly

3. **Enable Firestore Security Rules**
   - See `FIRESTORE-RULES.txt`
   - Restrict access appropriately

4. **Keep Dependencies Updated**
   - Run `npm audit` regularly
   - Update packages with security fixes

5. **Use HTTPS in Production**
   - Never use HTTP for production
   - Enable CORS properly

6. **Rate Limiting**
   - Adjust limits based on your needs
   - Monitor for abuse

7. **Environment Variables**
   - Use different credentials per environment
   - Never log sensitive data

## Known Security Considerations

- This application does not implement user authentication
- Room codes are short (8 chars) - consider longer codes for production
- Auto-summary feature requires proper API key management
- WebSocket connections should be secured with authentication in production

## Security Updates

Security updates will be released as patch versions and documented in CHANGELOG.md.
