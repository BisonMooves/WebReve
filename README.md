# WebRêve — Digital Studio & Portfolio Platform

WebRêve is a modern full-stack web application designed for a high-end digital design and development studio. It combines a dynamic, animated client-facing showcase with an administrative content management system (CMS), lead inquiry tracker, unified messaging hub, and MongoDB GridFS-powered media management.

---

## 📑 Table of Contents
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
  - [High-Level Architectural Diagram](#high-level-architectural-diagram)
  - [Core Architectural Workflows](#core-architectural-workflows)
  - [Database Schemas & Collections](#database-schemas--collections)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
- [How to Run](#-how-to-run)
  - [Database Initialization](#database-initialization)
  - [Development Mode](#development-mode)
  - [Production Mode](#production-mode)
- [Project Directory Structure](#-project-directory-structure)
- [API Reference](#-api-reference)
- [Deployment (Render Blueprint)](#-deployment-render-blueprint)

---

## 🛠 Tech Stack

### Frontend (`client/`)
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `v19` | Modern UI library with component-driven architecture |
| **Vite** | `v8` | Blazing-fast frontend build tool and dev server |
| **React Router** | `v7` | Client-side routing with deep-link support (`/`, `/project/:id`, `/admin`) |
| **Tailwind CSS** | `v4` | Modern utility-first styling with `@tailwindcss/vite` |
| **Framer Motion** | `v13` | Fluid UI animations, exit transitions, and scroll effects |
| **Lucide React** | `v1.46+` | Clean, modern SVG icon set |

### Backend (`server/`)
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>= v18` | Modern ES Module runtime (`"type": "module"`) |
| **Express** | `v5` | Robust REST API server with custom error handling |
| **MongoDB Driver** | `v6` | Official native MongoDB driver for Atlas database operations |
| **GridFS (MongoDB)** | `Native` | Binary asset streaming (high-resolution project images up to 50MB) |
| **JWT (jsonwebtoken)** | `v9` | Stateless token-based admin authentication & session verification |
| **bcryptjs** | `v3` | Salted password hashing for administrator accounts |
| **Multer** | `v2` | Memory-buffered multipart form upload handler |
| **Resend API** | `v2` | Transactional email notifications for incoming client inquiries |

### Monorepo & Tooling
- **Concurrently**: Multi-process orchestrator running client and server simultaneously.
- **Render Infrastructure as Code**: Unified deployment via `render.yaml`.

---

## 🏛 System Architecture

### High-Level Architectural Diagram

```mermaid
flowchart TD
    subgraph Client["Client (React 19 + Vite SPA)"]
        UI[Public Portfolio & Landing UI]
        Pricing[Custom Pricing & Inquiry Calculator]
        AdminUI[Admin Dashboard & CMS]
        AuthGate[Admin Auth Gate & JWT Storage]
    end

    subgraph Server["Backend API (Node.js + Express 5)"]
        Router["/api Route Dispatcher"]
        AuthMid[authenticateAdmin Middleware]
        UploadMid[Multer In-Memory Storage]
        InqHandler[Inquiry & Messaging Service]
        ProjHandler[Project CMS Service]
    end

    subgraph Data["MongoDB Atlas Database (WebReve_DB)"]
        ColAdmins[admins]
        ColProjects[projects]
        ColInquiries[inquiries]
        ColConvs[conversations]
        ColMsgs[messages]
        ColGridFS[fs.files & fs.chunks (GridFS)]
    end

    subgraph External["External Services"]
        Resend[Resend Email API]
        RenderHost[Render Cloud Platform]
    end

    %% Client to Server
    UI -->|Browse & View Media| Router
    Pricing -->|POST /api/inquiries| Router
    AdminUI -->|Manage Content & Conversations| Router
    AuthGate -->|POST /api/auth/login| Router

    %% Routing & Middleware
    Router --> AuthMid
    Router --> UploadMid
    Router --> InqHandler
    Router --> ProjHandler

    %% Handlers to Database
    AuthMid -.->|Validate Admin Email & Hash| ColAdmins
    InqHandler -->|Store Leads & Messages| ColInquiries
    InqHandler -->|Update Conversation State| ColConvs
    InqHandler -->|Append Message History| ColMsgs
    InqHandler -->|Notify Admins| Resend
    ProjHandler -->|CRUD Metadata| ColProjects
    UploadMid -->|Stream Images <= 50MB| ColGridFS

    %% External
    RenderHost -.-> Client
    RenderHost -.-> Server
```

---

### Core Architectural Workflows

1. **Client Inquiry & Dynamic Estimator**:
   - Visitors configure services and hosting timelines in the interactive pricing estimator.
   - Submitting an inquiry triggers `POST /api/inquiries`, which concurrently:
     - Formats and writes the document into `inquiries`.
     - Generates or updates a corresponding thread in `conversations` and logs an initial entry in `messages`.
     - Dispatches a formatted notification email to configured studio admins via **Resend**.

2. **Secure Admin Authentication**:
   - Access to `/admin` is guarded by an authorized email whitelist (`singh.aditya.44618@gmail.com`, `aman27pvt@gmail.com`).
   - First-time setup validates allowed email and stores a `bcrypt`-hashed credential in `admins`.
   - Subsequent logins issue a signed **JWT** token stored securely in `localStorage`, validated across protected `/api/admin/*` routes.

3. **GridFS Image Management**:
   - Project showcase images are uploaded directly via `POST /api/upload`.
   - `Multer` buffers the upload in memory, then streams the file chunks directly into **MongoDB GridFS** (`fs.files` & `fs.chunks`).
   - Images are retrieved via public streaming endpoint `GET /api/images/:id` with cache-control headers.

4. **In-Memory Fallback Resilience**:
   - In the event that MongoDB Atlas credentials are not yet configured or temporarily offline, the server automatically degrades to in-memory runtime storage to ensure the user interface and preview flows continue uninterrupted.

---

### Database Schemas & Collections

- **`admins`**: Administrator accounts, bcrypt password hash, setup timestamp, and role flags.
- **`projects`**: Dynamic studio portfolio items (title, category, tags, description, live links, GridFS image IDs, ordering).
- **`inquiries`**: Raw quote requests (client name, email, WhatsApp, selected plan, calculated total, reference code).
- **`conversations`**: Aggregated communication channels linked to inquiry references with state lifecycle tracking (`new`, `active`, `contacted`, `converted`, `archived`).
- **`messages`**: Threaded message records (sender role, timestamp, content, read indicators).
- **`fs.files` & `fs.chunks`**: MongoDB GridFS binary storage supporting high-resolution image uploads up to 50MB.

---

## 📦 Prerequisites

Ensure you have the following installed on your local environment:
- **Node.js**: `v20.0.0` or higher (Node 22 recommended; required by Capacitor 7)
- **npm**: `v9.0.0` or higher
- **MongoDB Atlas Account**: A free MongoDB Atlas cluster connection string (or local MongoDB v6+)
- **Java Development Kit (JDK)**: OpenJDK 17 or 21 (e.g. Android Studio JBR: `C:\Program Files\Android\Android Studio\jbr`)
- **Android SDK**: Android SDK Platform 34 or 35 and platform-tools (configured via `ANDROID_HOME`)

---

## ⚙️ Installation

### 1. Clone Repository
```bash
git clone https://github.com/BisonMooves/WebReve.git
cd WebReve
```

### 2. Install Dependencies

You can install all dependencies across the root, client, and server workspaces in a single command:

```bash
npm run install:all
```

*(Alternatively, install each component manually):*
```bash
# Root monorepo dependencies
npm install

# Backend server dependencies
npm install --prefix server

# Frontend client dependencies
npm install --prefix client
```

---

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory by copying from the provided example:

```bash
# On Windows PowerShell
Copy-Item server/.env.example server/.env

# On Linux / macOS / Bash
cp server/.env.example server/.env
```

Open `server/.env` and update the values:

```env
# MongoDB Atlas Connection URL (Replace with your actual credentials)
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/WebReve_DB?retryWrites=true&w=majority

# Target Database Name
DB_NAME=WebReve_DB

# Secure JWT Secret for Admin Session Signing
JWT_SECRET=your_custom_secure_jwt_secret_here

# Backend Server Port
PORT=5001

# Resend API Key for Email Notifications (Optional)
RESEND_API_KEY=re_your_resend_api_key_here
```

#### Client Environment Variables (Optional)
The client automatically detects `localhost:5001` or Render URLs. If you are hosting the backend on a custom domain or non-standard port, create `client/.env`:

```env
VITE_API_URL=http://localhost:5001
```

---

## 🚀 How to Run

### Database Initialization

To verify your MongoDB connection and ensure all collections and indexes (`admins`, `conversations`, `messages`, `projects`, etc.) are pre-created:

```bash
npm run init:db
```

---

### Development Mode

Run both the **Frontend** (Vite) and **Backend** (Express) concurrently with color-coded terminal output:

```bash
npm run dev
```

The services will start at:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001](http://localhost:5001)
- **API Status Check**: [http://localhost:5001/api/status](http://localhost:5001/api/status)

#### Running Services Separately

If you prefer separate terminal windows:

```bash
# Terminal 1: Run Backend (with Node.js auto-reloading --watch)
npm run dev:server

# Terminal 2: Run Frontend (Vite Dev Server)
npm run dev:client
```

---

### Production Mode

#### 1. Build the Frontend
```bash
npm run build
```
This bundles the React application into optimized static assets in `client/dist/`.

#### 2. Start the Production Server
```bash
npm start
```
Starts the backend Express server using `node server.js`.

---

## 📱 Android App Packaging (Capacitor)

WebRêve uses a unified codebase where the same React 19 frontend compiles to both the live web site and a native Android application via **Capacitor 7**.

### Architecture & Native Features
- **Unified Build Mode**: The native app compiles via `npm run build:mobile` (`vite build --mode mobile`), loading backend environment settings from `client/.env.mobile` without touching the web deployment.
- **Display-Only Image Resolution**: `resolveImageUrl()` dynamically formats MongoDB GridFS images (`/api/images/:id`) to the deployed HTTPS backend (`https://webreve-server.onrender.com`) without hardcoding hostnames into the database.
- **Modal-Aware Hardware Back Navigation**: Android hardware back button closes open modals, menus, and drawers first, falls back gracefully on direct deep links, and exits cleanly from the home route (`/`).
- **Cold-Start Warm-up**: On native launch, a lightweight status ping detects if the Render free-tier backend is waking from sleep and displays a non-intrusive waking banner with a full data-refetching Retry trigger.
- **Safe Area Insets**: Edge-to-edge support ensures header and footer elements never sit beneath the status bar or Android system navigation bar.

---

### Building the Debug APK

1. **Set `JAVA_HOME`** to OpenJDK 17 or 21 (for example, Android Studio's bundled JBR):
   ```powershell
   # Windows PowerShell
   $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

   # macOS / Linux
   export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
   ```

2. **Build and Sync Web Assets to Android**:
   ```bash
   cd client
   npm run android:sync
   ```

3. **Assemble the Debug APK**:
   ```bash
   cd client
   npm run android:apk
   ```

The compiled APK will be output to:
```text
client/android/app/build/outputs/apk/debug/app-debug.apk
```

---

### Creating a Keystore & Building a Signed Release (AAB / APK)

To publish on the Google Play Store or share a signed release build:

#### 1. Generate a Release Keystore
Run `keytool` from your terminal:
```bash
keytool -genkey -v -keystore webreve-release.keystore -alias webreve -keyalg RSA -keysize 2048 -validity 10000
```
> [!NOTE]
> Keep `webreve-release.keystore` and its passwords in a secure location. `*.keystore` and `*.jks` are excluded in `.gitignore` to prevent committing credentials.

#### 2. Configure Signing in `client/android/app/build.gradle`
Add your release signing configuration inside `android { ... }`:
```groovy
signingConfigs {
    release {
        storeFile file(System.getenv("KEYSTORE_PATH") ?: "webreve-release.keystore")
        storePassword System.getenv("KEYSTORE_PASSWORD")
        keyAlias System.getenv("KEY_ALIAS") ?: "webreve"
        keyPassword System.getenv("KEY_PASSWORD")
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

#### 3. Assemble Release Artifacts
```powershell
cd client/android

# Build Android App Bundle (.aab) for Google Play Store:
.\gradlew.bat bundleRelease

# Or Build Signed Release APK:
.\gradlew.bat assembleRelease
```
- Release AAB: `client/android/app/build/outputs/bundle/release/app-release.aab`
- Release APK: `client/android/app/build/outputs/apk/release/app-release.apk`

---

### Real Device Testing Checklist

When deploying to a physical Android device, verify:
- [ ] **Cold Start**: Launch the app when the Render backend is idle; observe the waking banner until the service spins up, and verify the Retry button repopulates the portfolio.
- [ ] **Admin Authentication**: Log in with authorized credentials (`singh.aditya.44618@gmail.com` or `aman27pvt@gmail.com`) over HTTPS.
- [ ] **Custom Pricing & Inquiries**: Configure a custom website package and submit an inquiry; confirm it saves to MongoDB Atlas and dispatches via Resend.
- [ ] **GridFS Image Loading**: Open delivered case studies and ensure images load smoothly from `/api/images/:id`.
- [ ] **Image Upload**: Upload a project photo using the system file picker without requiring special camera permissions.
- [ ] **Hardware Back Button**:
  - Open the mobile menu drawer or a project modal; pressing Back closes the modal first.
  - From `/project/:id`, pressing Back returns to `/`.
  - From `/`, pressing Back exits the app immediately without bouncing through `#work` anchor history.
- [ ] **Edge-to-Edge Layout**: Ensure the top brand bar sits comfortably below the status bar, and footer buttons are unobscured by the gesture navigation bar.

## 📂 Project Directory Structure

```text
WebReve/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/                 # Static assets (favicons, logos)
│   ├── src/
│   │   ├── assets/             # Images, project screenshots & SVGs
│   │   ├── components/         # Reusable UI widgets & Modals
│   │   │   ├── AdminAuthGate.jsx     # Admin authentication gate
│   │   │   ├── ImageEditorModal.jsx  # GridFS image uploader modal
│   │   │   ├── ProjectGallery.jsx    # Portfolio grid display
│   │   │   └── ...
│   │   ├── config/             # Environment & API helpers (api.js)
│   │   ├── context/            # React context providers
│   │   ├── pages/
│   │   │   ├── HomePage.jsx          # Studio landing page
│   │   │   ├── AdminPage.jsx         # Full CMS & messaging dashboard
│   │   │   └── ProjectDetailPage.jsx # Individual project showcase
│   │   ├── sections/           # Landing page sections (Hero, Pricing, etc.)
│   │   ├── App.jsx             # Route definitions
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind CSS directives & theme rules
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend API (Node.js + Express)
│   ├── data/                   # Default starter projects & seed data
│   ├── models/                 # Schemas, document formatters & index setup
│   │   ├── Admin.js            # Admin schema & formatters
│   │   ├── Inquiry.js          # Inquiry & status types
│   │   ├── Message.js          # Conversation & message formatters
│   │   ├── Project.js          # Project document schema
│   │   └── index.js            # Database index initializer
│   ├── scripts/
│   │   └── createCollection.js # MongoDB collection initialization tool
│   ├── .env.example            # Environment configuration template
│   ├── package.json
│   └── server.js               # Main Express application & API router
│
├── render.yaml                 # Render Blueprint for automated deployment
├── package.json                # Root monorepo script runner
└── README.md                   # Project documentation
```

---

## 📡 API Reference

All backend routes are dual-mounted at `/api/*` and root:

### Authentication (`/api/auth`)
- `POST /api/auth/check-email` — Check if admin email is whitelisted & password setup status
- `POST /api/auth/set-password` — Set password for whitelisted admin (first-time setup)
- `POST /api/auth/login` — Login admin with email & password, returns JWT
- `GET  /api/auth/verify` — Validate active JWT token
- `POST /api/auth/change-password` — Change password for authenticated admin

### Inquiries & Leads (`/api/inquiries`)
- `POST /api/inquiries` — Submit new project inquiry (calculates price, initiates conversation, notifies admin via Resend)
- `DELETE /api/inquiries/:id` — Delete inquiry record *(Admin Only)*

### Conversations & Messaging (`/api/admin/conversations`)
- `GET    /api/admin/conversations` — List all conversations with filters & status *(Admin Only)*
- `GET    /api/admin/conversations/:id` — Fetch single conversation thread and full message history *(Admin Only)*
- `POST   /api/admin/conversations/:id/messages` — Post reply or client message *(Admin Only)*
- `PATCH  /api/admin/conversations/:id` — Update conversation status or metadata *(Admin Only)*
- `DELETE /api/admin/conversations/:id` — Delete conversation thread *(Admin Only)*

### Portfolio CMS (`/api/projects`)
- `GET    /api/projects` — Fetch all public portfolio projects
- `GET    /api/projects/:id` — Fetch single project by ID
- `POST   /api/admin/projects` — Create new project *(Admin Only)*
- `PUT    /api/admin/projects/:id` — Update project details *(Admin Only)*
- `DELETE /api/admin/projects/:id` — Delete project *(Admin Only)*
- `POST   /api/admin/projects/sync` — Sync / reorder project portfolio *(Admin Only)*

### Media & GridFS (`/api/upload`, `/api/images`)
- `POST /api/upload` — Upload image (up to 50MB, returns GridFS image ID and stream URL)
- `GET  /api/images/:id` — Stream image directly from MongoDB GridFS

### System & Health (`/api/status`)
- `GET /api/status` — Health check, returns MongoDB connection status & database name
- `GET /api/admin/stats` — Metrics overview (total inquiries, revenue, conversions) *(Admin Only)*
- `GET /api/admin/collections-status` — Detailed MongoDB collection document counts *(Admin Only)*

---

## ☁️ Deployment (Render Blueprint)

WebRêve is pre-configured for automated deployment using the included [`render.yaml`](render.yaml) blueprint:

1. **Backend Service (`webreve-server`)**:
   - **Type**: Web Service (Node)
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add `MONGO_URL`, `JWT_SECRET`, and optional `RESEND_API_KEY` in your Render dashboard.

2. **Frontend Service (`webreve-client`)**:
   - **Type**: Static Site
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `./dist`
   - **Routes**: Automatic rewrite `/*` -> `/index.html` (SPA routing).
   - **Environment Variables**: `VITE_API_URL` pointing to the deployed backend service URL.
