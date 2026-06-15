import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Wallet, 
  Briefcase, 
  Users, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Award,
  Zap
} from "lucide-react";

interface FeatureExplainerProps {
  onStartChat: (name: string, text: string, avatar: string) => void;
  isVerified: boolean;
}

interface FeatureItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  subtitle: string;
  description: string;
  bullets: string[];
  color: string;
}

export default function FeatureExplainer({ onStartChat, isVerified }: FeatureExplainerProps) {
  const [isPerfectVisible, setIsPerfectVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem('isPerfectVisible_v1');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const handleHide = () => {
    setIsPerfectVisible(false);
    localStorage.setItem('isPerfectVisible_v1', 'false');
  };

  const handleUnhide = () => {
    setIsPerfectVisible(true);
    localStorage.setItem('isPerfectVisible_v1', 'true');
  };

  const features: FeatureItem[] = [
    {
      id: "gigs",
      title: "Gigs Market",
      icon: <Briefcase className="text-blue-500" size={20} />,
      subtitle: "Casual Gigs & Permanent Vacancies",
      description: "TimeGiG bridges the gap between quick micro-tasks and stable employment. Post or apply for local neighborhood gigs in seconds.",
      bullets: [
        "Simple Casual Jobs: One-time gigs like lawn care, dog walking, event assistance, or flyer distribution.",
        "Permanent positions: Continuous local roles, stable retail support, regular tutoring, or recurrent building maintenance.",
        "Secure document exchange: Securely attach and share CVs and qualification documents with employers."
      ],
      color: "border-blue-500/20 bg-blue-50/50"
    },
    {
      id: "seekers",
      title: "Local Seekers",
      icon: <Users className="text-emerald-500" size={20} />,
      subtitle: "Showcase Your Craft & Get Hired",
      description: "Highlight your physical or digital skills nearby. Turn on your online toggle to show you are ready for instant job requests.",
      bullets: [
        "Interactive profiles: Set your hourly price range, upload project pictures, and select your South African province.",
        "Direct Hire inquiries: Let neighbors message you instantly to kick off an active work assignment.",
        "Smart service categories: Organized neatly under Labor, Creative, Education, and Care headings."
      ],
      color: "border-emerald-500/20 bg-emerald-50/50"
    },
    {
      id: "wallet",
      title: "Secure C-Wallet",
      icon: <Wallet className="text-purple-500" size={20} />,
      subtitle: "Escrow Protections & Instant Pay",
      description: "No more payment anxiety. Securely hold, escrow, and transfer task rewards with ultimate convenience in our digital ledger.",
      bullets: [
        "Safe Balance holding: View exact balances and top up securely with simple demonstration tools.",
        "Verified gig deposits: Funds are protected until tasks are fully signed off by original hirers.",
        "Instant neighborhood transfers: Zero transaction fees to transmit funds straight to other users' wallet addresses."
      ],
      color: "border-purple-500/20 bg-purple-50/50"
    },
    {
      id: "verification",
      title: "Identity & Trust Verification",
      icon: <ShieldCheck className="text-indigo-500" size={20} />,
      subtitle: "Real Profile Credence Scores",
      description: "Safety is our priority. Neighbors build standard mutual confidence by completing identity verification steps.",
      bullets: [
        "Government ID checks: Upload South African ID documents or drivers licenses for validation.",
        "Verified credential checks: Verified profiles get a highly striking blue shield badge across the app's views.",
        "Increased reach: Verified candidates receive twice as many hire invitations and immediate applicant approvals."
      ],
      color: "border-indigo-500/20 bg-indigo-50/50"
    }
  ];

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!isPerfectVisible ? (
          <motion.div 
            key="hidden-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-200 rounded-3xl p-4 flex items-center justify-between shadow-xs transition-all select-none"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                <Info size={18} className="shrink-0" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black text-slate-900 leading-tight">
                  Perfect for Casual Gigs & Permanent Career Paths
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Guidance hidden by user
                </p>
              </div>
            </div>
            <button
              onClick={handleUnhide}
              className="text-xs font-black text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-105-active px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              Unhide
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="visible-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white border border-slate-150 rounded-3xl p-5 shadow-sm space-y-4 text-left"
          >
            {/* Header section with toggle */}
            <div className="flex items-start justify-between gap-3 text-left">
              <div className="flex items-start gap-3 flex-1 text-left">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                  <Info size={22} />
                </div>
                <div className="space-y-1 text-left">
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Perfect for Casual Gigs & Permanent Career Paths
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold pr-4">
                    TimeGiG fits your absolute schedule and ambition level perfectly! Whether you want to pick up quick local soccer coaching hours, complete a simple flyer delivery gig, or land a permanent professional web development framework contract, TimeGiG secures your safety and pay.
                  </p>
                </div>
              </div>
              <button
                onClick={handleHide}
                className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl shrink-0 cursor-pointer"
                title="Hide this feature"
              >
                Hide
              </button>
            </div>

            {/* Dynamic Category Slices */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100 text-left">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-2xl border border-blue-100/30">
                <div className="flex items-center gap-1.5 text-blue-700 font-extrabold text-[11px] uppercase tracking-wider">
                  <Zap size={12} />
                  Simple Casual Jobs
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal font-semibold">
                  Quick tasks, immediate hours, pocket money rewards, or short-term pet care. Start working same-day!
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-50 to-green-50/30 rounded-2xl border border-emerald-100/30">
                <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[11px] uppercase tracking-wider">
                  <Award size={12} />
                  Permanent Positions
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal font-semibold">
                  Continuous contracts, fixed recurring positions, regular academy tutoring, and corporate local hires.
                </p>
              </div>
            </div>

            {/* Interactive Feature Accordion List */}
            <div className="space-y-2 pt-2 text-left">
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">
                Tap on any feature to explore how it works:
              </p>
              {features.map((feat) => {
                const isExpanded = expandedFeature === feat.id;
                return (
                  <div 
                    key={feat.id}
                    onClick={() => setExpandedFeature(isExpanded ? null : feat.id)}
                    className={`border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
                      isExpanded ? `${feat.color} border-slate-300 shadow-sm` : "bg-slate-50/60 hover:bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between p-3.5 select-none">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-white p-1.5 rounded-xl shadow-xs border border-slate-100">
                          {feat.icon}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 tracking-tight leading-none text-left">
                            {feat.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 leading-none text-left">
                            {feat.subtitle}
                          </p>
                        </div>
                      </div>
                      <div>
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={16} className="text-slate-400" />
                        )}
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="border-t border-slate-200/50 bg-white"
                        >
                          <div className="p-4 space-y-3 text-left">
                            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                              {feat.description}
                            </p>
                            <ul className="space-y-1.5 pl-1">
                              {feat.bullets.map((bullet, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-slate-500 leading-normal">
                                  <span className="text-emerald-500 font-black mt-0.5 shrink-0">✓</span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
