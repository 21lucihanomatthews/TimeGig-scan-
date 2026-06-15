import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, 
  Gift, 
  Users, 
  ShieldCheck, 
  ArrowLeft, 
  Copy, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Heart,
  Globe
} from 'lucide-react';

interface PromoteAppViewProps {
  onBack: () => void;
  onShowToast: (message: string, type: "success" | "info" | "error") => void;
}

export default function PromoteAppView({ onBack, onShowToast }: PromoteAppViewProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = "https://timegig.app/join?ref=MEM2024";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      onShowToast("Referral link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join TimeGiG',
          text: 'Find top experts and secure local gigs in South Africa. Join me on TimeGiG!',
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      handleCopy();
    }
  };

  const reasons = [
    {
      icon: <Users className="text-blue-600" size={24} />,
      title: "Stronger Community",
      desc: "More users mean more opportunities and a faster-growing local marketplace for everyone.",
      color: "bg-blue-50"
    },
    {
      icon: <Gift className="text-amber-600" size={24} />,
      title: "Mutual Rewards",
      desc: "You get 20 Coins and your friend gets 50 Coins. It's a win-win for both sides.",
      color: "bg-amber-50"
    },
    {
      icon: <ShieldCheck className="text-green-600" size={24} />,
      title: "Trusted Network",
      desc: "Help build a verified, secure environment by inviting people you trust to join the workspace.",
      color: "bg-green-50"
    },
    {
      icon: <Heart className="text-red-600" size={24} />,
      title: "Help Your Circle",
      desc: "Assist friends in finding flexible work or the right experts to get their tasks done efficiently.",
      color: "bg-red-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-20 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Promote TimeGiG</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-0.5">Grow your community</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
          <TrendingUp size={20} />
        </div>
      </div>

      <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-xs mx-auto">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl rotate-12 flex items-center justify-center shadow-xl shadow-blue-200">
               <Globe className="text-white -rotate-12" size={40} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white p-2 rounded-full border-4 border-gray-50 shadow-lg">
               <Gift size={20} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">Help Us Build the Future of Work</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            TimeGiG thrives on local trust. When you invite your network, you're not just earning coins—you're building a more reliable community.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-1">Why Promote?</h3>
          <div className="grid gap-4">
            {reasons.map((reason, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex gap-4 items-start group hover:border-blue-200 transition-all"
              >
                <div className={`w-12 h-12 ${reason.color} rounded-2xl flex items-center justify-center shrink-0`}>
                  {reason.icon}
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 mb-1">{reason.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{reason.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div className="relative z-10 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black tracking-tight">Your Referral Link</h3>
              <p className="text-gray-400 text-xs font-medium">Friends get 50 coins on signup!</p>
            </div>

            <div className="bg-white/10 border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-4">
              <code className="text-xs font-mono text-blue-300 truncate">{shareUrl}</code>
              <button 
                onClick={handleCopy}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all active:scale-90"
              >
                {copied ? <CheckCircle2 size={18} className="text-green-400" /> : <Copy size={18} />}
              </button>
            </div>

            <button 
              onClick={handleNativeShare}
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98]"
            >
              <Share2 size={20} />
              <span>Share Link Now</span>
            </button>
          </div>
        </div>

        {/* Stats Teaser */}
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none mb-1">Impact</p>
              <p className="text-xs font-black text-gray-900">Your network size: 0 friends</p>
            </div>
          </div>
          <motion.div 
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronRight className="text-blue-300" size={24} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
