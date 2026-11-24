# Prashant Kushwah — Personal Platform & Project Hub

Client-side React, TypeScript, Vite, and Tailwind CSS platform backed by **Firebase Realtime Database** and **Firebase Authentication**, ready for GitHub and Vercel deployment.

## Architecture

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Database**: Firebase Realtime Database exclusively (`/profile`, `/homepage`, `/projects`, `/releases`, `/assets`, `/changelog`, `/documentation`, `/projectActivity`, `/journey`, `/goals`, `/updates`, `/currentlyWorking`, `/achievements`, `/socialLinks`, `/contactSettings`, `/contactMessages`, `/websiteSettings`, `/admins`)
- **Authentication**: Firebase Email/Password Authentication + database-level UID authorization (`/admins/<UID>: true`)
- **Hosting**: Vercel (`vercel.json` included with SPA rewrites)

## Firebase Console Setup (Required)

1. **Enable Email/Password Authentication**:
   - Open Firebase Console (`prashant-hub`) → **Authentication** → **Sign-in method**.
   - Enable **Email/Password**.
   - Under **Users**, create your admin user account and copy its **User UID**.

2. **Grant Admin Authorization in Realtime Database**:
   - Open **Realtime Database** → **Data**.
   - Add node `admins/<YOUR_ADMIN_UID>` with boolean value `true`.
   - Note: Signing in at `/hubkaadmin/login` will also display your copyable UID if `/admins/<UID>` is not yet configured.

3. **Deploy Realtime Database Security Rules**:
   - Open **Realtime Database** → **Rules**.
   - Paste the contents of `/database.rules.json` and click **Publish**.
   - These rules allow public reads for published content, public message submission to `/contactMessages` with schema validation, and restrict all admin reads (`contactMessages`) and all writes to authenticated UIDs listed under `/admins/<uid> === true`.

## Admin Access

Navigate directly to `/hubkaadmin` (or `/hubkaadmin/login`) to access the administration dashboard. Public pages do not expose admin links or secret triggers; access is protected by Firebase Email/Password Authentication and Realtime Database UID authorization (`/admins/<UID>: true`).

## Local Development

```bash
npm install
npm run dev
```

## Deploying to Vercel via GitHub

1. Push this repository to GitHub.
2. In Vercel, click **Add New Project** and import the GitHub repository.
3. Vercel automatically detects Vite (`npm run build`, output `dist`) and uses `vercel.json` for SPA route rewrites (`/projects/:slug`, `/hubkaadmin`, etc.).
4. Optionally configure `VITE_FIREBASE_*` environment variables in Vercel Project Settings if overriding the default Firebase configuration.
5. Add your Vercel deployment domain to **Firebase Console → Authentication → Settings → Authorized domains**.
