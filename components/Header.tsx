
import React from 'react';

export interface HeaderProps {
  companyName: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ companyName, onLogout }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-medium text-sm flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full ml-2"></span>
          {companyName}
        </div>
      </div>
      
      <div className="flex items-center space-x-4 space-x-reverse">
        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </button>
        <button 
          onClick={onLogout}
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
};

export default Header;
