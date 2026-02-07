
import React, { useState } from 'react';
import { Employee } from '../../types';

interface EmployeesProps {
  employees: Employee[];
  onAction: (entity: string, action: 'add' | 'edit' | 'delete', data: Employee | string) => void;
}

const Employees: React.FC<EmployeesProps> = ({ employees, onAction }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({ name: '', role: '', department: '', salary: 0, status: 'ACTIVE' });

  const handleOpenModal = (emp?: Employee) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormData(emp);
    } else {
      setEditingEmployee(null);
      setFormData({ name: '', role: '', department: '', salary: 0, status: 'ACTIVE' });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      id: editingEmployee ? editingEmployee.id : crypto.randomUUID(),
      salary: Number(formData.salary),
    } as Employee;

    console.log('Employees handleSubmit - formData:', formData);
    console.log('Employees handleSubmit - final data:', data);

    onAction('employees', editingEmployee ? 'edit' : 'add', data);
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">إدارة الموظفين</h2>
          <p className="text-slate-500 text-sm mt-1">تنظيم بيانات الكادر البشري للشركة</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center shadow-lg shadow-indigo-100"
        >
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          إضافة موظف
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
              <th className="px-8 py-5">الموظف</th>
              <th className="px-8 py-5">المسمى الوظيفي</th>
              <th className="px-8 py-5">القسم</th>
              <th className="px-8 py-5">الراتب الأساسي</th>
              <th className="px-8 py-5 text-center">الحالة</th>
              <th className="px-8 py-5 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-20 text-slate-400 font-bold">لا يوجد موظفون مسجلون حالياً</td></tr>
            ) : employees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-5">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center ml-4 text-indigo-600 font-bold border border-indigo-100">
                      {emp.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-800">{emp.name}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-slate-600">{emp.role}</td>
                <td className="px-8 py-5 text-sm font-bold text-indigo-600">{emp.department}</td>
                <td className="px-8 py-5 font-black text-slate-900">{emp.salary.toLocaleString()} ريال</td>
                <td className="px-8 py-5">
                  <div className="flex justify-center">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${
                      emp.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {emp.status === 'ACTIVE' ? 'على رأس العمل' : 'في إجازة'}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-center space-x-2 space-x-reverse transition-all">
                    <button onClick={() => handleOpenModal(emp)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => onAction('employees', 'delete', emp.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
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
            <h3 className="text-xl font-black mb-6">{editingEmployee ? 'تعديل موظف' : 'إضافة موظف جديد'}</h3>
            <div className="space-y-4">
              <input type="text" placeholder="اسم الموظف" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="text" placeholder="المسمى الوظيفي" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
              <input type="text" placeholder="القسم" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
              <input type="number" placeholder="الراتب" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500" value={formData.salary} onChange={e => setFormData({...formData, salary: Number(e.target.value)})} />
              <select className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                <option value="ACTIVE">على رأس العمل</option>
                <option value="ON_LEAVE">في إجازة</option>
              </select>
            </div>
            <div className="mt-8 flex space-x-3 space-x-reverse">
              <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl">حفظ</button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Employees;
