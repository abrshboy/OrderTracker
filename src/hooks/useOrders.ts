import { useState, useEffect } from 'react';
import { Order, DailyReport } from '../types';
import { getAllOrders, putOrders, putOrder, getAllReports, putReport, deleteOrder } from '../lib/db';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Load and apply auto-archive logic
  useEffect(() => {
    async function loadData() {
      try {
        let parsedOrders = await getAllOrders();
        let modifiedOrders: Order[] = [];

        const now = new Date().getTime();
        const MS_PER_DAY = 1000 * 60 * 60 * 24;

        parsedOrders = parsedOrders.map(o => {
          if (o.status === 'Archived' || o.status === 'Confirmed' || o.status === 'Delivered') return o;

          const lastFollowUp = new Date(o.lastFollowUpDate).getTime();
          const daysSinceLastFollowUp = (now - lastFollowUp) / MS_PER_DAY;

          if (o.status === 'Inquiry' && daysSinceLastFollowUp >= 7) {
            const mod = { ...o, status: 'Archived' as const };
            modifiedOrders.push(mod);
            return mod;
          }

          if ((o.status === 'Waiting Design' || o.status === 'Waiting Customer Reply') && daysSinceLastFollowUp >= 7) {
            const mod = { ...o, status: 'Archived' as const };
            modifiedOrders.push(mod);
            return mod;
          }

          return o;
        });

        if (modifiedOrders.length > 0) {
          await putOrders(modifiedOrders);
        }

        // Sort orders descending
        parsedOrders.sort((a,b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
        setOrders(parsedOrders);

        const storedReports = await getAllReports();
        storedReports.sort((a,b) => new Date(b.id.replace('REP-', '')).getTime() - new Date(a.id.replace('REP-', '')).getTime());
        setReports(storedReports);
      } catch (err) {
        console.error("Failed to load IndexedDB data", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  const addOrder = async (order: Omit<Order, 'id' | 'createdDate' | 'lastFollowUpDate'>) => {
    const now = new Date().toISOString();
    // generate simple ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      ...order,
      id: `POD-${randomNum}`,
      createdDate: now,
      lastFollowUpDate: now,
    };
    
    await putOrder(newOrder);
    setOrders(prev => [newOrder, ...prev]);
    return newOrder.id;
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    const existing = orders.find(o => o.id === id);
    if (!existing) return;
    const newOrder = { ...existing, ...updates };
    
    await putOrder(newOrder);
    setOrders(prev => prev.map(o => o.id === id ? newOrder : o));
  };

  const checkOnCustomer = async (id: string) => {
    const now = new Date().toISOString();
    await updateOrder(id, { lastFollowUpDate: now });
  };

  const removeOrder = async (id: string) => {
    await deleteOrder(id);
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const finishDay = async () => {
    const today = new Date().toLocaleDateString();
    
    // Find orders delivered today that haven't been reported yet.
    // To be safe we'll use reportGenerated flag. 
    // And also ensure status is Delivered and they have costDetails
    const deliveredToday = orders.filter(o => 
      o.status === 'Delivered' && 
      o.costDetails && 
      !o.reportGenerated
    );

    if (deliveredToday.length === 0) return null;

    const summary = deliveredToday.reduce((acc, order) => {
      return {
        totalDelivered: acc.totalDelivered + 1,
        totalRevenue: acc.totalRevenue + (order.costDetails?.sellingPrice || 0),
        totalExpenses: acc.totalExpenses + (order.costDetails?.totalCost || 0),
        totalNetProfit: acc.totalNetProfit + (order.costDetails?.netProfit || 0),
      };
    }, {
      totalDelivered: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      totalNetProfit: 0
    });

    const newReport: DailyReport = {
      id: `REP-${new Date().getTime()}`,
      date: today,
      orders: [...deliveredToday],
      summary
    };

    await putReport(newReport);
    setReports(prev => [newReport, ...prev]);

    // Mark these as reported
    const updatedOrders: Order[] = [];
    const newOrders = orders.map(o => {
      if (deliveredToday.some(d => d.id === o.id)) {
        const up = { ...o, reportGenerated: true };
        updatedOrders.push(up);
        return up;
      }
      return o;
    });

    await putOrders(updatedOrders);
    setOrders(newOrders);
    
    return newReport.id;
  };

  return {
    orders,
    reports,
    loading,
    addOrder,
    updateOrder,
    checkOnCustomer,
    removeOrder,
    finishDay
  };
}
