# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BPartners Web is a React admin dashboard UI for the [BPartners API](https://github.com/b-partners/bpartners-api). Deployed to two environments: [preprod](https://dashboard-preprod.bpartners.app) and [prod](https://dashboard.bpartners.app). Main branch is `prod`.

## Setup

```bash
cp .env.template .env   # Uses preprod API by default
npm install --legacy-peer-deps
npm start               # Dev server on port 3000
```

## Commands

```bash
npm start               # Start dev server (Vite, port 3000)
npm run build           # TypeScript check + Vite build to ./build

npm test                # Component tests (Cypress)
npm run it              # E2E integration tests
npm run cy:open         # Open Cypress interactive UI

# Run a single test file:
npm test -- --spec "src/__tests__/SomeComponent.cy.tsx"
npm run it -- --spec "src/__tests__/it/customer.it.cy.ts"

npm run lint            # ESLint on ./src
npm run prettier:write  # Auto-format with Prettier
npm run prettier:check  # Check formatting
```

## Architecture

### Tech Stack
- **UI**: React 18 + React Admin 5 + MUI 5 + React Router 6
- **State**: Zustand stores + @tanstack/react-query
- **Forms**: React Hook Form + Zod validation
- **Auth**: AWS Cognito (OAuth 2.0) + Google reCAPTCHA v3
- **3D**: Three.js + React Three Fiber (CityJSON support in `src/lib/cityjson/`)
- **Testing**: Cypress 13 (component tests + E2E)
- **Build**: Vite 5 + TypeScript 5

### Directory Structure

```
src/
├── operations/        # Feature modules (customers, invoices, products, annotator, bank, etc.)
├── providers/         # Data fetching layer
│   ├── data-provider.ts   # Unified React Admin data provider
│   ├── auth-provider.ts   # AWS Cognito auth logic
│   ├── cache.ts           # Zustand-based client-side cache
│   └── mappers/           # API response transformers
├── common/            # Shared components, hooks, utils, stores
│   ├── components/    # Reusable UI (fields, buttons, PDF, rich text)
│   ├── hooks/         # Custom hooks (use-authentication, use-toggle, etc.)
│   ├── resolvers/     # Zod form schemas
│   └── store/         # Zustand stores (dialog, invoice)
├── security/          # Auth pages and wrappers (BpAdmin, LoginPage, SignInForm)
├── layout/            # AppBar and sidebar menu
├── lib/cityjson/      # 3D CityJSON rendering
├── bp-theme.js        # MUI theme with BPartners color palette
├── App.tsx            # Route definitions
└── main.tsx           # Entry point (Sentry + reCAPTCHA init)
```

### Data Flow

React Admin's data provider pattern is central: `src/providers/data-provider.ts` is the single adapter used by all feature modules for CRUD operations. Individual feature providers (e.g., `invoice-provider.ts`, `customer-provider.ts`) handle domain-specific API calls. Data is cached via `src/providers/cache.ts` using Zustand.

### Testing Conventions

- **Component tests** (`.cy.tsx`): Mount components directly using `cy.mount()`, mock API calls with `cy.intercept()`, use `cy.cognitoLogin()` custom command for auth
- **E2E tests** (`.it.cy.ts`): Full app flows, located in `src/__tests__/it/`
- **Mocks**: Shared mock data in `src/__tests__/mocks/`
- Viewport is 2014×844; retries set to 3 in CI

### Code Style

Prettier config (`.prettierrc.json`): `printWidth: 160`, `singleQuote: true`, `trailingComma: 'es5'`, `arrowParens: 'avoid'`. Import organization is handled automatically by `prettier-plugin-organize-imports`.

ESLint: `@typescript-eslint` recommended rules; `_`-prefixed variables are allowed to be unused; 3D renderer and `lib/` directories are excluded.

### Contribution Requirements

- Tests must pass; 80%+ Sonar coverage on new code
- Conventional Commits with GPG signatures
- SonarCloud analysis run on PRs via GitHub Actions CI
