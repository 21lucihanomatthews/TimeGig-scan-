import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  X, 
  Search, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  BadgeCheck, 
  ChevronRight,
  Star,
  MapPin,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Seeker } from './SeekersView';
import { generateProvinceTopSeekers } from '../utils/provinceSeekersGenerator';

interface Top20SeekersBoardProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (name: string, text: string, avatar: string) => void;
  deductCoins: (amount: number) => boolean;
  coinBalance: number;
  allSeekers: Seeker[];
}

const provincesList = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape'
];

export default function Top20SeekersBoard({ 
  isOpen, 
  onClose, 
  onStartChat, 
  deductCoins,
  coinBalance,
  allSeekers
}: Top20SeekersBoardProps) {
  const [selectedProvince, setSelectedProvince] = useState<string>('Gauteng');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Hiring States
  const [hiringSeeker, setHiringSeeker] = useState<Seeker | null>(null);
  const [hiringMode, setHiringMode] = useState<'none' | 'options' | 'processing' | 'success'>('none');
  const [hiringType, setHiringType] = useState<'casual' | 'permanent'>('casual');

  if (!isOpen) return null;

  // Retrieve top 20 candidates with > 10 likes and by province
  const seekers = allSeekers
    .filter(s => (s.likes || 0) > 10 && s.province === selectedProvince)
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 20);

  // Filter list based on search input
  const filteredSeekers = seekers.filter(seeker => 
    seeker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seeker.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seeker.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seeker.skillsNeeded.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleInitiateHire = (seeker: Seeker) => {
    setHiringSeeker(seeker);
    setHiringMode('options');
  };

  const handleExecuteHire = () => {
    if (!hiringSeeker) return;
    
    // Attempt deduction of 50 coins
    const wasDeducted = deductCoins(50);
    if (!wasDeducted) return;

    setHiringMode('processing');
    
    setTimeout(() => {
      setHiringMode('success');
    }, 1800);
  };

  const handleLaunchPriorityChat = () => {
    if (!hiringSeeker) return;
    
    const msg = `🎉 EXTRAORDINARY DIRECT MATCH!
Focus Position: ${hiringType === 'permanent' ? 'Permanent Position' : 'Casual Task/Job Arrangement'}
Sealed Status: Verified Escrow Match Confirmed (50 coins)
Hi ${hiringSeeker.name}! I have reviewed your expert profile on the Top 20 Candidates list for ${selectedProvince} and have successfully hired your service. Looking forward to discussing schedule, rates, and starting out!`;
    
    onStartChat(hiringSeeker.name, msg, hiringSeeker.avatar);
    
    // Clear states and close boards
    setHiringSeeker(null);
    setHiringMode('none');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-white flex flex-col justify-between max-w-md mx-auto overflow-hidden text-gray-900 transition-opacity duration-300">
      {/* Header Sticky Box */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 shrink-0 z-10 select-none">
        <div className="flex items-center gap-2">
          <Crown size={22} className="text-amber-500" />
          <div className="text-left">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-1">
              Top 20 Candidates
            </h2>
            <p className="text-[9px] text-gray-500 font-semibold leading-none mt-0.5">Highly rated and liked by clients per province</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-500 rounded-full p-2 border border-gray-200 transition-all"
          title="Close board"
        >
          <X size={16} />
        </button>
      </div>

      {/* Inner Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide select-none">
        
        {/* Province Scroll Selection Tabs */}
        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select South African Province</label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {provincesList.map(prov => (
              <button
                key={prov}
                onClick={() => {
                  setSelectedProvince(prov);
                  setSearchTerm('');
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                  selectedProvince === prov 
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {prov}
              </button>
            ))}
          </div>
        </div>

        {/* Inner Search Filter specifically for Top 20 Candidates */}
        <div className="relative">
          <input
            type="text"
            placeholder={`Filter 20 top-tier ${selectedProvince} experts...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-full pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-xs text-gray-900 placeholder:text-gray-400 font-medium font-sans text-left"
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={14} />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-900"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dynamic Coin Wallet display info bar */}
        <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 flex items-center justify-between text-left">
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider font-bold text-blue-600">TimeGiG Priority Escrow Escort</span>
            <p className="text-[10px] text-gray-600 leading-tight">Instant hire guarantees calendar reservations and priority support lock.</p>
          </div>
          <div className="bg-white px-2.5 py-1 rounded-xl text-amber-600 font-mono text-xs font-bold border border-amber-200 shadow-sm">
            🪙 {coinBalance}
          </div>
        </div>

        {/* Candidates Feed */}
        <div className="space-y-3">
          {filteredSeekers.length === 0 ? (
            <div className="text-center py-12 text-gray-900 bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-6">
              <p className="font-extrabold text-lg">No expert matches found</p>
              <p className="text-xs text-gray-500 mt-2">Try another search filter query!</p>
            </div>
          ) : (
            filteredSeekers.map((seeker, index) => {
              const actualRank = index + 1;
              return (
                <div
                  key={seeker.id}
                  className="p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm transition-colors hover:bg-gray-50 space-y-3"
                >
                  {/* Seeker Profile Info Header */}
                  <div className="flex items-start justify-between gap-3 text-left">
                    <div className="flex items-center gap-3">
                      {/* Rank Indicator and avatar wrapper */}
                      <div className="relative shrink-0">
                        <img
                          src={seeker.avatar}
                          className="w-12 h-12 rounded-full border border-gray-100 object-cover bg-gray-50"
                          alt={seeker.name}
                        />
                        <div className={`absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-md border ${
                          actualRank === 1 ? 'bg-amber-400 text-amber-950 border-amber-300' :
                          actualRank === 2 ? 'bg-slate-300 text-slate-900 border-slate-200' :
                          actualRank === 3 ? 'bg-orange-800 text-orange-50 border-orange-700' :
                          'bg-gray-100 text-gray-500 border-gray-200 shadow-sm'
                        }`}>
                          {actualRank}
                        </div>
                      </div>
                      
                      <div className="text-left font-sans">
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-sm tracking-tight text-gray-900">{seeker.name}</span>
                          <BadgeCheck size={13} fill="#3b82f6" className="text-white shrink-0" />
                        </div>
                        <p className="text-[10px] text-gray-500 leading-normal line-clamp-1">{seeker.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] bg-blue-50 px-1.5 py-0.5 rounded font-black text-blue-600 tracking-tight uppercase border border-blue-100">
                            {seeker.category}
                          </span>
                          <span className="text-[9px] font-bold text-gray-400 flex items-center gap-0.5">
                            ⭐ 5.0 ({seeker.likes} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-amber-600 font-mono tracking-tight">{seeker.budget}</span>
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wide mt-1">Provider Rate</p>
                    </div>
                  </div>

                  {/* Candidate Bio statement */}
                  <div className="p-3 rounded-xl bg-gray-50 text-[11px] text-gray-600 leading-relaxed text-left border border-gray-100">
                    {seeker.description}
                    
                    {/* Location Badge */}
                    <div className="flex items-center gap-1.5 text-gray-500 mt-2 font-semibold">
                      <MapPin size={10} className="text-amber-500 shrink-0" />
                      <span className="text-[9px] truncate">{seeker.location}</span>
                    </div>

                    {/* Skills list */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {seeker.skillsNeeded.map(skill => (
                        <span key={skill} className="text-[9px] bg-white text-gray-600 border border-gray-200 rounded px-1.5 py-0.5 font-bold font-sans shadow-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Double direct action buttons to start matching & Instant Hire */}
                  <div className="grid grid-cols-2 gap-2 pt-1 select-none font-sans">
                    <button
                      type="button"
                      onClick={() => {
                        onStartChat(seeker.name, `Hello ${seeker.name}! I detected your outstanding expert profile inside the Top 20 Candidates Board for ${selectedProvince} and want to align on calendars for a booking. Let's connect!`, seeker.avatar);
                        onClose();
                      }}
                      className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 py-2 rounded-xl text-[11px] font-extrabold transition-all active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                    >
                      <MessageSquare size={12} className="text-blue-600" />
                      <span>Inquire & Chat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleInitiateHire(seeker);
                      }}
                      className="bg-gray-900 hover:bg-black text-white py-2 rounded-xl text-[11px] font-black transition-all active:scale-95 flex items-center justify-center gap-1 shadow-md"
                    >
                      <Sparkles size={12} className="text-amber-400" />
                      <span>Instant Hire</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom info footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 text-center text-[10px] text-gray-400 leading-none sticky bottom-0 shrink-0 select-none font-sans">
        💡 Top 20 Candidates are rated and liked by our client community
      </div>

      {/* 💼 Interactive Dual-Path Candidate Hiring Escrow Modal */}
      <AnimatePresence>
        {hiringSeeker && hiringMode !== 'none' && (
          <div className="fixed inset-0 z-[130] bg-black/85 flex items-center justify-center p-4 text-slate-800">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative text-left"
            >
              {/* Option Mode Selection */}
              {hiringMode === 'options' && (
                <div className="space-y-4 font-sans">
                  <div className="text-center pb-2 border-b border-gray-100 flex flex-col items-center">
                    <img
                      src={hiringSeeker.avatar}
                      className="w-16 h-16 rounded-full border mb-2 bg-slate-50 object-cover"
                      alt={hiringSeeker.name}
                    />
                    <h3 className="font-extrabold text-[#111827] text-sm">Secure Escrow Contract Setup</h3>
                    <p className="text-xs text-gray-500 font-medium font-sans">Configuring priority match for {hiringSeeker.name}</p>
                  </div>

                  <div className="space-y-3 text-left">
                    <label className="text-[10px] uppercase font-mono font-black tracking-wider text-gray-400">Select Agreement Track</label>
                    
                    {/* Position 1: Casual position */}
                    <div
                      onClick={() => setHiringType('casual')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        hiringType === 'casual'
                          ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                          : 'border-gray-250 hover:border-gray-300 bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BadgeCheck size={16} fill="black" className={hiringType === 'casual' ? 'text-white' : 'text-gray-300'} />
                        <span className="font-black text-xs text-[#111827]">Casual / Gig Engagement</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 pl-6 leading-relaxed">
                        Excellent for immediate hourly repairs, garden maintenance, or short tutoring runs.
                      </p>
                    </div>

                    {/* Position 2: Permanent / Full-time position */}
                    <div
                      onClick={() => setHiringType('permanent')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        hiringType === 'permanent'
                          ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                          : 'border-gray-250 hover:border-gray-300 bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BadgeCheck size={16} fill="black" className={hiringType === 'permanent' ? 'text-white' : 'text-gray-300'} />
                        <span className="font-black text-xs text-[#111827]">Permanent / Full Agreement</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 pl-6 leading-relaxed">
                        Best for formal long-term recurring services, legal security, and scheduled trial contracts.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-[10px] text-slate-500 border border-slate-100 font-semibold leading-relaxed">
                    <span>Priority Escrow Reserved Match Fee:</span>
                    <span className="font-bold text-blue-600">🪙 50 Coins</span>
                  </div>

                  <div className="flex gap-2.5 pt-2 select-none">
                    <button
                      type="button"
                      onClick={() => {
                        setHiringSeeker(null);
                        setHiringMode('none');
                      }}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all text-gray-500 font-extrabold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteHire}
                      className="flex-1 py-3 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1"
                    >
                      <ShieldCheck size={14} />
                      <span>Execute Secure Hire</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Secure verification Loader */}
              {hiringMode === 'processing' && (
                <div className="py-8 text-center space-y-4 font-sans flex flex-col items-center">
                  <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-black text-[#111827] text-sm uppercase tracking-wide">Processing Secure Escrow</h3>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">Deducting TimeGiG coins, establishing priority seals & registering agreements on localized ledger...</p>
                  </div>
                </div>
              )}

              {/* Hired Successfully screen details */}
              {hiringMode === 'success' && (
                <div className="space-y-4 font-sans text-center flex flex-col items-center">
                  <div className="text-center py-4 space-y-3">
                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto border-2 border-green-200 scale-105 transition-all duration-300">
                      <BadgeCheck size={36} fill="black" className="text-white" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-green-600 uppercase tracking-widest">Hired Successfully!</h4>
                      <p className="text-xs text-[#374151] font-semibold leading-relaxed">
                        Priority Match escrow has been formally deposited on TimeGiG system.
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 leading-relaxed text-center bg-gray-50 p-3 rounded-xl border border-gray-150 italic font-medium">
                    "We have compiled the customized positions contract, locked 50 coins safely, and authorized priority contact channels with '{hiringSeeker.name}'."
                  </p>

                  <button
                    type="button"
                    onClick={handleLaunchPriorityChat}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={13} />
                    <span>Launch Priority Chat</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
