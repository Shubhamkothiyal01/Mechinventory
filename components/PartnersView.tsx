
import React, { useState } from 'react';
import { Entity } from '../types';
import { Icons } from '../constants';

interface PartnersViewProps {
  entities: Entity[];
  onAddPartner: (partner: Entity) => void;
  onDeletePartner: (id: string) => void;
}

const PartnersView: React.FC<PartnersViewProps> = ({ entities, onAddPartner, onDeletePartner }) => {
  const [filter, setFilter] = useState<'ALL' | 'SUPPLIER' | 'CUSTOMER'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [newPartner, setNewPartner] = useState<Partial<Entity>>({
    name: '',
    type: 'CUSTOMER',
    contact: '',
    email: '',
    gstin: '',
    address: ''
  });

  const filtered = entities.filter(e => {
    const matchesFilter = filter === 'ALL' || e.type === filter;
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (e.gstin || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name) return;
    
    onAddPartner({
      id: Math.random().toString(36).substr(2, 9),
      name: newPartner.name || '',
      type: newPartner.type as 'SUPPLIER' | 'CUSTOMER',
      contact: newPartner.contact || '',
      email: newPartner.email || '',
      gstin: newPartner.gstin || '',
      address: newPartner.address || ''
    });
    
    setIsAdding(false);
    setNewPartner({ name: '', type: 'CUSTOMER', contact: '', email: '', gstin: '', address: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Search and Filter Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm w-full lg:w-auto">
          {['ALL', 'SUPPLIER', 'CUSTOMER'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {f === 'ALL' ? 'Global Directory' : f === 'SUPPLIER' ? 'Suppliers' : 'Customers'}
            </button>
          ))}
        </div>
        
        <div className="flex gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></span>
            <input 
              type="text" 
              placeholder="Search by name or GSTIN..." 
              className="w-full pl-14 pr-6 py-4 rounded-[2rem] bg-white border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-3 hover:bg-indigo-600 transition-all"
          >
            <Icons.Plus /> Register Partner
          </button>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4 opacity-30">
             <div className="scale-[3] text-slate-400 mb-6 flex justify-center"><Icons.Partners /></div>
             <p className="font-black uppercase tracking-[0.3em] text-slate-500">No matching business partners found</p>
          </div>
        ) : (
          filtered.map(entity => (
            <div key={entity.id} className="bg-white rounded-[3rem] border border-slate-200 p-8 hover:shadow-2xl hover:border-indigo-100 transition-all group relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] -mr-8 -mt-8 ${entity.type === 'SUPPLIER' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                  <Icons.Partners />
               </div>
               <div className="flex items-start justify-between mb-6">
                 <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                   entity.type === 'SUPPLIER' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                 }`}>
                   {entity.type}
                 </div>
                 <button 
                   onClick={() => onDeletePartner(entity.id)}
                   className="p-2 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                 </button>
               </div>
               <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-1">{entity.name}</h3>
               <p className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-widest mb-6">GSTIN: {entity.gstin || 'NOT REGISTERED'}</p>
               
               <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-400"><Icons.Partners /></div>
                    <p className="text-xs font-bold text-slate-600">{entity.contact}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-slate-400 mt-0.5"><Icons.Warehouse /></div>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2">{entity.address || 'No address provided'}</p>
                  </div>
               </div>
               
               <div className="mt-8 flex gap-3">
                 <button className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all">View Statement</button>
                 <button className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">Edit Record</button>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Registration Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-12 border-b border-slate-100 flex items-center justify-between">
               <div>
                 <h3 className="text-3xl font-black text-slate-800 tracking-tight">Register New Partner</h3>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Add Supplier or Customer to directory</p>
               </div>
               <button onClick={() => setIsAdding(false)} className="p-4 bg-slate-100 rounded-2xl text-slate-400 hover:text-rose-600 transition-all">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-12 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Business Name</label>
                  <input type="text" required className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-600 font-bold uppercase" value={newPartner.name} onChange={e => setNewPartner({...newPartner, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Account Type</label>
                  <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-600 font-black uppercase text-xs" value={newPartner.type} onChange={e => setNewPartner({...newPartner, type: e.target.value as any})}>
                    <option value="CUSTOMER">CUSTOMER (Receivable)</option>
                    <option value="SUPPLIER">SUPPLIER (Payable)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">GSTIN Number</label>
                  <input type="text" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-600 font-mono font-bold uppercase" value={newPartner.gstin} onChange={e => setNewPartner({...newPartner, gstin: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Mobile / Contact</label>
                  <input type="text" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-600 font-bold" value={newPartner.contact} onChange={e => setNewPartner({...newPartner, contact: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Email Address</label>
                  <input type="email" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-600 font-bold" value={newPartner.email} onChange={e => setNewPartner({...newPartner, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Registered Billing Address</label>
                <textarea className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-600 font-medium text-sm h-32" value={newPartner.address} onChange={e => setNewPartner({...newPartner, address: e.target.value})} />
              </div>
              
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-6 bg-white border-2 border-slate-100 text-slate-400 rounded-3xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 py-6 bg-slate-900 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all shadow-2xl">Confirm Registration</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnersView;
