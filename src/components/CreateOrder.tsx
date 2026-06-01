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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ customerName, phoneNumber, source, orderType, quantity, notes, status });
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
