import { DailyReport } from '../types';
import { ArrowLeft } from 'lucide-react';

export function ReportDetails({ report, onBack }: { report: DailyReport, onBack: () => void }) {
  
  return (
    <div className="flex flex-col h-full bg-gray-50 relative pb-24">
      <div className="bg-white px-4 py-4 border-b border-gray-200 sticky top-0 z-10 flex items-center shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 active:bg-gray-100 rounded-full cursor-pointer"><ArrowLeft className="w-6 h-6" /></button>
        <div className="font-bold text-lg text-center flex-1 pr-8 text-gray-900">Report {report.date}</div>
      </div>
      
      <div className="p-4 space-y-4 flex-1 overflow-y-auto mix-blend-multiply">
         <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-md">
            <h2 className="text-indigo-100 text-sm font-medium mb-1">Daily Summary</h2>
            <div className="text-3xl font-bold mb-6">{report.summary.totalNetProfit} <span className="text-lg font-normal text-indigo-200">Net Profit</span></div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
               <div>
                  <div className="text-indigo-200 mb-1">Revenue</div>
                  <div className="font-bold">{report.summary.totalRevenue}</div>
               </div>
               <div>
                  <div className="text-indigo-200 mb-1">Expenses</div>
                  <div className="font-bold">{report.summary.totalExpenses}</div>
               </div>
               <div className="col-span-2 pt-2 border-t border-indigo-500/50">
                  <div className="text-indigo-200 mb-1">Orders Delivered</div>
                  <div className="font-bold text-lg">{report.summary.totalDelivered}</div>
               </div>
            </div>
         </div>

         <div className="space-y-3">
             <h3 className="font-bold text-gray-900 px-1 pt-2">Order Breakdown</h3>
             
             {report.orders.map(order => (
               <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3">
                  <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                     <div>
                        <div className="font-bold text-gray-900">{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.id}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">Qty: {order.quantity}</div>
                     </div>
                  </div>
                  
                  {order.costDetails && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                       <div className="text-gray-500">Material <span className="text-gray-900 font-medium float-right">{order.costDetails.materialCost}</span></div>
                       <div className="text-gray-500">Printing <span className="text-gray-900 font-medium float-right">{order.costDetails.printingCost}</span></div>
                       <div className="text-gray-500">Transport <span className="text-gray-900 font-medium float-right">{order.costDetails.transportationCost}</span></div>
                       <div className="text-gray-500">Other <span className="text-gray-900 font-medium float-right">{order.costDetails.otherCost}</span></div>
                       
                       <div className="col-span-2 border-t border-gray-50 mt-1 pt-2 text-sm">
                           <div className="flex justify-between text-red-600 mb-1"><span>Total Cost:</span> <span>-{order.costDetails.totalCost}</span></div>
                           <div className="flex justify-between text-gray-900 mb-1"><span>Selling Price:</span> <span>{order.costDetails.sellingPrice}</span></div>
                           <div className="flex justify-between font-bold text-emerald-600 mt-1 pt-1 border-t border-gray-100">
                               <span>Net Profit:</span> <span>{order.costDetails.netProfit}</span>
                           </div>
                       </div>
                    </div>
                  )}
               </div>
             ))}
             
             {report.orders.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm bg-white rounded-xl border border-gray-100">
                   No order details available.
                </div>
             )}
         </div>
      </div>
    </div>
  );
}
