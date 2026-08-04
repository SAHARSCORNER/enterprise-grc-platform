# API & Socket.IO Specification

## Authentication API (`/api/v1/auth`)
- `POST /login`: Authenticate user and receive JWT Access & Refresh Tokens.
- `POST /register`: Register new user account with role assignment.

## Dashboard API (`/api/v1/dashboard`)
- `GET /kpis`: Returns total employees, assets, high-risk counts, compliance %, open risks, pending audits, and trend charts.

## Employee API (`/api/v1/employees`)
- `GET /`: Search, filter, and paginate workforce directory.
- `POST /`: Create employee record and emit `EMPLOYEE_CREATED` socket event.
- `GET /:id`: Retrieve detailed profile, assigned assets, and audit history.
- `PUT /:id`: Update employee details.
- `DELETE /:id`: Remove employee and unassign assets.

## Asset API (`/api/v1/assets`)
- `GET /`: List assets with category filters and generated QR code base64 URLs.
- `POST /assign`: Assign asset to employee; broadcasts `ASSET_ASSIGNED`.
- `POST /unassign`: Release asset back to available pool; broadcasts `ASSET_REMOVED`.

## Risk API (`/api/v1/risks`)
- `GET /`: Retrieve Risk Register items sorted by score (1..25).
- `POST /`: Add risk item with automatic score computation (Likelihood × Impact).

## AI Assistant API (`/api/v1/ai`)
- `POST /query`: Execute natural language analytics query against live database.

## Reports API (`/api/v1/reports`)
- `GET /pdf?type=executive|risk|asset|employee`: Download print-ready PDF document.
- `GET /csv?type=risk|asset|employee`: Export raw CSV spreadsheet.
