
import React, { useState } from 'react';
import { Lead } from '../../types';

interface LeadsProps {
  leads: Lead[];
  onAction: (entity: string, action: 'add' | 'edit' | 'delete', data: Lead | string) => void;
}

const Leads: React.FC<LeadsProps> = ({ leads, onAction }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState<Partial<Lead>>({ name: '', company: '', value: 0, stage: 'NEW', chance: 10 });

  const handleOpenModal = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      // Ensure company is a string for the form input
      // Fallback to tenant name if company_name is null
      const companyVal = typeof lead.company === 'string' 
        ? lead.company 
        : (lead.company_name || lead.company?.name || '');
      
      setFormData({
        ...lead,
        company: companyVal
      });
    } else {
      setEditingLead(null);
      setFormData({ name: '', company: '', value: 0, stage: 'NEW', chance: 10 });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      id: editingLead ? editingLead.id : crypto.randomUUID(),
      value: Number(formData.value),
      chance: Number(formData.chance),
    } as Lead;

    onAction('leads', editingLead ? 'edit' : 'add', data);
    setShowModal(false);
  };

  const getStageLabel = (stage: Lead['stage']) => {
    switch (stage) {
      case 'NEW': return 'جديد';
      case 'CONTACTED': return 'تم التواصل';
      case 'PROPOSAL': return 'تقديم عرض';
      case 'NEGOTIATION': return 'مفاوضات';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">العملاء المحتملين</h2>
          <p className="text-slate-500 text-sm mt-1">تتبع رحلة المبيعات وتحويل الفرص لصفقات</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-rose-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-700 transition-all flex items-center shadow-lg shadow-rose-100"
        >
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-9-4.512a9.48 9.48 0 010 16.024M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          إضافة فرصة بيعية
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {leads.length === 0 ? (
          <div className="lg:col-span-3 py-20 bg-white rounded-[2rem] border border-dashed border-slate-300 text-center text-slate-400 font-bold">لا يوجد فرص بيعية حالياً</div>
        ) : leads.map(lead => (
          <div key={lead.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative border-t-4 border-t-rose-500">
            <div className="absolute top-4 left-4 flex space-x-2 space-x-reverse transition-all">
              <button onClick={() => handleOpenModal(lead)} className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <button onClick={() => onAction('leads', 'delete', lead.id)} className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-lg shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
            
            <div className="flex justify-between mb-4">
              <span className={`px-2 py-1 rounded-lg text-[10px] font-black border ${
                lead.stage === 'NEW' ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-blue-50 text-blue-600 border-blue-100'
              }`}>
                {getStageLabel(lead.stage)}
              </span>
            </div>
            
            <h4 className="text-lg font-black text-slate-900">{lead.name}</h4>
            <p className="text-slate-500 text-sm font-medium">
              {typeof lead.company === 'string' ? lead.company : lead.company_name || lead.company?.name}
            </p>
            
            <div className="mt-6 pt-6 border-t border-slate-50">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">القيمة المتوقعة</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{Number(lead.value).toLocaleString()} ريال</p>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">احتمالية الإغلاق</p>
                  <p className={`text-lg font-black mt-1 ${lead.chance > 50 ? 'text-emerald-500' : 'text-amber-500'}`}>{lead.chance}%</p>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${lead.chance > 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${lead.chance}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-xl font-black mb-6">{editingLead ? 'تعديل فرصة' : 'إضافة فرصة جديدة'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">اسم العميل</label>
                <input type="text" placeholder="مثال: محمد أحمد" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-rose-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">الشركة</label>
                <input type="text" placeholder="اسم الشركة" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-rose-500" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">القيمة المتوقعة</label>
                  <input type="number" placeholder="0.00" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-rose-500" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">الاحتمالية %</label>
                  <input type="number" placeholder="0" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-rose-500" value={formData.chance} onChange={e => setFormData({...formData, chance: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">مرحلة البيع</label>
                <select className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-rose-500" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value as any})}>
                  <option value="NEW">جديد</option>
                  <option value="CONTACTED">تم التواصل</option>
                  <option value="PROPOSAL">تقديم عرض</option>
                  <option value="NEGOTIATION">مفاوضات</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex space-x-3 space-x-reverse">
              <button type="submit" className="flex-1 bg-rose-600 text-white font-bold py-3 rounded-xl hover:bg-rose-700 transition-colors">حفظ الفرصة</button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Leads;
