# QuickPay — Zero-Setup Demo

This version is designed for a school/project submission where you need a deployable demonstration without Paystack, MongoDB, Render, SMTP or secret keys.

## What it demonstrates

- Registration and login
- Wallet balance
- Fund wallet simulation
- User-to-user transfer
- 4-digit PIN
- Transaction history
- Withdrawal simulation
- Responsive fintech UI
- Browser persistence with localStorage

## Demo login

Email: `demo@quickpay.test`

Password: `demo1234`

Demo transfer PIN: `1234`

## Run locally

```bash
npm install
npm run dev
```

## Build for deployment

```bash
npm run build
```

The resulting `dist` folder can be deployed to Vercel, Netlify or GitHub Pages.

## Deploy on Vercel

1. Create a GitHub repository and upload this project.
2. Import the repository into Vercel.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Deploy.

No environment variables are required.

## Important

This is a **demo/simulation**, not a real-money wallet. Funding and withdrawals change the browser's local data only. No bank account, Paystack account or real money is involved.

For a production-style version, connect a backend database, authentication service, Paystack test mode, webhooks, server-side verification, KYC/AML and proper financial controls.
