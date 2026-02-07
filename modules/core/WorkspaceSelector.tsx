
import React from 'react';
import { Company } from '../../types';

interface WorkspaceSelectorProps {
  companies: Company[];
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}

const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({ companies, onSelect, onCreateNew }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden" dir="rtl">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]"></div>
      </div>

      <div className="w-full max-w-5xl z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div className="text-right mb-6 md:mb-0">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">مساحات العمل الخاصة بك</h1>
            <p className="text-slate-400 font-medium text-lg">اختر الشركة التي تود العمل عليها اليوم</p>
          </div>
          <button 
            onClick={onCreateNew}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/50 flex items-center group"
          >
            <svg className="w-5 h-5 ml-3 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            تأسيس شركة جديدة
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companies.map(company => (
            <div 
              key={company.id} 
              onClick={() => onSelect(company.id)}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600/20 to-transparent rounded-bl-[5rem] -mr-8 -mt-8 group-hover:scale-125 transition-transform"></div>
              
              <div className="flex items-center justify-between mb-8 relative">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-inner group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div className="text-left">
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-widest">نشط</span>
                </div>
              </div>

              <h3 className="text-2xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors">{company.name}</h3>
              <p className="text-slate-500 text-sm font-bold mb-6 truncate">{company.adminEmail}</p>
              
              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">منذ {new Date(company.createdAt).toLocaleDateString('ar-EG')}</span>
                <div className="text-blue-400 font-black text-sm flex items-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all">
                  دخول
                  <svg className="w-4 h-4 mr-2 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSelector;
