# AI-POWERED GOVERNMENT SCHEME ANALYZER AND RECOMMENDATION SYSTEM
**CSE Final Year Major Project (Full-Stack MERN + Google Gemini GenAI)**

---

## 1. Project Overview
The **AI-Powered Government Scheme Analyzer and Recommendation System** is an intelligent civic portal designed to eliminate discovery friction and simplify public welfare access for Indian citizens. It features:
- **Centralized Government Welfare Directory**: 12+ authentic central sector and centrally sponsored schemes across Agriculture, Healthcare, Housing, Loans, Higher Education, Social Security, and Women Empowerment.
- **Deterministic Rule-Based Eligibility Engine**: Mathematical comparison of age brackets, income thresholds, state domicile, occupation, gender, and social category to prevent hallucination.
- **Gemini 3.8 Flash AI Integration**: Server-side natural-language explainer and conversational AI chat assistant grounded strictly in verified scheme database records.
- **Interactive Document Readiness Checklist**: Real-time checklists with issuing authorities and instructions.
- **Application Lifecycle Tracking**: User-maintained tracking across stages (*Not Started*, *Preparing Documents*, *Ready to Apply*, *Submitted*, *Completed*).
- **Administrative Analytics Dashboard**: Real-time charts rendered with Recharts, scheme inventory management (CRUD), and citizen feedback review.

---

## 2. Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Axios, React Router DOM
- **Backend**: Node.js, Express.js REST API, tsx runtime
- **AI Service**: Google Gemini 3.8 Flash (`@google/genai` TypeScript SDK)
- **Security & Auth**: JSON Web Tokens (JWT), bcrypt password hashing, role-based authorization
- **Database**: MongoDB Atlas via Mongoose ODM, with resilient persistent fallback

---

## 3. Pre-Seeded Demonstration Accounts

| Role | Email | Password | Pre-Configured Persona |
| :--- | :--- | :--- | :--- |
| **Central Administrator** | `admin@gov.in` | `Admin@1234` | Full access to Scheme CRUD, analytics, feedback management |
| **Citizen User** | `citizen@demo.in` | `Citizen@1234` | Ramesh Kumar, Farmer, UP, Income ₹1.4L (Matched with PM-KISAN, PM-JAY) |

*(Quick 1-click fill buttons are provided on the Login page for seamless college demonstration).*

---

## 4. Local Execution on Windows (VS Code)

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Step 1: Clone or Open Project in VS Code
Open the project folder in VS Code or PowerShell:
```bash
cd government-scheme-analyzer
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a file named `.env` in the root folder:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=scheme_analyzer_jwt_secure_secret_key_2026
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/scheme_analyzer?retryWrites=true&w=majority
```

### Step 4: Run Application
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```
