
import React, { useState } from 'react';
import { Product, Entity, MovementType, Warehouse } from '../types';
import { WAREHOUSES } from '../constants';

interface StockTransactionModalProps {
  product: Product;
  entities: Entity[];
  onSave: (transaction: {
    type: MovementType;
    quantity: number;
    reason: string;
    entityId?: string;
    warehouseId: string;
  }) => void;
  onClose: () => void;
}

const StockTransactionModal: React.FC<StockTransactionModalProps> = ({ product, entities, onSave, onClose }) => {
  const [type, setType] = useState<MovementType>('PURCHASE');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [entityId, setEntityId] = useState('');
  const [warehouseId, setWarehouseId] = useState(product.warehouseId);

  const filteredEntities = entities.filter(e => 
    (type === 'PURCHASE' && e.type === 'SUPPLIER') || 
    (type === 'SALE' && e.type === 'CUSTOMER')
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Stock Movement</h2>
            <p className="text-xs text-gray-500 mt-0.5">{product.name} ({product.sku})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 