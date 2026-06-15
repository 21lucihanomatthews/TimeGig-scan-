/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import ChatView from "./components/ChatView";
import ChatListView from "./components/ChatListView";
import ProfileView from "./components/ProfileView";
import PersonalProfileEditView from "./components/PersonalProfileEditView";
import SeekersView from "./components/SeekersView";
import CwalletView from "./components/CwalletView";
import MarketView from "./components/MarketView";
import DocumentViewer from "./components/DocumentViewer";
import MeetingArrivalView from "./components/MeetingArrivalView";
import OnboardingGuide from "./components/OnboardingGuide";
import AuthFlow from "./components/AuthFlow";
import IdentityVerificationView from "./components/IdentityVerificationView";
import HelpView from "./components/HelpView";
import WorldCupFeverHub from "./components/WorldCupFeverHub";
import FeatureExplainer from "./components/FeatureExplainer";
import Top20SeekersBoard from "./components/Top20SeekersBoard";
import TimeGigLogo from "./components/TimeGigLogo";
import {
  Home,
  MessageSquare,
  Bell,
  User,
  MapPin,
  Hammer,
  Sparkles,
  Briefcase,
  Wallet,
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  Lock,
  RefreshCw,
  X,
  Shield,
  ShieldCheck,
  Star,
  ArrowRight,
  MoreVertical,
  Gift,
  Play,
  Heart,
  MessageCircle,
  ShoppingBag,
  Trash2,
  Power,
  LogOut,
  LifeBuoy,
  Crown,
  Upload,
} from "lucide-react";

const formatPriceForMarketplace = (priceStr: string) => {
  if (!priceStr) return "ZAR 0";
  let cleaned = priceStr.trim();
  // Decode R to ZAR
  if (cleaned.toLowerCase().startsWith("r")) {
    cleaned = "ZAR" + cleaned.substring(1).trim();
  }
  // Standardize prefix
  if (!cleaned.toUpperCase().startsWith("ZAR")) {
    cleaned = "ZAR" + cleaned;
  }
  return cleaned;
};

const initialGigs: Gig[] = [];

interface Gig {
  id: number;
  title: string;
  description: string;
  price: string;
  location: string;
  images: string[];
  timing: string;
  date?: string;
  isUserCreated?: boolean;
}

interface GigCardProps {
  gig: Gig;
  onClick: () => void;
}

const GigCard: React.FC<GigCardProps> = ({ gig, onClick }) => {
  const [imgSrc, setImgSrc] = useState(
    gig.images[0] ||
      "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=300&q=80",
  );

  return (
    <div
      onClick={onClick}
      className="cursor-pointer group flex flex-col text-left"
    >
      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-50 border border-gray-100/60 flex items-center justify-center">
        <img
          src={imgSrc}
          alt={gig.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            setImgSrc(
              "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=300&q=80",
            );
          }}
        />

        {/* Photo Count tag is shown if there are multiple images */}
        {gig.images && gig.images.length > 1 && (
          <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-[8px] font-bold text-white px-1.5 py-0.5 rounded">
            {gig.images.length}
          </div>
        )}

        {/* Priority Timing Tag top-left */}
        <span className="absolute top-1.5 left-1.5 text-[8px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded shadow-xs bg-white text-blue-600 border border-slate-100">
          {gig.timing}
        </span>
      </div>

      {/* Under-image precise FB Marketplace text block */}
      <div className="mt-2 px-0.5 space-y-0.5">
        <h3 className="text-xs text-gray-900 leading-snug">
          <span className="font-extrabold text-[#111827]">
            {formatPriceForMarketplace(gig.price)}
          </span>
          <span className="text-gray-400 font-bold mx-1.5">·</span>
          <span className="font-medium text-[#374151] group-hover:text-blue-600 transition-colors line-clamp-1">
            {gig.title}
          </span>
        </h3>

        {/* Underline helper metadata */}
        <div className="flex items-center text-[10px] text-gray-400 font-medium truncate">
          <MapPin size={9} className="mr-0.5" />
          <span className="truncate">{gig.location}</span>
        </div>
      </div>
    </div>
  );
};

