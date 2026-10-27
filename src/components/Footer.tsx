import React from 'react';
import { Link } from 'react-router-dom';
import { Building, ShieldAlert, Award, FileCode2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16 border-t border-slate-800">
      {/* Official Disclaimer Banner */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3 text-xs text-amber-300/90 leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p>
            <strong className="font-semibold text-white">Important Civic Advisory:</strong> This portal provides automated rule-based eligibility assessments and AI-grounded recommendations for informational guidance. Final eligibility verification and fund disbursement are strictly subject to official scrutiny by the designated Central / State Government Ministries upon submission through respective verified portals.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white">
                <Building className="w-4 h-4 text-amber-300" />
              </div>
              <span>SchemeAnalyzer</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-Powered Government Scheme Analyzer and Recommendation System. Designed to eliminate discovery friction and simplify public welfare access for Indian citizens.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-[11px] text-slate-300 font-medium border border-slate-700">
                <Award className="w-3.5 h-3.5 text-blue-400" />
                <span>CSE Major Project (MERN + GenAI)</span>
              </span>
            </div>
          </div>

          {/* Col 2: Citizen Modules */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              Citizen Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/schemes" className="text-slate-400 hover:text-white transition-colors">
                  Explore Government Schemes
                </Link>
              </li>
              <li>
                <Link to="/eligibility" className="text-slate-400 hover:text-white transition-colors">
                  Rule-Based Eligibility Analyzer
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="text-slate-400 hover:text-white transition-colors">
                  Personalized AI Recommendations
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-slate-400 hover:text-white transition-colors">
                  Conversational AI Scheme Bot
                </Link>
              </li>
              <li>
                <Link to="/applications" className="text-slate-400 hover:text-white transition-colors">
                  Application Tracking System
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Welfare Sectors */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              Sectors Covered
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Agriculture & Farmers (PM-KISAN)</li>
              <li>Healthcare Cover (Ayushman Bharat)</li>
              <li>Housing Subsidies (PMAY)</li>
              <li>Micro Loans & Vendors (PM SVANidhi, Mudra)</li>
              <li>Higher Education & Scholarships (NSP)</li>
              <li>Social Security & Pension (APY)</li>
            </ul>
          </div>

          {/* Col 4: Project Info & Administration */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              System & Project
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/documentation" className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                  <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Architecture & Docs</span>
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-slate-400 hover:text-white transition-colors">
                  Administrative Dashboard
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-slate-400 hover:text-white transition-colors">
                  Citizen Ratings & Feedback
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-slate-400 hover:text-white transition-colors">
                  Profile Management
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 AI-Powered Government Scheme Analyzer. Built with React, TypeScript, Express, MongoDB & Gemini API.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Local Node.js Full-Stack Service</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">System Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
