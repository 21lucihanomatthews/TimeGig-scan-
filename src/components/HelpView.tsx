import React, { useState, useRef, useEffect } from "react";
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
  ArrowRight,
  Send,
  Loader2,
  Sparkles,
  Trophy,
  ShieldCheck,
  Award
} from "lucide-react";

interface HelpViewProps {
  onBack: () => void;
  coinBalance: number;
  isVerified: boolean;
  userData: { name?: string; email?: string } | null;
}

const CATEGORIES = [
  { id: "getting-started", icon: BookOpen, title: "Getting Started", color: "blue" },
  { id: "safety", icon: ShieldAlert, title: "Trust & Safety", color: "red" },
  { id: "payments", icon: CreditCard, title: "Payments & C-Wallet", color: "green" },
  { id: "account", icon: UserCircle, title: "Account & Profile", color: "purple" },
];

const FAQS = [
  { id: 1, cat: "getting-started", q: "How do I search or post a gig?", a: "To search, use the search block at the top of Gigs list. To post a new gig, click '+ Create Gig' on the top-right of your screen, fill out the form, and set a coin prize." },
  { id: 2, cat: "payments", q: "What is the C-Wallet and how do I use it?", a: "C-Wallet is your decentralized payment manager. You can send mock payments, upload transaction receipts/proofs for verification, top up mock coins, and pay other specialists securely." },
  { id: 3, cat: "safety", q: "How do I become a verified professional?", a: "Go to your user Profile, click 'Identity Verification', and upload your ID, CV, or certificates. The Support Manager reviews and awards the trusted check badge." },
  { id: 4, cat: "safety", q: "What should I do if I suspect a scam?", a: "If you observe any suspicious marketplace item or gig, click 'Help / Report Scam' or message Marcus the Support Manager directly to freeze the listing instantly." },
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function HelpView({ onBack, coinBalance, isVerified, userData }: HelpViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // AI Support Chat flow
  const [isSupportChatActive, setIsSupportChatActive] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const defaultGreeting: ChatMessage = {
      role: "assistant",
      content: `### Goal! Welcome to customer support, **${userData?.name || "Neighbor"}**! ⚽\n\nI'm **Marcus**, your active Support Manager and absolute World Cup fan! How can I assist you on the pitch today?\n\nAsk me about **Gigs**, **C-Wallet balances**, **ID Verification uploading**, **scam safety investigations**, or standard **World Cup Standing furies**! Let's get the ball rolling! 🏆`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    return [defaultGreeting];
  });
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isGenerating]);

  const filteredFaqs = FAQS.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory ? faq.cat === activeCategory : true;
    return matchesSearch && matchesCat;
  });

  // Client side markdown to react element parser
  const parseMarkdown = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let content = line.trim();
      if (!content) return <div key={idx} className="h-2" />;

      // Headers check
      if (line.startsWith("###")) {
        return (
          <h4 key={idx} className="text-xs font-black text-slate-900 mt-2.5 mb-1.5 flex items-center gap-1 text-emerald-600 uppercase tracking-wide">
            <Trophy size={12} className="inline text-yellow-500 shrink-0" />
            {line.replace("###", "").trim()}
          </h4>
        );
      }
      if (line.startsWith("##")) {
        return <h3 key={idx} className="text-sm font-black text-slate-950 mt-3 mb-1.5">{line.replace("##", "").trim()}</h3>;
      }
      if (line.startsWith("#")) {
        return <h2 key={idx} className="text-base font-black text-slate-950 mt-4 mb-2">{line.replace("#", "").trim()}</h2>;
      }

      // Strong bold parsing: replace **x** with <strong>
      const boldRegex = /\*\*(.*?)\*\*/g;
      let parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="font-extrabold text-indigo-700 bg-indigo-50/50 px-1 rounded">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      // Unordered lists parsing
      if (line.trim().startsWith("*") || line.trim().startsWith("-")) {
        return (
          <li key={idx} className="ml-3 list-disc text-[11px] text-slate-600 leading-relaxed my-0.5 pl-0.5">
            {parts.length > 0 ? parts : line.replace(/^[\*\-]\s*/, "")}
          </li>
        );
      }

      return (
        <p key={idx} className="text-[11px] text-slate-600 leading-relaxed mb-1.5">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isGenerating) return;

    const userText = chatInput.trim();
    setChatInput("");

    const newMsg: ChatMessage = {
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
    setIsGenerating(true);

    try {
      const userSupporter = localStorage.getItem("user_supporter_flag") || "None";
      const userProfile = {
        name: userData?.name || "Valued Neighbor",
        isVerified: isVerified,
        coinBalance: coinBalance,
        supporterCountry: userSupporter
      };

      const response = await fetch("/api/chat-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, newMsg],
          userProfile
        })
      });

      if (!response.ok) {
        throw new Error("Match penalty! Unable to connect to support desk.");
      }

      const data = await response.json();
      
      setChatMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Marcus is blowing his whistle! Try submitting your request again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `### Whistle Blown! ⚠️\n\nI couldn't complete the connection to my desk system. Please verify your connection or retry shortly. Pitch results remain online!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed inset-0 z-[200] bg-white flex flex-col font-sans"
    >
      {/* Header */}
      <div className="flex-none p-6 border-b border-gray-100 flex items-center justify-between bg-white pt-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={isSupportChatActive ? () => setIsSupportChatActive(false) : onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-gray-100"
          >
            <ChevronLeft size={20} className="text-gray-900" />
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-1.5 leading-none">
              {isSupportChatActive ? (
                <>
                  <span className="relative flex h-2 w-2 mr-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Marcus App Manager
                </>
              ) : "Help & Support"}
            </h2>
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">
              {isSupportChatActive ? "Active Chat Session" : "App guides & Support Desk"}
            </p>
          </div>
        </div>

        {isSupportChatActive && (
          <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
            <Trophy size={12} className="text-yellow-500" />
            Superfan
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isSupportChatActive ? (
          <motion.div 
            key="faqs-list"
            className="flex-grow overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Search */}
            <div className="p-6 pb-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="Search support guidelines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium text-sm shadow-sm"
                />
              </div>
            </div>

            {/* Categories */}
            {!searchQuery && (
              <div className="p-6 pt-4">
                <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Browse Categories</h3>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                      className={`p-3.5 rounded-2xl border transition-all text-left ${
                        activeCategory === cat.id 
                          ? "bg-slate-900 border-slate-900 shadow-lg text-white" 
                          : "bg-white border-gray-100 shadow-sm hover:border-blue-200"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${
                        activeCategory === cat.id ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
                      }`}>
                        <cat.icon size={16} />
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
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  {activeCategory ? `${CATEGORIES.find(c => c.id === activeCategory)?.title} FAQs` : "Common Questions"}
                </h3>
                {activeCategory && (
                  <button 
                    onClick={() => setActiveCategory(null)}
                    className="text-[9px] font-black text-blue-600 uppercase tracking-widest"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
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
                        <span className="text-xs font-bold text-gray-950 group-hover:text-blue-600 transition-colors pr-4">
                          {faq.q}
                        </span>
                        <div className={`transition-transform duration-300 shrink-0 ${expandedFaq === faq.id ? "rotate-90" : ""}`}>
                          <ChevronRight size={16} className="text-gray-300" />
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedFaq === faq.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-4 pb-4 border-t border-gray-50 pt-2.5"
                          >
                            <p className="text-[11px] text-gray-600 leading-relaxed font-semibold">
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredFaqs.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-xs text-gray-400 font-bold">No guideline found match query.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Custom high-energy support card */}
            <div className="p-6 pt-0">
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-emerald-950 text-white rounded-3xl p-5 border border-indigo-500/20 shadow-xl relative overflow-hidden text-left">
                <div className="absolute right-0 bottom-0 text-[120px] font-black text-white/5 leading-none translate-y-8 select-none pointer-events-none">COSMIC</div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <Sparkles size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-wider">Talk with Marcus App Manager</h3>
                      <p className="text-[9px] text-emerald-300 font-black uppercase tracking-widest mt-0.5">Real-time support & World Cup Fever</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    Get answers about wallet credits, profile locks, identity checks, and live soccer simulation commentary.
                  </p>

                  <button 
                    onClick={() => setIsSupportChatActive(true)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-black py-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all outline-none"
                  >
                    <MessageCircle size={15} /> Open Chat with Marcus <ChevronRight size={13} className="ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="ai-support-conversation"
            className="flex-grow flex flex-col bg-slate-50 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
              {chatMessages.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                  <div 
                    key={i}
                    className={`flex items-start gap-2.5 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto text-left"}`}
                  >
                    {/* Tiny Avatar */}
                    <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center border font-black text-[10px] ${
                      isUser ? "bg-indigo-600 text-white border-indigo-400" : "bg-gradient-to-r from-indigo-950 to-emerald-950 text-emerald-400 border-zinc-800"
                    }`}>
                      {isUser ? "ME" : "⚽"}
                    </div>

                    <div className="space-y-1">
                      {/* Message Bubble */}
                      <div className={`p-3 rounded-2xl shadow-sm text-xs relative ${
                        isUser 
                          ? "bg-indigo-600 text-white rounded-tr-none text-left" 
                          : "bg-white text-slate-800 rounded-tl-none border border-slate-100 text-left"
                      }`}>
                        {isUser ? <p className="leading-relaxed leading-snug">{msg.content}</p> : parseMarkdown(msg.content)}
                      </div>

                      {/* Msg Timestamp */}
                      <p className={`text-[8px] text-slate-400 font-bold px-1 ${isUser ? "text-right" : "text-left"}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}

              {isGenerating && (
                <div className="flex items-center gap-2 max-w-[80%] mr-auto text-left">
                  <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-[10px]">⚽</div>
                  <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm text-xs text-slate-400 font-semibold">
                    <Loader2 size={13} className="animate-spin text-emerald-500" />
                    Marcus is writing commentary...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Helper Actions Taps */}
            <div className="p-3 bg-white border-t border-slate-150 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth">
              <button 
                onClick={() => setChatInput("Tell me about World Cup Standing standing lists!")}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg border border-slate-200 uppercase tracking-wide select-none"
              >
                ⚽ World Cup Standings
              </button>
              <button 
                onClick={() => setChatInput("How do I verify my profile ID document?")}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg border border-slate-200 uppercase tracking-wide select-none"
              >
                🛡️ ID Verification Help
              </button>
              <button 
                onClick={() => setChatInput("Wallet Coin Balance problems or Top Up guide")}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg border border-slate-200 uppercase tracking-wide select-none"
              >
                🪙 Wallet Questions
              </button>
              <button 
                onClick={() => setChatInput("Report scam gig profile or Safety issue")}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg border border-slate-200 uppercase tracking-wide select-none"
              >
                🚨 Report Safety Scam
              </button>
            </div>

            {/* Message input field */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
              <input 
                type="text"
                placeholder="Ask Marcus App Manager anything..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-slate-800"
              />
              <button 
                onClick={handleSendChatMessage}
                disabled={!chatInput.trim() || isGenerating}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl shadow transition-all active:scale-95 flex items-center justify-center shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-center gap-1.5">
         <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
         <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
           Marcus App Administration Support Desk
         </span>
      </div>
    </motion.div>
  );
}
