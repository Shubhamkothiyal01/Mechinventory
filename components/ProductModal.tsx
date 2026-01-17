
import React, { useState } from 'react';
import { Product, UserRole } from '../types';
import { CATEGORIES, Icons, WAREHOUSES, UOMS } from '../constants';
import { generateProductDescription, generateProductImage } from '../services/geminiService';

interface ProductModalProps {
  product?: Product | null;
  userRole: UserRole;
  onSave: (product: Partial<Product>) => void;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, userRole, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    hsnCode: '94054090', // Default example HSN
    brand: '',
    category: CATEGORIES[0],
    uom: 'NOS',
    quantity: 0,
    minStock: 5,
    maxStock: 1000,
    purchasePrice: 0,
    sellingPrice: 0,
    warehouseId: WAREHOUSES[0].id,
    description: '',
    imageUrl: `https://picsum.photos/seed/${Math.random()}/400/300`,
    ...product
  });

  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  const handleAIDescription = async () => {
    if (!formData.name) return alert('Enter asset name first');
    setIsGeneratingDesc(true);
    try {
      const desc = await generateProductDescription(formData.name, formData.category || '');
      setFormData(prev => ({ ...prev, description: desc }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleAIImage = async () => {
    if (!formData.name) return alert('Enter asset name first');
    setIsGeneratingImg(true);
    try {
      const url = await generateProductImage(formData.name, formData.category || '');
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const canEditPrices = userRole === 'Owner';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {product ? 'Modify Master Record' : 'Register New Asset'}
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Inventory Management Terminal</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl text-slate-400 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        <div className="p-8 space-y-8 overflow-y-auto max-h-[75vh]">
          {!canEditPrices && (
            <div className="px-6 py-3 bg-amber-50 border border-amber-100 rounded-2xl text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Pricing restricted to Business Owner. Manager can update logistics and descriptions.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Name</label>
              <input 
                type="text" 
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Wireless Router X1"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HSN/SAC Code</label>
              <input 
                type="text" 
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono font-bold"
                value={formData.hsnCode}
                onChange={e => setFormData({ ...formData, hsnCode: e.target.value })}
                placeholder="94054090"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU / Code</label>
              <input 
                type="text" 
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono"
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SKU-000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
             <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${canEditPrices ? 'text-slate-400' : 'text-slate-300'}`}>Purchase Cost</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input 
                  type="number" 
                  step="0.01"
                  disabled={!canEditPrices}
                  className={`w-full pl-8 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold ${!canEditPrices ? 'opacity-50 bg-slate-100 cursor-not-allowed' : ''}`}
                  value={formData.purchasePrice}
                  onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ${canEditPrices ? 'text-slate-400' : 'text-slate-300'}`}>Selling Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input 
                  type="number" 
                  step="0.01"
                  disabled={!canEditPrices}
                  className={`w-full pl-8 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold ${!canEditPrices ? 'opacity-50 bg-slate-100 cursor-not-allowed' : ''}`}
                  value={formData.sellingPrice}
                  onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Reorder Level</label>
              <input 
                type="number" 
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold text-rose-600"
                value={formData.minStock}
                onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Initial Count</label>
              <input 
                type="number" 
                disabled={!!product}
                className={`w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-emerald-600 ${!!product ? 'opacity-50 bg-slate-100' : ''}`}
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
              <select 
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold bg-white"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit of Measure (UOM)</label>
              <select 
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold bg-white"
                value={formData.uom}
                onChange={e => setFormData({ ...formData, uom: e.target.value as any })}
              >
                {UOMS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                <option value="NOS">NOS (Numbers)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Location</label>
              <select 
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold bg-white"
                value={formData.warehouseId}
                onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
              >
                {WAREHOUSES.map(wh => <option key={wh.id} value={wh.id}>{wh.name} - {wh.location}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Bio / Description</label>
              <div className="flex gap-2">
                <button 
                  onClick={handleAIImage} 
                  disabled={isGeneratingImg} 
                  className="text-[10px] font-black text-slate-500 hover:bg-slate-200 px-4 py-2 rounded-xl bg-slate-100 transition-all uppercase flex items-center gap-2"
                >
                  {isGeneratingImg ? 'Painting...' : 'Regenerate Image'}
                </button>
                <button 
                  onClick={handleAIDescription} 
                  disabled={isGeneratingDesc} 
                  className="text-[10px] font-black text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl bg-indigo-50 transition-all uppercase"
                >
                  {isGeneratingDesc ? 'Thinking...' : 'AI Enrich Bio'}
                </button>
              </div>
            </div>
            <textarea 
              className="w-full px-6 py-5 rounded-3xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all min-h-[120px] font-medium leading-relaxed"
              placeholder="Provide specific details about dimensions, warranty, or usage..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button onClick={onClose} className="flex-1 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
          <button 
            onClick={() => onSave(formData)} 
            className="flex-1 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-white bg-slate-900 hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100"
          >
            {product ? 'Update Asset' : 'Commit to Ledger'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
