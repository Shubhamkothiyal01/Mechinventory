
import React from 'react';
import { AuditLogEntry } from '../types';

interface AuditLogProps {
  logs: AuditLogEntry[];
}

const AuditLog: React.FC<AuditLogProps> = ({ logs }) => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-xl font-black text-slate-800">Security & Compliance</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">System-wide activity log</p>
        </div>
        <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Export CSV</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action Type</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Event Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    </div>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No activity recorded</p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <p className="text-xs font-mono text-slate-500">{new Date(log.timestamp).toLocaleDateString()}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <span className="text-sm font-bold text-slate-700">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[10px] font-black uppercase rounded-lg tracking-wider border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm text-slate-600 font-medium max-w-xl line-clamp-2">{log.details}</p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog;
