# Security

Security policy should be repository-local and versioned.

## Current Requirements

- Do not commit secrets
- Prefer boring dependencies and explicit interfaces
- Document new trust boundaries before implementing them
- Treat voice transcripts and profile answers as sensitive user data
- Keep API keys in local env files only (`.env`, `.env.local`) and never in source control

## Future Requirements

When services and clients are introduced, document:

- Authn and authz model
- Secret management
- Data classification
- External service boundaries
- Security review checklist
