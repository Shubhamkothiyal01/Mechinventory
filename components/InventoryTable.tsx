
import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { Icons, CATEGORIES, WAREHOUSES } from '../constants';

interface InventoryTableProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onStockMovement: (product: Product) => void;
  onQuickRestock?: (product: Product, amount: number) => void;
  onCSVImport?: (data: Product[]) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ 
  products, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct, 
  onStockMovement, 
  onQuickRestock,
  onCSVImport 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/);
      const results: Product[] = [];
      
      // Robust regex for splitting CSV lines that may contain commas within quotes
      const csvRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split(csvRegex).map(c => c.replace(/^"|"$/g, '').trim());
        
        // Expected Order: Name, SKU, Category, SellingPrice, Quantity, HSN
        if (cols.length >= 2) {
          results.push({
            id: Math.random().toString(36).substr(2, 9),
            name: cols[0] || 'Unknown Item',
            sku: cols[1] || `SKU-${Date.now()}-${i}`,
            category: cols[2] || 'General',
            sellingPrice: parseFloat(cols[3]) || 0,
            purchasePrice: (parseFloat(cols[3]) || 0) * 0.7,
            quantity: parseInt(cols[4]) || 0,
            hsnCode: cols[5] || '94054090',
            brand: 'Imported',
            uom: 'NOS',
            minStock: 5,
            maxStock: 1000,
            warehouseId: WAREHOUSES[0].id,
            description: 'Bulk imported item.',
            imageUrl: `https://picsum.photos/seed/${Math.random()}/400/300`,
            lastUpdated: new Date().toISOString()
          });
        }
      }
      
      if (results.length > 0 && onCSVImport) {
        onCSVImport(results);
        alert(`Successfully imported ${results.length} items to inventory.`);
      } else {
        alert('Could not parse any valid data from the CSV. Please check the format.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = "Name,SKU,Category,SellingPrice,Quantity,HSNCode";
    const sample = "Example Product,SKU-101,Hardware,499.00,50,94054090";
    const blob = new Blob([`${headers}\n${sample}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invenpro_template.csv';
    a.click();
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (confirm(`Confirm Decommission: Permanent removal of ${name}?`)) {
      onDeleteProduct(id);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[300px] max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Icons.Search />
            </span>
            <input 
              type="text" 
              placeholder="Filter assets by name or SKU..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-white focus:border-indigo-500 outline-none transition-all shadow-sm font-bold text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-4 rounded-2xl border-2 border-slate-100 bg-white outline-none font-black text-[10px] uppercase tracking-wider text-slate-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={downloadTemplate}
            className="p-4 bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all"
            title="Download CSV Template"
          >
            <Icons.Reports />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".csv" 
            onChange={handleCSVUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border-2 border-slate-100 hover:border-indigo-500 text-slate-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm transition-all"
          >
            Bulk Import (.csv)
          </button>
          <button 
            onClick={onAddProduct}
            className="bg-slate-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl transition-all"
          >
            <Icons.Plus />
            Register New Asset
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Logistics</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Health</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Restock</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Master Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-black uppercase text-[10px] tracking-[0.5em]">Inventory Empty</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                          <img src={product.imageUrl} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 uppercase tracking-tight">{product.name}</p>
                          <p className="text-[10px] font-bold text-indigo-500 uppercase">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-mono text-xs font-black text-slate-500">{product.sku}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{WAREHOUSES.find(w => w.id === product.warehouseId)?.name}</p>
                    </td>
                    <td className="px-8 py-6 min-w-[180px]">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                           <span className={`text-sm font-black ${product.quantity <= product.minStock ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>{product.quantity} {product.uom}</span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Min: {product.minStock}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                            <div className={`h-full rounded-full transition-all duration-1000 ${product.quantity <= product.minStock ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((product.quantity/product.maxStock)*100, 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => onQuickRestock?.(product, 10)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black border border-slate-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all"
                        >
                          +10
                        </button>
                        <button 
                          onClick={() => onQuickRestock?.(product, 50)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black border border-slate-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all"
                        >
                          +50
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right space-x-2">
                      <button onClick={() => onStockMovement(product)} className="p-3 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all border border-indigo-100 shadow-sm" title="Adjust Stock">
                        <Icons.Inventory />
                      </button>
                      <button onClick={() => onEditProduct(product)} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 shadow-sm" title="Edit Record">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </button>
                      <button onClick={() => handleDeleteClick(product.id, product.name)} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-100 shadow-sm" title="Decommission">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
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

export default InventoryTable;
