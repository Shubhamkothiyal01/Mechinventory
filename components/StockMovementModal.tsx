
import React, { useState } from 'react';
import { Product, Entity, MovementType, Warehouse, UserRole } from '../types';
import { WAREHOUSES, INITIAL_ENTITIES } from '../constants';

interface StockMovementModalProps {
  product: Product;
  currentUser: { name: string, role: UserRole };
  onSave: (data: {
    type: MovementType;
    quantity: number;
    reason: string;
    entityId?: string;
    warehouseId: string;
  }) => void;
  onClose: () => void;
}

const StockMovementModal: React.FC<StockMovementModalProps> = ({ product, currentUser, onSave, onClose }) => {
  const [type, setType] = useState<MovementType>('PURCHASE');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [entityId, setEntityId] = useState('');
  const [warehouseId, setWarehouseId] = useState(product.warehouseId);
  const [pin, setPin] = useState('');

  const filteredEntities = INITIAL_ENTITIES.filter(e => 
    (type === 'PURCHASE' && e.type === 'SUPPLIER') || 
    (type === 'SALE' && e.type === 'CUSTOMER')
  );

  const isPinCorrect = pin === '0000';
  // Allow any user to fill form, but require PIN for adjustment
  const isFormValid = reason.trim() !== '' && quantity > 0 && isPinCorrect;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800">Stock Adjustment</h2>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-wide">{product.name} ({product.sku})</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'PURCHASE', label: 'Stock IN', color: 'bg-emerald-500' },
              { id: 'SALE', label: 'Stock OUT', color: 'bg-rose-500' },
              { id: 'ADJUSTMENT', label: 'Adjust', color: 'bg-indigo-500' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setType(m.id as MovementType)}
                className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  type === m.id ? `${m.color} text-white shadow-lg` : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quantity ({product.uom})</label>
              <input 
                type="number" 
                min="1"
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-lg"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value) || 0)}
              />
            </div>

            {(type === 'PURCHASE' || type === 'SALE') && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {type === 'PURCHASE' ? 'Supplier Source' : 'Customer Destination'}
                </label>
                <select 
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold"
                  value={entityId}
                  onChange={e => setEntityId(e.target.value)}
                >
                  <option value="">Select Partner...</option>
                  {filteredEntities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Movement Reason (Mandatory)</label>
              <textarea 
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all min-h-[100px] font-medium text-sm"
                placeholder="Briefly explain why stock is being modified..."
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>

            <div className="space-y-2 p-4 rounded-3xl border mt-2 bg-indigo-50/50 border-indigo-100 transition-all">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Security Authorization PIN
              </label>
              <input 
                type="password" 
                maxLength={4}
                placeholder="Enter 4-digit code"
                className={`w-full px-5 py-4 rounded-2xl bg-white border outline-none transition-all font-black text-center tracking-[1em] text-lg ${
                  pin.length === 4 && !isPinCorrect ? 'border-rose-300 ring-4 ring-rose-500/10 text-rose-500' : 
                  isPinCorrect ? 'border-emerald-300 ring-4 ring-emerald-500/10 text-emerald-600' :
                  'border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400'
                }`}
                value={pin}
                onChange={e => setPin(e.target.value)}
              />
              {pin.length === 4 && !isPinCorrect && (
                <p className="text-[10px] font-bold text-rose-500 text-center mt-1 uppercase">Invalid PIN</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button 
            disabled={!isFormValid}
            onClick={() => onSave({ type, quantity, reason, entityId, warehouseId })}
            className={`flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
              isPinCorrect ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900'
            }`}
          >
            {isPinCorrect ? 'Confirm Adjustment' : 'PIN Required'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockMovementModal;
