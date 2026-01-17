
import React, { useState, useMemo } from 'react';
import { Product, StockMovement } from '../types';

interface BusinessSheetProps {
  products: Product[];
  movements: StockMovement[];
}

const BusinessSheet: React.FC<BusinessSheetProps> = ({ products, movements }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');

  const financialStats = useMemo(() => {
    const totalAssetsValue = products.reduce((acc, p) => acc + (p.purchasePrice * p.quantity), 0);
    const projectedRevenue = products.reduce((acc, p) => acc + (p.sellingPrice * p.quantity), 0);
    
    const salesMovements = movements.filter(m => m.type === 'SALE');
    const totalSales = salesMovements.reduce((acc, m) => {
      const p = products.find(prod => prod.id === m.productId);
      return acc + (m.quantity * (p?.sellingPrice || 0));
    }, 0);

    const averageMargin = products.length > 0 
      ? products.reduce((acc, p) => acc + ((p.sellingPrice - p.purchasePrice) / p.sellingPrice), 0) / products.length 
      : 0;

    return { totalAssetsValue, projectedRevenue, totalSales, averageMargin };
  }, [products, movements]);

  const itemPerformance = useMemo(() => {
    return products.map(p => {
      const salesCount = movements
        .filter(m => m.productId === p.id && m.type === 'SALE')
        .reduce((acc, m) => acc + m.quantity, 0);
      
      const margin = p.sellingPrice - p.purchasePrice;
      const profitContribution = salesCount * margin;
      
      return {
        ...p,
        salesCount,
        profitContribution
      };
    }).sort((a, b) => b.profitContribution - a.profitContribution);
  }, [products, movements]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '2222') {
      setIsUnlocked(true);
    } else {
      alert('Security Violation: Incorrect Analytics PIN');
      setPin('');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl w-full max-w-md text-center">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Analytics Locked</h2>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">Entering sensitive financial data zone. Please enter the master analytics PIN.</p>
          
          <form onSubmit={handleUnlock} className="space-y-5">
            <input 
              type="password" 
              maxLength={4}
              placeholder="••••"
              className="w-full px-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-center text-4xl font-black tracking-[0.8em] focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
            <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all shadow-xl">
              Unlock Analytics
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Assets Valuation</p>
          <h3 className="text-3xl font-black text-slate-900">₹{financialStats.totalAssetsValue.toLocaleString()}</h3>
        </div>

        <div className="bg-indigo-600 p-8 rounded-[2.5rem] border border-indigo-700 shadow-xl relative overflow-hidden text-white">
          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Total Sales Revenue</p>
          <h3 className="text-3xl font-black">₹{financialStats.totalSales.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Margin</p>
          <h3 className="text-3xl font-black text-slate-900">{(financialStats.averageMargin * 100).toFixed(1)}%</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <h3 className="text-xl font-black text-slate-800">Item-Wise Business Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Asset</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty Sold</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Margin/Unit</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itemPerformance.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-800">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">{item.sku}</p>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-600">{item.salesCount}</td>
                  <td className="px-8 py-5 font-bold text-emerald-600">₹{(item.sellingPrice - item.purchasePrice).toFixed(2)}</td>
                  <td className="px-8 py-5 text-right font-black text-slate-900">
                     ₹{item.profitContribution.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BusinessSheet;
