import React, { useState } from 'react';
import { ArrowLeft, Star, MapPin, User, MoreVertical, ShieldAlert, BadgeCheck, Shield, X, AlertTriangle, ShieldCheck, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { compressImage } from '../utils/imageUtils';

interface ProfileViewProps {
  onBack: () => void;
  userName: string;
  avatarUrl: string;
  isVerified?: boolean;
  coverPhoto?: string | null;
  onUpdateCover?: (url: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ 
  onBack, 
  userName, 
  avatarUrl, 
  isVerified,
  coverPhoto,
  onUpdateCover
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [reported, setReported] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [reportReason, setReportReason] = useState('scam');
  const [reportDescription, setReportDescription] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setShowSuccessToast(msg);
    setTimeout(() => {
      setShowSuccessToast(null);
    }, 4000);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReported(true);
    setShowReportModal(false);
    triggerToast(`🛡️ Thank you. Your report against ${userName} has been logged for review. We will investigate to keep this community clean!`);
  };

  const handleBlockUser = () => {
    setBlocked(true);
    setShowBlockConfirm(false);
    triggerToast(`🚫 ${userName} has been successfully blocked. They will no longer be able to message or view your listings.`);
  };

  const handleShareProfile = () => {
    const shareText = `Check out ${userName}'s profile on TimeGIG! Verified and ready to assist.`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: `${userName}'s Profile`,
        text: shareText,
        url: shareUrl,
      }).then(() => {
        triggerToast("Profile link shared successfully!");
      }).catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
      window.open(whatsappUrl, '_blank');
      triggerToast("Directing to WhatsApp for profile sharing...");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Dynamic Action Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-4 left-4 right-4 z-[200] bg-slate-900 text-white text-xs font-medium p-4 rounded-2xl shadow-xl flex items-start gap-3 border border-slate-750"
          >
            <ShieldCheck className="text-green-400 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-extrabold tracking-tight">Security System Notice</p>
              <p className="opacity-90 leading-relaxed mt-0.5">{showSuccessToast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800 transition">
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-bold text-lg">Profile</h2>
        </div>
        <div className="relative">
          <button 
            type="button"
            onClick={() => setShowMenu(!showMenu)} 
            className="p-2 -mr-2 text-gray-550 hover:bg-gray-100 rounded-full transition active:scale-95"
          >
            <MoreVertical size={24} />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-10 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl p-1.5 z-20 w-44"
              >
                <button 
                  onClick={() => {
                    setShowReportModal(true);
                    setShowMenu(false);
                  }} 
                  className="flex items-center gap-2.5 text-red-600 hover:bg-red-50 font-extrabold text-xs w-full text-left px-3 py-2.5 rounded-xl transition"
                >
                  <ShieldAlert size={14} className="shrink-0" />
                  Report Account
                </button>
                <button 
                  onClick={() => {
                    setShowBlockConfirm(true);
                    setShowMenu(false);
                  }} 
                  className="flex items-center gap-2.5 text-gray-650 hover:bg-gray-50 font-bold text-xs w-full text-left px-3 py-2.5 rounded-xl transition"
                >
                  <Shield size={14} className="shrink-0" />
                  {blocked ? 'Blocked' : 'Block User'}
                </button>
                <div className="h-[1px] bg-gray-50 my-1 mx-2" />
                <button 
                  onClick={() => {
                    handleShareProfile();
                    setShowMenu(false);
                  }} 
                  className="flex items-center gap-2.5 text-indigo-600 hover:bg-indigo-50 font-extrabold text-xs w-full text-left px-3 py-2.5 rounded-xl transition"
                >
                  <Share2 size={14} className="shrink-0" />
                  Share Profile
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
      
      {/* Cover / Wallpaper Section */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden group">
        {coverPhoto ? (
          <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center">
             <div className="w-16 h-16 rounded-full bg-white/50 backdrop-blur shadow-sm flex items-center justify-center text-blue-300">
               <Share2 size={24} className="opacity-40" />
             </div>
          </div>
        )}
        
        {onUpdateCover && (
          <label className="absolute bottom-4 right-4 p-2.5 bg-white/90 backdrop-blur text-blue-600 rounded-2xl shadow-lg cursor-pointer hover:bg-white active:scale-95 transition-all flex items-center gap-2 border border-white/40">
            <Share2 size={16} />
            <span className="text-[10px] font-black uppercase tracking-wider">Update Wallpaper</span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const compressed = await compressImage(file, 1200, 800, 0.7);
                    onUpdateCover(compressed);
                    triggerToast("Profile wallpaper updated!");
                  } catch (err) {
                    console.error(err);
                  }
                }
              }}
            />
          </label>
        )}
      </div>

      <div className={`-mt-16 px-6 flex flex-col items-center flex-1 overflow-y-auto ${blocked ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="relative mb-4">
          <img 
            src={avatarUrl} 
            alt={userName} 
            className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover bg-white"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName) + '&background=random'; }}
          />
          {isVerified && (
            <div className="absolute bottom-1 right-1 bg-white rounded-full shadow-lg">
              <BadgeCheck size={32} fill="black" className="text-white" />
            </div>
          )}
        </div>
        <h1 className="text-2xl font-black mb-1 flex items-center gap-2">
          {userName}
          {reported && <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold border border-amber-100">Profile Reported</span>}
        </h1>
        <p className="text-gray-500 mb-4 flex items-center gap-1">
          <MapPin size={16} /> San Francisco, CA
        </p>

        {blocked && (
          <div className="bg-red-50 text-red-700 p-3 rounded-2xl text-xs font-black w-full mb-6 text-center border border-red-100">
            ⚠️ You have blocked this user.
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg w-full mb-6">
          <h3 className="font-semibold mb-2">About</h3>
          <p className="text-gray-600 text-sm">Passionate community provider focusing on safe, verified, and premium interactions. Happy to assist neighbors!</p>
        </div>

        <div className="flex justify-between w-full text-center">
          <div className="bg-gray-50 p-3 rounded-xl w-[48%] border border-gray-100">
            <div className="font-bold text-gray-900 text-lg">4.9/5</div>
            <div className="text-xs text-gray-500">Rating</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl w-[48%] border border-gray-100">
            <div className="font-bold text-gray-900 text-lg">120</div>
            <div className="text-xs text-gray-500">Gigs completed</div>
          </div>
        </div>
      </div>

      {/* Safety Report Modal Popup */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setShowReportModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
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

              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">Primary Reason</label>
                  <select 
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/10"
                  >
                    <option value="scam">Scam / Phishing Intent</option>
                    <option value="explicit">Explicit / Nudity / Impoliteness</option>
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
                    placeholder="Provide incident details (e.g., suspicious link, inappropriate vocabulary, external requests)..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-gray-700 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-red-500/10"
                  />
                </div>

                <div className="flex gap-2.5 justify-end pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold text-gray-500 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-red-650 hover:bg-red-700 text-white text-xs font-extrabold shadow-md shadow-red-500/10 transition"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block Confirmation Modal */}
      <AnimatePresence>
        {showBlockConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
                <Shield size={24} />
              </div>
              <h3 className="text-base font-black text-gray-900 mb-2">Block {userName}?</h3>
              <p className="text-gray-600 text-xs mb-6 leading-relaxed">
                They will be muted, blocked from viewing your listings, and disabled from sending messages. You can unblock them at any time.
              </p>
              <div className="flex gap-2.5 justify-center">
                <button 
                  type="button"
                  onClick={() => setShowBlockConfirm(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold text-gray-500 hover:bg-gray-50 transition w-28"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleBlockUser}
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
};

export default ProfileView;
