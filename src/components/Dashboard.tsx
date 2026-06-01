import { Order } from '../types';
import { FileText, Clock, MessageCircle, CheckCircle, CalendarDays, Zap } from 'lucide-react';
import { ViewState } from '../App';
import { useState } from 'react';

export function Dashboard({ orders, onNavigate, onFinishDay }: { orders: Order[], onNavigate: (v: ViewState) => void, onFinishDay: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const stats = {
    inquiry: orders.filter(o => o.status === 'Inquiry').length,
    waitingDesign: orders.filter(o => o.status === 'Waiting Design').length,
    waitingReply: orders.filter(o => o.status === 'Waiting Customer Reply').length,
    confirmed: orders.filter(o => o.status === 'Confirmed').length,
    rescheduled: orders.filter(o => o.status === 'Rescheduled').length,
  };

  const statCards = [
    { label: 'Inquiries', count: stats.inquiry, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Wait Design', count: stats.waitingDesign, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Wait Reply', count: stats.waitingReply, icon: MessageCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Confirmed', count: stats.confirmed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Rescheduled', count: stats.rescheduled, icon: CalendarDays, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50 flex-1 overflow-y-auto pb-24 relative">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center justify-center cursor-pointer active:scale-95 transition-transform" onClick={() => onNavigate('list')}>
            <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold text-gray-900 mb-1">{stat.count}</span>
            <span className="text-xs font-medium text-gray-500">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <button 
          onClick={() => setShowConfirm(true)} 
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-4 shadow-lg flex items-center justify-center space-x-3 active:scale-95 transition-transform cursor-pointer"
        >
          <Zap className="w-6 h-6" />
          <span className="text-lg font-bold">Finish Day</span>
        </button>
        <p className="text-center text-xs text-gray-500 mt-3 px-4">Generate your daily financial report and lock delivered orders.</p>
      </div>

      {showConfirm && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Finish Day?</h3>
            <p className="text-gray-600 text-sm mb-6">This will generate a daily report for today's delivered orders and lock them. This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="flex-1 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold active:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowConfirm(false);
                  onFinishDay();
                }} 
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold active:bg-indigo-700 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
