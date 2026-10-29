# 🏗️ BuildLink — Comprehensive Setup & Deployment Guide

> **Enterprise Construction Project Management Platform**  
> Unified digital ledger and operational cockpit connecting Construction Companies, Homeowners, and Trade Contractors with real-time sync, role-isolated dashboards, and a cross-platform mobile suite.

---

## 📑 Table of Contents
1. [System Prerequisites](#1-system-prerequisites)
2. [Step-by-Step Installation on a New Device](#2-step-by-step-installation-on-a-new-device)
   - [Step A: Clone the Codebase](#step-a-clone-the-codebase)
   - [Step B: PostgreSQL Database Setup](#step-b-postgresql-database-setup)
   - [Step C: Backend API Server Setup](#step-c-backend-api-server-setup)
   - [Step D: Frontend Web Dashboard Setup](#step-d-frontend-web-dashboard-setup)
   - [Step E: React Native Mobile App Setup](#step-e-react-native-mobile-app-setup)
3. [Troubleshooting Common Issues](#3-troubleshooting-common-issues)
4. [Pre-configured Demo Accounts](#4-pre-configured-demo-accounts)
5. [Architecture & Design System](#5-architecture--design-system)

---

## 1. System Prerequisites

Before starting on your other device, make sure the following software is installed:

| Software | Minimum Version | Download Link | Purpose |
|---|---|---|---|
| **Git** | 2.30+ | [git-scm.com](https://git-scm.com/downloads) | Version control & cloning |
| **Node.js** | 18.x or 20.x+ (LTS) | [nodejs.org](https://nodejs.org) | JavaScript runtime for backend & frontend |
| **PostgreSQL** | 14.x, 15.x, 16.x, or 17.x | [postgresql.org](https://www.postgresql.org/download) | Relational database |
| **VS Code** *(Optional)* | Latest | [code.visualstudio.com](https://code.visualstudio.com) | Recommended IDE |

> 💡 **Windows Tip**: When installing PostgreSQL, remember the superuser password you choose during setup. You will need it in Step C.

---

## 2. Step-by-Step Installation on a New Device

### Step A: Clone the Codebase

Open your terminal (PowerShell on Windows, Terminal on macOS/Linux):

```bash
# Navigate to the folder where you want to keep your projects (e.g. Desktop, Documents)
cd Documents

# Clone the repository
git clone https://github.com/chavanj052-commits/buildlink.git

# Enter the project directory
cd buildlink
```

---

### Step B: PostgreSQL Database Setup

1. **Verify PostgreSQL is running**:
   - **Windows**: Open `services.msc` and ensure `postgresql-x64-...` is **Running**.
   - **macOS**: Run `brew services list` or check the Postgres.app icon.
   - **Linux**: Run `sudo systemctl status postgresql`.

2. **Create the Database and Run the Tables**:
   Open a terminal and execute the following commands (replace `postgres` with your Postgres username if different):

   ```bash
   # 1. Create the database named 'buildlink'
   psql -U postgres -h localhost -c "CREATE DATABASE buildlink;"

   # 2. Run the base tables (users, projects, designs, materials)
   psql -U postgres -h localhost -d buildlink -f backend/schema.sql

   # 3. Run the migrations (payments, activity_log, messages, column extensions & indexes)
   psql -U postgres -h localhost -d buildlink -f backend/migration.sql
   ```

   *(You will be prompted to enter your PostgreSQL password).*

   **Alternative with pgAdmin / DBeaver / GUI**:
   - Connect to your local server.
   - Right-click **Databases** → **Create** → **Database** → Name it `buildlink`.
   - Open the Query Tool on `buildlink`.
   - Open and execute `backend/schema.sql`, then open and execute `backend/migration.sql`.

---

### Step C: Backend API Server Setup

1. **Open a dedicated terminal window** and navigate into the `backend` directory:
   ```bash
   cd buildlink/backend
   ```

2. **Install all backend dependencies**:
   ```bash
   npm install
   ```
   *(On Windows PowerShell, if you see a script execution error, use `npm.cmd install`)*.

3. **Configure Environment Variables (`.env`)**:
   Create a new file named `.env` inside the `backend` folder:
   ```bash
   # Windows PowerShell:
   notepad .env

   # macOS / Linux:
   nano .env
   ```
   Paste the following content:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_actual_postgres_password
   DB_NAME=buildlink
   JWT_SECRET=buildlink_super_secret_jwt_key_2026_prod
   ```
   > ⚠️ **IMPORTANT**: Replace `your_actual_postgres_password` with the password you set when installing PostgreSQL!

4. **Start the backend server**:
   ```bash
   npm run dev
   # or: npm.cmd run dev
   ```
   You should see:
   ```text
   Server running on port 5000
   ```

5. **Verify the connection**:
   Open your browser and navigate to:
   👉 **`http://localhost:5000/api/health`**  
   It must return:
   ```json
   { "status": "ok", "database": "connected" }
   ```

> 🛑 **Keep this terminal window running.** Do not close it.

---

### Step D: Frontend Web Dashboard Setup

1. **Open a second terminal window** and navigate into the `frontend` directory:
   ```bash
   cd buildlink/frontend
   ```

2. **Install all frontend dependencies**:
   ```bash
   npm install
   # or: npm.cmd install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   # or: npm.cmd run dev
   ```
   You should see:
   ```text
     VITE v8.3.5  ready in 450 ms

     ➜  Local:   http://localhost:5173/
     ➜  Network: use --host to expose
   ```

4. **Launch the web application**:
   Open your browser and go to:
   👉 **`http://localhost:5173`**

---

### Step E: React Native Mobile App Setup

1. **Open a third terminal window** and navigate into the `mobile` directory:
   ```bash
   cd buildlink/mobile
   ```

2. **Install mobile dependencies**:
   ```bash
   npm install
   # or: npm.cmd install
   ```

3. **Configure the API endpoint for your device**:
   Open `mobile/src/config.js`:
   - If testing on the **Android Emulator**: It defaults to `http://10.0.2.2:5000/api` (ready to go).
   - If testing on a **physical phone via Expo Go**: Change `LOCAL_IP` to your computer's local Wi-Fi IP address (e.g., `192.168.1.5`):
     ```javascript
     const LOCAL_IP = '192.168.1.5'; // Your computer's Wi-Fi IP
     ```

4. **Start the Expo development server**:
   ```bash
   npx expo start
   ```

5. **Connect your device**:
   - **On Android / iPhone**: Install the **Expo Go** app from Google Play / Apple App Store. Scan the QR code displayed in your terminal.
   - **In Web Browser**: Press `w` in your terminal to preview the mobile layout in Chrome/Edge.
   - **In Android Emulator**: Press `a`.

---

## 3. Troubleshooting Common Issues

### Issue 1: `password authentication failed for user "postgres"`
- **Why**: The password written in `backend/.env` doesn't match your computer's PostgreSQL password.
- **Fix**: Open `backend/.env` and update `DB_PASSWORD` to your correct PostgreSQL password, then restart the backend.

### Issue 2: `npm : File ... cannot be loaded because running scripts is disabled`
- **Why**: Windows PowerShell has an execution policy preventing `.ps1` script runners.
- **Fix 1**: Use `npm.cmd run dev` instead of `npm run dev`.
- **Fix 2**: Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force` in PowerShell once.

### Issue 3: `Registration failed. Please check inputs.`
- **Why**: The backend server is not running on port 5000, so the frontend cannot communicate with the auth API.
- **Fix**: Ensure the backend terminal is open and showing `Server running on port 5000`.

### Issue 4: `database "buildlink" does not exist`
- **Why**: Step B was skipped.
- **Fix**: Run `psql -U postgres -c "CREATE DATABASE buildlink;"` and re-run the `schema.sql` and `migration.sql` scripts.

---

## 4. Pre-configured Demo Accounts

Once you run `backend/schema.sql` and `backend/migration.sql`, you can either register your own accounts via the registration page or log in with these roles:

| Role | Email | Password | What You Can Do |
|---|---|---|---|
| **Company / Builder** | `apex@buildlink.com` | `password123` | Full admin privileges: Create/Edit projects, Assign homeowners & contractors, Enter budgets, Add materials & unit rates, Manage milestone disbursements, Upload blueprints and municipal permits. |
| **Homeowner** | `sarah@test.com` | `password123` | Client portal: View construction phase roadmap (Foundation → Structure → Interior → Handover), Escrow milestone payments, Approved materials, and Site photo gallery. *(Contractor-side costs & company profit margins are hidden).* |
| **Contractor** | `ramesh@test.com` | `password123` | Field execution: Daily site task checklists, Submit material supply requests, Track deliveries, Claim labor milestone disbursements, and access structural drawings. |

---

## 5. Architecture & Design System

```
                           ┌──────────────────────────────┐
                           │      PostgreSQL (5432)       │
                           │   Database: `buildlink`      │
                           └──────────────▲───────────────┘
                                          │
                                 pg Connection Pool
                                          │
                           ┌──────────────┴───────────────┐
                           │     Express REST API (5000)  │
                           │    JWT Auth + RBAC Guards    │
                           │     Socket.IO Event Engine   │
                           │   Multer Document Storage    │
                           └───────▲──────────────▲───────┘
                                   │              │
                   HTTP / REST + WS Interceptors  HTTP / REST + WS Interceptors
                                   │              │
        ┌──────────────────────────┴────┐    ┌────┴───────────────────────────┐
        │     React 19 + Vite (5173)    │    │    React Native + Expo App     │
        │  Dark Navy & Gold Design Token│    │  Cross-Platform Native UI      │
        │  Role-Specific Route Guards   │    │  Shared API & Token Engine     │
        └───────────────────────────────┘    └────────────────────────────────┘
```

- **Sidebar Background**: `#0f1b2d` (Deep Navy)
- **Active / Accent Tint**: `#e8a838` (Golden Orange)
- **Content Surface**: `#f5f6fa` (Subtle Off-White)
- **Card Background**: `#ffffff` (Elevated White Cards)
- **Typography**: Google Font **Inter** (300-800 weight scale)
