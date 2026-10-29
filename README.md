# 🏗️ BuildLink — Construction Project Management Platform

BuildLink connects construction companies, homeowners, and trade contractors under a single unified digital ledger and operational cockpit. It includes dedicated role-based web dashboards, real-time collaboration with Socket.IO, and a companion React Native (Expo) mobile app.

---

## 🎨 Design System & Highlights
- **Palette**: Dark Navy (`#0f1b2d`) sidebar, Golden-Orange (`#e8a838`) accents, and clean white cards.
- **Role Isolation**: 
  - **Company / Builder**: Portfolio analytics, project assignment, budgeting, materials procurement, payments, and document management.
  - **Homeowner**: Dedicated project timeline, milestone payments, approved materials, and site photos (sensitive contractor costs and margins are hidden).
  - **Contractor**: Field execution view, material requests, daily site checklists, and payout claims.
- **Unified Backend**: Web and mobile both interact with the same Express + PostgreSQL API with real-time Socket.IO synchronization.

---

## 🚀 How to Clone and Run on Another Device

### Prerequisites

Ensure the target machine has the following installed:
1. **Node.js** (LTS version 18+ or 20+): [https://nodejs.org](https://nodejs.org)
2. **PostgreSQL** (version 14+): [https://www.postgresql.org](https://www.postgresql.org)
3. **Git**: [https://git-scm.com](https://git-scm.com)

---

### Step 1: Clone the Repository

Open a terminal or command prompt and run:

```bash
git clone https://github.com/chavanj052-commits/buildlink.git
cd buildlink
```

---

### Step 2: Database Setup (PostgreSQL)

1. Open your PostgreSQL terminal (`psql`) or pgAdmin.
2. Create the database:
   ```sql
   CREATE DATABASE buildlink;
   ```
3. Run the initial schema and migrations in order:
   ```bash
   # Linux / macOS / Windows PowerShell:
   psql -U postgres -d buildlink -f backend/schema.sql
   psql -U postgres -d buildlink -f backend/migration.sql
   ```

---

### Step 3: Backend Configuration & Start

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `backend` folder:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_NAME=buildlink
   JWT_SECRET=buildlink_super_secret_jwt_key_2026_prod
   ```
   *(Replace `your_postgres_password` with your actual local PostgreSQL password).*

4. Start the backend server:
   ```bash
   npm run dev
   # or: npm start
   ```
   Server will start at: **`http://localhost:5000`**  
   Health check: `http://localhost:5000/api/health`

---

### Step 4: Frontend Web App (React + Vite)

Open a **new terminal window**:

1. Navigate to the `frontend` folder:
   ```bash
   cd buildlink/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit: **`http://localhost:5173`**

---

### Step 5: Mobile App (React Native + Expo)

Open a **third terminal window**:

1. Navigate to the `mobile` folder:
   ```bash
   cd buildlink/mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your backend IP:
   - Open `src/config.js` and set `LOCAL_IP` to your computer's local Wi-Fi IP address (e.g., `192.168.1.X`), so your physical phone or simulator can connect to the backend.
4. Start the Expo development server:
   ```bash
   npx expo start
   ```
5. Choose how to run:
   - **On Physical Phone**: Install the **Expo Go** app from App Store / Google Play and scan the displayed QR code.
   - **On Android Emulator**: Press `a`.
   - **On iOS Simulator**: Press `i` (macOS only).
   - **In Web Browser**: Press `w`.

---

## 👥 Pre-configured Demo Accounts

You can register new accounts on the registration page or use the pre-configured accounts below:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Company / Builder** | `apex@buildlink.com` | `password123` | Full portfolio, budget overview, project assignments, materials, payments |
| **Homeowner** | `sarah@test.com` | `password123` | Assigned home project, timeline, milestone payments, approved materials |
| **Contractor** | `ramesh@test.com` | `password123` | Material delivery tracking, daily tasks, claims and disbursement records |

---

## 📁 Project Structure

```
buildlink/
├── backend/                  # Node.js + Express API + Socket.IO
│   ├── middleware/           # JWT auth and Multer file upload handlers
│   ├── routes/               # API endpoints (auth, projects, materials, payments, documents, stats)
│   ├── utils/                # Project access check and activity logging helpers
│   ├── schema.sql            # Base PostgreSQL database schema
│   ├── migration.sql         # Idempotent table extensions and indexes
│   └── server.js             # Main server entry point
├── frontend/                 # React 19 + Vite Web Application
│   ├── src/
│   │   ├── components/       # Shared UI library (Sidebar, Header, StatCards, Donut, Tables)
│   │   ├── pages/
│   │   │   ├── company/      # Executive Cockpit pages
│   │   │   ├── homeowner/    # Homeowner Portal pages
│   │   │   └── contractor/   # Site Execution pages
│   │   └── styles/global.css # Complete Navy & Gold design system
│   └── vite.config.js
└── mobile/                   # React Native + Expo Companion App
    ├── src/
    │   ├── navigation/       # Role-specific bottom tabs & stacks
    │   ├── screens/          # Screens for Company, Homeowner, Contractor
    │   ├── components/       # Native UI widgets
    │   └── theme.js          # Unified theme tokens matching web
    └── app.json
```
