
import React, { useState } from 'react';
import { Icons } from '../constants';

interface LoginProps {
  onLogin: (success: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Jaidharidevi' && password === '805380') {
      onLogin(true);
    } else {
      setError('Invalid operator credentials. Access denied.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 shadow-2xl">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl mb-6 text-white rotate-6">
              <Icons.Warehouse />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">MechVerse Secure</h1>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mt-2">Enterprise Resource Gate</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Operator Identity</label>
              <input 
                type="text" 
                placeholder="Username" 
                className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Access Key</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-rose-400 text-[10px] font-black uppercase text-center bg-rose-500/10 py-3 rounded-xl border border-rose-500/20 animate-pulse">
                {error}
              </p>
            )}

            <button 
              type="submit" 
              className="w-full py-6 bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-indigo-900/40 transition-all transform active:scale-95"
            >
              Initialize Session
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest opacity-50">Authorized Personnel Only • IP Logged</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
