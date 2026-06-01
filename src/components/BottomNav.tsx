import { Home, PlusCircle, List, FileBarChart } from 'lucide-react';
import { ViewState } from '../App';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 pb-safe">
      <button 
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center p-2 min-w-[64px] min-h-[44px] ${currentView === 'dashboard' ? 'text-indigo-600' : 'text-gray-500'}`}
      >
        <Home className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">Home</span>
      </button>

      <button 
        onClick={() => onNavigate('create')}
        className={`flex flex-col items-center p-2 min-w-[64px] min-h-[44px] ${currentView === 'create' ? 'text-indigo-600' : 'text-gray-500'}`}
      >
        <PlusCircle className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">New</span>
      </button>

      <button 
        onClick={() => onNavigate('list')}
        className={`flex flex-col items-center p-2 min-w-[64px] min-h-[44px] ${currentView === 'list' || currentView === 'details' ? 'text-indigo-600' : 'text-gray-500'}`}
      >
        <List className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">Orders</span>
      </button>

      <button 
        onClick={() => onNavigate('reports')}
        className={`flex flex-col items-center p-2 min-w-[64px] min-h-[44px] ${currentView === 'reports' || currentView === 'report-details' ? 'text-indigo-600' : 'text-gray-500'}`}
      >
        <FileBarChart className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">Reports</span>
      </button>
    </div>
  );
}
