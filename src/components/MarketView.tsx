import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import TimeGigLogo from "./TimeGigLogo";
import { 
  Search, 
  Plus, 
  ShoppingBag, 
  Tag, 
  MapPin, 
  Filter, 
  ChevronLeft, 
  X, 
  Camera,
  ShieldCheck,
  BadgeCheck,
  Trash2,
  MessageSquare,
  MoreVertical,
  AlertTriangle
} from "lucide-react";

export interface MarketItem {
  id: number;
  title: string;
  price: string;
  location: string;
  category: string;
  images: string[];
  seller: string;
  description: string;
  isUserCreated?: boolean;
}

const INITIAL_MARKET_DATA: MarketItem[] = [];

const CATEGORIES = ["All", "Electronics", "Furniture", "Vehicles", "Clothing", "Sports", "Other"];

interface MarketViewProps {
  onInterested?: (seller: string) => void;
  onCreatingChange?: (isCreating: boolean) => void;
  deductCoins: (amount: number) => boolean;
  isVerified?: boolean;
  onPromote: () => void;
}

export default function MarketView({ onInterested, onCreatingChange, deductCoins, isVerified, onPromote }: MarketViewProps) {
  const [items, setItems] = useState<MarketItem[]>(INITIAL_MARKET_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleCreateModal = (val: boolean) => {
    setShowCreateModal(val);
    onCreatingChange?.(val);
  };
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [showItemMenu, setShowItemMenu] = useState(false);
  const [showReportItemModal, setShowReportItemModal] = useState(false);
  const [showBlockItemConfirm, setShowBlockItemConfirm] = useState(false);
  const [reportedItemIds, setReportedItemIds] = useState<number[]>([]);
  const [blockedMerchantNames, setBlockedMerchantNames] = useState<string[]>([]);
  const [reportReason, setReportReason] = useState('scam');
  const [reportDescription, setReportDescription] = useState('');
  const [marketToast, setMarketToast] = useState<string | null>(null);

  const triggerMarketToast = (msg: string) => {
    setMarketToast(msg);
    setTimeout(() => setMarketToast(null), 4000);
  };

  const handleReportItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      setReportedItemIds(prev => [...prev, selectedItem.id]);
    }
    setShowReportItemModal(false);
    triggerMarketToast(`🛡️ Reported successfully. We've archived this page and marked it for dynamic verification by safety operators.`);
  };

  const handleBlockMerchantSubmit = () => {
    if (selectedItem) {
      setBlockedMerchantNames(prev => [...prev, selectedItem.seller]);
    }
    setShowBlockItemConfirm(false);
    triggerMarketToast(`🚫 Provider blocked. Their listings have been hidden and communications muted.`);
  };

  // Create Item Form State
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newCategory, setNewCategory] = useState("Electronics");
  const [newDesc, setNewDesc] = useState("");
  const [newImages, setNewImages] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filteredItems = items.filter(item => {
    const isBlocked = blockedMerchantNames.includes(item.seller);
    if (isBlocked) return false;

    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newImageUrls = filesArray.map(file => URL.createObjectURL(file as Blob));
      setNewImages(prev => [...prev, ...newImageUrls].slice(0, 5));
    }
  };

  const handleRemoveNewImage = (idx: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!deductCoins(2)) return;

    const newItem: MarketItem = {
      id: Date.now(),
      title: newTitle,
      price: newPrice.startsWith("R") ? newPrice : `R${newPrice}`,
      location: newLocation,
      category: newCategory,
      images: newImages.length > 0 ? newImages : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop"],
      seller: "You",
      description: newDesc,
      isUserCreated: true
    };
    setItems([newItem, ...items]);
    toggleCreateModal(false);
    setShowSuccessModal(true);
    resetForm();
    
    // Auto show the item after a brief celebration
    setTimeout(() => {
      setSelectedItem(newItem);
      setShowSuccessModal(false);
    }, 2500);
  };

  const resetForm = () => {
    setNewTitle("");
    setNewPrice("");
    setNewLocation("");
    setNewCategory("Electronics");
    setNewDesc("");
    setNewImages([]);
  };

  const handleDeleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    setSelectedItem(null);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-24 text-left p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TimeGigLogo size="small" darkTheme={false} />
            <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full select-none">Market</span>
          </div>
          <p className="text-xs text-gray-400 font-medium mt-1">Buy and sell safely in your community</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1"
        >
          <Plus size={14} /> Sell Item
        </motion.button>
      </div>

      {/* 🌍 PROMOTIONAL COMMUNITY TEASER 🌍 */}
      <div 
        onClick={onPromote}
        className="bg-indigo-600 rounded-3xl p-5 shadow-lg shadow-indigo-100 flex items-center justify-between gap-4 cursor-pointer hover:bg-indigo-700 transition-all active:scale-[0.98] border border-indigo-500 group"
      >
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-white text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">Build Community</span>
          </div>
          <h3 className="text-base font-black text-white tracking-tight">Expand the Marketplace 📈</h3>
          <p className="text-[10px] text-indigo-100 font-medium leading-relaxed max-w-[200px]">
            Help neighbors find better deals. Earn <span className="text-amber-300 font-black">20 Coins</span> per connection.
          </p>
        </div>
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl group-hover:scale-110 transition-transform">
          <ShoppingBag size={24} />
        </div>
      </div>

      <div className="relative">
        <input 
          type="text" 
          placeholder="Search for items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white rounded-full pl-10 pr-4 py-2.5 border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm"
        />
        <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === cat 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredItems.map(item => (
          <motion.div
            key={item.id}
            layoutId={`item-${item.id}`}
            onClick={() => setSelectedItem(item)}
            className="cursor-pointer group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col"
          >
            <div className="aspect-square relative flex-shrink-0">
              <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {item.isUserCreated && (
                <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                  Your Item
                </div>
              )}
            </div>
            <div className="p-3 space-y-1">
              <p className="font-extrabold text-[#111827] text-sm">{item.price}</p>
              <h3 className="text-xs text-gray-600 font-medium line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                {item.title}
              </h3>
              <div className="flex items-center text-[10px] text-gray-400 font-semibold gap-0.5">
                <MapPin size={8} />
                <span>{item.location}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col max-h-[90vh] relative"
            >
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <button 
                  onClick={() => setShowItemMenu(!showItemMenu)}
                  className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-all"
                  title="Safety Settings"
                >
                  <MoreVertical size={20} />
                </button>
                <button 
                  onClick={() => {
                    setSelectedItem(null);
                    setActiveImageIndex(0);
                  }}
                  className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-all"
                >
                  <X size={20} />
                </button>

                <AnimatePresence>
                  {showItemMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute top-11 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl p-1.5 z-30 w-44 text-left font-sans text-slate-800"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowReportItemModal(true);
                          setShowItemMenu(false);
                        }}
                        className="flex items-center gap-2 text-red-650 hover:bg-red-50 font-extrabold text-[11px] w-full text-left px-3 py-2 rounded-xl transition"
                      >
                        Report Listing
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowBlockItemConfirm(true);
                          setShowItemMenu(false);
                        }}
                        className="flex items-center gap-2 text-gray-750 hover:bg-gray-50 font-bold text-[11px] w-full text-left px-3 py-2 rounded-xl transition"
                      >
                        Block Merchant
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    src={selectedItem.images[activeImageIndex]} 
                    className="w-full h-full object-cover" 
                    alt="" 
                  />
                </AnimatePresence>
                
                {selectedItem.images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                    {selectedItem.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${activeImageIndex === idx ? 'bg-white w-4' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-indigo-100">
                      {selectedItem.category}
                    </span>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
                      {selectedItem.title}
                    </h2>
                    <p className="text-lg font-black text-indigo-600">{selectedItem.price}</p>
                  </div>
                  {selectedItem.isUserCreated && (
                    <button 
                      onClick={() => {
                        if(confirm("Delete this listing?")) handleDeleteItem(selectedItem.id);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedItem.seller}`} className="w-10 h-10 rounded-full border-2 border-white bg-white" alt="" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Seller</p>
                    <p className="text-sm font-black text-gray-900">{selectedItem.seller}</p>
                  </div>
                  <div className="ml-auto">
                    {selectedItem.seller === "James W." ? (
                       <div className="flex items-center gap-1.5 text-green-600 text-[10px] font-bold bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                         <BadgeCheck size={12} fill="black" className="text-white" /> Verified
                       </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-600 text-[10px] font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 italic">
                         <ShieldCheck size={12} className="text-amber-500" /> Caution advised
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex gap-3 items-start">
                   <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0">
                      <X size={18} />
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-red-900 uppercase">Scam Alert Policy</p>
                      <p className="text-[10px] text-red-700 font-medium leading-tight">Always verify users with custom profile pictures. Avoid traders with generic avatars to minimize risk of being scammed.</p>
                   </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Description</h4>
                  <p className="text-sm text-gray-650 leading-relaxed font-medium">
                    {selectedItem.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2 text-xs text-gray-400 font-semibold">
                  <MapPin size={14} className="text-gray-300" />
                  <span>Located in {selectedItem.location}</span>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 flex gap-3 items-center">
                  <ShieldCheck className="text-indigo-600 shrink-0" size={24} />
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-indigo-900 uppercase">Secure Market Guarantee</p>
                    <p className="text-[10px] text-indigo-700 font-medium leading-tight">Payments are held in escrow until you confirm delivery of the item.</p>
                  </div>
                </div>

                {!selectedItem.isUserCreated && (
                  <div className="pt-2">
                    <button 
                      onClick={() => onInterested?.(selectedItem.seller)}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      <MessageSquare size={18} /> I'm Interested In This Item
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-xl flex items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="max-w-xs space-y-6"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <BadgeCheck size={48} fill="black" className="text-white animate-bounce" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Congratulations!</h2>
                <p className="text-sm text-gray-500 font-medium">Your item is now live and visible to all neighbors. Good luck with your sale!</p>
              </div>
              <div className="pt-4">
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ 
                        y: [0, -10, 0],
                        opacity: [1, 0.5, 1]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1, 
                        delay: i * 0.1 
                      }}
                      className="text-xl"
                    >
                      🎉
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900">List an Item</h2>
                  <p className="text-xs text-gray-400 font-medium">Earn extra cash by selling things</p>
                </div>
                <button onClick={() => toggleCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleCreateItem} className="p-6 space-y-5 overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Item Title</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="What are you selling?"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Price (R)</label>
                    <input 
                      type="text" 
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Location</label>
                    <input 
                      type="text" 
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Durban"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Category</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                  >
                    {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Tell buyers about your item's condition..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px]"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1 flex justify-between">
                    Product Photos
                    <span>{newImages.length} / 5</span>
                  </label>
                  
                  {newImages.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth">
                      {newImages.map((img, idx) => (
                        <div key={idx} className="relative shrink-0">
                          <img src={img} className="w-16 h-16 rounded-xl object-cover border border-gray-200" alt="" />
                          <button 
                            type="button"
                            onClick={() => handleRemoveNewImage(idx)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full shadow-lg"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-[32px] p-8 flex flex-col items-center justify-center gap-2 group hover:border-indigo-500 transition-all cursor-pointer bg-gray-50/30"
                  >
                    <div className="p-4 bg-white rounded-2xl text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                      <Camera size={32} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-gray-900">Upload from device</p>
                      <p className="text-[10px] font-bold text-gray-400">Select multiple photos</p>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all active:scale-95 mt-4"
                >
                  Create Listing
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items safety alerts */}
      <AnimatePresence>
        {marketToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-[200] bg-slate-900 text-white text-xs font-semibold p-4 rounded-2xl shadow-xl flex items-start gap-3 border border-slate-750"
          >
            <ShieldCheck className="text-green-400 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-extrabold tracking-tight">Security System Response</p>
              <p className="opacity-90 leading-relaxed mt-0.5">{marketToast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safety Report Modal Popup for items */}
      <AnimatePresence>
        {showReportItemModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 text-slate-800"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative text-left"
            >
              <button 
                type="button"
                onClick={() => setShowReportItemModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-650 animate-pulse"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-red-500" size={24} />
                <h3 className="text-lg font-black text-gray-900">Safety Complaint Form</h3>
              </div>

              <p className="text-gray-600 text-xs mb-4 leading-relaxed">
                We maintain active security controls to prevent scams, phishing, harassment, and explicit content. Please declare your complaint:
              </p>

              <form onSubmit={handleReportItemSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">Primary Reason</label>
                  <select 
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/10"
                  >
                    <option value="scam">Scam / Phishing / Fraud</option>
                    <option value="explicit">Explicit/Nude/Inappropriate behavior</option>
                    <option value="harassment">Abusive Content & Harassment</option>
                    <option value="underage">Underage User Activity</option>
                    <option value="off_platform">Requests payments off-platform</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">Context or Details</label>
                  <textarea
                    required
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Provide incident details (contracts outside app, suspcious listing)..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-gray-750 min-h-[80px]"
                  />
                </div>

                <div className="flex gap-2.5 justify-end pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowReportItemModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-150 text-xs font-bold text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md transition"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block Confirmation Modal for items */}
      <AnimatePresence>
        {showBlockItemConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 text-slate-800"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-base font-black text-gray-900 mb-2">Block Merchant?</h3>
              <p className="text-gray-600 text-xs mb-6 leading-relaxed">
                Are you sure you want to block this user? They will be muted, and their listings will no longer be visible to you.
              </p>
              <div className="flex gap-2.5 justify-center">
                <button 
                  type="button"
                  onClick={() => setShowBlockItemConfirm(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold text-gray-500 hover:bg-gray-50 transition w-28"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleBlockMerchantSubmit}
                  className="px-4 py-2.5 rounded-xl bg-red-650 hover:bg-red-700 text-white text-xs font-extrabold shadow-md transition w-28"
                >
                  Yes, Block
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
