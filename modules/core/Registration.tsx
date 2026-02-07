
import React, { useState } from 'react';

interface RegistrationProps {
  onRegister: (name: string, email: string) => void;
  hasCompanies: boolean;
  onBackToList: () => void;
}

const Registration: React.FC<RegistrationProps> = ({ onRegister, hasCompanies, onBackToList }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) onRegister(name, email);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden" dir="rtl">
      {/* Decorative Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-12 relative z-10 border border-white/20 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 mb-6 mx-auto transform rotate-3">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">ابدأ مع Zenith ERP</h2>
          <p className="text-slate-500 font-medium">أنشئ مساحة عمل احترافية لشركتك في ثوانٍ معدودة</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 mr-1">اسم المنشأة / الشركة</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-50 focus:bg-white outline-none transition-all font-bold text-lg"
              placeholder="مثال: شركة الحلول الذكية"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 mr-1">البريد الإلكتروني المالي</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-50 focus:bg-white outline-none transition-all font-bold text-lg"
              placeholder="admin@company.com"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] hover:bg-black transform transition-all active:scale-[0.98] shadow-2xl shadow-slate-200 text-xl"
          >
            تأسيس مساحة العمل
          </button>
        </form>

        {hasCompanies && (
          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <button 
              onClick={onBackToList}
              className="text-blue-600 font-black flex items-center justify-center mx-auto hover:underline underline-offset-8"
            >
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              العودة لقائمة شركاتي
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Registration;
