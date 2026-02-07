
import React from 'react';
import { Account, AccountType } from '../../types';

interface TrialProps {
  accounts: Account[];
}

const TrialBalance: React.FC<TrialProps> = ({ accounts }) => {
  const totalDebit = accounts.reduce((sum, acc) => {
    if (acc.type === AccountType.ASSET || acc.type === AccountType.EXPENSE) {
      return sum + Math.max(0, acc.balance);
    }
    return sum + Math.max(0, -acc.balance);
  }, 0);

  const totalCredit = accounts.reduce((sum, acc) => {
    if (acc.type === AccountType.LIABILITY || acc.type === AccountType.EQUITY || acc.type === AccountType.REVENUE) {
      return sum + Math.max(0, acc.balance);
    }
    return sum + Math.max(0, -acc.balance);
  }, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">ميزان المراجعة</h2>
          <p className="text-slate-500">حتى تاريخ {new Date().toLocaleDateString('ar-EG')}</p>
        </div>
        <button className="flex items-center text-blue-600 font-bold hover:underline">
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          طباعة التقرير
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="px-6 py-4">اسم الحساب</th>
              <th className="px-6 py-4">كود الحساب</th>
              <th className="px-6 py-4 text-center">مدين</th>
              <th className="px-6 py-4 text-center">دائن</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.map(acc => {
              const isDebitType = acc.type === AccountType.ASSET || acc.type === AccountType.EXPENSE;
              const debit = isDebitType ? (acc.balance > 0 ? acc.balance : 0) : (acc.balance < 0 ? Math.abs(acc.balance) : 0);
              const credit = !isDebitType ? (acc.balance > 0 ? acc.balance : 0) : (acc.balance < 0 ? Math.abs(acc.balance) : 0);
              
              return (
                <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{acc.name}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono">{acc.code}</td>
                  <td className="px-6 py-4 text-center text-blue-600 font-medium">
                    {debit > 0 ? debit.toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-center text-indigo-600 font-medium">
                    {credit > 0 ? credit.toLocaleString() : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-bold text-lg">
              <td colSpan={2} className="px-6 py-4 text-slate-900">المجموع النهائي</td>
              <td className="px-6 py-4 text-center text-blue-700 border-r border-slate-200">
                {totalDebit.toLocaleString()} ريال
              </td>
              <td className="px-6 py-4 text-center text-indigo-700">
                {totalCredit.toLocaleString()} ريال
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100 flex items-center">
        <div className={`p-2 rounded-full ${Math.abs(totalDebit - totalCredit) < 0.01 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} ml-4`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-blue-900">حالة الميزان</h4>
          <p className="text-sm text-blue-700">
            {Math.abs(totalDebit - totalCredit) < 0.01 
              ? 'ميزان المراجعة متوازن. جميع القيود مطابقة للقواعد المحاسبية.' 
              : 'يوجد خلل في التوازن. يرجى مراجعة القيود اليومية.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrialBalance;
