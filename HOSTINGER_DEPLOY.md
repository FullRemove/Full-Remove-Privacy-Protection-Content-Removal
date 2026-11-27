# Deploying Full Remove on Hostinger (hpanel.hostinger.com)

This application is a unified **Node.js + Express + React/Vite** app. Both the public marketing website, client workspace, staff console, Central Admin, API endpoints (`/api/*`), encrypted evidence vault (`.data/vault`), and WebSocket feeds run from a single Node.js process (`server.js`).

> **Note on Hosting Plan:** Shared PHP-only hosting plans on Hostinger do not run persistent Node.js servers. Use **Hostinger Node.js Web App Hosting** (available on Business/Cloud plans in hPanel) or a **Hostinger VPS**.

---

## Option 1: Hostinger hPanel Node.js Web App (Recommended)

1. Open **https://hpanel.hostinger.com** → **Websites** → **Add website** (or manage an existing site) → choose **Node.js Web App**.
2. Connect your Git repository (or upload your project source ZIP excluding `node_modules/` and `.data/`).
3. Configure the build & run settings in hPanel:
   - **Node.js version:** `20.x` or `22.x` LTS (declared in `package.json` `engines.node`)
   - **Build command:** `npm run build`
   - **Start command / Entry file:** `npm start` (runs `node server.js`)
4. Add your **Environment Variables** in hPanel (see `.env.example`):
   - `NODE_ENV=production`
   - `APP_URL=https://yourdomain.com`
   - `VAULT_KEY=<generate-a-long-random-secret-key>`
   - `DATA_DIR=/home/<your-hostinger-user>/fullremove-data` *(recommended so future Git deploys never overwrite stored cases or evidence)*
   - **Production Email OTP (using Hostinger Email):**
     - `SMTP_HOST=smtp.hostinger.com`
     - `SMTP_PORT=465`
     - `SMTP_SECURE=true`
     - `SMTP_USER=noreply@yourdomain.com`
     - `SMTP_PASS=<mailbox-password>`
     - `FROM_EMAIL=noreply@yourdomain.com`
   - **Disable Demo Shortcuts Before Going Public:**
     - `ALLOW_DEMO_LOGIN=false`
     - `ALLOW_DEV_LOGIN_CODE=false`
5. Click **Deploy / Restart**.
6. Verify your live deployment by opening `https://yourdomain.com/api/health` — it should return `{"ok":true,"status":"healthy","mode":"production","dist_ready":true,...}`.

---

## Option 2: Hostinger VPS (Ubuntu + PM2 + Nginx Reverse Proxy)

1. SSH into your Hostinger VPS and install Node.js 20 LTS (`nvm` or NodeSource) and PM2 (`npm i -g pm2`).
2. Upload/clone the repository to `/var/www/full-remove`.
3. Create `.env` from `.env.example` and fill in `VAULT_KEY`, `DATA_DIR`, and SMTP credentials:
   ```bash
   cp .env.example .env
   nano .env
   ```
4. Install dependencies, build, and start with PM2:
   ```bash
   npm install
   npm run build
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup
   ```
5. Point Nginx (with WebSocket upgrade headers for `/ws/*`) to `http://127.0.0.1:3000` and enable SSL via Certbot / Hostinger SSL:
   ```nginx
   location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```
   Set `client_max_body_size 15M;` in Nginx so evidence photo uploads succeed cleanly.
