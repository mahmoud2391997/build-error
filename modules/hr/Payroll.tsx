
import React, { useState } from 'react';
import { PayrollRecord, Employee } from '../../types';

interface PayrollProps {
  payrolls: PayrollRecord[];
  employees: Employee[];
  onAction: (entity: string, action: 'add' | 'edit' | 'delete', data: PayrollRecord | string) => void;
}

const Payroll: React.FC<PayrollProps> = ({ payrolls, employees, onAction }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollRecord | null>(null);
  const [formData, setFormData] = useState<Partial<PayrollRecord>>({ 
    month: 'فبراير 2024', 
    status: 'PENDING', 
    amount: 0,
    employeeId: '',
    date: new Date().toISOString().split('T')[0] 
  });

  // Debug logging
  React.useEffect(() => {
    console.log('Payroll component - payrolls received:', payrolls);
    console.log('Payroll component - payrolls length:', payrolls?.length || 0);
  }, [payrolls]);

  const handleOpenModal = (record?: PayrollRecord) => {
    if (record) {
      setEditingPayroll(record);
      // Map database fields to form fields
      setFormData({
        id: record.id,
        employeeId: record.employeeId || '',
        month: record.month || '',
        status: record.status || 'PENDING',
        amount: record.amount || 0,
        date: record.date || new Date().toISOString().split('T')[0]
      });
    } else {
      setEditingPayroll(null);
      // Default amount to sum of active employee salaries
      const totalSalaries = (employees || []).filter(e => e.status === 'ACTIVE').reduce((sum, e) => sum + e.salary, 0);
      setFormData({ 
        month: '', 
        status: 'PENDING', 
        amount: totalSalaries,
        employeeId: (employees || [])[0]?.id || '',
        date: new Date().toISOString().split('T')[0] 
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      id: editingPayroll ? editingPayroll.id : crypto.randomUUID(),
      amount: Number(formData.amount),
    } as PayrollRecord;

    onAction('payroll', editingPayroll ? 'edit' : 'add', data);
    setShowModal(false);
  };

  const totalPaid = (payrolls || []).filter(p => p.status === 'PAID').reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">مسيرات الرواتب</h2>
          <p className="text-slate-500 text-sm mt-1">احتساب المستحقات الشهرية للموظفين</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center shadow-lg shadow-emerald-100"
        >
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          توليد مسير جديد
        </button>
      </div>

      <div className="bg-emerald-50/50 p-8 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="mr-6">
            <h3 className="text-xl font-black text-emerald-900">إجمالي المصروفات على الرواتب</h3>
            <p className="text-emerald-700 font-medium">إجمالي المبالغ المصروفة فعلياً</p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-3xl font-black text-emerald-900">{totalPaid.toLocaleString()} ريال</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
        <h4 className="font-black text-slate-800 mb-6">تاريخ المسيرات</h4>
        <div className="space-y-4">
          {(payrolls || []).length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-3xl">
              لا توجد مسيرات رواتب مسجلة
            </div>
          ) : [...(payrolls || [])].reverse().map((item) => (
            <div key={item.id} className="group flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div className="mr-4">
                  <p className="font-bold text-slate-900">{item.month}</p>
                  <p className="text-xs text-slate-400">تاريخ العملية: {item.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6 space-x-reverse">
                <p className="font-black text-slate-700">{item.amount.toLocaleString()} ريال</p>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${
                  item.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                }`}>
                  {item.status === 'PAID' ? 'تم الصرف' : 'قيد الانتظار'}
                </span>
                
                <div className="flex space-x-2 space-x-reverse transition-all">
                  <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => onAction('payroll', 'delete', item.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-xl font-black mb-6">{editingPayroll ? 'تعديل مسير' : 'توليد مسير جديد'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">الموظف</label>
                <select className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-emerald-500" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} required>
                  <option value="">اختر موظف</option>
                  {(employees || []).map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} - {emp.salary.toLocaleString()} ريال</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">الشهر / الفترة</label>
                <input type="text" placeholder="مثال: فبراير 2024" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-emerald-500" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">إجمالي المبلغ</label>
                <input type="number" placeholder="0.00" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-emerald-500" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">التاريخ</label>
                <input type="date" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-emerald-500" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">الحالة</label>
                <select className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-emerald-500" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                  <option value="PAID">تم الصرف</option>
                  <option value="PENDING">قيد الانتظار</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex space-x-3 space-x-reverse">
              <button type="submit" className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors">حفظ المسير</button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Payroll;
