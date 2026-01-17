
import React, { useState, useEffect } from 'react';
import { AppView, UserRole } from '../types';
import { Icons } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  currentUser: { name: string, role: UserRole };
  setCurrentUser: (user: { name: string, role: UserRole }) => void;
  isFileSyncing?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, currentUser, setCurrentUser, isFileSyncing }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'dashboard' as AppView, label: 'Control Center', icon: Icons.Dashboard },
    { id: 'inventory' as AppView, label: 'Asset Explorer', icon: Icons.Inventory },
    { id: 'partners' as AppView, label: 'Business Directory', icon: Icons.Partners },
    { id: 'billing' as AppView, label: 'POS Terminal', icon: Icons.Billing },
    { id: 'billing-history' as AppView, label: 'Ledger Records', icon: Icons.Audit },
    { id: 'business-sheet' as AppView, label: 'Analytics Console', icon: Icons.Reports },
    { id: 'ai-assistant' as AppView, label: 'Neural Intelligence', icon: Icons.AI },
    { id: 'help' as AppView, label: 'Knowledge Base', icon: Icons.Sparkles },
  ];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 bg-slate-900 flex flex-col shrink-0">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-10 px-2">
              <div className="text-indigo-400"><Icons.Warehouse /></div>
              <h1 className="text-white font-black text-sm uppercase tracking-widest">MechVerse <span className="text-indigo-500">v3.1</span></h1>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} scale-90`}>
                      <Icon />
                    </div>
                    <span className="text-xs font-bold">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-6 space-y-6">
            <div className="pt-6 border-t border-slate-800">
              <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${
                  currentUser.role === 'Owner' ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
                }`}>
                  {currentUser.role[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-white truncate">{currentUser.name}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{currentUser.role}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
          {/* TOP WEB HEADER */}
          <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white shrink-0">
            <div className="flex items-center gap-4">
               <h2 className="text-sm font-black uppercase text-slate-800 tracking-widest">{activeView.replace('-', ' ')}</h2>
               <div className="h-4 w-px bg-slate-200"></div>
               <span className="text-[10px] font-bold text-slate-400">Environment: Main_Branch_GZB</span>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="hidden md:flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <span className="text-[10px] font-black text-slate-500 uppercase">System Online</span>
               </div>
               <div className="flex items-center gap-2">
                 <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                 </button>
                 <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                 </button>
               </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </div>

          {/* BOTTOM STATUS FOOTER */}
          <footer className="h-8 bg-white border-t border-slate-200 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isFileSyncing ? 'Cloud Synced' : 'Local Storage Mode'}</span>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{time}</span>
               <div className="h-4 w-px bg-slate-200"></div>
               <span className="text-[10px] font-black text-indigo-600 uppercase">MechVerse Inventory Tool v3.1</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;
