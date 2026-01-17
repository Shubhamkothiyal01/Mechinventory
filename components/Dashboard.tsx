
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Product, AppView } from '../types';
import { Icons, WAREHOUSES } from '../constants';

interface DashboardProps {
  products: Product[];
  setActiveView?: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, setActiveView }) => {
  const stats = useMemo(() => {
    const totalItems = products.reduce((acc, p) => acc + p.quantity, 0);
    const lowStockItems = products.filter(p => p.quantity <= p.minStock).length;
    const inventoryValuation = products.reduce((acc, p) => acc + (p.purchasePrice * p.quantity), 0);
    const potentialRevenue = products.reduce((acc, p) => acc + (p.sellingPrice * p.quantity), 0);
    const uniqueSkus = products.length;

    return { totalItems, lowStockItems, inventoryValuation, potentialRevenue, uniqueSkus };
  }, [products]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [products]);

  const warehouseDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      const wh = WAREHOUSES.find(w => w.id === p.warehouseId)?.name || 'Unknown';
      counts[wh] = (counts[wh] || 0) + p.quantity;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [products]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* SYSTEM SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Inventory Assets', value: stats.totalItems.toLocaleString(), icon: <Icons.Inventory />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Low Stock Thresholds', value: stats.lowStockItems, icon: <Icons.Alert />, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Master Asset Valuation', value: `₹${stats.inventoryValuation.toLocaleString()}`, icon: <Icons.Plus />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Registered SKUs', value: stats.uniqueSkus, icon: <Icons.Reports />, color: 'text-slate-700', bg: 'bg-slate-100' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`p-3 rounded-lg ${card.bg} ${card.color} scale-90`}>
              {card.icon}
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* QUICK LAUNCHER PANEL */}
      <div className="bg-slate-900 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-indigo-500">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight uppercase tracking-widest">Enterprise Launcher</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Primary System Entry Points</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveView?.('billing')}
            className="px-5 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all shadow-lg"
          >
            Create Sale
          </button>
          <button 
            onClick={() => setActiveView?.('inventory')}
            className="px-5 py-3 bg-slate-800 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
          >
            Add Assets
          </button>
          <button 
            onClick={() => setActiveView?.('partners')}
            className="px-5 py-3 bg-slate-800 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
          >
            Partner Log
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 1: WAREHOUSE BALANCE */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Stock Density by Warehouse</h3>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ fontSize: '10px', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: CATEGORY SPLIT */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-800 mb-6 uppercase tracking-widest text-center">Asset Classification</h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value" stroke="none">
                  {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
             {categoryData.slice(0, 4).map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase truncate">{entry.name}</span>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* REORDER CONSOLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center scale-90">
              <Icons.Alert />
            </div>
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Supply Chain Exceptions</h3>
          </div>
          <button onClick={() => setActiveView?.('inventory')} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All Records</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset Name</th>
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Available Stock</th>
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Process</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.filter(p => p.quantity <= p.minStock).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">All systems normal. No stock exceptions detected.</td>
                </tr>
              ) : (
                products.filter(p => p.quantity <= p.minStock).slice(0, 5).map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                          <img src={product.imageUrl} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{product.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-black text-rose-600">{product.quantity}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-md text-[8px] font-black uppercase">Critical Low</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setActiveView?.('inventory')} className="text-[9px] font-black text-white bg-slate-900 px-3 py-1.5 rounded-lg uppercase hover:bg-indigo-600 transition-all">Restock</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
