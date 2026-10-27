import React from 'react';
import {
  FileCode2,
  Terminal,
  Server,
  Database,
  Cpu,
  ShieldCheck,
  CheckCircle,
  Copy,
  BookOpen,
  Layers,
  Sparkles
} from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>CSE Final Year Project Technical Dossier</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Architecture & Windows Demonstration Guide
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
          Comprehensive project documentation explaining the MERN architecture, deterministic eligibility rule engine, Google Gemini AI integration, database schemas, and local execution steps.
        </p>
      </div>

      {/* 1. Technology Stack Architecture */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>1. Technology Stack & Multi-Tier Architecture</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-blue-900 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Frontend Layer</span>
            </span>
            <ul className="space-y-1 text-slate-600">
              <li>• React 19 SPA with Vite bundler</li>
              <li>• TypeScript for type safety</li>
              <li>• Tailwind CSS for accessible portal UI</li>
              <li>• React Router DOM for SPA routing</li>
              <li>• Recharts for interactive analytics</li>
              <li>• Axios centralized REST client</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>Backend & AI Layer</span>
            </span>
            <ul className="space-y-1 text-slate-600">
              <li>• Node.js & Express.js REST API</li>
              <li>• JWT (jsonwebtoken) session auth</li>
              <li>• bcrypt password hashing</li>
              <li>• Google Gemini 3.8 Flash SDK (@google/genai)</li>
              <li>• Server-side AI prompt grounding</li>
              <li>• Deterministic rule engine</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-purple-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-purple-600" />
              <span>Database Layer</span>
            </span>
            <ul className="space-y-1 text-slate-600">
              <li>• MongoDB Atlas (Mongoose ODM)</li>
              <li>• Resilient persistent JSON fallback</li>
              <li>• Pre-seeded 12 authentic schemes</li>
              <li>• Automatic seed of default admin</li>
              <li>• Strict schema validation</li>
              <li>• Citizen application tracking</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Deterministic Rule Engine vs AI Boundary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>2. Deterministic Rule Engine vs AI Boundary</span>
        </h2>
        <p className="text-xs text-slate-700 leading-relaxed">
          A fundamental requirement for civic applications is preventing AI hallucination in official welfare decisions. The architecture strictly enforces a boundary:
        </p>

        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-2">
          <p className="font-bold">Execution Rule:</p>
          <p>
            1. <strong>Rule-Based Evaluator (Deterministic):</strong> Executes mathematical evaluations on user age, household income ceiling, state domicile, occupation, gender, and social category. This deterministically sets status as <code>Eligible</code>, <code>Potentially Eligible</code>, <code>Ineligible</code>, or <code>Insufficient Information</code>.
          </p>
          <p>
            2. <strong>Gemini 3.8 Flash (Natural Language Explainer):</strong> Receives the mathematical evaluation and explains it in empathetic, accessible language. The system prompt strictly prohibits the AI model from altering or contradicting the deterministic assessment.
          </p>
        </div>
      </div>

      {/* 3. Pre-Seeded Demonstration Credentials */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <span>3. Pre-Seeded Demonstration Accounts</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-blue-900 block">Administrator Account</span>
            <p className="text-slate-600">Email: <code className="bg-white px-1.5 py-0.5 rounded border font-mono">admin@gov.in</code></p>
            <p className="text-slate-600">Password: <code className="bg-white px-1.5 py-0.5 rounded border font-mono">Admin@1234</code></p>
            <p className="text-[11px] text-slate-500">Access: Scheme CRUD, analytics charts, citizen feedback review.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-emerald-900 block">Citizen User Account</span>
            <p className="text-slate-600">Email: <code className="bg-white px-1.5 py-0.5 rounded border font-mono">citizen@demo.in</code></p>
            <p className="text-slate-600">Password: <code className="bg-white px-1.5 py-0.5 rounded border font-mono">Citizen@1234</code></p>
            <p className="text-[11px] text-slate-500">Profile: Ramesh Kumar, Farmer, UP, Income ₹1.4L (pre-matched with PM-KISAN, PM-JAY).</p>
          </div>
        </div>
      </div>

      {/* 4. Windows Local Execution Steps */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-600" />
          <span>4. Step-by-Step Local Execution on Windows</span>
        </h2>

        <div className="space-y-4 text-xs text-slate-700">
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Step 1: Prerequisites</h3>
            <p className="text-slate-600">
              Ensure <strong>Node.js (v18+ or v20+)</strong> and <strong>npm</strong> are installed on your Windows machine. Verify by opening PowerShell or CMD:
            </p>
            <div className="mt-1.5 p-3 bg-slate-900 text-slate-100 rounded-lg font-mono flex items-center justify-between">
              <code>node -v && npm -v</code>
              <button onClick={() => copyToClipboard('node -v && npm -v')} title="Copy">
                <Copy className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-1">Step 2: Install Project Dependencies</h3>
            <div className="mt-1.5 p-3 bg-slate-900 text-slate-100 rounded-lg font-mono flex items-center justify-between">
              <code>npm install</code>
              <button onClick={() => copyToClipboard('npm install')} title="Copy">
                <Copy className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-1">Step 3: Configure Environment Variables (.env)</h3>
            <p className="text-slate-600">
              Create a file named <code>.env</code> in the project root containing:
            </p>
            <div className="mt-1.5 p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] leading-relaxed">
              <code>
                PORT=3000<br />
                GEMINI_API_KEY=your_gemini_api_key_here<br />
                JWT_SECRET=scheme_analyzer_jwt_secure_secret_key_2026<br />
                MONGODB_URI=mongodb+srv://&lt;user&gt;:&lt;password&gt;@cluster0.mongodb.net/scheme_analyzer<br />
              </code>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              *Note: If MONGODB_URI is left empty or omitted, the app will automatically run on its persistent database engine with full data persistence.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-1">Step 4: Start the Full-Stack Application</h3>
            <div className="mt-1.5 p-3 bg-slate-900 text-slate-100 rounded-lg font-mono flex items-center justify-between">
              <code>npm run dev</code>
              <button onClick={() => copyToClipboard('npm run dev')} title="Copy">
                <Copy className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>
            <p className="text-slate-600 mt-1.5">
              Open your browser and navigate to <code>http://localhost:3000</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
