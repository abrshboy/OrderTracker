import { DailyReport } from '../types';
import { ChevronRight, FileBarChart } from 'lucide-react';

export function ReportsList({ reports, onReportClick }: { reports: DailyReport[], onReportClick: (id: string) => void }) {

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-6 py-4 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex items-center justify-center">
        <FileBarChart className="w-5 h-5 mr-2 text-indigo-600" />
        <div className="font-bold text-lg text-center text-gray-900">Daily Reports</div>
      </div>
      
      <div className="p-4 space-y-3 flex-1 overflow-y-auto pb-24">
        {reports.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No reports generated yet</div>
        ) : (
          reports.map(report => (
            <button key={report.id} onClick={() => onReportClick(report.id)} className="w-full text-left bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer">
              <div className="overflow-hidden">
                <div className="font-bold text-gray-900 text-lg mb-1">{report.date}</div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{report.summary.totalDelivered}</span> orders delivered
                </div>
                <div className="mt-2 flex space-x-3 text-xs">
                   <div className="px-2 py-1 bg-green-50 text-green-700 rounded font-semibold">
                      Profit: {report.summary.totalNetProfit}
                   </div>
                   <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-semibold">
                      Revenue: {report.summary.totalRevenue}
                   </div>
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
