# QueryBuilder PNPM Local Test

PNPM test project for local QueryBuilder installation.

## Setup

1. Build distribution: `npm run build:dist`
2. Link packages: `npm run link:pnpm`  
3. Install dependencies: `pnpm install`

## Test

`pnpm test`

## Notes

Uses `file:` protocol for local dependencies, which is the recommended approach for PNPM workspaces.
