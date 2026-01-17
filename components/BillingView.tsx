
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, DocumentType, DocumentRecord } from '../types';
import { Icons } from '../constants';

interface CartItem {
  product: Product;
  quantity: number;
  customPrice?: number;
}

interface BillingViewProps {
  products: Product[];
  onCompleteDocument: (doc: DocumentRecord) => void;
}

const BillingView: React.FC<BillingViewProps> = ({ products, onCompleteDocument }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [activeMode, setActiveMode] = useState<DocumentType>('SALES_BILL');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSelectingItems, setIsSelectingItems] = useState(false);
  
  // Professional Transaction Metadata
  const [partnerName, setPartnerName] = useState('');
  const [partnerGSTIN, setPartnerGSTIN] = useState('');
  const [partnerContact, setPartnerContact] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'CREDIT' | 'PENDING'>('PAID');
  const [vehicleNo, setVehicleNo] = useState('');
  const [notes, setNotes] = useState('');

  // Manual Adjustments
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(18); 
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentRecord | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSelectingItems) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSelectingItems]);

  const docConfig = {
    SALES_BILL: { label: 'Sales Bill', color: 'bg-indigo-600', icon: <Icons.Billing />, partnerType: 'CUSTOMER' },
    PURCHASE_BILL: { label: 'Purchase Bill', color: 'bg-emerald-600', icon: <Icons.Plus />, partnerType: 'SUPPLIER' },
    PO: { label: 'Purchase Order', color: 'bg-amber-600', icon: <Icons.Reports />, partnerType: 'SUPPLIER' },
    SO: { label: 'Sales Order', color: 'bg-purple-600', icon: <Icons.Reports />, partnerType: 'CUSTOMER' },
    GRN: { label: 'Goods Receipt (GRN)', color: 'bg-teal-600', icon: <Icons.Warehouse />, partnerType: 'SUPPLIER' },
    DELIVERY_CHALLAN: { label: 'Delivery Challan', color: 'bg-slate-700', icon: <Icons.Inventory />, partnerType: 'CUSTOMER' },
    ADJUSTMENT_BILL: { label: 'Adjustment', color: 'bg-rose-600', icon: <Icons.Alert />, partnerType: 'N/A' },
    CREDIT_DEBIT_NOTE: { label: 'Credit/Debit Note', color: 'bg-cyan-600', icon: <Icons.Audit />, partnerType: 'ANY' },
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '0000') setIsUnlocked(true);
    else { alert('Invalid PIN'); setPassword(''); }
  };

  const addToCart = (product: Product) => {
    const needsStockCheck = activeMode === 'SALES_BILL' || activeMode === 'DELIVERY_CHALLAN';
    if (needsStockCheck && product.quantity <= 0) return alert('No physical stock available.');

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (needsStockCheck && existing.quantity >= product.quantity) return prev;
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, customPrice: activeMode === 'PURCHASE_BILL' ? product.purchasePrice : product.sellingPrice }];
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const totals = useMemo(() => {
    const rawSubtotal = cart.reduce((acc, item) => acc + ((item.customPrice || 0) * item.quantity), 0);
    const discountAmount = rawSubtotal * (discountRate / 100);
    const taxableAmount = rawSubtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    return { 
      subtotal: rawSubtotal, 
      discount: discountAmount,
      taxable: taxableAmount,
      tax: taxAmount, 
      total: taxableAmount + taxAmount 
    };
  }, [cart, discountRate, taxRate]);

  const finalizeDocument = () => {
    const docPrefix = activeMode.split('_').map(word => word[0]).join('');
    const newDoc: DocumentRecord = {
      id: Math.random().toString(36).substr(2, 9),
      docType: activeMode,
      docNo: `${docPrefix}/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`,
      partnerName,
      partnerContact,
      gstin: partnerGSTIN,
      billingAddress,
      paymentStatus,
      discountPercentage: discountRate,
      taxRate: taxRate,
      vehicleNo,
      notes,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      timestamp: new Date().toISOString(),
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        hsn: item.product.hsnCode,
        quantity: item.quantity,
        price: item.customPrice || 0,
        uom: item.product.uom
      }))
    };

    onCompleteDocument(newDoc);
    setLastDoc(newDoc);
    setCart([]);
    setPartnerName('');
    setPartnerGSTIN('');
    setPartnerContact('');
    setBillingAddress('');
    setDiscountRate(0);
    setTaxRate(18);
    setShowConfirmation(false);
  };

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="glass-effect p-12 rounded-[3.5rem] border border-slate-200 shadow-2xl w-full max-w-md text-center">
          <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl"><Icons.Billing /></div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Operator Login</h2>
          <p className="text-slate-500 text-sm mb-10 font-medium tracking-tight">Access restricted to authorized personnel only.</p>
          <form onSubmit={handleUnlock} className="space-y-5">
            <input type="password" maxLength={4} placeholder="••••" className="w-full px-6 py-6 bg-slate-100/50 border border-slate-200 rounded-3xl text-center text-4xl font-black tracking-[1em] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
            <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-xl">Unlock Terminal</button>
          </form>
        </div>
      </div>
    );
  }

  if (lastDoc) {
    return (
      <div className="flex flex-col items-center py-10 animate-in zoom-in-95 duration-500 space-y-8">
        <div className="w-full max-w-[900px] bg-white border border-slate-400 font-sans text-slate-900 text-[10px] shadow-2xl p-0 overflow-hidden" id="printable-bill">
          <div className="grid grid-cols-3 border-b border-slate-400 p-4 text-center items-center bg-slate-50">
             <div className="text-left"><p className="font-bold">Ack No: <span className="font-mono">{lastDoc.id}</span></p><p className="font-bold">Mode: <span className="font-black text-indigo-600 uppercase">{lastDoc.docType.replace('_', ' ')}</span></p></div>
             <h1 className="text-xl font-black uppercase tracking-widest">{lastDoc.docType.replace('_', ' ')}</h1>
             <div className="text-right space-y-1"><p className="font-bold text-slate-400 italic">(COMPUTER GENERATED)</p><p className="font-bold">Digital ID: {lastDoc.id.slice(0,6)}</p></div>
          </div>
          <div className="grid grid-cols-2 border-b border-slate-400">
             <div className="p-6 border-r border-slate-400">
               <h2 className="text-sm font-black uppercase tracking-tight">MODERN TRANSFORMERS PVT LTD</h2>
               <p className="mt-2 text-slate-600">C-135, B S ROAD INDUSTRIAL AREA, GHAZIABAD</p>
               <p className="text-slate-600">GSTIN: 09AAACM0805G4ZS</p>
             </div>
             <div className="grid grid-cols-2">
               <div className="p-4 border-r border-b border-slate-400"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Document No.</p><p className="font-black text-sm">{lastDoc.docNo}</p></div>
               <div className="p-4 border-b border-slate-400"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Date</p><p className="font-black text-sm">{new Date(lastDoc.timestamp).toLocaleDateString('en-IN')}</p></div>
               <div className="p-4 border-r border-slate-400"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</p><p className="font-black text-sm uppercase">{lastDoc.paymentStatus}</p></div>
               <div className="p-4"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Vehicle No.</p><p className="font-black text-sm uppercase">{lastDoc.vehicleNo || 'N/A'}</p></div>
             </div>
          </div>
          <div className="p-6 border-b border-slate-400 bg-slate-50/30">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Consignee / Partner Details</p>
             <h2 className="text-base font-black uppercase text-slate-800">{lastDoc.partnerName || 'GUEST PARTNER'}</h2>
             <p className="font-bold text-slate-600 mt-1">GSTIN: <span className="font-normal">{lastDoc.gstin || 'N/A'}</span></p>
             <p className="font-bold text-slate-600">Address: <span className="font-normal">{lastDoc.billingAddress || 'N/A'}</span></p>
             <p className="font-bold text-slate-600">Contact: <span className="font-normal">{lastDoc.partnerContact || 'N/A'}</span></p>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-3 w-10 text-center uppercase text-[8px] tracking-widest font-black">SI</th>
                <th className="p-3 uppercase text-[8px] tracking-widest font-black">Item Description</th>
                <th className="p-3 w-20 text-center uppercase text-[8px] tracking-widest font-black">HSN</th>
                <th className="p-3 w-20 text-center uppercase text-[8px] tracking-widest font-black">Qty</th>
                <th className="p-3 w-24 text-right uppercase text-[8px] tracking-widest font-black">Rate (₹)</th>
                <th className="p-3 w-24 text-right uppercase text-[8px] tracking-widest font-black">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lastDoc.items.map((item, i) => (
                <tr key={i}>
                  <td className="p-4 text-center border-r border-slate-100">{i + 1}</td>
                  <td className="p-4 font-black uppercase border-r border-slate-100 text-xs tracking-tight">{item.name}</td>
                  <td className="p-4 text-center border-r border-slate-100 font-mono text-slate-500">{item.hsn}</td>
                  <td className="p-4 text-center font-black border-r border-slate-100 text-xs">{item.quantity} {item.uom}</td>
                  <td className="p-4 text-right border-r border-slate-100 text-xs">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-right font-black text-xs">{ (item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 }) }</td>
                </tr>
              ))}
              <tr className="h-20"><td colSpan={6}></td></tr>
            </tbody>
            <tfoot className="border-t border-slate-400 font-bold text-xs">
               <tr>
                 <td colSpan={5} className="p-3 text-right uppercase border-r border-slate-400 text-slate-400">Gross Subtotal</td>
                 <td className="p-3 text-right">₹{lastDoc.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
               </tr>
               {lastDoc.discountPercentage > 0 && (
                  <tr>
                    <td colSpan={5} className="p-3 text-right uppercase border-r border-slate-400 text-rose-600 font-black">Less: Cash Discount ({lastDoc.discountPercentage}%)</td>
                    <td className="p-3 text-right text-rose-600">-₹{(lastDoc.subtotal * (lastDoc.discountPercentage/100)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
               )}
               <tr>
                 <td colSpan={5} className="p-3 text-right uppercase border-r border-slate-400 text-slate-400">Add: GST ({lastDoc.taxRate}%)</td>
                 <td className="p-3 text-right">₹{lastDoc.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
               </tr>
               <tr className="bg-slate-900 text-white text-base">
                 <td colSpan={5} className="p-5 text-right uppercase font-black tracking-widest">Final Amount Payable</td>
                 <td className="p-5 text-right font-black">₹{lastDoc.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
               </tr>
            </tfoot>
          </table>
          <div className="p-8 grid grid-cols-2 gap-20">
             <div className="space-y-6">
               <p className="text-[8px] italic text-slate-400 leading-relaxed uppercase">This is a system generated {lastDoc.docType.replace('_', ' ')} based on digital ledgers of MechVerse Inventory Tool. Physical signature may be required for bank verification.</p>
               <div className="flex items-center gap-4">
                 <div className="bg-slate-100 p-2 rounded-lg opacity-30"><Icons.Warehouse /></div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-200">Authorized ERP Stamp</p>
               </div>
             </div>
             <div className="text-right flex flex-col items-end justify-between pt-16">
               <div className="w-40 h-px bg-slate-900 mb-2"></div>
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-800">For Modern Transformers Pvt Ltd</p>
             </div>
          </div>
        </div>
        <div className="flex gap-6 print:hidden">
          <button onClick={() => window.print()} className="px-12 py-6 bg-white border-2 border-slate-200 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl flex items-center gap-4 hover:bg-slate-50 transition-all transform active:scale-95"><Icons.Reports /> Generate & Print</button>
          <button onClick={() => setLastDoc(null)} className="px-12 py-6 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-600 transition-all transform active:scale-95">Next Operation</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] gap-8 animate-in fade-in duration-500">
      
      {/* HEADER: Bill Mode Tabs */}
      <div className="flex items-center justify-between gap-6 bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden shrink-0">
        <div className="flex items-center gap-3 px-6 border-r border-slate-100 hidden lg:flex">
          <div className="text-indigo-600"><Icons.Billing /></div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Document Selection</p>
        </div>
        <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide py-1">
          {(Object.entries(docConfig) as [DocumentType, any][]).map(([key, config]) => (
            <button
              key={key}
              onClick={() => { setActiveMode(key); setCart([]); }}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shrink-0 ${
                activeMode === key ? `${config.color} text-white shadow-xl scale-105` : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN WORKSPACE: Wider Draft Document View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 overflow-hidden">
        
        {/* Left: Draft Invoice Table (Spacious Work Area) */}
        <div className="lg:col-span-7 flex flex-col bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-0">
          <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
             <div className="flex items-center gap-6">
                <h3 className="text-2xl font-black tracking-tight text-slate-800">Draft Document</h3>
                <div className="px-4 py-1.5 bg-indigo-100 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest">{cart.length} ITEM{cart.length !== 1 && 'S'}</div>
             </div>
             <button 
                onClick={() => setIsSelectingItems(true)}
                className="px-8 py-4 bg-indigo-600 text-white rounded-[1.8rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
             >
                <Icons.Plus /> Add more item
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center space-y-8 opacity-20">
                <div className="scale-[4] text-slate-400"><Icons.Inventory /></div>
                <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-500">Document is currently empty</p>
                <button onClick={() => setIsSelectingItems(true)} className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest">Browse Asset Catalog</button>
              </div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="pb-4 pl-6">Product Detail</th>
                    <th className="pb-4 text-center">HSN</th>
                    <th className="pb-4 text-center">Quantity</th>
                    <th className="pb-4 text-right">Unit Price</th>
                    <th className="pb-4 text-right pr-6">Line Total</th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  {cart.map(item => (
                    <tr key={item.product.id} className="group bg-slate-50 hover:bg-indigo-50/50 transition-all rounded-3xl">
                      <td className="py-6 pl-8 rounded-l-[2.5rem] border-y border-l border-slate-100">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 shadow-inner">
                            <img src={item.product.imageUrl} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div>
                            <p className="font-black text-slate-800 uppercase tracking-tight text-sm">{item.product.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{item.product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 text-center font-mono text-xs text-slate-400 border-y border-slate-100">{item.product.hsnCode}</td>
                      <td className="py-6 border-y border-slate-100">
                        <div className="flex items-center justify-center gap-4">
                          <button onClick={() => updateCartQty(item.product.id, -1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all font-black">-</button>
                          <span className="text-sm font-black text-slate-800 w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQty(item.product.id, 1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all font-black">+</button>
                        </div>
                      </td>
                      <td className="py-6 text-right font-black text-slate-800 text-sm border-y border-slate-100">₹{(item.customPrice || 0).toLocaleString()}</td>
                      <td className="py-6 pr-8 text-right rounded-r-[2.5rem] border-y border-r border-slate-100">
                        <div className="flex items-center justify-end gap-6">
                           <span className="font-black text-indigo-600 text-sm">₹{((item.customPrice || 0) * item.quantity).toLocaleString()}</span>
                           <button onClick={() => removeFromCart(item.product.id)} className="p-3 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Master Control Center (Wide & Spacious Forms for GST/Accounts) */}
        <div className="lg:col-span-5 flex flex-col bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Top: Entity Details (Now much more spacious for GST and account details) */}
          <div className="flex-1 p-10 space-y-8 overflow-y-auto scrollbar-hide">
            <h4 className="text-2xl font-black text-slate-800 flex items-center gap-5 pb-6 border-b border-slate-100">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Icons.Partners /></div>
              Account & GST Details
            </h4>
            
            <div className="space-y-6">
              {/* Partner Name & GSTIN */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Customer / Company Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Acme Corp..." 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-sm font-black uppercase tracking-tight transition-all" 
                    value={partnerName} 
                    onChange={e => setPartnerName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">GSTIN Number (Tax ID)</label>
                  <input 
                    type="text" 
                    placeholder="09XXXXX0000X1XX..." 
                    className="w-full px-6 py-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 focus:border-indigo-500 outline-none text-sm font-mono font-black uppercase tracking-widest text-indigo-900" 
                    value={partnerGSTIN} 
                    onChange={e => setPartnerGSTIN(e.target.value)} 
                  />
                </div>
              </div>

              {/* Contact & Address */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Billing Address (For ITR)</label>
                <textarea 
                  placeholder="Street, City, State, ZIP..." 
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium h-24 transition-all" 
                  value={billingAddress} 
                  onChange={e => setBillingAddress(e.target.value)} 
                />
              </div>

              {/* Logistics & Payment */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Contact No</label>
                  <input 
                    type="text" 
                    placeholder="+91..." 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none text-xs font-black uppercase transition-all" 
                    value={partnerContact} 
                    onChange={e => setPartnerContact(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Ledger State</label>
                  <select className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-500" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value as any)}>
                    <option value="PAID">PAID</option>
                    <option value="CREDIT">CREDIT</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Vehicle Ref</label>
                  <input 
                    type="text" 
                    placeholder="DL01..." 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-black uppercase outline-none focus:border-indigo-500" 
                    value={vehicleNo} 
                    onChange={e => setVehicleNo(e.target.value)} 
                  />
                </div>
              </div>

              {/* Financial Toggles */}
              <div className="pt-6 border-t border-slate-50 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Cash Discount</p>
                    <span className="text-xs font-black text-indigo-600">{discountRate}%</span>
                  </div>
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    {[0, 5, 10, 15, 20].map(v => (
                      <button key={v} onClick={() => setDiscountRate(v)} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${discountRate === v ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{v}%</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase">GST Rate</p>
                    <span className="text-xs font-black text-emerald-600">{taxRate}%</span>
                  </div>
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    {[0, 5, 12, 18, 28].map(v => (
                      <button key={v} onClick={() => setTaxRate(v)} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${taxRate === v ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>{v}%</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Summary Bar: Concise Total and Large Green Button */}
          <div className="bg-slate-900 p-8 border-t-8 border-emerald-500 shadow-2xl flex items-center gap-8">
              <div className="shrink-0 space-y-1">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Payable Value</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-black text-white tracking-tighter">₹{totals.total.toLocaleString()}</span>
                   <span className="text-[10px] font-black text-emerald-400 uppercase">Net</span>
                </div>
              </div>

              <button 
                onClick={() => setShowConfirmation(true)}
                disabled={cart.length === 0 || !partnerName}
                className="flex-1 py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-white hover:text-emerald-600 transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-20 flex items-center justify-center gap-4"
              >
                COMMIT {activeMode.split('_')[0]}
                <Icons.Plus />
              </button>
          </div>
        </div>
      </div>

      {/* MODAL: Item Selector Overlay */}
      {isSelectingItems && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-7xl h-[85vh] rounded-[4rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-12 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div>
                  <h3 className="text-4xl font-black text-slate-800 tracking-tight">Select Asset Catalog</h3>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Browse items to add to {docConfig[activeMode].label}</p>
               </div>
               <div className="relative w-full max-w-xl mx-8">
                 <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 scale-125"><Icons.Search /></span>
                 <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Filter by SKU or Asset Name..." 
                  className="w-full pl-16 pr-8 py-6 rounded-[2.5rem] bg-white border-2 border-slate-100 focus:border-indigo-600 outline-none text-xl font-black uppercase tracking-tight transition-all shadow-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                 />
               </div>
               <button onClick={() => setIsSelectingItems(false)} className="px-10 py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-600 transition-all">Finished Selection</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 scrollbar-hide bg-slate-50/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map(product => {
                  const inCart = cart.find(c => c.product.id === product.id);
                  return (
                    <button 
                      key={product.id} 
                      onClick={() => addToCart(product)} 
                      className={`group bg-white p-6 rounded-[3rem] border border-slate-200 text-left hover:border-indigo-500 transition-all hover:shadow-2xl relative ${inCart ? 'ring-4 ring-indigo-500/20 border-indigo-500' : ''}`}
                    >
                      {inCart && (
                        <div className="absolute top-6 left-6 z-10 bg-indigo-600 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase shadow-lg animate-in zoom-in-50">
                          {inCart.quantity} Selected
                        </div>
                      )}
                      <div className="aspect-[4/3] rounded-[2.5rem] bg-slate-100 overflow-hidden mb-6 relative shadow-inner">
                        <img src={product.imageUrl} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur px-4 py-2 rounded-2xl border border-slate-200 text-[9px] font-black text-slate-800 shadow-sm">
                          STOCK: {product.quantity}
                        </div>
                      </div>
                      <h4 className="font-black text-slate-800 text-base uppercase tracking-tight line-clamp-1">{product.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{product.sku} • {product.category}</p>
                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-50">
                        <span className="text-xl font-black text-indigo-600">₹{(activeMode.includes('PURCHASE') ? product.purchasePrice : product.sellingPrice).toLocaleString()}</span>
                        <div className={`p-3 rounded-2xl transition-all ${inCart ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                          <Icons.Plus />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION OVERLAY */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-12 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">Ledger Verification</h3>
              <button onClick={() => setShowConfirmation(false)} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-rose-600 transition-all">✕</button>
            </div>
            
            <div className="p-12 space-y-10">
              <div className="p-10 bg-indigo-50 border-2 border-indigo-100 rounded-[3.5rem] space-y-6">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.8rem] flex items-center justify-center shadow-xl"><Icons.Billing /></div>
                   <div>
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Target Document</p>
                     <p className="text-2xl font-black text-indigo-900 uppercase tracking-tight">{docConfig[activeMode].label}</p>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-10 pt-8 border-t border-indigo-200/30">
                  <div>
                    <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">Billed To</p>
                    <p className="text-sm font-black text-slate-700 uppercase">{partnerName}</p>
                    <p className="text-[8px] font-black text-indigo-400">GST: {partnerGSTIN}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">Financial State</p>
                    <p className="text-sm font-black text-slate-700 uppercase">{paymentStatus}</p>
                  </div>
                </div>
              </div>

              <div className="px-10 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Gross Valuation (Incl. Adjustments)</span>
                  <span className="text-slate-800">₹{totals.taxable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-8 border-t-2 border-slate-900">
                   <span className="font-black text-xs uppercase text-slate-400 tracking-[0.3em]">Total Ledger Impact</span>
                   <span className="font-black text-5xl text-indigo-600 tracking-tighter">₹{totals.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-12 bg-slate-50 flex gap-6">
              <button onClick={() => setShowConfirmation(false)} className="flex-1 py-8 font-black uppercase text-[10px] tracking-[0.3em] text-slate-400 bg-white border-2 border-slate-200 rounded-[2.5rem] hover:bg-slate-100 transition-all">Cancel Entry</button>
              <button onClick={finalizeDocument} className="flex-1 py-8 font-black uppercase text-[10px] tracking-[0.3em] text-white bg-slate-900 rounded-[2.5rem] hover:bg-indigo-600 transition-all shadow-2xl scale-105 active:scale-100">Confirm & Generate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingView;
