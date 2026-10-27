import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';

// Pages
import { Home } from './pages/Home.js';
import { SchemesExplore } from './pages/SchemesExplore.js';
import { SchemeDetails } from './pages/SchemeDetails.js';
import { EligibilityAnalyzer } from './pages/EligibilityAnalyzer.js';
import { EligibilitySimulator } from './pages/EligibilitySimulator.js';
import { Recommendations } from './pages/Recommendations.js';
import { ChatAssistant } from './pages/ChatAssistant.js';
import { ApplicationTracker } from './pages/ApplicationTracker.js';
import { SavedSchemes } from './pages/SavedSchemes.js';
import { Profile } from './pages/Profile.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { FeedbackPage } from './pages/FeedbackPage.js';
import { DocumentationPage } from './pages/DocumentationPage.js';
import { VivaHub } from './pages/VivaHub.js';
import { SchemeCompare } from './pages/SchemeCompare.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-['Inter',sans-serif]">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* Public Citizen Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/schemes" element={<SchemesExplore />} />
              <Route path="/schemes/:id" element={<SchemeDetails />} />
              <Route path="/compare" element={<SchemeCompare />} />
              <Route path="/eligibility" element={<EligibilityAnalyzer />} />
              <Route path="/simulator" element={<EligibilitySimulator />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/chat" element={<ChatAssistant />} />
              <Route path="/viva-hub" element={<VivaHub />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/documentation" element={<DocumentationPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Citizen Routes */}
              <Route
                path="/applications"
                element={
                  <ProtectedRoute>
                    <ApplicationTracker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <SavedSchemes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdminRole={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
