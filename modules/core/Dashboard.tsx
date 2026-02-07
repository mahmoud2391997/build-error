import React from 'react';
import { Company, ModuleType } from '../../types';
import { APP_MODULES, ModuleDefinition } from '../registry';

interface DashboardProps {
  company: Company;
  onToggleModule: (module: ModuleType) => void;
  totalBalance: number;
  transactionsCount: number;
}

const Dashboard: React.FC<DashboardProps> = ({ company, onToggleModule, totalBalance, transactionsCount }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">لوحة القيادة</h1>
          <p className="text-slate-500 mt-2 font-medium">مرحباً بك في {company?.name || 'شركتكم'}، إليك نظرة سريعة على المنظومة.</p>
        </div>
        <div className="text-left">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تاريخ الاشتراك</p>
            <p className="font-bold text-slate-700">{company?.createdAt ? new Date(company.createdAt).toLocaleDateString('ar-EG') : '-'}</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 grid-rows-2 gap-6">
        <StatCard 
          title="رصيد الصندوق" 
          value={`${totalBalance?.toLocaleString() || '0'} ريال`} 
          color="blue"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          title="إجمالي القيود" 
          value={`${transactionsCount?.toString() || '0'}`}
          color="indigo"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard 
          title="الوحدات المفعّلة" 
          value={(company.activeModules || []).length.toString()} 
          color="emerald"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2 2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
        />
        <StatCard 
          title="حالة الشركة" 
          value="نشطة" 
          color="purple"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Dynamic Modules Management Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-800">إدارة وحدات المنظومة</h2>
          <span className="text-xs bg-slate-200 text-slate-600 px-3 py-1 rounded-full font-bold">كل شركة تظهر لها الوحدات المخصصة فقط</span>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          {APP_MODULES.slice(0, 4).map(module => (
            <ModuleToggleCard 
              key={module.type}
              module={module}
              isActive={(company.activeModules || []).includes(module.type)}
              onToggle={() => onToggleModule(module.type)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  color: 'blue' | 'indigo' | 'emerald' | 'purple' | 'green' | 'yellow' | 'red';
  icon: React.ReactNode;
}

// Fixed StatCard with proper color classes
const StatCard: React.FC<StatCardProps> = ({ title, value, color, icon }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group">
      <div className={`absolute top-0 right-0 w-24 h-24 ${colorClasses[color].split(' ')[0]} rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform opacity-50`}></div>
      <div className="flex items-center justify-between mb-6 relative">
        <div className={`p-4 rounded-2xl ${colorClasses[color]} shadow-inner`}>
          {icon}
        </div>
      </div>
      <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</h3>
      <p className="text-3xl font-black text-slate-900 mt-2">{value}</p>
    </div>
  );
};

interface ModuleToggleCardProps {
  module: ModuleDefinition;
  isActive: boolean;
  onToggle: () => void;
}

const ModuleToggleCard: React.FC<ModuleToggleCardProps> = ({ module, isActive, onToggle }) => (
  <div className={`group p-8 rounded-[2.5rem] border-2 transition-all duration-500 relative overflow-hidden flex flex-col justify-between ${
    isActive 
      ? 'border-blue-600 bg-white shadow-2xl shadow-blue-600/10' 
      : 'border-slate-100 bg-white hover:border-slate-300'
  }`}>
    {isActive && (
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-blue-600 to-indigo-600"></div>
    )}
    
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-blue-600 text-white shadow-xl rotate-3' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={module.icon} /></svg>
        </div>
        <button 
          onClick={onToggle}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-500 focus:outline-none focus:ring-4 ${isActive ? 'bg-blue-600 focus:ring-blue-100' : 'bg-slate-200 focus:ring-slate-100'}`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-500 ${isActive ? '-translate-x-8' : '-translate-x-1'}`} />
        </button>
      </div>
      
      <h4 className="text-xl font-black text-slate-900">{module.label}</h4>
      <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">{module.description}</p>
      
      {/* Dynamic Sub-tabs list */}
      <div className="mt-8 flex flex-wrap gap-2">
        {module.tabs.length > 0 ? (
          module.tabs.map(tab => (
            <span 
              key={tab.id} 
              className={`text-[10px] font-black px-3 py-1.5 rounded-xl border transition-colors ${
                isActive 
                  ? 'bg-blue-50 border-blue-100 text-blue-600' 
                  : 'bg-slate-50 border-slate-100 text-slate-400'
              }`}
            >
              {tab.label}
            </span>
          ))
        ) : (
          <span className="text-[10px] font-black px-3 py-1.5 rounded-xl border bg-slate-50 border-dashed border-slate-200 text-slate-400 italic">لا توجد أقسام فرعية حالياً</span>
        )}
      </div>
    </div>

    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
      <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
        {isActive ? 'الوحدة مفعّلة' : 'الوحدة غير نشطة'}
      </span>
      {isActive && (
        <div className="flex items-center text-blue-600 text-xs font-black animate-pulse">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full ml-2"></span>
          جاهز للعمل
        </div>
      )}
    </div>
  </div>
);

export default Dashboard;