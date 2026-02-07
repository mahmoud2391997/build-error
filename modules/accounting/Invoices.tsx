import React, { useState, useEffect } from 'react';
import { Account } from '../../types';

interface InvoicesProps {
  accounts: Account[];
  entries: any[];
  onAction: (entity: string, action: string, data: any) => void;
  onAdd?: (entry: any) => void;
  onPostInvoice?: (entry: any) => void;
  onEdit?: (entry: any) => void;
  onDelete?: (id: string) => void;
}

const Invoices: React.FC<InvoicesProps> = ({ accounts, entries, onAction, onAdd, onPostInvoice, onEdit, onDelete }) => {
  const [invoiceCustomer, setInvoiceCustomer] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState<number | ''>('');
  const [paymentCustomer, setPaymentCustomer] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS'>('IDLE');
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
  const [editCustomer, setEditCustomer] = useState('');
  const [editAmount, setEditAmount] = useState<number | ''>('');

  // Filter entries to show only invoices (INV- and PAY- prefixes)
  const invoices = entries?.filter(entry => 
    entry.reference?.startsWith('INV-') || entry.reference?.startsWith('PAY-')
  ) || [];

  useEffect(() => {
    // This will trigger a refresh of the invoice list from parent
    console.log('Invoices component - accounts loaded:', accounts.length);
    console.log('Available accounts:', accounts.map(a => `${a.code}: ${a.name}`));
  }, [invoices, accounts]);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(invoiceAmount);
    if (numAmount <= 0 || !invoiceCustomer.trim()) {
      console.error('Invalid invoice data');
      return;
    }

    console.log('Creating invoice with accounts:', accounts);
    console.log('Customer:', invoiceCustomer, 'Amount:', numAmount);

    const arAcc = accounts.find(a => a.code === '1201');
    const salesAcc = accounts.find(a => a.code === '4101');

    console.log('AR Account (1201):', arAcc);
    console.log('Sales Account (4101):', salesAcc);

    if (!arAcc || !salesAcc) {
      console.error('Required accounts not found. Available accounts:', accounts.map(a => `${a.code}: ${a.name}`));
      return;
    }

    // Create invoice via API call - this will be handled by parent component
    const invoiceEntry = {
      date: new Date().toISOString().split('T')[0],
      reference: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      description: `فاتورة مبيعات عميل: ${invoiceCustomer}`,
      lines: [
        { accountId: arAcc.id, description: `استحقاق عميل: ${invoiceCustomer}`, debit: numAmount, credit: 0 },
        { accountId: salesAcc.id, description: `إثبات إيراد مبيعات: ${invoiceCustomer}`, debit: 0, credit: numAmount },
      ],
      status: 'PENDING'
    };

    if (onPostInvoice) {
      onPostInvoice(invoiceEntry);
    } else if (onAdd) {
      onAdd(invoiceEntry);
    } else {
      onAction('journal', 'create', invoiceEntry);
    }
    
    setInvoiceCustomer('');
    setInvoiceAmount('');
    setStatus('SUCCESS');
    setTimeout(() => setStatus('IDLE'), 3000);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(paymentAmount);
    if (numAmount <= 0 || !paymentCustomer.trim()) {
      console.error('Invalid payment data');
      return;
    }

    console.log('Creating payment with accounts:', accounts);
    console.log('Customer:', paymentCustomer, 'Amount:', numAmount);

    const cashAcc = accounts.find(a => a.code === '1101');
    const arAcc = accounts.find(a => a.code === '1201');

    console.log('Cash Account (1101):', cashAcc);
    console.log('AR Account (1201):', arAcc);

    if (!cashAcc || !arAcc) {
      console.error('Required accounts not found. Available accounts:', accounts.map(a => `${a.code}: ${a.name}`));
      return;
    }

    // Create payment via API call - this will be handled by parent component
    const paymentEntry = {
      date: new Date().toISOString().split('T')[0],
      reference: `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      description: `سند قبض نقدية من عميل: ${paymentCustomer}`,
      lines: [
        { accountId: cashAcc.id, description: `تحصيل نقدية من: ${paymentCustomer}`, debit: numAmount, credit: 0 },
        { accountId: arAcc.id, description: `تخفيض حساب المدين: ${paymentCustomer}`, debit: 0, credit: numAmount },
      ],
      status: 'PAID'
    };

    if (onPostInvoice) {
      onPostInvoice(paymentEntry);
    } else if (onAdd) {
      onAdd(paymentEntry);
    } else {
      onAction('journal', 'create', paymentEntry);
    }
    
    setPaymentCustomer('');
    setPaymentAmount('');
    setStatus('SUCCESS');
    setTimeout(() => setStatus('IDLE'), 3000);
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    // Extract customer name from description
    const customerMatch = invoice.description?.match(/عميل: (.+)$/) || 
                          invoice.description?.match(/من: (.+)$/);
    const customer = customerMatch ? customerMatch[1] : '';
    setEditCustomer(customer);
    
    // Calculate total amount from debit lines
    const totalAmount = invoice.lines?.reduce((sum: number, line: any) => sum + (line.debit || 0), 0) || 0;
    setEditAmount(totalAmount);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      if (onDelete) {
        onDelete(id);
      } else {
        onAction('journal', 'delete', id);
      }
    }
  };

  const handleUpdateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    
    const numAmount = Number(editAmount);
    if (numAmount <= 0 || !editCustomer.trim()) {
      console.error('Invalid invoice data');
      return;
    }

    const isPayment = editingInvoice.reference?.startsWith('PAY-');
    let updatedEntry;

    if (isPayment) {
      const cashAcc = accounts.find(a => a.code === '1101');
      const arAcc = accounts.find(a => a.code === '1201');

      if (!cashAcc || !arAcc) {
        console.error('Required accounts not found');
        return;
      }

      updatedEntry = {
        ...editingInvoice,
        description: `سند قبض نقدية من عميل: ${editCustomer}`,
        lines: [
          { accountId: cashAcc.id, description: `تحصيل نقدية من: ${editCustomer}`, debit: numAmount, credit: 0 },
          { accountId: arAcc.id, description: `تخفيض حساب المدين: ${editCustomer}`, debit: 0, credit: numAmount },
        ],
      };
    } else {
      const arAcc = accounts.find(a => a.code === '1201');
      const salesAcc = accounts.find(a => a.code === '4101');

      if (!arAcc || !salesAcc) {
        console.error('Required accounts not found');
        return;
      }

      updatedEntry = {
        ...editingInvoice,
        description: `فاتورة مبيعات عميل: ${editCustomer}`,
        lines: [
          { accountId: arAcc.id, description: `استحقاق عميل: ${editCustomer}`, debit: numAmount, credit: 0 },
          { accountId: salesAcc.id, description: `إثبات إيراد مبيعات: ${editCustomer}`, debit: 0, credit: numAmount },
        ],
      };
    }

    if (onEdit) {
      onEdit(updatedEntry);
    } else {
      onAction('journal', 'edit', updatedEntry);
    }

    setEditingInvoice(null);
    setEditCustomer('');
    setEditAmount('');
    setStatus('SUCCESS');
    setTimeout(() => setStatus('IDLE'), 3000);
  };

  const handleCancelEdit = () => {
    setEditingInvoice(null);
    setEditCustomer('');
    setEditAmount('');
  };

  // Get status text and style
  const getStatusInfo = (status: string, reference: string) => {
    const isPayment = reference?.startsWith('PAY-');
    
    if (isPayment) {
      return {
        text: 'مدفوعة',
        style: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      };
    }
    
    switch (status) {
      case 'PAID':
        return {
          text: 'مدفوعة',
          style: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      case 'PENDING':
        return {
          text: 'قيد الانتظار',
          style: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      default:
        return {
          text: 'قيد التنفيذ',
          style: 'bg-blue-100 text-blue-800 border-blue-200'
        };
    }
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-900/10 p-8 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">الفواتير والتحصيل</h2>
                <p className="text-slate-500 text-sm mt-1">إدارة الفواتير وتسجيل المدفوعات</p>
              </div>
            </div>
          </div>
          
          {/* Invoice Form */}
          <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 rounded-2xl p-6 mb-6 border border-blue-100/60">
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">إنشاء فاتورة جديدة</h3>
            </div>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">اسم العميل</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={invoiceCustomer}
                    onChange={(e) => setInvoiceCustomer(e.target.value)}
                    className="w-full px-4 py-3 pr-10 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white transition-all duration-200"
                    placeholder="أدخل اسم العميل"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">المبلغ</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <input
                    type="number"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-3 pr-10 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white transition-all duration-200"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-700/30 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>إنشاء فاتورة</span>
                </div>
              </button>
            </form>
          </div>

          {/* Payment Form */}
          <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/30 rounded-2xl p-6 mb-6 border border-green-100/60">
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <div className="bg-green-500 p-2 rounded-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">تسجيل دفعة</h3>
            </div>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">اسم العميل</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={paymentCustomer}
                    onChange={(e) => setPaymentCustomer(e.target.value)}
                    className="w-full px-4 py-3 pr-10 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 bg-white transition-all duration-200"
                    placeholder="أدخل اسم العميل"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">المبلغ</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-3 pr-10 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 bg-white transition-all duration-200"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-green-700 transition-all duration-200 shadow-lg shadow-green-600/25 hover:shadow-green-700/30 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>تسجيل دفعة</span>
                </div>
              </button>
            </form>
          </div>

          {/* Invoice List */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="bg-slate-600 p-2 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">سجل الفواتير</h3>
              </div>
              <div className="text-sm text-slate-500">
                {invoices.length} فاتورة
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200/60">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/60">
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">التاريخ</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">الرقم</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">العميل</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">الوصف</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">المبلغ</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-8 py-12 text-center text-slate-500 bg-gradient-to-b from-white to-slate-50">
                          <div className="flex flex-col items-center space-y-3">
                            <div className="bg-slate-100 p-3 rounded-full">
                              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-slate-600">لا توجد فواتير</p>
                              <p className="text-sm text-slate-400">ابدأ بإنشاء فاتورة جديدة</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      invoices.map((invoice, idx) => {
                        // Extract customer name from description
                        const customerMatch = invoice.description?.match(/عميل: (.+)$/) || 
                                            invoice.description?.match(/من: (.+)$/);
                        const customer = customerMatch ? customerMatch[1] : '-';
                        
                        // Calculate total amount from debit lines
                        const totalAmount = invoice.lines?.reduce((sum: number, line: any) => {
                          const debitAmount = typeof line.debit === 'string' ? parseFloat(line.debit) : (line.debit || 0);
                          return sum + debitAmount;
                        }, 0) || 0;
                        const statusInfo = getStatusInfo(invoice.status, invoice.reference);
                        
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors duration-150">
                            <td className="px-6 py-4 text-sm text-center text-slate-600 font-medium">{invoice.date}</td>
                            <td className="px-6 py-4 text-sm text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
                                invoice.reference?.startsWith('INV-') 
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-green-100 text-green-800 border-green-200'
                              }`}>
                                {invoice.reference}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-center text-slate-700 font-medium">{customer}</td>
                            <td className="px-6 py-4 text-sm text-center text-slate-600">{invoice.description || '-'}</td>
                            <td className="px-6 py-4 text-sm text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${
                                invoice.reference?.startsWith('INV-') 
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-green-100 text-green-800 border-green-200'
                              }`}>
                                {totalAmount.toLocaleString()} ر.س
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.style}`}>
                                {statusInfo.text}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-center">
                              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                                <button
                                  onClick={() => handleEdit(invoice)}
                                  className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-slate-200/60"
                                  title="تعديل"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(invoice.id)}
                                  className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-slate-200/60"
                                  title="حذف"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {status === 'SUCCESS' && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-5 rounded-3xl shadow-2xl animate-in slide-in-from-bottom flex items-center z-50 border border-slate-700">
          <div className="bg-emerald-500 p-2 rounded-full ml-4">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="font-black text-lg">تمت العملية بنجاح</p>
        </div>
      )}

      {editingInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {editingInvoice.reference?.startsWith('PAY-') ? 'تعديل الدفعة' : 'تعديل الفاتورة'}
              </h3>
              <button
                onClick={handleCancelEdit}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">اسم العميل</label>
                <input
                  type="text"
                  value={editCustomer}
                  onChange={(e) => setEditCustomer(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white transition-all duration-200"
                  placeholder="أدخل اسم العميل"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">المبلغ</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-300/60 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white transition-all duration-200"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
              <div className="flex items-center space-x-3 space-x-reverse pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-700/30"
                >
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 px-4 rounded-xl font-bold hover:bg-slate-200 transition-all duration-200"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Invoices;
