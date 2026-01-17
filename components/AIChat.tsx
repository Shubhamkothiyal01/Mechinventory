
import React, { useState, useEffect, useRef } from 'react';
import { Product, AIInsight } from '../types';
import { Icons } from '../constants';
import { getInventoryInsights, chatWithInventory } from '../services/geminiService';

interface AIChatProps {
  products: Product[];
}

const AIChat: React.FC<AIChatProps> = ({ products }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInsights();
  }, [products]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const data = await getInventoryInsights(products);
      setInsights(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMessage('');
    setIsChatting(true);

    try {
      const botResponse = await chatWithInventory(userMsg, products);
      setChatHistory(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'bot', text: "Error connecting to Gemini." }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full animate-in slide-in-from-bottom-4 duration-500">
      {/* Strategic Insights */}
      <div className="lg:col-span-1 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="text-indigo-600"><Icons.Sparkles /></span>
            AI Strategic Insights
          </h3>
          <button 
            onClick={fetchInsights} 
            disabled={isLoadingInsights}
            className="p-2 text-gray-400 hover:text-indigo-600 rounded-full transition-all"
          >
            <svg className={isLoadingInsights ? 'animate-spin' : ''} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
          </button>
        </div>

        {isLoadingInsights ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    insight.severity === 'high' ? 'bg-rose-100 text-rose-700' :
                    insight.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {insight.severity} Priority
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{insight.description}</p>
                {insight.action && (
                  <button className="mt-4 text-xs font-bold text-indigo-600 hover:underline">
                    Recommended Action: {insight.action}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Assistant */}
      <div className="lg:col-span-2 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[700px]">
        <div className="p-6 border-b border-gray-100 bg-indigo-50/30 flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Icons.AI />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Inventory Management Assistant</h3>
            <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider">Powered by Gemini 3 Flash</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatHistory.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-12">
              <div className="p-6 bg-indigo-50 rounded-full mb-6">
                <Icons.Sparkles />
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Ask anything about your stock</h4>
              <p className="text-sm text-gray-500">"Which items are selling fastest?" or "Suggest a reorder quantity for Neural Processor X1."</p>
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isChatting && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-100 px-5 py-3 rounded-2xl rounded-tl-none animate-pulse flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-100">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Type your message..."
              className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={isChatting}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
