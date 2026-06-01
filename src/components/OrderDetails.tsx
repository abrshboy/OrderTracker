import { useState } from 'react';
import { Order, OrderStatus, CostDetails } from '../types';
import { ArrowLeft, Clock, Phone, MessageCircle, Trash2 } from 'lucide-react';

export function OrderDetails({ 
  order, onBack, onUpdate, onCheckCustomer, onDelete 
}: { 
  order: Order, onBack: () => void, onUpdate: (id: string, update: Partial<Order>) => void, onCheckCustomer: (id: string) => void, onDelete: (id: string) => void 
}) {
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const [rescheduledDate, setRescheduledDate] = useState<string>(order.rescheduledDate || '');
  const [costs, setCosts] = useState<Omit<CostDetails, 'totalCost' | 'netProfit'>>({
    materialCost: order.costDetails?.materialCost || 0,
    printingCost: order.costDetails?.printingCost || 0,
    transportationCost: order.costDetails?.transportationCost || 0,
    otherCost: order.costDetails?.otherCost || 0,
    sellingPrice: order.costDetails?.sellingPrice || 0,
  });
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const statuses: OrderStatus[] = ['Inquiry', 'Waiting Design', 'Waiting Customer Reply', 'Confirmed', 'Delivered', 'Rescheduled', 'Archived'];

  const now = new Date().getTime();
  const lastFollowUp = new Date(order.lastFollowUpDate).getTime();
  const daysSinceFollowUp = Math.floor((now - lastFollowUp) / (1000 * 60 * 60 * 24));

  const needsReminder = (order.status === 'Waiting Design' || order.status === 'Waiting Customer Reply') && daysSinceFollowUp >= 3;

  const handleUpdateStatus = () => {
    const updates: Partial<Order> = { status: newStatus };
    if (newStatus === 'Rescheduled' && rescheduledDate) {
      updates.rescheduledDate = rescheduledDate;
    }
    if (newStatus === 'Delivered') {
      const totalCost = costs.materialCost + costs.printingCost + costs.transportationCost + costs.otherCost;
      const netProfit = costs.sellingPrice - totalCost;
      updates.costDetails = {
        ...costs,
        totalCost,
        netProfit,
      };
      if (order.status !== 'Delivered') {
        updates.deliveredDate = new Date().toISOString();
      }
    }
    onUpdate(order.id, updates);
    setEditMode(false);
  };

  const currentTotalCost = costs.materialCost + costs.printingCost + costs.transportationCost + costs.otherCost;
  const currentNetProfit = costs.sellingPrice - currentTotalCost;

  return (
    <div className="flex flex-col h-full bg-gray-50 relative pb-24">
      <div className="bg-white px-4 py-4 border-b border-gray-200 sticky top-0 z-10 flex items-center shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 active:bg-gray-100 rounded-full cursor-pointer"><ArrowLeft className="w-6 h-6" /></button>
        <div className="font-bold text-lg text-center flex-1 pr-8">Order Details</div>
      </div>
      
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
             <div>
               <h2 className="text-xl font-bold text-gray-900">{order.customerName}</h2>
               <div className="text-sm text-gray-500 mt-1">{order.id}</div>
             </div>
             <span className="px-3 py-1 rounded text-xs font-bold bg-indigo-100 text-indigo-700">{order.status}</span>
           </div>

           <div className="space-y-3">
             <div className="flex items-center text-sm text-gray-600">
               <Phone className="w-4 h-4 mr-3 text-gray-400" />
               <a href={`tel:${order.phoneNumber}`} className="text-indigo-600 font-medium">{order.phoneNumber}</a>
             </div>
             <div className="flex items-center text-sm text-gray-600">
               <span className="w-4 h-4 mr-3 text-gray-400 font-bold text-center flex items-center justify-center">@</span>
               {order.source}
             </div>
           </div>
        </div>

        {needsReminder && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col">
            <div className="flex items-center font-bold text-amber-800 mb-2">
              <Clock className="w-5 h-5 mr-2" /> Action Required
            </div>
            <p className="text-sm text-amber-700 mb-3">No activity for {daysSinceFollowUp} days. Please follow up!</p>
            <button onClick={() => onCheckCustomer(order.id)} className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl font-bold cursor-pointer transition-colors">Checked On Customer</button>
          </div>
        )}

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-900">Order Information</h3>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <div className="text-xs text-gray-500 mb-1">Type</div>
                <div className="text-sm font-medium text-gray-900">{order.orderType}</div>
             </div>
             <div>
                <div className="text-xs text-gray-500 mb-1">Quantity</div>
                <div className="text-sm font-medium text-gray-900">{order.quantity}</div>
             </div>
             <div className="col-span-2">
                <div className="text-xs text-gray-500 mb-1">Notes</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{order.notes || 'None'}</div>
             </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="font-bold text-gray-900">Status Management</h3>
             {!editMode && <button onClick={() => setEditMode(true)} className="text-sm font-bold text-indigo-600 cursor-pointer">Change</button>}
          </div>
          
          {editMode ? (
            <div className="space-y-4 pt-2">
              <select value={newStatus} onChange={e => setNewStatus(e.target.value as OrderStatus)} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              
              {newStatus === 'Rescheduled' && (
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">New Delivery Date</label>
                   <input type="date" value={rescheduledDate} onChange={e => setRescheduledDate(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500" />
                </div>
              )}

              {newStatus === 'Delivered' && (
                <div className="space-y-4 pt-2 border-t border-gray-200 mt-2">
                  <h4 className="font-bold text-gray-900">Tracking Costs</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">Material Cost</label>
                       <input type="number" min="0" value={costs.materialCost || ''} onChange={e => setCosts({...costs, materialCost: Number(e.target.value) || 0})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">Printing Cost</label>
                       <input type="number" min="0" value={costs.printingCost || ''} onChange={e => setCosts({...costs, printingCost: Number(e.target.value) || 0})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">Transport Cost</label>
                       <input type="number" min="0" value={costs.transportationCost || ''} onChange={e => setCosts({...costs, transportationCost: Number(e.target.value) || 0})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-gray-700 mb-1">Other Cost</label>
                       <input type="number" min="0" value={costs.otherCost || ''} onChange={e => setCosts({...costs, otherCost: Number(e.target.value) || 0})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                     </div>
                     <div className="col-span-2">
                       <label className="block text-xs font-medium text-gray-700 mb-1">Selling Price</label>
                       <input type="number" min="0" value={costs.sellingPrice || ''} onChange={e => setCosts({...costs, sellingPrice: Number(e.target.value) || 0})} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-base font-bold text-green-700 focus:ring-2 focus:ring-indigo-500" />
                     </div>
                  </div>

                  <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center text-sm">
                     <div>
                       <div className="text-gray-500">Total Cost: <span className="font-bold text-gray-900">{currentTotalCost}</span></div>
                     </div>
                     <div className="text-right">
                       <div className="text-gray-500">Net Profit: <span className={`font-bold ${currentNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{currentNetProfit}</span></div>
                     </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button onClick={() => { setEditMode(false); setNewStatus(order.status); }} className="flex-1 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 active:bg-gray-300 cursor-pointer">Cancel</button>
                <button onClick={handleUpdateStatus} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:bg-indigo-800 cursor-pointer">Update</button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Last Follow-Up:</span> {new Date(order.lastFollowUpDate).toLocaleDateString()}</div>
              <div className="flex justify-between"><span className="text-gray-500">Created:</span> {new Date(order.createdDate).toLocaleDateString()}</div>
              {order.status === 'Rescheduled' && order.rescheduledDate && (
                <div className="flex justify-between"><span className="text-gray-500">Rescheduled To:</span> <span className="font-bold text-orange-600">{new Date(order.rescheduledDate).toLocaleDateString()}</span></div>
              )}
            </div>
          )}
        </div>

        {order.status === 'Delivered' && order.costDetails && !editMode && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3 pl-5 border-l-4 border-l-emerald-500">
             <h3 className="font-bold text-gray-900">Delivery Financials</h3>
             <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-500">Selling Price:</div>
                <div className="text-right font-medium">{order.costDetails.sellingPrice}</div>
                
                <div className="text-gray-500">Total Cost:</div>
                <div className="text-right font-medium text-red-600">-{order.costDetails.totalCost}</div>
                
                <div className="col-span-2 border-t border-gray-100 my-1 pt-2 flex justify-between">
                   <div className="font-bold text-gray-900">Net Profit:</div>
                   <div className={`font-bold ${order.costDetails.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{order.costDetails.netProfit}</div>
                </div>
             </div>
          </div>
        )}
        
        {/* Helper Actions */}
        {(order.status === 'Waiting Design' || order.status === 'Waiting Customer Reply') && !editMode && (
           <button onClick={() => onCheckCustomer(order.id)} className="w-full py-4 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 border border-indigo-100 rounded-xl font-bold flex items-center justify-center shadow-sm transition-colors cursor-pointer">
             <MessageCircle className="w-5 h-5 mr-2" /> Log "Checked On Customer"
           </button>
        )}

        <div className="pt-4 border-t border-gray-200 mt-6 pb-6">
          <button 
            onClick={() => setShowDeleteConfirm(true)} 
            className="w-full py-3 text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-xl font-bold flex items-center justify-center transition-colors cursor-pointer"
          >
            <Trash2 className="w-5 h-5 mr-2" /> Delete Order Permanently
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Order?</h3>
            <p className="text-gray-600 text-sm mb-6">Are you sure you want to permanently delete order <strong>{order.id}</strong>? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="flex-1 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete(order.id);
                }} 
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 active:bg-red-800 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
