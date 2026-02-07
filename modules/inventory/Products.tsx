import React, { useState, useEffect } from 'react';
import { Product } from '../../types';

interface ProductsProps {
  products: Product[];
  onAction: (entity: string, action: 'add' | 'edit' | 'delete', data: Product | string) => void;
  onRefresh?: () => void;
}

const Products: React.FC<ProductsProps> = ({ products = [], onAction, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({ name: '', sku: '', price: 0, stock: 0, category: 'إلكترونيات' });
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS'>('IDLE');
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('Products component - products received:', products);
    console.log('Products component - products length:', products?.length);
  }, [products]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', sku: '', price: 0, stock: 0, category: 'إلكترونيات' });
    }
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المنتج "${name}"؟`)) {
      setIsLoading(true);
      try {
        console.log('Deleting product:', id);
        
        // Call the onAction which will trigger the delete operation
        await onAction('products', 'delete', id);
        
        // Show success message
        setStatus('SUCCESS');
        setTimeout(() => setStatus('IDLE'), 3000);
        
        console.log('Product deleted successfully, state should refresh automatically');
      } catch (error) {
        console.error('Error deleting product:', error);
        // You might want to show an error message here
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      id: editingProduct ? editingProduct.id : crypto.randomUUID(),
      price: Number(formData.price),
      stock: Number(formData.stock),
    } as Product;

    onAction('products', editingProduct ? 'edit' : 'add', data);
    setShowModal(false);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'نفذ المخزون', style: 'bg-rose-100 text-rose-800 border-rose-200' };
    if (stock < 10) return { text: 'مخزون منخفض', style: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { text: 'متوفر', style: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'إلكترونيات':
        return 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z';
      case 'ملحقات':
        return 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4';
      case 'أثاث':
        return 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6';
      default:
        return 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4';
    }
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-900/10 p-8 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-2xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">إدارة المنتجات</h2>
                <p className="text-slate-500 text-sm mt-1">عرض وتعديل قائمة الأصناف والمخزون</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <button 
                onClick={() => onRefresh?.()}
                disabled={isLoading}
                className="group px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all duration-200 border border-slate-200/60 disabled:opacity-50 disabled:cursor-not-allowed"
                title="تحديث البيانات"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <svg className="w-4 h-4 group-animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>تحديث</span>
                </div>
              </button>
              <button 
                onClick={() => handleOpenModal()}
                disabled={isLoading}
                className="group px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all duration-200 shadow-lg shadow-purple-600/25 hover:shadow-purple-700/30 transform hover:scale-[1.02] active:scale-[0.98] border border-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{isLoading ? 'جاري المعالجة...' : 'إضافة منتج'}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Stats Cards - Now as 2x2 Grid */}
          <div className="grid grid-cols-2 grid-rows-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/60 hover:shadow-lg hover:shadow-blue-900/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-blue-600 uppercase">إجمالي</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{products.length}</p>
              <p className="text-sm text-slate-600 mt-1">منتج</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100/60 hover:shadow-lg hover:shadow-green-900/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-green-500 p-2 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-green-600 uppercase">قيمة</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}
              </p>
              <p className="text-sm text-slate-600 mt-1">ريال سعودي</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100/60 hover:shadow-lg hover:shadow-amber-900/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-amber-500 p-2 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-amber-600 uppercase">منخفض</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{products.filter(p => p.stock < 10).length}</p>
              <p className="text-sm text-slate-600 mt-1">مخزون منخفض</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100/60 hover:shadow-lg hover:shadow-purple-900/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-purple-600 uppercase">فئات</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{new Set(products.map(p => p.category)).size}</p>
              <p className="text-sm text-slate-600 mt-1">فئة منتجات</p>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="bg-slate-600 p-2 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">قائمة المنتجات</h3>
              </div>
              <div className="text-sm text-slate-500">
                {products.length} منتج
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200/60">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/60">
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">المنتج</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">الفئة</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">السعر</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">المخزون</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-8 py-12 text-center text-slate-500 bg-gradient-to-b from-white to-slate-50">
                          <div className="flex flex-col items-center space-y-3">
                            <div className="bg-slate-100 p-3 rounded-full">
                              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-slate-600">لا توجد منتجات</p>
                              <p className="text-sm text-slate-400">ابدأ بإضافة منتج جديد</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      products.map(product => {
                        const stockStatus = getStockStatus(product.stock);
                        return (
                          <tr key={product.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                            <td className="px-6 py-4 text-sm text-center">
                              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                                <div className="bg-slate-100 p-2 rounded-lg">
                                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={getCategoryIcon(product.category)} />
                                  </svg>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-slate-800">{product.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                                {product.sku}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                                {product.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-200">
                                {product.price.toLocaleString()} ر.س
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                                product.stock === 0 
                                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                                  : product.stock < 10 
                                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}>
                                {product.stock}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${stockStatus.style}`}>
                                {stockStatus.text}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-center">
                              <div className="flex items-center justify-center space-x-2 space-x-reverse">
                                <button
                                  onClick={() => handleOpenModal(product)}
                                  disabled={isLoading}
                                  className="p-2 bg-slate-50 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all border border-slate-200/60 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="تعديل"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id, product.name)}
                                  disabled={isLoading}
                                  className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-slate-200/60 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-xl font-black mb-6">{editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">اسم المنتج</label>
                <input type="text" placeholder="مثال: لابتوب ألترا" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">رقم الموديل (SKU)</label>
                <input type="text" placeholder="LAP-001" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-blue-500 font-mono" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">السعر</label>
                  <input type="number" placeholder="0.00" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-blue-500" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">المخزون الحالي</label>
                  <input type="number" placeholder="0" required className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-blue-500" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">الفئة</label>
                <select className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-blue-500" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="إلكترونيات">إلكترونيات</option>
                  <option value="ملحقات">ملحقات</option>
                  <option value="أثاث">أثاث</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex space-x-3 space-x-reverse">
              <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">حفظ المنتج</button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">إلغاء</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Products;