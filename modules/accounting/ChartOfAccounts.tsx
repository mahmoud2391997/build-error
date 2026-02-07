
import React, { useState } from 'react';
import { Account, AccountType } from '../../types';

interface COAProps {
  accounts: Account[];
  onAction: (entity: string, action: 'add' | 'edit' | 'delete', data: Account | string) => void;
}

const ChartOfAccounts: React.FC<COAProps> = ({ accounts, onAction }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<Partial<Account>>({ code: '', name: '', type: AccountType.ASSET, balance: 0 });

  // Debug: Log accounts data
  console.log('ChartOfAccounts component - accounts loaded:', accounts.length, 'Available accounts:', accounts);

  const handleOpenModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData(account);
    } else {
      setEditingAccount(null);
      setFormData({ code: '', name: '', type: AccountType.ASSET, balance: 0 });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      id: editingAccount ? editingAccount.id : crypto.randomUUID(),
      balance: formData.balance || 0
    } as Account;

    onAction('coa', editingAccount ? 'edit' : 'add', data);
    setShowModal(false);
  };

  const getTypeBadgeColor = (type: AccountType) => {
    switch (type) {
      case AccountType.ASSET: return 'bg-blue-50 text-blue-600 border-blue-100';
      case AccountType.LIABILITY: return 'bg-amber-50 text-amber-600 border-amber-100';
      case AccountType.EQUITY: return 'bg-purple-50 text-purple-600 border-purple-100';
      case AccountType.REVENUE: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case AccountType.EXPENSE: return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getTypeText = (type: AccountType) => {
    switch (type) {
      case AccountType.ASSET: return 'أصول';
      case AccountType.LIABILITY: return 'خصوم';
      case AccountType.EQUITY: return 'حقوق ملكية';
      case AccountType.REVENUE: return 'إيرادات';
      case AccountType.EXPENSE: return 'مصروفات';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">دليل الحسابات</h2>
          <p className="text-slate-500 text-sm mt-1">هيكلة الحسابات المالية للشركة</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center shadow-lg"
        >
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          إضافة حساب جديد
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-widest border-b">
              <th className="px-8 py-5 font-black">كود الحساب</th>
              <th className="px-8 py-5 font-black">اسم الحساب</th>
              <th className="px-8 py-5 font-black">نوع الحساب</th>
              <th className="px-8 py-5 font-black text-left">الرصيد الحالي</th>
              <th className="px-8 py-5 font-black text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.sort((a, b) => a.code.localeCompare(b.code)).map(account => (
              <tr key={account.id} className="group hover:bg-slate-50/80 transition-all">
                <td className="px-8 py-5">
                  <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600">
                    {account.code}
                  </span>
                </td>
                <td className="px-8 py-5 font-bold text-slate-800">{account.name}</td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase ${getTypeBadgeColor(account.type)}`}>
                    {getTypeText(account.type)}
                  </span>
                </td>
                <td className="px-8 py-5 font-black text-slate-900 text-left">
                  <span className={account.balance < 0 ? 'text-rose-600' : ''}>
                    {account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} ريال
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-center space-x-1 space-x-reverse transition-all">
                    <button onClick={() => handleOpenModal(account)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => {
                      if (window.confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
                        console.log('Delete button clicked - account data:', account);
                        onAction('coa', 'delete', account);
                      }
                    }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-xl font-black mb-6">{editingAccount ? 'تعديل حساب' : 'إضافة حساب جديد'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">كود الحساب</label>
                <input type="text" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-slate-900 font-mono" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">اسم الحساب</label>
                <input type="text" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-slate-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">نوع الحساب</label>
                <select className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-slate-900" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as AccountType})}>
                  <option value={AccountType.ASSET}>أصول</option>
                  <option value={AccountType.LIABILITY}>خصوم</option>
                  <option value={AccountType.EQUITY}>حقوق الملكية</option>
                  <option value={AccountType.REVENUE}>إيرادات</option>
                  <option value={AccountType.EXPENSE}>مصروفات</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">الرصيد الحالي</label>
                <input type="number" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-slate-900" value={formData.balance} onChange={e => setFormData({...formData, balance: parseFloat(e.target.value)})} />
              </div>
            </div>
            <div className="mt-8 flex space-x-3 space-x-reverse">
              <button type="submit" className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">حفظ الحساب</button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChartOfAccounts;
