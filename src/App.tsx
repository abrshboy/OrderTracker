import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  X, 
  Check, 
  Copy, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  AlertTriangle,
  Layers,
  Palette,
  Sparkles,
  Info,
  Layers3,
  CopyPlus,
  HelpCircle,
  TrendingUp,
  XOctagon
} from 'lucide-react';
import { Order } from './types';
import { getAllOrders, putOrder, deleteOrder, clearAllOrders } from './lib/db';

export default function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<'All' | 'Front' | 'Back'>('All');
  const [sizeFilter, setSizeFilter] = useState<string>('All');
  const [apparelFilter, setApparelFilter] = useState<'All' | 'T-shirt' | 'Hoodie'>('All');

  // Modal control states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Form input states
  const [formDate, setFormDate] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSize, setFormSize] = useState('M');
  const [formColor, setFormColor] = useState('Black');
  const [customColor, setCustomColor] = useState('');
  const [formDesign, setFormDesign] = useState('');
  const [formDesignPosition, setFormDesignPosition] = useState<'Front' | 'Back'>('Front');
  const [formLocation, setFormLocation] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formApparelType, setFormApparelType] = useState<'T-shirt' | 'Hoodie'>('T-shirt');

  // UI Interactive States
  const [showColorPopup, setShowColorPopup] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load orders initially
  useEffect(() => {
    async function initData() {
      try {
        const data = await getAllOrders();
        // Sort by date descending
        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(data);
      } catch (err) {
        console.error('Error fetching database orders', err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Pre-fill form for adding
  const handleOpenAdd = () => {
    const today = new Date();
    const localDateStr = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    setEditingOrder(null);
    setFormDate(localDateStr);
    setFormName('');
    setFormPhone('');
    setFormSize('M');
    setFormColor('Black');
    setCustomColor('');
    setFormDesign('');
    setFormDesignPosition('Front');
    setFormLocation('');
    setFormNote('');
    setFormApparelType('T-shirt');
    setShowColorPopup(true); // Open the color picker right away
    setIsFormOpen(true);
  };

  // Pre-fill form for editing
  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setFormDate(order.date);
    setFormName(order.name);
    setFormPhone(order.phoneNumber);
    setFormSize(order.size);
    setFormApparelType(order.apparelType || 'T-shirt');
    
    const standardColors = ['White', 'Black', 'Grey', 'Red', 'Blue'];
    if (standardColors.includes(order.color)) {
      setFormColor(order.color);
      setCustomColor('');
    } else {
      setFormColor('Other');
      setCustomColor(order.color);
    }
    
    setFormDesign(order.design);
    setFormDesignPosition(order.designPosition || 'Front');
    setFormLocation(order.location);
    setFormNote(order.note);
    setShowColorPopup(false); 
    setIsFormOpen(true);
  };

  // Pre-fill form for custom fast-adding of a SECOND/Multiple order for the same customer (Quick registration clone)
  const handleAddAnotherItem = (order: Order) => {
    setEditingOrder(null);
    setFormDate(order.date);
    setFormName(order.name);
    setFormPhone(order.phoneNumber);
    setFormLocation(order.location);
    
    // Reset specific item configurations
    setFormSize('M');
    setFormColor('Black');
    setCustomColor('');
    setFormDesign('');
    setFormDesignPosition('Front');
    setFormNote('');
    setFormApparelType('T-shirt');
    
    setShowColorPopup(true); // Show size-triggered color popover
    setIsFormOpen(true);
    triggerToast(`Created a second item template for client: ${order.name}`);
  };

  const handleSaveOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDesign.trim()) {
      triggerToast('Please fill out Name and Design details.');
      return;
    }

    const selectedColor = formColor === 'Other' ? (customColor.trim() || 'Other') : formColor;

    const orderData: Order = {
      id: editingOrder ? editingOrder.id : `POD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: formDate,
      name: formName.trim(),
      phoneNumber: formPhone.trim(),
      size: formSize,
      color: selectedColor,
      design: formDesign.trim(),
      designPosition: formDesignPosition,
      location: formLocation.trim(),
      note: formNote.trim(),
      apparelType: formApparelType
    };

    try {
      await putOrder(orderData);
      if (editingOrder) {
        setOrders(prev => prev.map(o => o.id === orderData.id ? orderData : o));
        triggerToast('Order updated successfully!');
      } else {
        setOrders(prev => [orderData, ...prev]);
        triggerToast('New order registered successfully!');
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      triggerToast('Error saving data to database.');
    }
  };

  // Safe Deletion confirmation
  const triggerDeleteConfirm = (order: Order) => {
    setOrderToDelete(order);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await deleteOrder(orderToDelete.id);
      setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
      triggerToast(`Order for ${orderToDelete.name} deleted successfully.`);
      setOrderToDelete(null);
    } catch (err) {
      console.error(err);
      triggerToast('Error deleting order.');
    }
  };

  const handleConfirmClearTable = async () => {
    try {
      await clearAllOrders();
      setOrders([]);
      setIsClearConfirmOpen(false);
      triggerToast('Table cleared successfully!');
    } catch (err) {
      console.error(err);
      triggerToast('Error clearing database.');
    }
  };

  // Copy phone helper
  const handleCopyText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    triggerToast(`Copied "${text}" to clipboard!`);
  };

  // Color bubbles helper
  const getVisualColorCode = (color: string) => {
    const norm = color.toLowerCase().trim();
    switch (norm) {
      case 'white': return '#ffffff';
      case 'black': return '#000000';
      case 'grey':
      case 'gray': return '#6b7280';
      case 'red': return '#dc2626';
      case 'blue': return '#2563eb';
      default: return '#7c3aed'; // custom colors default to purple circles
    }
  };

  // Filter logic
  const filteredOrders = orders.filter(o => {
    const matchQuery = 
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phoneNumber.includes(searchQuery) ||
      o.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.design.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.note.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchPosition = positionFilter === 'All' || o.designPosition === positionFilter;
    const matchSize = sizeFilter === 'All' || o.size === sizeFilter;
    const matchApparel = apparelFilter === 'All' || o.apparelType === apparelFilter;

    return matchQuery && matchPosition && matchSize && matchApparel;
  });

  // Aggregation of detailed combinations
  const calculateAggregate = (type: 'T-shirt' | 'Hoodie') => {
    const targetOrders = orders.filter(o => o.apparelType === type);
    const groups: { [key: string]: number } = {};
    
    targetOrders.forEach(o => {
      const displaySize = o.size || 'M';
      // Match case sensitivity
      const displayColor = o.color || 'Black';
      const key = `${displaySize} ${displayColor}`;
      groups[key] = (groups[key] || 0) + 1;
    });

    const breakdownLines = Object.entries(groups).map(([key, count]) => {
      return {
        label: `${key} ${type}`,
        count: count
      };
    });

    // Sort by size or alphabetical
    breakdownLines.sort((a, b) => a.label.localeCompare(b.label));

    return {
      breakdown: breakdownLines,
      total: targetOrders.length
    };
  };

  const tShirtAggr = calculateAggregate('T-shirt');
  const hoodieAggr = calculateAggregate('Hoodie');
  const totalQuantity = orders.length;

  return (
    <div className="h-[100vh] w-full bg-slate-50 flex flex-col text-slate-800 font-sans overflow-hidden selection:bg-indigo-100">
      
      {/* Top Refined Professional Light Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
              POD Matrix <span className="text-indigo-600 font-bold text-xs uppercase px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded-md">Manager</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">Sleek Light Screen Print & Apparel Inventory Hub</p>
          </div>
        </div>

        {/* Global actions at header */}
        <div className="flex items-center space-x-2">
          {/* Summary Breakdown Toggle Trigger */}
          <button
            onClick={() => setIsSummaryOpen(true)}
            className="border border-slate-200 bg-white hover:bg-slate-50 active:scale-98 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Layers3 className="w-4 h-4 text-indigo-600" />
            <span>Apparel Summary</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm inline-flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Order</span>
          </button>
          
          <button
            onClick={() => setIsClearConfirmOpen(true)}
            disabled={orders.length === 0}
            className={`border text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center space-x-1.5 transition-all cursor-pointer ${
              orders.length === 0 
                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'border-red-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100/70 hover:text-rose-700'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Table</span>
          </button>
        </div>
      </header>

      {/* Dynamic Summary Cards Bar */}
      <section className="bg-slate-100/60 border-b border-slate-200 px-6 py-3.5 shrink-0 flex flex-wrap gap-x-8 gap-y-2 text-xs font-semibold text-slate-600 items-center">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-xs" />
          <span>Total Quantities on Matrix: <strong className="text-slate-900 text-sm font-black">{orders.length}</strong></span>
        </div>
        <div className="h-4 w-px bg-slate-250 bg-slate-200 hidden sm:block" />
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs" />
          <span>T-Shirts: <strong className="text-slate-900 text-sm font-black">{orders.filter(o => o.apparelType === 'T-shirt').length} Pcs</strong></span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
          <span>Hoodies: <strong className="text-slate-900 text-sm font-black">{orders.filter(o => o.apparelType === 'Hoodie').length} Pcs</strong></span>
        </div>
        <div className="h-4 w-px bg-slate-250 bg-slate-200 hidden md:block" />
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
          <span>Back Print: <strong className="text-slate-900 text-sm font-black">{orders.filter(o => o.designPosition === 'Back').length} Pcs</strong></span>
        </div>
        <div className="ml-auto text-slate-500 flex items-center space-x-1 hidden lg:flex font-medium text-[11px]">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Back print design cell will display beautiful dark backings automatically.</span>
        </div>
      </section>

      {/* Multi-Dimensional Filter Navigation Hub */}
      <div className="bg-white border-b border-slate-200 p-4 shrink-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 shadow-xs">
        {/* Text Search Box */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-550 text-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-slate-455 transition-all text-ellipsis"
            placeholder="Search name, phone, design description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Size Selector Filtering */}
        <div>
          <select
            value={sizeFilter}
            onChange={e => setSizeFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="All">All Sizes Selected</option>
            {['S', 'M', 'L', 'XL', '2XL', '3XL', 'N/A'].map(sz => (
              <option key={sz} value={sz}>{sz} Size</option>
            ))}
          </select>
        </div>

        {/* Apparel Type Filter */}
        <div>
          <select
            value={apparelFilter}
            onChange={e => setApparelFilter(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="All">All Apparel Formats</option>
            <option value="T-shirt">T-shirts Only</option>
            <option value="Hoodie">Hoodies Only</option>
          </select>
        </div>

        {/* Position Select Tab controls */}
        <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-0.5">
          {(['All', 'Front', 'Back'] as const).map(pos => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`flex-1 text-center py-2 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                positionFilter === pos 
                  ? 'bg-white text-indigo-700 font-extrabold shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              {pos} Print
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Tables area */}
      <main className="flex-grow overflow-hidden flex flex-col bg-slate-50 relative">
        {loading ? (
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute w-full h-full border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <span className="mt-4 text-xs font-black text-slate-500 tracking-wider">LOADING LOCAL DATABASE GRAPH...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center p-8 text-center bg-white m-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Recorded Orders Found</h3>
            <p className="max-w-xs text-xs text-slate-500 mt-1">There are no orders that align with the selected filters or search matches. Clear parameters or add real entries!</p>
            {(searchQuery || positionFilter !== 'All' || sizeFilter !== 'All' || apparelFilter !== 'All') ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPositionFilter('All');
                  setSizeFilter('All');
                  setApparelFilter('All');
                }}
                className="mt-4 inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-850 underline transition"
              >
                Clear Selected Filters
              </button>
            ) : (
              <button
                onClick={handleOpenAdd}
                className="mt-4 inline-flex items-center bg-indigo-600 text-white rounded-xl px-4 py-2 text-xs font-bold"
              >
                Create First Item
              </button>
            )}
          </div>
        ) : (
          /* Table design container - keeps scrolling independent */
          <div className="flex-1 overflow-auto no-scrollbar scroll-smooth">
            <table className="w-full text-left border-collapse min-w-[1000px] relative bg-white">
              <thead className="sticky top-0 bg-slate-105 bg-slate-100 border-b border-slate-250 border-slate-200 text-slate-600 text-[10px] uppercase tracking-wider z-20 font-black shadow-xs">
                <tr>
                  <th className="py-4 px-4 font-black text-indigo-600">Date Log</th>
                  <th className="py-4 px-4 font-black">Client name</th>
                  <th className="py-4 px-3 font-black">Phone contact</th>
                  <th className="py-4 px-4 font-black text-center">Type</th>
                  <th className="py-4 px-4 font-black text-center">Size & Color</th>
                  <th className="py-4 px-4 font-black text-center">Design Artwork</th>
                  <th className="py-4 px-4 font-black">Storage Store</th>
                  <th className="py-4 px-4 font-black">Memo notes</th>
                  <th className="py-4 px-4 font-black text-center sticky right-0 bg-slate-100 border-l border-slate-200 shadow-xs z-30">ROW ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 divide-slate-100 text-slate-700 text-xs font-medium">
                {filteredOrders.map(order => {
                  const isBackPrint = order.designPosition === 'Back';
                  const isHoodie = order.apparelType === 'Hoodie';
                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-slate-50/70 group transition-colors duration-150 bg-white"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-bold text-slate-500 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-650 transition" />
                          <span>{order.date}</span>
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 font-black text-slate-900 max-w-[140px] truncate">
                        {order.name}
                      </td>

                      {/* Phone contact */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {order.phoneNumber ? (
                          <div className="inline-flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 select-all group/phone hover:border-slate-350">
                            <span className="text-[11px] font-mono leading-none">{order.phoneNumber}</span>
                            <button
                              onClick={() => handleCopyText(order.phoneNumber)}
                              className="text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                              title="Copy Customer Phone"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-normal italic">--</span>
                        )}
                      </td>

                      {/* Apparel Type */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          isHoodie 
                            ? 'bg-amber-50 text-amber-800 border-amber-200' 
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {order.apparelType || 'T-shirt'}
                        </span>
                      </td>

                      {/* Size & Color configured */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center space-x-2 bg-slate-50 border border-slate-200 py-1 px-2.5 rounded-xl text-left scale-95 origin-center">
                          <span className="text-xs font-black text-white bg-indigo-650 bg-indigo-600 px-1.5 py-0.5 rounded leading-none uppercase">
                            {order.size || 'M'}
                          </span>
                          <span className="w-2.5 h-2.5 rounded-full border border-slate-320 block shrink-0 shadow-xs" style={{ backgroundColor: getVisualColorCode(order.color) }} />
                          <span className="text-[11px] font-black text-slate-800 pr-1">{order.color || 'Black'}</span>
                        </div>
                      </td>

                      {/* Design Column - SOLID black background cell style standard if Back print is used! */}
                      <td 
                        className={`py-3.5 px-4 text-center transition-all duration-300 relative ${
                          isBackPrint 
                            ? 'bg-slate-950 text-white font-bold border-l border-r border-slate-950 shadow-inner' 
                            : 'text-slate-800'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center space-y-0.5">
                          <span className={`block font-extrabold tracking-tight text-xs max-w-[170px] truncate ${
                            isBackPrint ? 'text-white' : 'text-slate-900 font-black'
                          }`}>
                            {order.design}
                          </span>
                          <span className={`inline-block py-0.5 px-1.5 rounded text-[8px] uppercase tracking-wider font-extrabold ${
                            isBackPrint 
                              ? 'bg-rose-950 text-rose-300 border border-rose-900/60' 
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}>
                            {order.designPosition || 'Front'} Print
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-600 font-semibold max-w-[140px] truncate">
                        {order.location ? (
                          <div className="flex items-center space-x-1 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{order.location}</span>
                          </div>
                        ) : (
                          <span className="text-slate-350 shrink-0">--</span>
                        )}
                      </td>

                      {/* Note memos */}
                      <td className="py-3.5 px-4 text-slate-500 font-normal italic max-w-[160px] truncate" title={order.note}>
                        {order.note ? (
                          <span className="truncate text-[11px] flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                            <span className="truncate">{order.note}</span>
                          </span>
                        ) : (
                          <span className="text-slate-300 italic">--</span>
                        )}
                      </td>

                      {/* Row actions - Sticky right */}
                      <td className="py-3.5 px-4 text-center sticky right-0 bg-white group-hover:bg-slate-50/70 border-l border-slate-100 z-10 whitespace-nowrap shadow-xs">
                        <div className="inline-flex items-center space-x-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                          {/* Quick clone duplicate of client details for multi-items */}
                          <button
                            onClick={() => handleAddAnotherItem(order)}
                            className="bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-600 border border-slate-200 p-1.5 rounded-lg transition-all cursor-pointer inline-flex items-baseline"
                            title="Add Another Item for this Client (Same Info)"
                          >
                            <CopyPlus className="w-3.5 h-3.5 text-indigo-500 mr-0.5" />
                            <span className="text-[10px] font-bold">Add Item</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(order)}
                            className="bg-white hover:bg-slate-100 text-teal-650 text-indigo-650 text-indigo-600 p-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer"
                            title="Edit Order Properties"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => triggerDeleteConfirm(order)}
                            className="bg-white hover:bg-rose-50 text-rose-600 p-1.5 rounded-lg border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
                            title="Delete Order Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* FOOTER BAR status */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3.5 shrink-0 text-slate-500 text-xs flex flex-col sm:flex-row justify-between items-center gap-2 font-semibold">
        <div>
          Showing <span className="text-indigo-600 font-bold">{filteredOrders.length}</span> of <span className="text-slate-900 font-extrabold">{orders.length}</span> order registry entries
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block shrink-0" />
          <span className="text-slate-400 text-[11px] font-medium">Standard Swatches: White | Black | Grey | Red | Blue. Custom colors render violet circles.</span>
        </div>
      </footer>

      {/* ================= MODALS & DETAILED OVERLAYS ================= */}

      {/* 1. APPAREL STATISTICS SUMMARY DIALOGUE (With exact requested format for T-shirt spec) */}
      <AnimatePresence>
        {isSummaryOpen && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[600] flex justify-center items-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">Apparel Production Summary</h3>
                </div>
                <button
                  onClick={() => setIsSummaryOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable breakdown block */}
              <div className="p-5 overflow-y-auto space-y-6 no-scrollbar">
                
                {/* 1. Main detailed T-Shirt breakdown requested by user */}
                <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-wider uppercase text-indigo-700">T-Shirt Detailed Breakdown</span>
                    <span className="bg-indigo-650 bg-indigo-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full">
                      {tShirtAggr.total} Pcs Total
                    </span>
                  </div>

                  {tShirtAggr.breakdown.length === 0 ? (
                    <p className="text-xs text-slate-450 italic text-slate-500 py-1">No T-shirts registered on matrix yet.</p>
                  ) : (
                    <div className="space-y-1.5 pt-1">
                      {tShirtAggr.breakdown.map((item, index) => {
                        // format perfectly to requested specs e.g. "L Black T-shirt = 4Pcs" or "XL White T-shirt = 1Pc"
                        const quantityLabel = item.count > 1 ? 'Pcs' : 'Pc';
                        return (
                          <div 
                            key={index} 
                            className="bg-white border border-indigo-100/60 rounded-lg px-3 py-2 text-xs font-mono font-bold text-indigo-900 flex justify-between items-center"
                          >
                            <span className="capitalize">{item.label}</span>
                            <span className="text-indigo-650 text-indigo-600 font-extrabold">= {item.count} {quantityLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Hoodie detailed breakdown side card */}
                <div className="bg-amber-50/40 rounded-xl p-4 border border-amber-150 border-amber-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-wider uppercase text-amber-800">Hoodie Detailed Breakdown</span>
                    <span className="bg-amber-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full">
                      {hoodieAggr.total} Pcs Total
                    </span>
                  </div>

                  {hoodieAggr.breakdown.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-1">No hoodies registered on matrix yet.</p>
                  ) : (
                    <div className="space-y-1.5 pt-1">
                      {hoodieAggr.breakdown.map((item, index) => {
                        const quantityLabel = item.count > 1 ? 'Pcs' : 'Pc';
                        return (
                          <div 
                            key={index} 
                            className="bg-white border border-amber-100 rounded-lg px-3 py-2 text-xs font-mono font-bold text-amber-905 text-amber-900 flex justify-between items-center"
                          >
                            <span className="capitalize">{item.label}</span>
                            <span className="text-amber-700 font-extrabold">= {item.count} {quantityLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Overall cumulative details */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Grand Cumulative Registry Quantity:</span>
                  <span className="text-sm font-extrabold text-slate-100 bg-slate-900 border border-slate-950 px-3 py-1 rounded-lg">
                    {totalQuantity} Pcs
                  </span>
                </div>

              </div>

              {/* Close footer buttons */}
              <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSummaryOpen(false)}
                  className="bg-indigo-605 bg-indigo-600 text-white hover:bg-indigo-750 hover:bg-indigo-750 hover:bg-indigo-700 active:scale-98 text-xs font-black px-5 py-2 rounded-xl transition cursor-pointer shadow-xs"
                >
                  Close Summary
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. CREATE or EDIT NEW ITEM FORM OVERLAY */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[500] flex justify-center items-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-800"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal form head */}
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-indigo-50 border border-indigo-150 p-1.5 rounded-lg">
                    <Palette className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">
                    {editingOrder ? 'EDIT KEY REGISTRATION DATA' : 'REGISTER MATRIX ITEM'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form entries */}
              <form onSubmit={handleSaveOrder} className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                
                {/* Row 1: apparel categories and dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-extrabold text-slate-500 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      Matrix Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={e => setFormDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-extrabold text-slate-500 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      Storage / Store Location
                    </label>
                    <input
                      type="text"
                      placeholder="E.g., Shelf C, Box 4"
                      value={formLocation}
                      onChange={e => setFormLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Patient / customer names info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-extrabold text-slate-500 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      Customer Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Alice Green"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-extrabold text-slate-500 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-600" />
                      Phone Contact
                    </label>
                    <input
                      type="tel"
                      placeholder="E.g., +155502123"
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Apparel format toggle selection */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                  <span className="block text-[11px] uppercase tracking-wider font-extrabold text-slate-500">
                    Apparel Category format
                  </span>
                  <div className="flex space-x-3">
                    {([ 'T-shirt', 'Hoodie' ] as const).map(type => {
                      const isActive = formApparelType === type;
                      return (
                        <button
                          type="button"
                          key={type}
                          onClick={() => setFormApparelType(type)}
                          className={`flex-1 py-2 rounded-lg border text-xs font-black transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-indigo-600 text-white border-indigo-600 font-extrabold shadow-sm'
                              : 'bg-white text-slate-655 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {type} Item
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Graphic layout setup */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-150 pt-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider font-extrabold text-slate-500 mb-1 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      Design Artwork details *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Vintage Car Front, Retro Logo..."
                      value={formDesign}
                      onChange={e => setFormDesign(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">
                      Print Position
                    </label>
                    <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                      {(['Front', 'Back'] as const).map(pos => (
                        <button
                          type="button"
                          key={pos}
                          onClick={() => setFormDesignPosition(pos)}
                          className={`flex-1 py-1.5 text-[10px] font-black rounded-lg cursor-pointer ${
                            formDesignPosition === pos 
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Size choice - Tapping triggers color popover */}
                <div className="border-t border-slate-150 pt-3 space-y-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-extrabold text-indigo-600 mb-1.5">
                      Choose Apparel Size: (S, M, L, XL, 2XL, 3XL)
                    </label>
                    <div className="grid grid-cols-7 gap-1">
                      {['S', 'M', 'L', 'XL', '2XL', '3XL', 'N/A'].map(sz => {
                        const isSel = formSize === sz;
                        return (
                          <button
                            type="button"
                            key={sz}
                            onClick={() => {
                              setFormSize(sz);
                              setShowColorPopup(true); // Open colors nested selection overlay automatically
                            }}
                            className={`py-2 text-xs font-black rounded-lg border cursor-pointer transition-all ${
                              isSel 
                                ? 'bg-indigo-600 text-white border-indigo-600 font-black shadow-xs' 
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Color configurations inline container */}
                  <AnimatePresence>
                    {showColorPopup && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black tracking-wider text-indigo-700">
                            Choose Color Swatch for {formSize} ({formApparelType})
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowColorPopup(false)}
                            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 underline"
                          >
                            Done Picking
                          </button>
                        </div>

                        {/* Flat Palette choice */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                          {[
                            { name: 'White', bg: 'bg-white text-slate-800 border border-slate-300' },
                            { name: 'Black', bg: 'bg-slate-900 border border-slate-950 text-white shadow-xs' },
                            { name: 'Grey', bg: 'bg-slate-400 text-white' },
                            { name: 'Red', bg: 'bg-red-600 text-white' },
                            { name: 'Blue', bg: 'bg-blue-600 text-white' },
                            { name: 'Other', bg: 'bg-slate-250 bg-slate-200 border border-slate-300 text-slate-800 font-bold' }
                          ].map(pill => {
                            const active = formColor === pill.name;
                            return (
                              <button
                                type="button"
                                key={pill.name}
                                onClick={() => {
                                  setFormColor(pill.name);
                                  if (pill.name !== 'Other') {
                                    setCustomColor('');
                                  }
                                }}
                                className={`rounded-xl py-1 px-1.5 text-[10px] font-black text-center cursor-pointer transition-transform ${pill.bg} ${
                                  active 
                                    ? 'ring-2 ring-indigo-505 ring-indigo-600 scale-102 font-black' 
                                    : 'opacity-75 hover:opacity-100'
                                }`}
                              >
                                {pill.name}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom colors container */}
                        {formColor === 'Other' && (
                          <div className="animate-in fade-in slide-in-from-top-1">
                            <input
                              type="text"
                              placeholder="Describe custom hue (e.g., Violet, Crimson, Forest Green...)"
                              value={customColor}
                              onChange={e => setCustomColor(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-bold focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Notes and custom instructions */}
                <div className="border-t border-slate-150 pt-3">
                  <label className="block text-[11px] uppercase tracking-wider font-extrabold text-slate-500 mb-1">
                    Special Memo Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="E.g. Extra baggy fit, sleeve print details..."
                    value={formNote}
                    onChange={e => setFormNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-indigo-500 focus:outline-none resize-none text-slate-700"
                  />
                </div>

              </form>

              {/* Modal form foot actions */}
              <div className="bg-slate-50 border-t border-slate-200 px-5 py-4 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-transparent border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveOrder}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
                >
                  {editingOrder ? 'Update Configuration' : 'Confirm Registration'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. ROW SAFE DELETION CONFIRMATION DIALOGUE */}
      <AnimatePresence>
        {orderToDelete && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[600] flex justify-center items-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-rose-100 w-full max-w-sm rounded-2xl shadow-xl p-5 text-center space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <XOctagon className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Delete Registry Item?</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Are you sure you want to permanently delete the registered {orderToDelete.apparelType || 'item'} for <strong className="text-slate-900">{orderToDelete.name}</strong>? This cannot be undone.
                </p>
                {orderToDelete.design && (
                  <div className="bg-slate-50 text-[11px] text-slate-600 p-2 rounded-xl border border-slate-200/60 font-mono inline-block font-semibold mt-3 max-w-md truncate">
                    Design: {orderToDelete.design} ({orderToDelete.size}, {orderToDelete.color})
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setOrderToDelete(null)}
                  className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 text-slate-500 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Keep Item
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow cursor-pointer"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. CLEAR ALL LIST COMPLETELY CONFIRMATION DIALOGUE */}
      <AnimatePresence>
        {isClearConfirmOpen && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[600] flex justify-center items-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-rose-105 border-rose-200 w-full max-w-sm rounded-2xl shadow-xl p-5 text-center space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>

              <div>
                <h3 className="text-sm font-black text-rose-700">PURGE REGISTRY MATRIX?</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  You are about to irreversibly wipe out the full list of <strong className="text-rose-600">{orders.length}</strong> apparel registrations. All synchronized client data will be cleared permanently.
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setIsClearConfirmOpen(false)}
                  className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel and Abort
                </button>
                <button
                  onClick={handleConfirmClearTable}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow cursor-pointer"
                >
                  Confirm and Terminate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Smooth pop toast notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 35, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 35, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-[1000] px-4 py-3 bg-slate-900 border border-slate-950 text-white text-xs font-black rounded-xl shadow-xl flex items-center space-x-2"
          >
            <Check className="w-4 h-4 text-emerald-400 font-black" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
