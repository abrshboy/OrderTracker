import { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { Search, ChevronRight } from 'lucide-react';

export function OrderList({ orders, onOrderClick }: { orders: Order[], onOrderClick: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');

  const filtered = orders.filter(o => {
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    const lowerSearch = search.toLowerCase();
    if (search && !(
      o.id.toLowerCase().includes(lowerSearch) ||
      o.customerName.toLowerCase().includes(lowerSearch) ||
      o.phoneNumber.includes(lowerSearch)
    )) return false;
    return true;
  });

  const statuses: (OrderStatus | 'All')[] = ['All', 'Inquiry', 'Waiting Design', 'Waiting Customer Reply', 'Confirmed', 'Delivered', 'Rescheduled', 'Archived'];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-6 py-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm space-y-4">
        <div className="font-bold text-lg text-center">Orders</div>
        <div className="relative">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search ID, Name, Phone..." 
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 space-y-3 flex-1 overflow-y-auto pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No orders found</div>
        ) : (
          filtered.map(order => (
            <button key={order.id} onClick={() => onOrderClick(order.id)} className="w-full text-left bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer">
              <div className="overflow-hidden">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold text-gray-900">{order.customerName}</span>
                  <span className="text-xs text-gray-500">{order.id}</span>
                </div>
                <div className="text-sm text-gray-600 truncate">{order.orderType} • Qty: {order.quantity}</div>
                <div className="mt-2 inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                  {order.status}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
