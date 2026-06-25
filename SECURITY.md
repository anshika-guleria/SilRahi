# Security Policy

## Supported Versions

The `main` branch receives security fixes.

## Reporting a Vulnerability

Please do not open public issues for vulnerabilities.

Use GitHub private vulnerability reporting if enabled, or contact a maintainer privately with:

- Affected area
- Steps to reproduce
- Expected impact
- Suggested fix, if known

## Secret Handling

Never commit:

- `backend/.env`
- `frontend/.env`
- Firebase Admin private keys
- Firebase service-account JSON files
- Production JWT secrets

If a secret is committed accidentally, rotate it immediately in Firebase or the hosting provider, then remove it from git history before publishing.
