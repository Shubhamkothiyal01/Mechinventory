
import React from 'react';

interface HelpViewProps {
  connectLocalFile: () => void;
  isFileSyncing: boolean;
}

const HelpView: React.FC<HelpViewProps> = ({ connectLocalFile, isFileSyncing }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">System Operator Guide</h2>
        <p className="text-slate-500 font-medium">Learn how to maximize MechVerse for your daily shop operations.</p>
      </div>

      <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
           <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center shrink-0">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
           </div>
           <div className="space-y-4">
             <h3 className="text-2xl font-black">Enable Physical Storage (C: Drive)</h3>
             <p className="text-indigo-100 font-medium leading-relaxed">By default, your data is saved in your web browser. For professional backup, you can link a file on your computer hard drive. The app will save your database there in real-time.</p>
             <div className="flex gap-4">
               <button 
                onClick={connectLocalFile}
                className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl"
               >
                 {isFileSyncing ? 'Change Database File' : 'Connect Local Database (.json)'}
               </button>
             </div>
             {isFileSyncing && (
               <p className="text-[10px] font-black uppercase text-indigo-200 tracking-widest flex items-center gap-2">
                 <span className="w-2 h-2 bg-emerald-400 rounded-full"></span> Active: Data is currently saving to your computer.
               </p>
             )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          </div>
          <h3 className="text-xl font-black text-slate-800">Billing (POS)</h3>
          <p className="text-sm text-slate-500 leading-relaxed">Use the POS Terminal for customer checkouts. Access is protected by PIN <b>0000</b>. Select items, assign a customer, and generate digital challans instantly.</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          </div>
          <h3 className="text-xl font-black text-slate-800">Inventory Management</h3>
          <p className="text-sm text-slate-500 leading-relaxed">Add or update products in the Inventory tab. Master controls are locked behind PIN <b>0000</b> to prevent accidental changes by unauthorized staff.</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
          </div>
          <h3 className="text-xl font-black text-slate-800">Analytics (P&L)</h3>
          <p className="text-sm text-slate-500 leading-relaxed">The Business Sheet provides sensitive financial insights including Valuation and Profit Margins. Access is restricted to Owners with PIN <b>2222</b>.</p>
        </div>

        <div className="bg-rose-600 p-8 rounded-[2.5rem] border border-rose-700 shadow-xl space-y-4 text-white">
          <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          </div>
          <h3 className="text-xl font-black">Stock Alerts</h3>
          <p className="text-sm text-rose-100 leading-relaxed">The system automatically monitors stock levels. When an item falls below its "Minimum Threshold", it will appear as a red alert on the Dashboard.</p>
        </div>
      </div>
    </div>
  );
};

export default HelpView;
