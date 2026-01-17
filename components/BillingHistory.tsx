
import React, { useState } from 'react';
// Corrected: Import DocumentRecord instead of the non-existent BillingRecord type.
import { DocumentRecord } from '../types';

interface BillingHistoryProps {
  // Corrected: Use the existing DocumentRecord type.
  records: DocumentRecord[];
}

const BillingHistory: React.FC<BillingHistoryProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter(r => 
    // Corrected: Update property names from challanNo/customerName to docNo/partnerName to match DocumentRecord.
    r.docNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.partnerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Challan No', 'Date', 'Customer', 'Items Count', 'Tax (₹)', 'Total (₹)'];
    const rows = filteredRecords.map(r => [
      // Corrected: Mapping docNo and partnerName properties for CSV export.
      r.docNo,
      new Date(r.timestamp).toLocaleString(),
      r.partnerName,
      r.items.length,
      r.tax.toFixed(2),
      r.total.toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `billing_history_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <input 
            type="text" 
            placeholder="Search by Challan or Customer..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={exportToCSV}
          disabled={filteredRecords.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg transition-all disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Items</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tax</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No billing records found</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      {/* Corrected: Use docNo property. */}
                      <p className="font-black text-slate-800">{r.docNo}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs text-slate-500 font-mono">{new Date(r.timestamp).toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      {/* Corrected: Use partnerName property. */}
                      <p className="font-bold text-slate-700">{r.partnerName}</p>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-500">{r.items.length}</td>
                    <td className="px-8 py-5 text-right font-bold text-slate-400">₹{r.tax.toFixed(2)}</td>
                    <td className="px-8 py-5 text-right font-black text-indigo-600">₹{r.total.toFixed(2)}</td>
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

export default BillingHistory;
