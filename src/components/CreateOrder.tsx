import { useState, FormEvent } from 'react';
import { OrderSource, OrderType, OrderStatus } from '../types';

export function CreateOrder({ onSave, onCancel }: { onSave: (o: any) => void, onCancel: () => void }) {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [source, setSource] = useState<OrderSource>('Call');
  const [orderType, setOrderType] = useState<OrderType>('Library Design');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<OrderStatus>('Inquiry');
  const [size, setSize] = useState('M');
  const [color, setColor] = useState('Black');
  const [customColor, setCustomColor] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const finalColor = color === 'Other' ? (customColor.trim() || 'Other') : color;
    onSave({ 
      customerName, 
      phoneNumber, 
      source, 
      orderType, 
      quantity, 
      notes, 
      status, 
      size, 
      color: finalColor 
    });
  };

  const sources: OrderSource[] = ['Call', 'TikTok', 'Telegram', 'Other'];
  const types: OrderType[] = ['Library Design', 'Library Design + Edit', 'Custom Design', 'Special Request', 'Bulk Order'];
  const statuses: OrderStatus[] = ['Inquiry', 'Waiting Design', 'Waiting Customer Reply', 'Confirmed', 'Rescheduled'];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-6 py-4 border-b border-gray-200 sticky top-0 z-10 font-bold text-lg text-center">
        New Order
      </div>
      <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
          <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
          <input required type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
          <select value={source} onChange={e => setSource(e.target.value as OrderSource)} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
          <select value={orderType} onChange={e => setOrderType(e.target.value as OrderType)} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
           <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
          <div className="flex flex-wrap gap-2">
            {['S', 'M', 'L', 'XL', '2XL', '3XL', 'N/A'].map(s => (
              <button
                type="button"
                key={s}
                onClick={() => setSize(s)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl cursor-pointer border transition-all duration-150 ${
                  size === s 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-102' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { name: 'White', bgClass: 'bg-white border-gray-300 text-gray-800' },
              { name: 'Black', bgClass: 'bg-black text-white border-black' },
              { name: 'Grey', bgClass: 'bg-gray-400 text-white border-gray-400' },
              { name: 'Red', bgClass: 'bg-red-600 text-white border-red-600' },
              { name: 'Blue', bgClass: 'bg-blue-600 text-white border-blue-600' },
              { name: 'Green', bgClass: 'bg-emerald-600 text-white border-emerald-600' },
              { name: 'Yellow', bgClass: 'bg-yellow-400 text-amber-950 border-yellow-400' },
              { name: 'Navy', bgClass: 'bg-blue-950 text-white border-blue-950' },
              { name: 'Pink', bgClass: 'bg-pink-400 text-white border-pink-400' },
              { name: 'Purple', bgClass: 'bg-purple-600 text-white border-purple-600' },
              { name: 'Other', bgClass: 'bg-gray-100 text-gray-700 border-gray-300' },
            ].map(c => {
              const isSelected = color === c.name || (c.name === 'Other' && !['White', 'Black', 'Grey', 'Red', 'Blue', 'Green', 'Yellow', 'Navy', 'Pink', 'Purple'].includes(color));
              return (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => {
                    setColor(c.name);
                    if (c.name !== 'Other') {
                      setCustomColor('');
                    }
                  }}
                  className={`border rounded-xl py-2 px-1 text-xs font-semibold text-center truncate flex items-center justify-center space-x-1 cursor-pointer transition-all duration-150 ${c.bgClass} ${
                    isSelected 
                      ? 'ring-2 ring-indigo-500 ring-offset-2 scale-102 font-bold' 
                      : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full inline-block shrink-0 ${
                    c.name === 'White' ? 'bg-gray-200 border border-gray-300' : 'bg-current'
                  }`} />
                  <span className="truncate">{c.name}</span>
                </button>
              );
            })}
          </div>
          
          {(color === 'Other' || !['White', 'Black', 'Grey', 'Red', 'Blue', 'Green', 'Yellow', 'Navy', 'Pink', 'Purple'].includes(color)) && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-150">
              <input 
                type="text" 
                placeholder="Enter custom color (e.g., Orange, Neon...)" 
                value={customColor || (['White', 'Black', 'Grey', 'Red', 'Blue', 'Green', 'Yellow', 'Navy', 'Pink', 'Purple'].includes(color) ? '' : color)}
                onChange={e => {
                  setCustomColor(e.target.value);
                  setColor('Other');
                }}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}
        </div>
        
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
           <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Initial Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as OrderStatus)} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="pt-4 pb-8 flex space-x-3">
          <button type="button" onClick={onCancel} className="flex-1 py-4 bg-gray-200 text-gray-800 rounded-xl font-bold text-base hover:bg-gray-300 active:bg-gray-400">Cancel</button>
          <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold text-base hover:bg-indigo-700 active:bg-indigo-800">Save Order</button>
        </div>
      </form>
    </div>
  );
}
