
import React, { useState } from 'react';
import { Warehouse } from '../../types';

interface WarehousesProps {
  warehouses: Warehouse[];
  onAction: (entity: string, action: 'add' | 'edit' | 'delete', data: Warehouse | string) => void;
}

const Warehouses: React.FC<WarehousesProps> = ({ warehouses, onAction }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState<Partial<Warehouse>>({ name: '', location: '', capacity: 0 });

  const handleOpenModal = (wh?: Warehouse) => {
    if (wh) {
      setEditingWarehouse(wh);
      setFormData(wh);
    } else {
      setEditingWarehouse(null);
      setFormData({ name: '', location: '', capacity: 0 });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      id: editingWarehouse ? editingWarehouse.id : crypto.randomUUID(),
      capacity: Number(formData.capacity),
      occupancy: editingWarehouse ? editingWarehouse.occupancy : 0
    } as Warehouse;

    console.log('Warehouses handleSubmit - editingWarehouse:', editingWarehouse);
    console.log('Warehouses handleSubmit - formData:', formData);
    console.log('Warehouses handleSubmit - final data:', data);

    onAction('warehouses', editingWarehouse ? 'edit' : 'add', data);
    setShowModal(false);
  };

  return (
    <div key={warehouses.length} className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">إدارة المستودعات</h2>
          <p className="text-slate-500 text-sm mt-1">توزيع المخزون عبر المواقع الجغرافية</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center shadow-lg"
        >
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          مستودع جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {warehouses.length === 0 ? (
          <div className="md:col-span-2 py-20 bg-white rounded-[2rem] border border-dashed border-slate-300 text-center text-slate-400 font-bold">لا توجد مستودعات مسجلة حالياً</div>
        ) : warehouses.map(wh => {
          return (
            <div key={wh.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:shadow-xl transition-all relative">
              <div className="absolute bottom-6 left-6 flex space-x-2 space-x-reverse transition-all">
                <button onClick={() => handleOpenModal(wh)} className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg shadow-sm border border-slate-100">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => onAction('warehouses', 'delete', wh.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-lg shadow-sm border border-slate-100">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">السعة الكلية</span>
                  <span className="text-sm font-bold text-slate-700">{wh.capacity.toLocaleString()} وحدة</span>
                </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-900">{wh.name}</h3>
              <p className="text-slate-500 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {wh.location}
              </p>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-xl font-black mb-6">{editingWarehouse ? 'تعديل مستودع' : 'مستودع جديد'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">اسم المستودع</label>
                <input type="text" placeholder="مثال: مستودع جدة" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-slate-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">الموقع</label>
                <input type="text" placeholder="العنوان أو الإحداثيات" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-slate-900" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">السعة الاستيعابية</label>
                <input type="number" placeholder="0" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-slate-900" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} />
              </div>
            </div>
            <div className="mt-8 flex space-x-3 space-x-reverse">
              <button type="submit" className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">حفظ</button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Warehouses;
