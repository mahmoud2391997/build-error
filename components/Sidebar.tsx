
import React from 'react';
import { ModuleType } from '../types';
import { APP_MODULES } from '../modules/registry';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeModules: ModuleType[];
  userName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, activeModules, userName }) => {
  const [expandedModules, setExpandedModules] = React.useState<ModuleType[]>([]);

  const toggleModule = (moduleType: ModuleType) => {
    setExpandedModules(prev => 
      prev.includes(moduleType) 
        ? prev.filter(m => m !== moduleType)
        : [...prev, moduleType]
    );
  };

  return (
    <div className="w-72 bg-slate-900 text-white flex flex-col h-full transition-all duration-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-l from-white to-slate-400 bg-clip-text text-transparent">
              ZENITH
            </h1>
            <p className="text-xs text-slate-400 font-medium">نظام إدارة متكامل</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Main Tab */}
        <div className="px-4 py-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl transition-all duration-300 group ${
              activeTab === 'dashboard' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className={`${activeTab === 'dashboard' ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <span className="font-semibold text-sm">لوحة القيادة</span>
            {activeTab === 'dashboard' && (
              <div className="w-2 h-2 bg-white rounded-full animate-pulse ml-auto"></div>
            )}
          </button>
        </div>

        {/* Module Tabs */}
        <div className="px-4 py-4 space-y-2">
          {APP_MODULES.map(module => {
            const isExpanded = expandedModules.includes(module.type);
            const isActive = activeModules.includes(module.type);
            const hasActiveTab = module.tabs.some(tab => activeTab === tab.id);

            return (
              <div key={module.type} className="space-y-1">
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.type)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 group ${
                    hasActiveTab 
                      ? 'bg-slate-800 text-white border border-slate-700' 
                      : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className={`p-2 rounded-lg transition-all ${
                      hasActiveTab ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={module.icon} /></svg>
                    </div>
                    <span className="font-semibold text-sm">{module.label}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {!isActive && (
                      <span className="bg-rose-900/50 text-rose-400 text-[9px] px-2 py-1 rounded-full border border-rose-800/30">
                        مغلق
                      </span>
                    )}
                    <svg 
                      className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Subtabs */}
                {isExpanded && (
                  <div className="ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {module.tabs.map(tab => {
                      const isTabActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          disabled={!isActive}
                          className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-2 rounded-lg transition-all duration-300 group ${
                            isTabActive 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : isActive 
                                ? 'text-slate-400 hover:bg-slate-700/50 hover:text-white' 
                                : 'opacity-30 grayscale cursor-not-allowed'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full transition-all ${
                            isTabActive 
                              ? 'bg-white' 
                              : isActive 
                                ? 'bg-slate-600 group-hover:bg-blue-400' 
                                : 'bg-slate-700'
                          }`}></div>
                          <span className="text-sm font-medium">{tab.label}</span>
                          {isTabActive && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse ml-auto"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 rounded-2xl border border-slate-600/30">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold border-2 border-slate-600 shadow-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate text-white">{userName}</p>
              <p className="text-xs text-slate-300 truncate">المسؤول الرئيسي</p>
            </div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SidebarItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ active, onClick, icon, label, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-2.5 rounded-xl transition-all duration-300 group ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
          : disabled 
            ? 'opacity-20 grayscale cursor-not-allowed' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <div className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`}>
        {icon}
      </div>
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
};

export default Sidebar;
