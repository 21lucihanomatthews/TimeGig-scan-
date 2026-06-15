import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ShoppingBag, MapPin, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface MeetingArrivalViewProps {
  isOpen: boolean;
  onClose: () => void;
  buyer: { name: string; avatar: string };
  seller: { name: string; avatar: string };
  locationName: string;
}

const MeetingArrivalView: React.FC<MeetingArrivalViewProps> = ({ 
  isOpen, 
  onClose, 
  buyer, 
  seller,
  locationName 
}) => {
  const [distance, setDistance] = useState(100); // 100% to 0%
  const [isFaceToFace, setIsFaceToFace] = useState(false);
  const [safetyStep, setSafetyStep] = useState<'monitoring' | 'emergency' | 'success'>('monitoring');

  // Play arrival sound
  const playArrivalSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // A4

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio failed", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setDistance(100);
      setIsFaceToFace(false);
      setSafetyStep('monitoring');
      
      const timer = setInterval(() => {
        setDistance(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            setIsFaceToFace(true);
            playArrivalSound();
            return 0;
          }
          return prev - 1.5;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const nearestPolice = {
    name: "Sandton SAPS",
    address: "2 Summit Rd, Morningside, Sandton",
    phone: "011 722 4200",
    emergency: "10111"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] transition-colors duration-1000 ${
              safetyStep === 'emergency' ? 'bg-red-600/30' : safetyStep === 'success' ? 'bg-green-600/30' : 'bg-blue-600/20'
            }`} />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
          </div>

          <div className="relative z-10 w-full max-w-lg space-y-12">
            {/* Header Section */}
            <div className="space-y-4">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`inline-flex items-center gap-2 px-4 py-2 border rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${
                  safetyStep === 'emergency' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                  safetyStep === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                  'bg-blue-500/10 border-blue-500/20 text-blue-400'
                }`}
              >
                {safetyStep === 'emergency' && <ShieldCheck size={14} className="text-red-400" />}
                {safetyStep === 'success' && <CheckCircle2 size={14} className="text-green-400" />}
                {safetyStep === 'monitoring' && <MapPin size={14} />}
                {safetyStep === 'monitoring' ? (isFaceToFace ? 'Face-to-Face Established' : 'Live Distance Tracking') : 
                 safetyStep === 'emergency' ? 'Emergency Protocol Active' : 'Meeting Verified'}
              </motion.div>
              
              <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
                {safetyStep === 'emergency' ? "Emergency Contact" : 
                 safetyStep === 'success' ? "Stay Safe, Neighbor!" :
                 isFaceToFace ? "Handover Active" : "Meeting in Progress"}
              </h2>
            </div>

            {/* Main Stage (Face-to-Face Interactive Area) */}
            <div className="relative h-48 flex items-center justify-between px-10">
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/5 -translate-y-1/2" />
              <motion.div 
                className={`absolute top-1/2 -translate-y-1/2 h-[2px] transition-colors duration-500 ${
                  safetyStep === 'emergency' ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' :
                  safetyStep === 'success' ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]' :
                  'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                }`}
                style={{ 
                  left: `${(100 - distance) / 2}%`, 
                  right: `${(100 - distance) / 2}%` 
                }}
              />

              {/* LEFT: Buyer */}
              <motion.div 
                animate={{ 
                  x: isFaceToFace ? 50 : `${(100 - distance) / 2.2}%`,
                  scale: isFaceToFace ? 1.2 : 1
                }}
                className="relative z-20 flex flex-col items-center gap-4 transition-all"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-white shadow-2xl relative z-10">
                    <img src={buyer.avatar} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 bg-indigo-600 text-white p-2 rounded-xl border-2 border-slate-950 shadow-lg z-20">
                    <ShoppingBag size={16} />
                  </div>
                </div>
                {!isFaceToFace && <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Buyer</p>}
              </motion.div>

              {/* RIGHT: Seller */}
              <motion.div 
                animate={{ 
                  x: isFaceToFace ? -50 : `-${(100 - distance) / 2.2}%`,
                  scale: isFaceToFace ? 1.2 : 1
                }}
                className="relative z-20 flex flex-col items-center gap-4 transition-all"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-white shadow-2xl relative z-10">
                    <img src={seller.avatar} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-600 text-white p-2 rounded-xl border-2 border-slate-950 shadow-lg z-20">
                    <User size={16} />
                  </div>
                </div>
                {!isFaceToFace && <p className="text-[9px] font-black text-green-400 uppercase tracking-widest">Seller</p>}
              </motion.div>
            </div>

            {/* Interaction States */}
            <div className="min-h-[160px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {isFaceToFace && safetyStep === 'monitoring' && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="space-y-6"
                    key="monitoring"
                  >
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <p className="text-gray-400 text-xs font-medium leading-relaxed">
                        Neighbors are now face-to-face. Proceed with the exchange. Keep this safety screen active until complete.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setSafetyStep('emergency')}
                        className="flex-1 py-4 bg-red-500/10 border border-red-500/30 text-red-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
                      >
                        Help / Report Scam
                      </button>
                      <button 
                        onClick={() => setSafetyStep('success')}
                        className="flex-1 py-4 bg-green-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-green-700 shadow-xl shadow-green-900/20 transition-all active:scale-95"
                      >
                        Safe & Completed
                      </button>
                    </div>
                  </motion.div>
                )}

                {safetyStep === 'emergency' && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-red-500/5 border border-red-500/20 p-6 rounded-[2rem] space-y-4"
                    key="emergency"
                  >
                    <div className="flex flex-col items-center gap-2">
                       <h4 className="text-red-400 font-black text-xs uppercase tracking-widest">Nearest Police Station</h4>
                       <p className="text-white text-lg font-black">{nearestPolice.name}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                       <p className="text-gray-400">{nearestPolice.address}</p>
                       <p className="text-red-400 font-bold">Inland Emergency: {nearestPolice.emergency}</p>
                       <p className="text-white font-bold">Contact: {nearestPolice.phone}</p>
                    </div>
                    <button 
                      onClick={() => setSafetyStep('monitoring')}
                      className="w-full py-3 bg-white/5 text-gray-400 font-bold text-[10px] uppercase tracking-widest rounded-xl mt-4"
                    >
                      Return to Safety Monitor
                    </button>
                  </motion.div>
                )}

                {safetyStep === 'success' && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-6"
                    key="success"
                  >
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-900/40">
                          <CheckCircle2 size={32} />
                       </div>
                       <div className="space-y-2">
                          <p className="text-white text-xl font-black">Congratulations!</p>
                          <p className="text-gray-400 text-sm font-medium">You've completed a secure neighbor-to-neighbor gig. Thank you for keeping the community safe.</p>
                       </div>
                    </div>
                    <button 
                      onClick={onClose}
                      className="w-full py-4 bg-white text-slate-950 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-gray-100 transition-all active:scale-95 shadow-2xl"
                    >
                      Exit Secure Session
                    </button>
                  </motion.div>
                )}

                {!isFaceToFace && (
                   <motion.div exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
                      <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                           className="h-full bg-blue-500" 
                           animate={{ width: `${100 - distance}%` }}
                         />
                      </div>
                      <p className="text-blue-400/60 font-black text-[9px] uppercase tracking-[0.2em] animate-pulse">
                        Synchronizing Encrypted Locations...
                      </p>
                   </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MeetingArrivalView;
