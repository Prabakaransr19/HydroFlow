# React + Vite

## Deployment Configuration

Frontend production builds require:

```text
VITE_API_BASE_URL=https://api.example.com
VITE_RAZORPAY_KEY_ID=rzp_test_or_live_key
```

Backend production requires `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`,
`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `FRONTEND_URL`, and
`CORS_ALLOWED_ORIGINS`. Never commit these values. The destructive demo
initializer runs only when the backend uses the `dev` Spring profile.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
