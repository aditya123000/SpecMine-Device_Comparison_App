# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Backend Postgres Setup

The backend now reads devices from PostgreSQL instead of `src/Backend/Data/db.json`.

1. Copy `src/Backend/.env.example` to `src/Backend/.env`.
2. Put your Postgres password in `PGPASSWORD`.
3. Make sure your Postgres server already has a database named `compare_devices`.
4. Start the backend with `npm run server`.

By default, the backend connects using:

- host: `localhost`
- port: `5432`
- database: `compare_devices`
- user: `postgres`

You only need to override `PGHOST`, `PGPORT`, `PGDATABASE`, or `PGUSER` if your setup is different.

On startup, the backend creates a `devices` table and, if it is empty, imports the records from `src/Backend/Data/db.json`.

If you want to seed manually, run `npm --prefix src/Backend run seed`.
