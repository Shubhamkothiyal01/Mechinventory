
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InventoryTable from './components/InventoryTable';
import ProductModal from './components/ProductModal';
import StockMovementModal from './components/StockMovementModal';
import AuditLog from './components/AuditLog';
import BillingView from './components/BillingView';
import BusinessSheet from './components/BusinessSheet';
import BillingHistory from './components/BillingHistory';
import PartnersView from './components/PartnersView';
import HelpView from './components/HelpView';
import AIChat from './components/AIChat';
import Login from './components/Login';
import { Product, AppView, StockMovement, AuditLogEntry, MovementType, UserRole, DocumentRecord, Entity } from './types';
import { Icons, INITIAL_ENTITIES } from './constants';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [documentHistory, setDocumentHistory] = useState<DocumentRecord[]>([]);
  const [entities, setEntities] = useState<Entity[]>(INITIAL_ENTITIES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isFileSyncing, setIsFileSyncing] = useState(false);

  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [currentUser, setCurrentUser] = useState({ name: 'System Owner', role: 'Owner' as UserRole });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductForMovement, setSelectedProductForMovement] = useState<Product | null>(null);

  useEffect(() => {
    const savedP = localStorage.getItem('invenpro_products');
    const savedM = localStorage.getItem('invenpro_movements');
    const savedD = localStorage.getItem('invenpro_docs');
    const savedE = localStorage.getItem('invenpro_entities');
    const savedA = localStorage.getItem('invenpro_audit');
    const savedAuth = localStorage.getItem('invenpro_auth');

    if (savedP) setProducts(JSON.parse(savedP));
    if (savedM) setMovements(JSON.parse(savedM));
    if (savedD) setDocumentHistory(JSON.parse(savedD));
    if (savedE) setEntities(JSON.parse(savedE));
    if (savedA) setAuditLogs(JSON.parse(savedA));
    if (savedAuth === 'true') setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (!isFileSyncing) {
      localStorage.setItem('invenpro_products', JSON.stringify(products));
      localStorage.setItem('invenpro_movements', JSON.stringify(movements));
      localStorage.setItem('invenpro_docs', JSON.stringify(documentHistory));
      localStorage.setItem('invenpro_entities', JSON.stringify(entities));
      localStorage.setItem('invenpro_audit', JSON.stringify(auditLogs));
    }
  }, [products, movements, documentHistory, entities, auditLogs, isFileSyncing]);

  const addAuditLog = (action: string, details: string) => {
    const log: AuditLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      details,
      user: `${currentUser.name} (${currentUser.role})`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
      localStorage.setItem('invenpro_auth', 'true');
      addAuditLog('USER_LOGIN', 'Operator session established.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('invenpro_auth');
  };

  const handleCSVImport = (data: Product[]) => {
    setProducts(prev => [...prev, ...data]);
    addAuditLog('BULK_IMPORT', `Imported ${data.length} items via CSV file.`);
  };

  const handleDocumentCompletion = (doc: DocumentRecord) => {
    const increasesStock = ['PURCHASE_BILL', 'GRN', 'CREDIT_NOTE', 'ADJUSTMENT_BILL'].includes(doc.docType);
    const decreasesStock = ['SALES_BILL', 'DELIVERY_CHALLAN', 'DEBIT_NOTE'].includes(doc.docType);
    
    const qtyMultiplier = increasesStock ? 1 : (decreasesStock ? -1 : 0);

    if (qtyMultiplier !== 0) {
      setProducts(prev => prev.map(p => {
        const item = doc.items.find(di => di.productId === p.id);
        if (item) {
          const newQty = p.quantity + (item.quantity * qtyMultiplier);
          const updateObj: Partial<Product> = { quantity: newQty, lastUpdated: new Date().toISOString() };
          if (doc.docType === 'PURCHASE_BILL') updateObj.purchasePrice = item.price;
          return { ...p, ...updateObj };
        }
        return p;
      }));

      const newMovements = doc.items.map(item => ({
        id: Math.random().toString(36).substr(2, 9),
        productId: item.productId,
        productName: item.name,
        type: doc.docType as any,
        quantity: item.quantity,
        reason: `Auto-logged from ${doc.docType} ${doc.docNo}`,
        docRef: doc.docNo,
        warehouseId: products.find(p => p.id === item.productId)?.warehouseId || '',
        timestamp: new Date().toISOString()
      }));

      setMovements(prev => [...newMovements, ...prev]);
    }

    setDocumentHistory(prev => [doc, ...prev]);
    addAuditLog('DOC_GENERATION', `Generated ${doc.docType} [${doc.docNo}] for ${doc.partnerName}`);
  };

  const handleSaveProduct = (formData: Partial<Product>) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...formData, lastUpdated: new Date().toISOString() } as Product : p));
      addAuditLog('UPDATE_ASSET', `Product ${editingProduct.sku} updated.`);
    } else {
      const newProduct: Product = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        lastUpdated: new Date().toISOString()
      } as Product;
      setProducts(prev => [newProduct, ...prev]);
      addAuditLog('CREATE_ASSET', `New asset registered: ${newProduct.sku}`);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleStockMovement = (data: { type: MovementType, quantity: number, reason: string, entityId?: string, warehouseId: string }) => {
    if (!selectedProductForMovement) return;
    const qtyMod = (data.type === 'SALE' || (data.type === 'ADJUSTMENT' && data.quantity < 0)) ? -Math.abs(data.quantity) : Math.abs(data.quantity);
    
    setProducts(prev => prev.map(p => p.id === selectedProductForMovement.id ? { ...p, quantity: p.quantity + qtyMod, lastUpdated: new Date().toISOString() } : p));
    setMovements(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      productId: selectedProductForMovement.id,
      productName: selectedProductForMovement.name,
      type: data.type,
      quantity: data.quantity,
      reason: data.reason,
      warehouseId: data.warehouseId,
      timestamp: new Date().toISOString()
    }, ...prev]);
    setIsMovementModalOpen(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard products={products} setActiveView={setActiveView} />;
      case 'inventory': return (
        <InventoryTable 
          products={products} 
          onAddProduct={() => { setEditingProduct(null); setIsModalOpen(true); }} 
          onEditProduct={p => { setEditingProduct(p); setIsModalOpen(true); }} 
          onDeleteProduct={id => setProducts(prev => prev.filter(p => p.id !== id))} 
          onStockMovement={p => { setSelectedProductForMovement(p); setIsMovementModalOpen(true); }} 
          onQuickRestock={(p, a) => setProducts(prev => prev.map(prod => prod.id === p.id ? {...prod, quantity: prod.quantity + a} : prod))}
          onCSVImport={handleCSVImport}
        />
      );
      case 'billing': return <BillingView products={products} onCompleteDocument={handleDocumentCompletion} />;
      case 'billing-history': return (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200">
             <h3 className="text-xl font-black text-slate-800">Global Ledger History</h3>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Audit of all 8 document types</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
             {documentHistory.map(doc => (
               <div key={doc.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between hover:border-indigo-500 transition-all group">
                 <div>
                   <p className="text-[9px] font-black text-indigo-500 uppercase">{doc.docType.replace('_', ' ')}</p>
                   <h4 className="font-black text-slate-800 uppercase tracking-tighter text-lg">{doc.docNo}</h4>
                   <p className="text-xs font-bold text-slate-400">Partner: {doc.partnerName} • {new Date(doc.timestamp).toLocaleDateString()}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-sm font-black text-slate-900">₹{doc.total.toLocaleString()}</p>
                   <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${doc.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{doc.paymentStatus}</span>
                 </div>
               </div>
             ))}
          </div>
        </div>
      );
      case 'partners': return (
        <PartnersView 
          entities={entities} 
          onAddPartner={p => setEntities(prev => [p, ...prev])} 
          onDeletePartner={id => setEntities(prev => prev.filter(e => e.id !== id))} 
        />
      );
      case 'ai-assistant': return <AIChat products={products} />;
      case 'business-sheet': return <BusinessSheet products={products} movements={movements} />;
      case 'audit': return <AuditLog logs={auditLogs} />;
      case 'help': return <HelpView connectLocalFile={() => {}} isFileSyncing={isFileSyncing} />;
      default: return <Dashboard products={products} setActiveView={setActiveView} />;
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView} currentUser={currentUser} setCurrentUser={setCurrentUser} isFileSyncing={isFileSyncing}>
      {renderContent()}
      <div className="fixed bottom-6 right-6">
        <button onClick={handleLogout} className="p-4 bg-white/80 border border-slate-200 rounded-full shadow-lg hover:bg-rose-50 hover:text-rose-600 transition-all text-slate-400" title="Secure Logout">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        </button>
      </div>
      {isModalOpen && <ProductModal product={editingProduct} userRole={currentUser.role} onClose={() => setIsModalOpen(false)} onSave={handleSaveProduct} />}
      {isMovementModalOpen && selectedProductForMovement && <StockMovementModal product={selectedProductForMovement} currentUser={currentUser} onClose={() => setIsMovementModalOpen(false)} onSave={handleStockMovement} />}
    </Layout>
  );
};

export default App;
