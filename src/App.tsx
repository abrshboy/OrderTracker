/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useOrders } from './hooks/useOrders';
import { Dashboard } from './components/Dashboard';
import { CreateOrder } from './components/CreateOrder';
import { OrderList } from './components/OrderList';
import { OrderDetails } from './components/OrderDetails';
import { ReportsList } from './components/ReportsList';
import { ReportDetails } from './components/ReportDetails';
import { BottomNav } from './components/BottomNav';

export type ViewState = 'dashboard' | 'create' | 'list' | 'details' | 'reports' | 'report-details';

export default function App() {
  const { orders, reports, loading, addOrder, updateOrder, checkOnCustomer, finishDay, removeOrder } = useOrders();
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const navigateTo = (view: ViewState, id?: string) => {
    setCurrentView(view);
    if (id) {
      setSelectedEntityId(id);
    } else {
      setSelectedEntityId(null);
    }
  };

  const handleFinishDay = async () => {
    const reportId = await finishDay();
    if (reportId) {
      navigateTo('report-details', reportId);
    } else {
      showToast("No newly delivered orders to report.");
    }
  };

  const handleAddOrder = async (data: any) => {
    navigateTo('list');
    await addOrder(data);
    showToast("Order created successfully!");
  };

  if (loading) {
    return (
      <div className="bg-gray-100 h-[100dvh] w-full flex justify-center items-center selection:bg-indigo-100 overflow-hidden">
        <div className="animate-pulse text-indigo-600 font-bold text-xl">Loading POD Manager...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 h-[100dvh] w-full flex justify-center selection:bg-indigo-100 relative overflow-hidden">
      <div className="w-full max-w-md bg-white h-full flex flex-col relative shadow-2xl ring-1 ring-gray-200 overflow-hidden">
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col relative h-full">
          {currentView === 'dashboard' && <Dashboard orders={orders} onNavigate={navigateTo} onFinishDay={handleFinishDay} />}
          {currentView === 'create' && <CreateOrder onSave={handleAddOrder} onCancel={() => navigateTo('dashboard')} />}
          {currentView === 'list' && <OrderList orders={orders} onOrderClick={(id) => navigateTo('details', id)} />}
          {currentView === 'details' && selectedEntityId && (
            <OrderDetails 
              order={orders.find(o => o.id === selectedEntityId)!} 
              onBack={() => navigateTo('list')}
              onUpdate={async (id, updates) => {
                 await updateOrder(id, updates);
                 if (updates.status === 'Delivered') {
                    showToast("Order marked as Delivered.");
                 }
              }}
              onCheckCustomer={async (id) => {
                 await checkOnCustomer(id);
                 showToast("Logged customer check.");
              }}
              onDelete={async (id) => {
                 await removeOrder(id);
                 showToast("Order deleted successfully.");
                 navigateTo('list');
              }}
            />
          )}
          {currentView === 'reports' && <ReportsList reports={reports} onReportClick={(id) => navigateTo('report-details', id)} />}
          {currentView === 'report-details' && selectedEntityId && (
             <ReportDetails
               report={reports.find(r => r.id === selectedEntityId)!}
               onBack={() => navigateTo('reports')}
             />
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNav currentView={currentView} onNavigate={navigateTo} />
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-4 right-4 z-[200] flex justify-center animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium">
              {toastMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
