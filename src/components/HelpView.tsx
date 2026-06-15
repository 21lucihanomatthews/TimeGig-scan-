import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  Search, 
  LifeBuoy, 
  ShieldAlert, 
  CreditCard, 
  UserCircle, 
  MessageCircle, 
  ExternalLink,
  ChevronRight,
  BookOpen,
  ArrowRight
} from "lucide-react";

interface HelpViewProps {
  onBack: () => void;
}

const CATEGORIES = [
  { id: "getting-started", icon: BookOpen, title: "Getting Started", color: "blue" },
  { id: "safety", icon: ShieldAlert, title: "Trust & Safety", color: "red" },
  { id: "payments", icon: CreditCard, title: "Payments & C-Wallet", color: "green" },
  { id: "account", icon: UserCircle, title: "Account & Profile", color: "purple" },
];

const FAQS = [
  { 
    id: 1, 
    cat: "getting-started", 
    q: "How do I apply for a gig?", 
    a: "Browse the home feed for available gigs. Tap on any gig to see details, then click 'Apply'. You can choose which documents to share for the application." 
  },
  { 
    id: 2, 
    cat: "safety", 
    q: "How does identity verification work?", 
    a: "We use biometric AI to match your real-time selfie with your uploaded documents. This creates a circle of trust in the neighborhood." 
  },
  { 
    id: 3, 
    cat: "payments", 
    q: "What is C-Wallet?", 
    a: "C-Wallet is our integrated secure payment system. You can load funds, receive payments for gigs, and withdraw to your bank account." 
  },
  { 
    id: 4, 
    cat: "account", 
    q: "Can I delete my account?", 
    a: "Yes, you can temporarily disable your account in Settings, or contact support for permanent deletion." 
  }
];

export default function HelpView({ onBack }: HelpViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = FAQS.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory ? faq.cat === activeCategory : true;
    return matchesSearch && matchesCat;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed inset-0 z-[200] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="flex-none p-6 border-b border-gray-100 flex items-center justify-between bg-white pt-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-900" />
          </button>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Help & Support
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search */}
        <div className="p-6 pb-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div className="p-6 pt-4">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Browse Categories</h3>
            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className={`p-4 rounded-3xl border transition-all text-left group ${
                    activeCategory === cat.id 
                      ? "bg-blue-600 border-blue-600 shadow-xl shadow-blue-100" 
                      : "bg-white border-gray-100 shadow-sm hover:border-blue-200"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                    activeCategory === cat.id ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
                  }`}>
                    <cat.icon size={20} />
                  </div>
                  <p className={`text-xs font-black tracking-tight leading-tight ${
                    activeCategory === cat.id ? "text-white" : "text-gray-900"
                  }`}>
                    {cat.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
              {activeCategory ? `${CATEGORIES.find(c => c.id === activeCategory)?.title} FAQs` : "Common Questions"}
            </h3>
            {activeCategory && (
              <button 
                onClick={() => setActiveCategory(null)}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {filteredFaqs.map((faq) => (
                <motion.div
                  layout
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full p-4 flex items-center justify-between text-left group"
                  >
                    <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors pr-4">
                      {faq.q}
                    </span>
                    <div className={`transition-transform duration-300 ${expandedFaq === faq.id ? "rotate-90" : ""}`}>
                      <ChevronRight size={18} className="text-gray-300" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedFaq === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 border-t border-gray-50 pt-3"
                      >
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 font-bold">No results found for your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="p-6 pt-0">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 shadow-xl shadow-blue-100 text-white relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <LifeBuoy className="mb-4 opacity-80" size={32} />
              <h3 className="text-xl font-black mb-2 tracking-tight">Need more help?</h3>
              <p className="text-sm text-white/80 font-medium mb-6"> Our support team is ready to assist you with any neighborhood issue.</p>
              
              <div className="space-y-3">
                <button className="w-full bg-white text-blue-600 font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                  <MessageCircle size={18} /> Chat with Support
                  <ArrowRight size={18} className="ml-1" />
                </button>
                <button className="w-full bg-blue-500/20 text-white border border-white/20 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-xs">
                  <ExternalLink size={14} /> Documentation Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-center gap-2">
         <ShieldAlert size={14} className="text-blue-500" />
         <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
           24/7 Priority Neighbor Support
         </span>
      </div>
    </motion.div>
  );
}
