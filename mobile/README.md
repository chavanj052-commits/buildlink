# BuildLink Mobile App

A modern, production-quality React Native + Expo mobile application for the **BuildLink** construction project management platform.

BuildLink seamlessly connects **Building Companies**, **Homeowners**, and **Field Contractors** in real-time to manage construction progress, milestone disbursements, material procurement, site logs, and discussions.

---

## 🏗 Features by Role

### 🏢 Building Company / Developer
- **Live Dashboard**: Portfolio-wide statistics, active works, completed sites, overall weighted completion.
- **Project Portfolio**: Tabbed filters (*All*, *Active*, *Completed*), real-time search by project name, client, or site address.
- **Detailed Site Management**:
  - **Overview**: Timeline dates, budget utilization, assigned homeowners and lead contractors.
  - **Materials Management**: Review procurement requests, approve orders, and track delivered stock.
  - **Milestone Budgeting**: View milestone releases, amounts in INR (`₹`), and escrow disbursements.
  - **Photo Progress**: Integrated image picker to upload verified site progress photos.
- **Project Initialization**: Complete form with validation to launch new sites, set budgets, and assign stakeholders.

### 🏡 Homeowner / Client
- **Dream Home Portal**: Hero project showcase with live progress bar and site location.
- **Financial Transparency**: Clear breakdown of Total Budget, Amount Spent, and Remaining Balance.
- **Roadmap & Phase Tracker**: Construction timeline from Foundation to Handover.
- **Milestone Escrow**: Verify completed milestones and authorize secure fund releases.
- **Direct Communication**: Dedicated chat channel with builders and contractors.

### 👷 Field Contractor
- **Contractor Command**: Active site details, countdown to next milestone, daily progress tracking.
- **Task Management**: Daily site checklist (e.g. rebar spacing, conduit pipes, plastering).
- **Material Indents**: Submit material procurement requests with quantity, unit, and estimated rate.
- **Payout Invoices**: Milestone tracking and claim disbursals for executed works.
- **Site Work Proof**: Capture photos directly from field camera to update site logs.

---

## 🎨 Design System
Matches the BuildLink web design:
- **Primary Navy**: `#0f1b2d`
- **Golden Orange Accent**: `#e8a838`
- **Background**: `#f5f6fa`
- **Card Surface**: `#ffffff`
- **Typography & Formatting**: Clean typography, 100% `StyleSheet.create` (zero inline styles), Indian Rupee (`₹15,00,000`) formatting.

---

## 🚀 Getting Started

### 1. Install Dependencies
```powershell
cd "c:\Users\harid\Downloads\final application draft agent\buildlink\mobile"
npm install
```

### 2. Run the App with Expo
```powershell
npx expo start
```

### 3. Open on Device / Emulator
- **Android Emulator**: Press `a` in terminal (defaults to `http://10.0.2.2:5000/api`)
- **iOS Simulator**: Press `i` in terminal (defaults to `http://localhost:5000/api`)
- **Physical Device (Expo Go)**: Scan QR code with the Expo Go app. Update API URL in Profile settings to your local LAN IP (e.g. `http://192.168.1.50:5000/api`).

---

## ⚡ Instant Demo Access
The app includes a quick demo switcher on the Login and Profile screens:
- **Company**: `john@buildlink.com`
- **Homeowner**: `sarah@homeowner.com`
- **Contractor**: `ramesh@contractor.com`
