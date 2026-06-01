export type OrderStatus = 'Inquiry' | 'Waiting Design' | 'Waiting Customer Reply' | 'Confirmed' | 'Delivered' | 'Rescheduled' | 'Archived';
export type OrderSource = 'Call' | 'TikTok' | 'Telegram' | 'Other';
export type OrderType = 'Library Design' | 'Library Design + Edit' | 'Custom Design' | 'Special Request' | 'Bulk Order';

export interface CostDetails {
  materialCost: number;
  printingCost: number;
  transportationCost: number;
  otherCost: number;
  totalCost: number;
  sellingPrice: number;
  netProfit: number;
}

export interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  source: OrderSource;
  orderType: OrderType;
  quantity: number;
  notes: string;
  status: OrderStatus;
  createdDate: string;
  lastFollowUpDate: string;
  rescheduledDate?: string;
  deliveredDate?: string;
  costDetails?: CostDetails;
  reportGenerated?: boolean;
  size?: string;
  color?: string;
}

export interface DailyReportSummary {
  totalDelivered: number;
  totalRevenue: number;
  totalExpenses: number;
  totalNetProfit: number;
}

export interface DailyReport {
  id: string;
  date: string;
  orders: Order[];
  summary: DailyReportSummary;
}