const CreateGigForm: React.FC<{
  onCancel: () => void;
  onSubmit: (gig: Omit<Gig, "id">) => void;
}> = ({ onCancel, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [timing, setTiming] = useState("Immediate");
  const [gigDate, setGigDate] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const previews = files.map((file: File) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      price,
      location,
      timing,
      date: gigDate,
      images:
        imagePreviews.length > 0
          ? imagePreviews
          : [
              "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=300&q=80",
            ],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Create Gig</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        placeholder="Price (e.g., R150/hr)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="radio"
            value="Immediate"
            checked={timing === "Immediate"}
            onChange={(e) => setTiming(e.target.value)}
            className="mr-2"
          />{" "}
          Immediate
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            value="Schedule"
            checked={timing === "Schedule"}
            onChange={(e) => setTiming(e.target.value)}
            className="mr-2"
          />{" "}
          Schedule
        </label>
      </div>
      {timing === "Schedule" && (
        <input
          type="date"
          value={gigDate}
          onChange={(e) => setGigDate(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      )}
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="w-full p-2 border rounded"
      />
      {imagePreviews.length > 0 && (
        <div className="flex gap-2 overflow-x-auto p-2 border rounded">
          {imagePreviews.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`preview-${index}`}
              className="w-20 h-20 object-cover rounded flex-shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src =
                  "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=300&q=80";
              }}
            />
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 p-2 bg-gray-200 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 p-2 bg-blue-600 text-white rounded"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

interface GigsFeedProps {
  gigs: Gig[];
  onShowCreateGig: () => void;
  onSelectGig: (gig: Gig) => void;
  isVerified?: boolean;
  onStartChat: (name: string, text: string, avatar: string) => void;
}

function GigsFeed({ gigs, onShowCreateGig, onSelectGig, isVerified, onStartChat }: GigsFeedProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredGigs = gigs.filter(
    (gig) =>
      gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gig.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gig.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-md mx-auto space-y-6 pb-24 text-left">
      {/* Header section identical to seekers but for Gigs Grid */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <TimeGigLogo size="small" darkTheme={false} />
          </div>
          <p className="text-xs text-gray-450 font-semibold mt-1">
            Local gigs & jobs posted by verified nearby hirers
          </p>
        </div>
        <button
          onClick={onShowCreateGig}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1 shrink-0"
        >
          + Create Gig
        </button>
      </div>

      {/* 🏆 DECORATIVE WORLD CUP STANDING FAN DISPLAY 🏆 */}
      <div 
        className="bg-gradient-to-r from-emerald-800 via-green-950 to-indigo-950 border border-emerald-600/30 rounded-3xl p-4 shadow-md text-white overflow-hidden relative"
      >
        {/* Decorative background soccer ball */}
        <div className="absolute -right-3 -bottom-3 text-7xl opacity-10 select-none pointer-events-none">⚽</div>
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-400 font-extrabold animate-bounce text-xs">🏆</span>
              <p className="text-[9px] text-emerald-300 font-extrabold uppercase tracking-widest leading-none">World Cup Fever</p>
            </div>
            <p className="text-xs font-black text-white">TimeGiG Celebrates Soccer World Cup! ⚽🏆</p>
            <p className="text-[9px] text-gray-350 leading-none mt-1">Bringing pitch-perfect neighborhood Gigs and professional secure solutions!</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-2xl border border-white/15 shadow-inner shrink-0 text-center">
            <motion.span 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="text-2xl"
            >
              ⚽
            </motion.span>
            <motion.span 
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="text-2xl"
            >
              🏆
            </motion.span>
          </div>
        </div>
      </div>

      {/* 🌟 FEATURE EXPLAINER ENGINE & GLASSBOARD 🌟 */}
      <FeatureExplainer onStartChat={onStartChat} isVerified={!!isVerified} />

      {/* Styled Search Input premium decoration */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search gigs, jobs, locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white rounded-full pl-10 pr-4 py-2.5 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
        />
        <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
      </div>

      {/* Gigs Grid Layout */}
      <div className="grid grid-cols-2 gap-4">
        {filteredGigs.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200 p-6">
            <p className="font-semibold text-gray-650">No gigs found</p>
            <p className="text-xs mt-1">Try another query or post a new gig!</p>
          </div>
        ) : (
          filteredGigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} onClick={() => onSelectGig(gig)} />
          ))
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("is_authenticated") === "true";
  });
  const [isVerified, setIsVerified] = useState(() => {
    return localStorage.getItem("is_verified") === "true";
  });
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem("user_account");
    const account = saved ? JSON.parse(saved) : null;
    if (account && !account.isVerified) {
      account.isVerified = localStorage.getItem("is_verified") === "true";
    }
    return account;
  });

  const [activeTab, setActiveTab] = useState("home");
  const [showVerification, setShowVerification] = useState(false);
  const [gigs, setGigs] = useState<Gig[]>(initialGigs);
  const [showCreateGig, setShowCreateGig] = useState(false);
  const [isCreatingSeeker, setIsCreatingSeeker] = useState(false);
  const [selectedGigForDetails, setSelectedGigForDetails] =
    useState<Gig | null>(null);
  const [congratulatoryMessage, setCongratulatoryMessage] = useState("");
  const [showProfile, setShowProfile] = useState<{
    name: string;
    avatar: string;
  } | null>(null);
  const [isProfileLocked, setIsProfileLocked] = useState(false);
  const [isAccountDisabled, setIsAccountDisabled] = useState(() => {
    return localStorage.getItem("isAccountDisabled") === "true";
  });
  const [userProfilePic, setUserProfilePic] = useState<string | null>(() => {
    return localStorage.getItem("profilePic");
  });

  useEffect(() => {
    // Sync profile check
    const interval = setInterval(() => {
      const savedPic = localStorage.getItem("profilePic");
      if (savedPic !== userProfilePic) {
        setUserProfilePic(savedPic);
      }
      const verified = localStorage.getItem("is_verified") === "true";
      if (verified !== isVerified) {
        setIsVerified(verified);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [userProfilePic, isVerified]);

  // Custom states for document security sharing & review simulation
  const [applyGigState, setApplyGigState] = useState<{
    gig: Gig;
    hirerName: string;
    hirerAvatar: string;
    stage:
      | "permission-request"
      | "simulating-review"
      | "decision-approved"
      | "decision-rejected";
    selectedDocs: { cv: boolean; certificates: boolean; idDocs: boolean };
  } | null>(null);

  const [reviewApplicationState, setReviewApplicationState] = useState<{
    gig: Gig;
    applicantName: string;
    applicantAvatar: string;
  } | null>(null);

  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [selectedProofForReview, setSelectedProofForReview] = useState<
    any | null
  >(null);
  const [adminProfit, setAdminProfit] = useState(0);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);

  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [showTopMenu, setShowTopMenu] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState({
    market: true,
    chat: true,
    safety: true,
    wallet: true
  });
  const [appBackgroundUrl, setAppBackgroundUrl] = useState(() => {
    return localStorage.getItem("timegig_bg_url") || "";
  });
  const [appBackgroundBlur, setAppBackgroundBlur] = useState(() => {
    const saved = localStorage.getItem("timegig_bg_blur");
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem("timegig_bg_url", appBackgroundUrl || "");
  }, [appBackgroundUrl]);

  useEffect(() => {
    localStorage.setItem("timegig_bg_blur", appBackgroundBlur.toString());
  }, [appBackgroundBlur]);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showWorldCupHub, setShowWorldCupHub] = useState(false);
  const [showTop20Seekers, setShowTop20Seekers] = useState(false);
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);
  const [documentViewerSeeker, setDocumentViewerSeeker] = useState<any>(null);
  const [isMeetingArrivalOpen, setIsMeetingArrivalOpen] = useState(false);
  const [meetingArrivalData, setMeetingArrivalData] = useState<any>(null);
  const [isViewingDirectChat, setIsViewingDirectChat] = useState(false);
  const [isCreatingMarketItem, setIsCreatingMarketItem] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isTopUpActive, setIsTopUpActive] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    // Hide when scrolling down, but only if we've scrolled a bit
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      setShowHeader(false);
    } else {
      setShowHeader(true);
    }
    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferralCode(ref);
      setShowReferralModal(true);
    }

  }, []);

  const [activeToast, setActiveToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const canAfford = (amount: number) => coinBalance >= amount;
  const deductCoins = (amount: number) => {
    if (canAfford(amount)) {
      setCoinBalance((prev) => prev - amount);
      return true;
    }
    showToastNotification("Not enough coins!", "error");
    return false;
  };

  const showToastNotification = (
    message: string,
    type: "success" | "info" | "error" = "info",
  ) => {
    setActiveToast({ message, type });
    setTimeout(() => {
      setActiveToast(null);
    }, 5000);
  };

  const handleApplyOutcome = (outcome: "approve" | "reject") => {
    if (!applyGigState) return;
    if (outcome === "approve") {
      setApplyGigState((prev) =>
        prev ? { ...prev, stage: "decision-approved" } : null,
      );
    } else {
      setApplyGigState((prev) =>
        prev ? { ...prev, stage: "decision-rejected" } : null,
      );
    }
  };

  const handleCloseApprovedFlow = () => {
    if (!applyGigState) return;
    const { gig, hirerName, hirerAvatar } = applyGigState;

    // Add structured live notification
    const msgText = `🎉 Application Approved: ${hirerName} approved your CV & profile credentials for the '${gig.title}' gig. Tap to start working!`;
    setNotifications((prev) => [
      {
        id: Date.now(),
        message: msgText,
        read: false,
        link: "chat",
        type: "gig",
      },
      ...prev,
    ]);

    // Set immediate visual toast notification banner
    showToastNotification(
      `🔔 Approval Received! ${hirerName} has approved your application and started a chat.`,
      "success",
    );

    // Trigger immediate, real connection & chat flow initialization
    handleStartChatFromSeeker(
      hirerName,
      `Hi ${hirerName}! I saw your gig posting for "${gig.title}" and authorized sharing my verified profile data, picture, and credentials (CV & verification documents). Let's coordinate details!`,
      hirerAvatar,
    );

    // Reset overlay state
    setApplyGigState(null);
    setSelectedGigForDetails(null);
  };

  const handleCloseRejectedFlow = () => {
    if (!applyGigState) return;
    const { gig, hirerName } = applyGigState;

    // Reject receives ONLY high-priority notification, and no chat contact represents
    const msgText = `⚠️ Application Update: ${hirerName} has declined your application for '${gig.title}'. Shared documents have been purged securely.`;
    setNotifications((prev) => [
      {
        id: Date.now(),
        message: msgText,
        read: false,
        link: "home",
        type: "gig",
      },
      ...prev,
    ]);

    // Set immediate toast notification banner
    showToastNotification(
      `🔔 Application Declined: ${hirerName} chose another applicant for the '${gig.title}' gig.`,
      "error",
    );

    // Clear overlay state, do NOT open active chat partner
    setApplyGigState(null);
    setSelectedGigForDetails(null);
    setActiveTab("home");
  };

  const handleHostReviewOutcome = (outcome: "approve" | "reject") => {
    if (!reviewApplicationState) return;
    const { gig, applicantName, applicantAvatar } = reviewApplicationState;
    if (outcome === "approve") {
      showToastNotification(
        `You have approved ${applicantName}! A chat has been started.`,
        "success",
      );
      // As host, we initiate the chat message to the applicant
      handleStartChatFromSeeker(
        applicantName,
        `Hi ${applicantName}, I've reviewed your application for "${gig.title}" and would love to start working with you.`,
        applicantAvatar,
      );

      // Trigger the Face-to-Face meeting arrival visualization
      setMeetingArrivalData({
        buyer: { name: "Host (You)", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=App" },
        seller: { name: applicantName, avatar: applicantAvatar },
        locationName: gig.location
      });
      setIsMeetingArrivalOpen(true);
    } else {
      showToastNotification(
        `Application from ${applicantName} declined.`,
        "info",
      );
    }
    setReviewApplicationState(null);
  };

  const [activeChatPartner, setActiveChatPartner] = useState<{
    name: string;
    avatar: string;
  } | null>(() => {
    const saved = localStorage.getItem("active_chat_partner");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return null;
  });

  const [notifications, setNotifications] = useState<
    {
      id: number;
      message: string;
      read: boolean;
      link: string;
      type: "gig" | "seeker" | "promotion" | "application";
      metaData?: any;
    }[]
  >([]);

  useEffect(() => {
    // Notifications simulation removed
  }, []);

  const addNotification = (
    message: string,
    link: string,
    type: "gig" | "seeker" | "promotion" = "gig",
  ) => {
    setNotifications((prev) => [
      { id: Date.now(), message, read: false, link, type },
      ...prev,
    ]);
  };

  const handleDeleteNotification = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleToggleAccount = () => {
    const newState = !isAccountDisabled;
    setIsAccountDisabled(newState);
    localStorage.setItem("isAccountDisabled", newState.toString());
    if (newState) {
      showToastNotification("Account disabled successfully.", "info");
    } else {
      showToastNotification("Account re-enabled! Welcome back.", "success");
    }
  };

  const handleDeleteGig = (id: number) => {
    setGigs((prev) => prev.filter((g) => g.id !== id));
    setSelectedGigForDetails(null);
    showToastNotification("Gig deleted successfully.", "success");
  };

  const handleCreateGig = (newGig: Omit<Gig, "id">) => {
    if (!deductCoins(2)) return;

    const gigId = Date.now();
    const createdGig = { ...newGig, id: gigId, isUserCreated: true };
    setGigs([...gigs, createdGig]);
    setShowCreateGig(false);
    setCongratulatoryMessage("Congratulations! Your gig is now live.");
    addNotification(`New gig posted: ${newGig.title}`, "home", "gig");
    setTimeout(() => setCongratulatoryMessage(""), 3000);
  };

  const handleNavigate = (link: string) => {
    setActiveTab(link);
  };

  const handleInterestedFromMarket = (sellerName: string) => {
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${sellerName}`;
    handleStartChatFromSeeker(
      sellerName,
      `Hi! I saw your item in the market and I'm interested.`,
      avatar,
    );
  };

  const handleStartChatFromSeeker = (
    name: string,
    text: string,
    avatar?: string,
  ) => {
    const partnerAvatar =
      avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.toLowerCase()}`;
    const chatKey = `chat_messages_${name.replace(/\s+/g, "_")}`;

    // Check if we already have messages with this partner
    const savedMessages = localStorage.getItem(chatKey);
    let messages = savedMessages ? JSON.parse(savedMessages) : [];

    if (messages.length === 0) {
      const userMessage = {
        id: Date.now(),
        text: text,
        sender: 'user',
        type: 'text',
        timestamp: new Date().toLocaleTimeString(),
      };
      messages = [userMessage];
    } else {
      // If conversation already exists, just append the new message
      const userMessage = {
        id: Date.now(),
        text: text,
        sender: "user",
        type: "text",
        timestamp: new Date().toLocaleTimeString(),
      };
      messages.push(userMessage);
    }

    localStorage.setItem(chatKey, JSON.stringify(messages));

    // Also save active chat partner details
    const partner = { name, avatar: partnerAvatar };
    localStorage.setItem("active_chat_partner", JSON.stringify(partner));
    setActiveChatPartner(partner);
    setIsViewingDirectChat(true);

    setActiveTab("chat");
  };

  const handleNotificationClick = (id: number, link: string) => {
    const notification = notifications.find((n) => n.id === id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    if (
      notification &&
      notification.type === "application" &&
      notification.metaData
    ) {
      setReviewApplicationState(notification.metaData);
      return;
    }
    setActiveTab(link);
  };

  const hasUnread = notifications.some((n) => !n.read);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [prevUnreadCount, setPrevUnreadCount] = useState(unreadCount);

  useEffect(() => {
    if (unreadCount > prevUnreadCount && soundEnabled) {
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
      );
      audio.play().catch(() => {});
    }
    setPrevUnreadCount(unreadCount);
  }, [unreadCount, prevUnreadCount, soundEnabled]);

  const renderContent = () => {
    if (showProfile) {
      return (
        <ProfileView
          onBack={() => setShowProfile(null)}
          userName={showProfile.name}
          avatarUrl={showProfile.avatar}
          isVerified={showProfile.name === userData?.email || isVerified} // Mock: verified if current user or by name check
        />
      );
    }
    if (congratulatoryMessage) {
      const container = {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.05, delayChildren: 0.1 },
        },
      };
      const child = {
        hidden: { opacity: 0, y: -200, rotate: -20 },
        visible: {
          opacity: 1,
          y: 0,
          rotate: 0,
          transition: { type: "spring", stiffness: 300, damping: 10 },
        },
      };
      return (
        <div className="flex flex-col h-full items-center justify-center p-6 text-center">
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="text-4xl font-extrabold text-blue-600 flex flex-wrap justify-center"
          >
            {congratulatoryMessage.split("").map((char, index) => (
              <motion.span
                key={index}
                variants={child}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -250, y: 0, rotate: -45, scale: 0.8 }}
            animate={{
              opacity: 1,
              x: [-250, 250],
              y: [0, -50, 0],
              rotate: [0, -45, 0, -45, 0],
              scale: [0.8, 1.2, 0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              times: [0, 0.25, 0.5, 0.75, 1],
            }}
            className="mt-8 [perspective:1000px]"
          >
            <Hammer size={64} className="text-gray-700" />
          </motion.div>
        </div>
      );
    }
    if (showCreateGig) {
      return (
        <CreateGigForm
          onCancel={() => setShowCreateGig(false)}
          onSubmit={handleCreateGig}
        />
      );
    }
    if (selectedGigForDetails) {
      const isGigUserCreated = selectedGigForDetails.isUserCreated;
      const hirerName = isGigUserCreated ? "Me (Logged In User)" : "Local Community Member";
      const hirerAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(hirerName)}`;

      return (
        <div className="fixed inset-0 z-45 bg-gray-50 flex flex-col max-w-sm mx-auto shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-250 text-left">
          {/* Header Sticky Navigation Bar */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-gray-100 flex items-center justify-between z-10 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedGigForDetails(null)}
              className="p-1 text-gray-550 hover:bg-gray-100 rounded-full transition flex items-center gap-1"
            >
              <ChevronLeft size={20} />
              <span className="text-xs font-bold text-gray-650">Back</span>
            </button>
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-wider font-mono font-bold text-blue-600">
                Gig Listing
              </p>
              <p className="text-xs font-black text-gray-800 truncate max-w-[150px]">
                {selectedGigForDetails.title}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                handleStartChatFromSeeker(
                  hirerName,
                  `Hi! I saw your gig posting: "${selectedGigForDetails.title}" and I would love to apply for it. Let's chat!`,
                  hirerAvatar,
                );
                setSelectedGigForDetails(null);
              }}
              className="bg-blue-50 text-blue-600 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition"
            >
              Chat
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
            <div className="relative h-72 w-full bg-slate-100 shrink-0">
              <img
                src={
                  selectedGigForDetails.images[0] ||
                  "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=300&q=80"
                }
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src =
                    "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=300&q=80";
                }}
                alt={selectedGigForDetails.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-3 left-3 bg-black/60 shadow-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                {selectedGigForDetails.timing}
              </span>
            </div>

            <div className="p-5 space-y-5">
              {/* Hirer Profile detail box */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={hirerAvatar}
                      alt={hirerName}
                      className="w-12 h-12 rounded-full border border-gray-200 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(hirerName)}&background=random`;
                      }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 bg-black text-white p-0.5 rounded-full border border-white">
                      <CheckCircle2 size={10} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900 leading-tight">
                      {hirerName}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-medium flex items-center gap-0.5 mt-0.5">
                      <MapPin size={9} />
                      {selectedGigForDetails.location}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold uppercase font-mono text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  Verified Hirer
                </span>
              </div>

              {/* Specification list */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3.5">
                <div>
                  <h4 className="text-[10px] uppercase font-mono font-bold text-gray-400">
                    Position / Title
                  </h4>
                  <h3 className="font-black text-gray-800 text-sm mt-0.5">
                    {selectedGigForDetails.title}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
                  <div>
                    <h4 className="text-[10px] uppercase font-mono font-bold text-gray-400">
                      Budget / Rate
                    </h4>
                    <p className="font-black text-blue-600 text-sm mt-0.5">
                      {formatPriceForMarketplace(selectedGigForDetails.price)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-mono font-bold text-gray-400">
                      Timeline
                    </h4>
                    <p className="font-bold text-gray-700 text-sm mt-0.5">
                      {selectedGigForDetails.timing}{" "}
                      {selectedGigForDetails.date &&
                        `(${selectedGigForDetails.date})`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Descriptions box */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-2.5">
                <h4 className="text-[11px] uppercase font-mono font-bold text-gray-400">
                  Description & Tasks
                </h4>
                <p className="text-gray-650 text-xs leading-relaxed font-medium">
                  {selectedGigForDetails.description ||
                    "No extended description provided for this gig listing. Please connect via chat for full task details and scope requirements."}
                </p>
              </div>
              {selectedGigForDetails.isUserCreated && (
                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this gig?")) {
                        handleDeleteGig(selectedGigForDetails.id);
                      }
                    }}
                    className="w-full py-3 bg-red-50 text-red-600 border border-red-100 font-bold text-xs rounded-xl hover:bg-red-100 transition flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Delete This Gig
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Bottom bar action */}
          <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 shrink-0 flex gap-3 z-10">
            <button
              type="button"
              onClick={() => setSelectedGigForDetails(null)}
              className={`${selectedGigForDetails.isUserCreated ? "w-full" : "w-1/3"} py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-extrabold rounded-xl transition`}
            >
              Close
            </button>
            {!selectedGigForDetails.isUserCreated && (
              <button
                type="button"
                onClick={() => {
                  if (!isVerified) {
                    showToastNotification("You must verify your profile before applying.", "error");
                    return;
                  }
                  if (!deductCoins(3)) return;
                  setApplyGigState({
                    gig: selectedGigForDetails,
                    hirerName,
                    hirerAvatar,
                    stage: "permission-request",
                    selectedDocs: {
                      cv: true,
                      certificates: true,
                      idDocs: true,
                    },
                  });
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Briefcase size={13} /> Apply to Gig
              </button>
            )}
          </div>
        </div>
      );
    }
    switch (activeTab) {
      case "home":
        return (
          <GigsFeed
            gigs={gigs}
            onShowCreateGig={() => setShowCreateGig(true)}
            onSelectGig={(gig) => setSelectedGigForDetails(gig)}
            isVerified={isVerified}
            onStartChat={(name, text, avatar) => handleStartChatFromSeeker(name, text, avatar)}
          />
        );
      case "seekers":
        return (
          <SeekersView
            deductCoins={deductCoins}
            onStartChat={(name, text, avatar) => {
              if (!isVerified) {
                showToastNotification("You must verify your profile before contacting seekers.", "error");
                return;
              }
              handleStartChatFromSeeker(name, text, avatar);
            }}
            onCreatingChange={setIsCreatingSeeker}
            isVerified={isVerified}
          />
        );
      case "market":
        return (
          <MarketView 
            deductCoins={deductCoins}
            onInterested={(seller) => {
              if (!isVerified) {
                showToastNotification("You must verify your profile before contacting sellers.", "error");
                return;
              }
              handleInterestedFromMarket(seller);
            }}
            onCreatingChange={setIsCreatingMarketItem}
            isVerified={isVerified}
          />
        );
      case "cwallet":
        return (
          <CwalletView
            coinBalance={coinBalance}
            setCoinBalance={setCoinBalance}
            onSubmitPayment={(paymentData) => {
              setPendingPayments([...pendingPayments, paymentData]);
              showToastNotification(
                "Payment submitted for admin review",
                "info",
              );
            }}
            onTopUpToggle={setIsTopUpActive}
          />
        );
      case "chat":
        if (isViewingDirectChat && activeChatPartner) {
          return (
            <ChatView
              partner={activeChatPartner}
              soundEnabled={soundEnabled}
              deductCoins={deductCoins}
              onBack={() => setIsViewingDirectChat(false)}
              onViewProfile={() =>
                setShowProfile({
                  name: activeChatPartner?.name || "Service Provider",
                  avatar:
                    activeChatPartner?.avatar ||
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=other",
                })
              }
              onViewDocuments={() => {
                const name = activeChatPartner?.name || "Service Provider";
                setDocumentViewerSeeker({
                  name,
                  avatar: activeChatPartner?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=other",
                  role: "Verified Neighbor",
                  rating: 4.8,
                  location: "Sandton, Gauteng",
                  memberSince: "Jan 2024",
                  documents: [
                    { id: '1', title: 'Neighbor Profile', type: 'Profile', url: '', status: 'Verified' },
                    { id: '2', title: 'National Identity Document', type: 'ID', url: 'https://images.unsplash.com/photo-1634733988138-bf2c3a2a13fa?w=800&q=80', status: 'Verified' },
                    { id: '3', title: 'Work Certification', type: 'Certification', url: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=800&q=80', status: 'Verified' },
                    { id: '4', title: 'Safety Verification', type: 'PoliceCheck', url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&q=80', status: 'Verified' },
                  ]
                });
                setIsDocumentViewerOpen(true);
              }}
              onMeetingConfirmed={() => {
                setMeetingArrivalData({
                  buyer: { name: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user" },
                  seller: { name: activeChatPartner?.name || "Neighbor", avatar: activeChatPartner?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=other" },
                  locationName: "Safe Meeting Zone"
                });
                setIsMeetingArrivalOpen(true);
              }}
            />
          );
        }
        return (
          <ChatListView 
            onSelectContact={(name, avatar) => {
              setActiveChatPartner({ name, avatar });
              setIsViewingDirectChat(true);
            }}
            onBack={() => setActiveTab("home")}
          />
        );
      case "user":
        return (
          <PersonalProfileEditView
            isLocked={isProfileLocked}
            onBack={() => setActiveTab("home")}
            onVerify={() => setShowVerification(true)}
            onSubmit={() => {
              const currentDataString = localStorage.getItem("profileFormData");
              const previousDataString = localStorage.getItem(
                "lastSavedProfileData",
              );

              if (currentDataString !== previousDataString) {
                setCongratulatoryMessage("Congratulations");
                localStorage.setItem(
                  "lastSavedProfileData",
                  currentDataString || "",
                );
              }
              setIsProfileLocked(true);
              setTimeout(() => {
                setCongratulatoryMessage("");
                setActiveTab("home");
              }, 3000);
            }}
            onUnlock={() => setIsProfileLocked(false)}
          />
        );
      case "bell":
        return (
          <div className="p-4 max-w-md mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Bell className="text-blue-600 animate-bounce" /> Notifications
              </h1>
              {hasUnread && (
                <button
                  onClick={() =>
                    setNotifications((prev) =>
                      prev.map((n) => ({ ...n, read: true })),
                    )
                  }
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 space-y-3">
                <div className="p-4 bg-gray-100 rounded-full text-gray-400">
                  <Bell size={32} />
                </div>
                <p className="font-medium text-gray-500">All caught up!</p>
                <p className="text-xs text-gray-400 max-w-[200px]">
                  Any new gigs, seeker requests, or promotions will appear here.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
                {notifications.map((n) => {
                  let iconElement = (
                    <Bell size={16} className="text-yellow-600" />
                  );
                  let bgClass = "bg-yellow-50";
                  if (n.type === "gig") {
                    iconElement = (
                      <Briefcase size={16} className="text-blue-600" />
                    );
                    bgClass = "bg-blue-50";
                  } else if (n.type === "seeker") {
                    iconElement = <User size={16} className="text-green-600" />;
                    bgClass = "bg-green-50";
                  } else if (n.type === "promotion") {
                    iconElement = (
                      <Sparkles size={16} className="text-purple-600" />
                    );
                    bgClass = "bg-purple-50";
                  }

                  return (
                    <motion.div
                      key={n.id}
                      whileHover={{ backgroundColor: "#f8fafc" }}
                      onClick={() => handleNotificationClick(n.id, n.link)}
                      className={`p-2.5 border-b last:border-b-0 transition-colors cursor-pointer flex gap-3 relative ${
                        n.read ? "bg-white" : "bg-blue-50/40"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 mt-0.5 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}
                      >
                        {React.cloneElement(iconElement as React.ReactElement, { size: 14 })}
                      </div>
                      <div className="flex-1 pr-6">
                        <p
                          className={`text-xs tracking-tight leading-tight ${n.read ? "text-gray-500" : "text-gray-900 font-semibold"}`}
                        >
                          {n.message}
                        </p>
                        <p className="text-[10px] text-blue-600/70 font-bold mt-0.5 uppercase tracking-wider">
                          {n.type} • Just now
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteNotification(e, n.id)}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors self-start"
                      >
                        <X size={12} />
                      </button>
                      {!n.read && (
                        <div className="absolute top-1/2 -translate-y-1/2 right-7 w-2 h-2 bg-blue-500 rounded-full shadow-sm shadow-blue-500/20" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            Content for {activeTab}
          </div>
        );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("is_authenticated");
    localStorage.removeItem("is_verified");
    setIsAuthenticated(false);
    setIsVerified(false);
    setShowOnboarding(false);
    showToastNotification("Logged out successfully", "info");
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-6 text-slate-800 text-center select-none">
        {/* Abstract background soccer pitch lines decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="w-full h-full border-[3px] border-slate-200 rounded-t-[100px] mt-24" />
          <div className="w-64 h-64 border-[3px] border-slate-200 rounded-full mx-auto -mt-12" />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 space-y-6"
        >
          {/* Soccer Ball and World Cup Celebration Icons */}
          <div className="flex items-center justify-center gap-6">
            <motion.span 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="text-5xl drop-shadow-[0_0_15px_rgba(37,99,235,0.2)]"
            >
              ⚽
            </motion.span>
            <motion.span 
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="text-6xl drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]"
            >
              🏆
            </motion.span>
          </div>

          <div className="space-y-2 flex flex-col items-center justify-center">
            {/* Animated Title TimeGiG */}
            <TimeGigLogo size="large" darkTheme={false} />

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-xs text-gray-500 font-extrabold uppercase tracking-[0.25em] mt-2 text-center"
            >
              Pitch-Perfect Gig Solutions
            </motion.p>
          </div>

          {/* Loading status bar */}
          <div className="w-48 h-1 bg-gray-100 rounded-full mx-auto overflow-hidden relative">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
            />
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-[10px] text-gray-400 font-bold uppercase tracking-widest"
          >
            Entering Stadium...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthFlow
        onComplete={(data) => {
          setUserData(data);
          setIsAuthenticated(true);
          setShowOnboarding(true);
        }}
      />
    );
  }

  if (showOnboarding) {
    return <OnboardingGuide onFinish={() => setShowOnboarding(false)} />;
  }

  if (showVerification) {
    return (
      <IdentityVerificationView 
        onBack={() => setShowVerification(false)}
        onComplete={() => {
          setIsVerified(true);
          setShowVerification(false);
          setCoinBalance(prev => prev + 15);
          showToastNotification("Identity verified successfully! You received 15 free coins.", "success");
        }}
      />
    );
  }

  if (showHelp) {
    return (
      <HelpView 
        onBack={() => setShowHelp(false)}
        coinBalance={coinBalance}
        isVerified={isVerified}
        userData={userData}
      />
    );
  }

  if (showWorldCupHub) {
    return (
      <WorldCupFeverHub 
        onBack={() => setShowWorldCupHub(false)}
        coinBalance={coinBalance}
        setCoinBalance={setCoinBalance}
      />
    );
  }

  return (
    <div
      className="flex flex-col h-screen bg-gray-50 relative overflow-hidden"
      style={{
        backgroundImage: appBackgroundUrl ? `url(${appBackgroundUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {appBackgroundUrl && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backdropFilter: `blur(${appBackgroundBlur}px)`,
            backgroundColor: "rgba(255,255,255,0.3)",
          }}
        />
      )}
      <div className="relative flex flex-col h-full z-0">
        {isAccountDisabled && (
          <div className="absolute inset-0 z-[200] bg-white/90 backdrop-blur-md flex items-center justify-center p-6 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-xs space-y-6"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                <Power size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-gray-900">Account Disabled</h2>
                <p className="text-sm text-gray-500">Your account is currently offline. You won't be seen by seekers or hirers.</p>
              </div>
              <button 
                onClick={handleToggleAccount}
                className="w-full py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Power size={16} /> Enable Account
              </button>
            </motion.div>
          </div>
        )}
        {activeTab !== "shorts" && 
         activeTab !== "chat" && 
         !showCreateGig && 
         !isCreatingSeeker && 
         !isCreatingMarketItem && 
         !showProfile && (
          <header 
            className="fixed top-4 right-4 z-50 flex items-center gap-3"
            style={{ pointerEvents: showHeader ? 'auto' : 'none' }}
          >
            <motion.div
              className="flex items-center gap-3"
              initial={{ y: 0, opacity: 1 }}
              animate={{ 
                y: showHeader ? 0 : -80,
                opacity: showHeader ? 1 : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <motion.button
                className={`relative bg-white shadow-md hover:shadow-lg transition-all p-3 rounded-full flex items-center justify-center ${activeTab === "cwallet" ? "text-blue-600 font-bold" : "text-gray-700"} hover:text-blue-600`}
                onClick={() => setActiveTab("cwallet")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet size={24} />
              </motion.button>

              {/* Bell Notifications */}
              <motion.div
                className="relative cursor-pointer bg-white shadow-md hover:shadow-lg transition-all p-3 rounded-full flex items-center justify-center text-gray-700 hover:text-blue-600"
                animate={
                  hasUnread
                    ? {
                        rotate: [0, -15, 15, -15, 12, -12, 8, -8, 0],
                        scale: [1, 1.15, 0.95, 1.1, 1],
                        y: [0, -4, 2, -2, 0],
                      }
                    : {}
                }
                transition={
                  hasUnread
                    ? {
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 1.5,
                        ease: "easeInOut",
                      }
                    : { duration: 0.3 }
                }
                onClick={() => setActiveTab(activeTab === "bell" ? "home" : "bell")}
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </motion.div>

              {/* Top Options Menu */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowTopMenu(!showTopMenu)}
                  className="relative transition-all rounded-full flex items-center justify-center focus:outline-none"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md bg-white flex items-center justify-center">
                      {userProfilePic ? (
                        <img 
                          src={userProfilePic} 
                          alt="User" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User size={20} className="text-gray-400" />
                      )}
                    </div>
                    {isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-black text-white p-0.5 rounded-full border border-white shadow-sm z-10">
                        <CheckCircle2 size={10} />
                      </div>
                    )}
                  </div>
                </motion.button>

                {showTopMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowTopMenu(false)}
                    ></div>
                    <div className="absolute top-14 right-0 z-50 bg-white rounded-xl shadow-xl w-48 border border-gray-100 overflow-hidden transform origin-top-right transition-all">
                      <button
                        onClick={() => {
                          setShowTopMenu(false);
                          setShowTop20Seekers(true);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-semibold text-yellow-600 hover:bg-yellow-50 flex items-center gap-2"
                      >
                        <Crown size={16} className="text-yellow-500 animate-pulse" /> Top 20 Seekers
                      </button>
                      <div className="h-[1px] bg-gray-100"></div>
                      <button
                        onClick={() => {
                          setShowTopMenu(false);
                          setActiveTab("user");
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <User size={16} /> Profile
                      </button>
                      <div className="h-[1px] bg-gray-100"></div>
                      {userData?.email === "21lucihanomatthews@gmail.com" && (
                        <button
                          onClick={() => {
                            setShowTopMenu(false);
                            setShowAdminDashboard(true);
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Shield size={16} /> Admin Dashboard
                          {pendingPayments.length > 0 && (
                            <span className="ml-auto bg-indigo-500 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                              {pendingPayments.length}
                            </span>
                          )}
                        </button>
                      )}
                      <div className="h-[1px] bg-gray-100"></div>
                      <button
                        onClick={() => {
                          setShowTopMenu(false);
                          setShowSettingsModal(true);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        Settings
                      </button>
                      <div className="h-[1px] bg-gray-100"></div>
                      <button
                        onClick={() => {
                          setShowTopMenu(false);
                          setShowHelp(true);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        Help & Support
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </header>
        )}

        <main 
          onScroll={handleScroll}
          className={`flex-grow overflow-y-auto relative z-10 ${
            activeTab === "chat" || activeTab === "user" ? "h-screen" : "p-4 pt-16 pb-24"
          } transition-all`}
        >
          {renderContent()}
        </main>

        {activeTab !== "chat" &&
          activeTab !== "user" &&
          activeTab !== "shorts" &&
          !showCreateGig &&
          !isCreatingSeeker &&
          !isCreatingMarketItem &&
          !showProfile &&
          !isTopUpActive && (
            <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 h-16 flex items-center justify-around px-2 shadow-lg z-30">
              <button
                onClick={() => setActiveTab("home")}
                className={`flex flex-col items-center justify-center p-2 transition-colors w-24 ${activeTab === "home" ? "text-blue-600 font-bold" : "text-gray-500"}`}
              >
                <Home size={24} />
                <span className="text-[9px] mt-0.5">Gigs</span>
              </button>

              <button
                onClick={() => setActiveTab("market")}
                className={`flex flex-col items-center justify-center p-2 transition-colors w-16 ${activeTab === "market" ? "text-indigo-600 font-bold" : "text-gray-500"}`}
              >
                <div className={`${activeTab === "market" ? "p-1.5 rounded-lg bg-indigo-50" : ""}`}>
                  <ShoppingBag size={22} className={activeTab === "market" ? "text-indigo-600" : ""} />
                </div>
                <span className="text-[9px] mt-0.5">Market</span>
              </button>

              <button
                onClick={() => setActiveTab("seekers")}
                className={`flex flex-col items-center justify-center p-2 transition-colors w-16 ${activeTab === "seekers" ? "text-blue-600 font-bold" : "text-gray-500"}`}
              >
                <Users size={22} />
                <span className="text-[9px] mt-0.5">Seekers</span>
              </button>

              <button
                onClick={() => setActiveTab("chat")}
                className={`flex flex-col items-center justify-center p-2 transition-colors w-16 ${activeTab === "chat" ? "text-blue-600 font-bold" : "text-gray-500"}`}
              >
                <MessageSquare size={22} />
                <span className="text-[9px] mt-0.5">Chat</span>
              </button>
            </footer>
          )}

        {/* Top 20 Candidates Board Overlay */}
        <Top20SeekersBoard
          isOpen={showTop20Seekers}
          onClose={() => setShowTop20Seekers(false)}
          onStartChat={handleStartChatFromSeeker}
          deductCoins={deductCoins}
          coinBalance={coinBalance}
        />

        {/* Apply to Gig Flow Overlay */}
        {applyGigState && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
              {applyGigState.stage === "permission-request" && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200">
                      <img
                        src={applyGigState.hirerAvatar}
                        alt="avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://ui-avatars.com/api/?name=" +
                            encodeURIComponent(applyGigState.hirerName) +
                            "&background=random";
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm">
                        Apply to "{applyGigState.gig.title}"
                      </h3>
                      <p className="text-xs text-slate-500">
                        Host: {applyGigState.hirerName}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col gap-3">
                    <div className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold">
                          Permission to share required
                        </p>
                        <p className="text-[10px] text-slate-500">
                          To apply, you need to grant {applyGigState.hirerName}{" "}
                          access to review your personal profile picture and
                          selected credentials.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={applyGigState.selectedDocs.cv}
                          onChange={(e) =>
                            setApplyGigState((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    selectedDocs: {
                                      ...prev.selectedDocs,
                                      cv: e.target.checked,
                                    },
                                  }
                                : null,
                            )
                          }
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-0"
                        />
                        <span>Curriculum Vitae (CV)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={applyGigState.selectedDocs.certificates}
                          onChange={(e) =>
                            setApplyGigState((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    selectedDocs: {
                                      ...prev.selectedDocs,
                                      certificates: e.target.checked,
                                    },
                                  }
                                : null,
                            )
                          }
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-0"
                        />
                        <span>Certifications / Portfolio</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={applyGigState.selectedDocs.idDocs}
                          onChange={(e) =>
                            setApplyGigState((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    selectedDocs: {
                                      ...prev.selectedDocs,
                                      idDocs: e.target.checked,
                                    },
                                  }
                                : null,
                            )
                          }
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-0"
                        />
                        <span>Verified ID Document</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setApplyGigState(null)}
                      className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        setApplyGigState((prev) =>
                          prev ? { ...prev, stage: "simulating-review" } : null,
                        )
                      }
                      className="flex-1 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition"
                    >
                      Authorize & Submit
                    </button>
                  </div>
                </>
              )}

              {applyGigState.stage === "simulating-review" && (
                <div className="flex flex-col items-center justify-center p-8 gap-4 text-center">
                  <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                  <div>
                    <h3 className="font-bold text-sm">Application Sent!</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Waiting for {applyGigState.hirerName} to review your
                      documents...
                    </p>
                  </div>
                  <div className="mt-4 flex gap-3 w-full border-t border-slate-100 pt-4">
                    <div className="text-[10px] text-slate-400 w-full text-center mb-2">
                      [DEMO SIMULATION]: Choose Host Response
                    </div>
                  </div>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => handleApplyOutcome("reject")}
                      className="flex-1 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100"
                    >
                      Simulate: Reject
                    </button>
                    <button
                      onClick={() => handleApplyOutcome("approve")}
                      className="flex-1 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100"
                    >
                      Simulate: Approve
                    </button>
                  </div>
                </div>
              )}

              {applyGigState.stage === "decision-approved" && (
                <div className="flex flex-col items-center justify-center p-6 gap-4 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">
                      Application Approved!
                    </h3>
                    <p className="text-sm text-slate-600 mt-2">
                      {applyGigState.hirerName} has reviewed your credentials
                      and accepted your application for "
                      {applyGigState.gig.title}". You will be automatically
                      connected via chat!
                    </p>
                  </div>
                  <button
                    onClick={handleCloseApprovedFlow}
                    className="w-full mt-4 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                  >
                    Start Working & Chat
                  </button>
                </div>
              )}

              {applyGigState.stage === "decision-rejected" && (
                <div className="flex flex-col items-center justify-center p-6 gap-4 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">
                      Application Declined
                    </h3>
                    <p className="text-sm text-slate-600 mt-2">
                      Unfortunately, {applyGigState.hirerName} has chosen
                      another applicant for "{applyGigState.gig.title}". Your
                      shared documents have been securely purged from their
                      view.
                    </p>
                  </div>
                  <button
                    onClick={handleCloseRejectedFlow}
                    className="w-full mt-4 py-3 bg-slate-800 text-white font-bold text-sm rounded-xl hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition"
                  >
                    Close & View Other Gigs
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Host Review Application Overlay */}
        {reviewApplicationState && (
          <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2rem] overflow-hidden w-full max-w-md shadow-2xl flex flex-col border border-white/20"
            >
              {/* Header with Background Pattern/Color */}
              <div className="h-32 bg-indigo-600 relative flex items-end justify-center p-6">
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-tighter border border-white/20">
                  Application Review
                </div>
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl absolute -bottom-12 translate-y-0">
                  <img
                    src={reviewApplicationState.applicantAvatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="pt-16 pb-8 px-8 flex flex-col items-center">
                <h3 className="text-xl font-black text-gray-900 leading-tight">
                  {reviewApplicationState.applicantName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                    <Star size={10} fill="currentColor" />
                    4.8 Rating
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Local Seeker
                  </div>
                </div>

                <div className="w-full mt-6 space-y-4">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Applied For</p>
                    <p className="text-sm font-bold text-slate-800 text-center leading-tight">
                      {reviewApplicationState.gig.title}
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      if (reviewApplicationState) {
                        setDocumentViewerSeeker({
                          name: reviewApplicationState.applicantName,
                          avatar: reviewApplicationState.applicantAvatar,
                          role: "Gig Seeker",
                          rating: 4.8,
                          location: "Sandton, local",
                          memberSince: "Dec 2023",
                          documents: [
                            { id: '1', title: 'Professional Profile', type: 'Profile', url: '', status: 'Verified' },
                            { id: '2', title: 'Verified Identity', type: 'ID', url: 'https://images.unsplash.com/photo-1634733988138-bf2c3a2a13fa?w=800&q=80', status: 'Verified' },
                            { id: '3', title: 'Skills & Portfolio', type: 'Certification', url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80', status: 'Verified' },
                          ]
                        });
                        setIsDocumentViewerOpen(true);
                      }
                    }}
                    className="w-full p-4 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-2xl flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                        <ShieldCheck size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-blue-900 uppercase">Inspect Credentials</p>
                        <p className="text-[10px] text-blue-600 font-medium">3 Documents Shared Safely</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-blue-400 transform group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handleHostReviewOutcome("reject")}
                      className="py-4 bg-white border border-gray-200 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleHostReviewOutcome("approve")}
                      className="py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      Approve Seeker
                    </button>
                  </div>

                  <button
                    onClick={() => setReviewApplicationState(null)}
                    className="w-full py-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Decide Later
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Admin Dashboard Overlay */}
        {showAdminDashboard && userData?.email === "21lucihanomatthews@gmail.com" && (
          <div className="fixed inset-0 z-[120] bg-slate-900 overflow-y-auto">
            <div className="max-w-2xl mx-auto min-h-screen bg-slate-50 relative pb-20">
              <div className="bg-indigo-600 text-white p-6 pt-12 rounded-b-3xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-extrabold flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-indigo-200" /> Admin
                    Command
                  </h2>
                  <button
                    onClick={() => setShowAdminDashboard(false)}
                    className="p-2 bg-indigo-500 rounded-full hover:bg-indigo-400 text-white"
                  >
                    <X />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-indigo-700/50 p-4 rounded-2xl flex flex-col items-center justify-center">
                    <span className="text-xs text-indigo-200 font-semibold text-center uppercase tracking-wider">
                      Profit
                    </span>
                    <span className="text-xl font-black mt-1">
                      R{adminProfit.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div className="bg-indigo-700/50 p-4 rounded-2xl flex flex-col items-center justify-center">
                    <span className="text-xs text-indigo-200 font-semibold text-center uppercase tracking-wider">
                      Active
                    </span>
                    <span className="text-xl font-black mt-1">1,402</span>
                  </div>
                  <div className="bg-indigo-700/50 p-4 rounded-2xl flex flex-col items-center justify-center">
                    <span className="text-xs text-indigo-200 font-semibold text-center uppercase tracking-wider">
                      Visitors
                    </span>
                    <span className="text-xl font-black mt-1">5,892</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Admin Promotion Creation */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-6 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    Create Promotion
                  </h4>
                  <input
                    type="text"
                    placeholder="Enter promotion message"
                    id="promo-input"
                    className="w-full p-3 border border-slate-200 rounded-xl mb-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById(
                        "promo-input",
                      ) as HTMLInputElement;
                      if (input.value) {
                        addNotification(input.value, "home", "promotion");
                        input.value = "";
                        showToastNotification("Promotion created!", "success");
                      }
                    }}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition"
                  >
                    Send Promotion Notification
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  Pending Approvals
                  {pendingPayments.length > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                      {pendingPayments.length}
                    </span>
                  )}
                </h3>

                {pendingPayments.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-sm">No pending payments.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4"
                      >
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                          <img
                            src={payment.userAvatar}
                            alt="avatar"
                            className="w-12 h-12 rounded-full border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-slate-900 text-sm">
                                {payment.senderName}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mb-2">
                              Requested {payment.coins} Coins (R
                              {payment.price.toFixed(2)}) • Ref:{" "}
                              <span className="font-mono text-slate-600">
                                {payment.refString}
                              </span>
                            </p>

                            <button
                              onClick={() => setSelectedProofForReview(payment)}
                              className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800"
                            >
                              <ImageIcon className="w-4 h-4" /> View Proof
                              Document
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setPendingPayments(
                                pendingPayments.filter(
                                  (p) => p.id !== payment.id,
                                ),
                              );
                              showToastNotification(
                                "Payment rejected and purged.",
                                "error",
                              );
                            }}
                            className="h-10 px-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-xs hover:bg-red-100 transition"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              setAdminProfit((prev) => prev + payment.price);
                              setPendingPayments(
                                pendingPayments.filter(
                                  (p) => p.id !== payment.id,
                                ),
                              );
                              setCoinBalance((prev) => prev + payment.coins);
                              showToastNotification(
                                `Approved! ${payment.coins} coins credited to wallet.`,
                                "success",
                              );
                              addNotification(
                                `Your payment of R${payment.price.toFixed(2)} was approved! Credited ${payment.coins} coins to your wallet.`,
                                "cwallet",
                                "promotion",
                              );
                            }}
                            className="h-10 px-4 bg-green-500 text-white rounded-xl font-bold text-xs hover:bg-green-600 transition"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 pt-0">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-indigo-500" /> Global App
                  Background
                </h3>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Upload from Device
                    </label>
                    <div className="flex flex-col justify-center items-center border border-dashed border-slate-300 rounded-xl p-5 bg-slate-50 hover:bg-slate-100 transition relative mb-4">
                      <Upload className="w-8 h-8 text-indigo-500 mb-2 animate-bounce" />
                      <span className="text-xs font-bold text-slate-700">Choose Image File</span>
                      <span className="text-[9px] text-slate-400 mt-1">PNG, JPG or WebP</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setAppBackgroundUrl(event.target.result as string);
                                showToastNotification("Wallpaper set successfully!", "success");
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>

                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Wallpaper URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/wallpaper.jpg"
                      value={appBackgroundUrl}
                      onChange={(e) => setAppBackgroundUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Leave empty to remove wallpaper. Or upload/clear a file.
                    </p>
                  </div>
                  <div>
                    <label className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      <span>Background Blur</span>
                      <span className="text-indigo-600">
                        {appBackgroundBlur}px
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={appBackgroundBlur}
                      onChange={(e) =>
                        setAppBackgroundBlur(parseInt(e.target.value))
                      }
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Screen Proof View */}
        {selectedProofForReview && (
          <div className="fixed inset-0 z-[130] bg-black bg-opacity-95 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-slate-200 font-medium font-mono text-sm">
                Review: {selectedProofForReview.fileName}
              </h3>
              <button
                onClick={() => setSelectedProofForReview(null)}
                className="text-white p-2 hover:bg-slate-800 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
              <img
                src={selectedProofForReview.fileUrl}
                alt="Proof Document"
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              />
            </div>
            <div className="p-6 bg-slate-900 border-t border-slate-800 flex gap-4 justify-center">
              <button
                onClick={() => {
                  setPendingPayments(
                    pendingPayments.filter(
                      (p) => p.id !== selectedProofForReview.id,
                    ),
                  );
                  setSelectedProofForReview(null);
                  showToastNotification("Payment rejected.", "error");
                }}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg"
              >
                Reject Document
              </button>
              <button
                onClick={() => {
                  setAdminProfit((prev) => prev + selectedProofForReview.price);
                  setPendingPayments(
                    pendingPayments.filter(
                      (p) => p.id !== selectedProofForReview.id,
                    ),
                  );
                  setCoinBalance((prev) => prev + selectedProofForReview.coins);
                  showToastNotification(`Payment Approved!`, "success");
                  addNotification(
                    `Your payment of R${selectedProofForReview.price.toFixed(2)} was approved! Credited ${selectedProofForReview.coins} coins to your wallet.`,
                    "cwallet",
                    "promotion",
                  );
                  setSelectedProofForReview(null);
                }}
                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg"
              >
                Approve Document
              </button>
            </div>
          </div>
        )}

        {/* Referral Modal Overlay */}
        {showReferralModal && (
          <div className="fixed inset-0 z-[140] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-50 to-white -z-10" />
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                <Gift className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                You've Been Invited!
              </h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed px-2">
                Join the TimeGiG app via referral code{" "}
                <strong className="text-blue-600 tracking-wide">
                  {referralCode}
                </strong>{" "}
                and receive a welcome bonus of{" "}
                <strong className="text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded">
                  50 Coins!
                </strong>
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setCoinBalance((prev) => prev + 50);
                    setShowReferralModal(false);
                    showToastNotification(
                      "50 Coins added to your wallet!",
                      "success",
                    );
                    // Remove parameter from URL to prevent showing again on refresh
                    window.history.replaceState(
                      {},
                      document.title,
                      window.location.pathname,
                    );
                  }}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow shadow-blue-500/20 active:scale-[0.98]"
                >
                  Join & Claim 50 Coins
                </button>
                <button
                  onClick={() => {
                    setShowReferralModal(false);
                    window.history.replaceState(
                      {},
                      document.title,
                      window.location.pathname,
                    );
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition active:scale-[0.98]"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}

        {showSettingsModal && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-0 z-[150] bg-white flex flex-col"
          >
            <div className="flex-none p-6 border-b border-gray-100 flex items-center justify-between bg-white pt-12">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft size={24} className="text-gray-900" />
                </button>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  Settings
                </h2>
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">
                v1.0.4 - Secure
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-6">
                <div>
                   <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Preferences</h3>
                   <div className="flex items-center justify-between p-5 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                        <Bell size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          In-App Sounds
                        </h3>
                        <p className="text-[10px] text-gray-500 font-medium">
                          Notifications & Feedback
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`w-14 h-8 rounded-full transition-all relative ${soundEnabled ? "bg-blue-600 shadow-lg shadow-blue-200" : "bg-gray-200"}`}
                    >
                      <motion.div
                        initial={false}
                        animate={{ x: soundEnabled ? 26 : 4 }}
                        className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Notification Center</h3>
                   
                   <div className="bg-gray-50 rounded-[2rem] p-2 border border-gray-100 space-y-1">
                     {[
                       { key: 'market', label: 'Market Deals', desc: 'New items & price drops' },
                       { key: 'chat', label: 'Messages', desc: 'Alerts for new messages' },
                       { key: 'safety', label: 'Safety Alerts', desc: 'Trade & meeting verification' },
                       { key: 'wallet', label: 'C-Wallet', desc: 'Transactions & bonuses' }
                     ].map((item) => (
                       <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-50/50">
                          <div>
                            <p className="text-xs font-black text-gray-900">{item.label}</p>
                            <p className="text-[10px] text-gray-500 font-medium">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => setNotificationSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notificationSettings] }))}
                            className={`w-12 h-6 rounded-full transition-all relative ${notificationSettings[item.key as keyof typeof notificationSettings] ? "bg-indigo-600 shadow-lg shadow-indigo-100" : "bg-gray-200"}`}
                          >
                            <motion.div
                              initial={false}
                              animate={{ x: notificationSettings[item.key as keyof typeof notificationSettings] ? 26 : 2 }}
                              className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Support</h3>
                  <button
                    onClick={() => {
                      setShowSettingsModal(false);
                      setShowHelp(true);
                    }}
                    className="w-full flex items-center justify-between p-5 bg-white rounded-3xl border border-gray-100 hover:bg-gray-50 transition-all text-left shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <LifeBuoy size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          Help & Support
                        </h3>
                        <p className="text-[10px] text-gray-500 font-medium">
                          Guides, FAQ & Support
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                  </button>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Account Security</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-5 bg-red-50/50 rounded-3xl border border-red-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                          <Power size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-red-900 text-sm">
                            Disable Account
                          </h3>
                          <p className="text-[10px] text-red-500 font-medium">
                            Go offline temporarily
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleToggleAccount}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95"
                      >
                        Disable
                      </button>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-5 bg-white rounded-3xl border border-gray-100 hover:bg-gray-50 transition-all text-left shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                          <LogOut size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">
                            Logout
                          </h3>
                          <p className="text-[10px] text-gray-500 font-medium">
                            End secure session
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-center gap-2">
               <ShieldCheck size={14} className="text-blue-500" />
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                 Military Grade Encryption Active
               </span>
            </div>
          </motion.div>
        )}

        {/* Global Toast Notification */}
        {activeToast && (
          <div className="fixed top-20 inset-x-4 z-[110] flex justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl pointer-events-auto max-w-sm w-full ${
                activeToast.type === "success"
                  ? "bg-green-600 text-white"
                  : activeToast.type === "error"
                    ? "bg-red-600 text-white"
                    : "bg-blue-600 text-white"
              }`}
            >
              {activeToast.type === "success" && (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              )}
              {activeToast.type === "error" && (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              {activeToast.type === "info" && (
                <Bell className="w-5 h-5 shrink-0" />
              )}
              <span className="text-xs font-medium leading-relaxed">
                {activeToast.message}
              </span>
              <button
                onClick={() => setActiveToast(null)}
                className="ml-auto opacity-70 hover:opacity-100 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}

        {documentViewerSeeker && (
          <DocumentViewer 
            isOpen={isDocumentViewerOpen}
            onClose={() => setIsDocumentViewerOpen(false)}
            seeker={documentViewerSeeker}
            onApprove={reviewApplicationState ? () => {
              handleHostReviewOutcome("approve");
              setIsDocumentViewerOpen(false);
            } : undefined}
            onReject={reviewApplicationState ? () => {
              handleHostReviewOutcome("reject");
              setIsDocumentViewerOpen(false);
            } : undefined}
          />
        )}

        {meetingArrivalData && (
          <MeetingArrivalView 
            isOpen={isMeetingArrivalOpen}
            onClose={() => setIsMeetingArrivalOpen(false)}
            buyer={meetingArrivalData.buyer}
            seller={meetingArrivalData.seller}
            locationName={meetingArrivalData.locationName}
          />
        )}
      </div>
    </div>
  );
}
