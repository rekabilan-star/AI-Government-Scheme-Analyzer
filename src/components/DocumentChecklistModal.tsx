import React, { useState } from 'react';
import { RequiredDocument } from '../types/index.js';
import { X, CheckSquare, Square, FileCheck, ShieldAlert, Download, ExternalLink } from 'lucide-react';

interface DocumentChecklistModalProps {
  schemeName: string;
  documents: RequiredDocument[];
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentChecklistModal: React.FC<DocumentChecklistModalProps> = ({
  schemeName,
  documents,
  isOpen,
  onClose
}) => {
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleCheck = (docName: string) => {
    setCheckedDocs(prev => ({
      ...prev,
      [docName]: !prev[docName]
    }));
  };

  const completedCount = documents.filter(d => checkedDocs[d.name]).length;
  const totalCount = documents.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
              <FileCheck className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">Document Readiness Checklist</h3>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-sm">{schemeName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-900">Readiness:</span>
            <span className="text-blue-700">{completedCount} of {totalCount} documents ready ({progressPercent}%)</span>
          </div>
          <div className="w-24 h-2 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Document List */}
        <div className="p-6 overflow-y-auto space-y-3.5 divide-y divide-slate-100">
          {documents.map((doc, idx) => {
            const isChecked = !!checkedDocs[doc.name];
            return (
              <div
                key={idx}
                onClick={() => toggleCheck(doc.name)}
                className={`pt-3.5 first:pt-0 flex items-start gap-3 cursor-pointer group select-none transition-colors ${
                  isChecked ? 'opacity-80' : ''
                }`}
              >
                <div className="mt-0.5 text-blue-600 shrink-0">
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${isChecked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {doc.name}
                    </span>
                    {doc.mandatory ? (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded">
                        Mandatory
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        Optional / Supporting
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {doc.description}
                  </p>

                  {doc.issuingAuthority && (
                    <span className="inline-block text-[11px] text-slate-500 mt-1">
                      Issuing Authority: <span className="font-medium text-slate-700">{doc.issuingAuthority}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Notice & Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>This checklist is for your personal readiness. Documents are verified at official portals.</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
