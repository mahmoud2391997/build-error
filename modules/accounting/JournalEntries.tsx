'use client';

import React, { useState, useEffect } from 'react';
import { JournalEntry, Account, JournalEntryLine } from '../../types';

interface JournalProps {
  entries: JournalEntry[];
  accounts: Account[];
  onAdd: (entry: Omit<JournalEntry, 'id'>) => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

const JournalEntries: React.FC<JournalProps> = ({ entries, accounts, onAdd, onEdit, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lines, setLines] = useState<JournalEntryLine[]>([
    { accountId: '', description: '', debit: 0, credit: 0 },
    { accountId: '', description: '', debit: 0, credit: 0 }
  ]);

  console.log('JournalEntries component - accounts prop:', accounts);
  console.log('JournalEntries component - accounts length:', accounts?.length);

  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleLineChange = (index: number, field: keyof JournalEntryLine, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const addLine = () => setLines([...lines, { accountId: '', description: '', debit: 0, credit: 0 }]);
  const removeLine = (index: number) => lines.length > 2 && setLines(lines.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entryData: any = {
      date,
      description,
      reference: `JV-${Date.now().toString().slice(-6)}`, // Generate reference if not provided
      lines: lines.filter(l => l.accountId !== '') // Remove empty lines
    };

    const existingEntry = entries.find((entry: JournalEntry) => entry.id === editingEntryId);
    
    if (editingEntryId && existingEntry) {
      // Editing existing entry
      onEdit({
        ...existingEntry,
        ...entryData,
      });
    } else {
      // Creating new entry
      onAdd(entryData);
    }

    // Reset form
    setShowForm(false);
    setEditingEntryId(null);
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setLines([
      { accountId: '', description: '', debit: 0, credit: 0 },
      { accountId: '', description: '', debit: 0, credit: 0 }
    ]);
  };

  const handleView = (entry: JournalEntry) => {
    setViewingEntry(entry);
    setShowViewModal(true);
  };

  const handleEdit = (entry: JournalEntry) => {
    console.log('handleEdit called with entry:', entry);
    console.log('handleEdit - entry lines:', entry.lines);
    
    // Populate form with entry data for editing
    setEditingEntryId(entry.id);
    setDescription(entry.description || '');
    // Handle date format (YYYY-MM-DD)
    const entryDate = entry.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    setDate(entryDate);
    
    // Map lines, handling both camelCase and snake_case for account ID
    setLines(entry.lines.map((line: any) => ({
      accountId: line.accountId || line.account_id || line.account?.id || '',
      description: line.description || '',
      debit: typeof line.debit === 'number' ? line.debit : parseFloat(line.debit || '0'),
      credit: typeof line.credit === 'number' ? line.credit : parseFloat(line.credit || '0')
    })));
    
    // Show form when editing
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القيد؟')) {
      onDelete(id);
    }
  };



  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">القيود اليومية</h2>
          <p className="text-slate-500 text-sm mt-1">سجل الحركات المالية المزدوجة</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center shadow-xl shadow-blue-600/20"
          >
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            إنشاء قيد جديد
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-l from-blue-500 to-indigo-500"></div>
          
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-800">قيد يومية يدوي</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">وصف القيد العام</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all font-bold" 
                placeholder="مثال: فاتورة كهرباء شهر يناير..." 
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">تاريخ الاستحقاق</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all font-bold" 
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-6">
              <div className="col-span-4">الحساب المالي</div>
              <div className="col-span-4">بيان السطر</div>
              <div className="col-span-2 text-center">مدين (+)</div>
              <div className="col-span-2 text-center">دائن (-)</div>
            </div>
            
            <div className="space-y-3">
              {lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 items-center group">
                  <div className="col-span-4">
                    <select 
                      value={line.accountId}
                      onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                      required
                    >
                      <option value="">-- اختر الحساب --</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.code} | {acc.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-4">
                    <input 
                      type="text"
                      value={line.description}
                      onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="بيان تفصيلي لهذا الحساب..."
                    />
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="number"
                      step="0.01"
                      value={line.debit?.toString() || ''}
                      onChange={(e) => handleLineChange(idx, 'debit', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-blue-50/30 border border-blue-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-center text-blue-700"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-2 relative group-item">
                    <input 
                      type="number"
                      step="0.01"
                      value={line.credit?.toString() || ''}
                      onChange={(e) => handleLineChange(idx, 'credit', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-rose-50/30 border border-rose-100 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 font-black text-center text-rose-700"
                      placeholder="0.00"
                    />
                    <button 
                      type="button" 
                      onClick={() => removeLine(idx)} 
                      className="absolute -left-8 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-10">
            <button type="button" onClick={addLine} className="flex items-center text-blue-600 font-black hover:text-blue-700 group">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ml-3 group-hover:bg-blue-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              </div>
              إضافة سطر حساب
            </button>
            
            <div className="flex space-x-12 space-x-reverse items-center">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 mb-1">إجمالي المدين</span>
                <span className="text-2xl font-black text-blue-600">{totalDebit.toLocaleString()}</span>
              </div>
              <div className="text-slate-300 text-3xl font-thin">/</div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 mb-1">إجمالي الدائن</span>
                <span className="text-2xl font-black text-rose-600">{totalCredit.toLocaleString()}</span>
              </div>
              
              <div className="mr-6">
                <button 
                  type="submit" 
                  disabled={!isBalanced}
                  className={`px-12 py-4 rounded-2xl font-black text-lg transition-all ${
                    isBalanced 
                      ? 'bg-slate-900 text-white shadow-2xl hover:bg-black hover:-translate-y-1' 
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  {editingEntryId ? 'تحديث القيد' : 'حفظ وترحيل القيد'}
                </button>
                {!isBalanced && totalDebit > 0 && (
                  <p className="text-[10px] font-black text-rose-500 mt-2 text-center animate-pulse">القيد غير متوازن!</p>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <h4 className="font-black text-slate-800">تاريخ العمليات المسجلة</h4>
          <div className="flex space-x-2 space-x-reverse">
            <div className="px-3 py-1 bg-white border rounded-lg text-xs font-bold text-slate-500">فلترة حسب التاريخ</div>
            <div className="px-3 py-1 bg-white border rounded-lg text-xs font-bold text-slate-500">تصدير PDF</div>
          </div>
        </div>
        <table className="w-full text-right border-collapse">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <tr className="border-b">
              <th className="px-8 py-5">تاريخ القيد</th>
              <th className="px-8 py-5">الرقم المرجعي</th>
              <th className="px-8 py-5">البيان العام</th>
              <th className="px-8 py-5 text-left">قيمة القيد</th>
              <th className="px-8 py-5 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries && entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center opacity-30">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p className="font-bold">لا يوجد قيود يومية للمنشأة حتى الآن</p>
                  </div>
                </td>
              </tr>
            ) : (
              [...entries].reverse().map(entry => (
                <tr key={entry.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-5 text-sm font-bold text-slate-600">{entry.date}</td>
                  <td className="px-8 py-5 font-black text-blue-600 font-mono text-sm">{entry.reference}</td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-800 text-sm">{entry.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{entry.lines.length} أسطر محاسبية</p>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-900 text-left">
                    {entry.lines.reduce((sum, l) => sum + l.debit, 0).toLocaleString()} ريال
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center space-x-2 space-x-reverse">
                      <button onClick={() => handleView(entry)} className="p-2 text-slate-400 hover:text-blue-600 transition-all" title="عرض">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button onClick={() => handleEdit(entry)} className="p-2 text-slate-400 hover:text-green-600 transition-all" title="تعديل">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                      </button>
                      <button onClick={() => handleDelete(entry.id)} className="p-2 text-slate-400 hover:text-red-600 transition-all" title="حذف">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {showViewModal && viewingEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300 relative">
            <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-l from-blue-500 to-indigo-500"></div>
            
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">تفاصيل القيد اليومي</h3>
                  <p className="text-slate-500 text-sm mt-1">عرض كامل تفاصيل القيد المحاسبي</p>
                </div>
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="text-slate-400 hover:text-slate-600 transition-all p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">تاريخ القيد</label>
                  <p className="text-lg font-bold text-slate-800">{viewingEntry.date}</p>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">الرقم المرجعي</label>
                  <p className="text-lg font-black text-blue-600 font-mono">{viewingEntry.reference}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">البيان العام</label>
                  <p className="text-lg font-bold text-slate-800">{viewingEntry.description || 'لا يوجد وصف'}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-lg font-black text-slate-800 mb-4">أسطر القيد المحاسبية</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-right text-xs font-black text-slate-400 uppercase">الحساب</th>
                        <th className="px-4 py-3 text-right text-xs font-black text-slate-400 uppercase">البيان</th>
                        <th className="px-4 py-3 text-center text-xs font-black text-slate-400 uppercase">مدين</th>
                        <th className="px-4 py-3 text-center text-xs font-black text-slate-400 uppercase">دائن</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewingEntry.lines.map((line, idx) => {
                        const account = accounts.find(acc => acc.id === line.accountId);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-800">{account ? `${account.code} | ${account.name}` : 'حساب غير موجود'}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">{line.description || '-'}</td>
                            <td className="px-4 py-3 text-center font-black text-blue-600">
                              {line.debit > 0 ? line.debit.toLocaleString() : '-'}
                            </td>
                            <td className="px-4 py-3 text-center font-black text-green-600">
                              {line.credit > 0 ? line.credit.toLocaleString() : '-'}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="border-t-2 border-slate-300 font-black">
                        <td colSpan={2} className="px-4 py-4 text-right text-slate-800">المجموع</td>
                        <td className="px-4 py-4 text-center text-blue-600">
                          {viewingEntry.lines.reduce((sum, l) => sum + l.debit, 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-center text-green-600">
                          {viewingEntry.lines.reduce((sum, l) => sum + l.credit, 0).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalEntries;
