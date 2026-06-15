import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  History,
  CheckCircle2,
  X,
  CreditCard,
  Sparkles,
  Coins,
  UploadCloud,
  FileText,
  AlertCircle,
  Clock,
  Loader2,
  Check,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  location: string;
  avatar: string;
}

const CONTACTS: Contact[] = [
  {
    id: "sipho",
    name: "Sipho M.",
    location: "Sunninghill, JHB",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sipho",
  },
  {
    id: "lerato",
    name: "Lerato K.",
    location: "Soweto, JHB",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lerato",
  },
  {
    id: "arthur",
    name: "Arthur S.",
    location: "Green Point, CPT",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=arthur",
  },
  {
    id: "sarah",
    name: "Sarah D.",
    location: "Hatfield, PTA",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
  },
  {
    id: "jenny",
    name: "Jenny Y.",
    location: "Umhlanga, DBN",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jenny",
  },
];

interface Transaction {
  id: number;
  title: string;
  description: string;
  amount: number;
  currency: "ZAR" | "COINS";
  type: "deposit" | "withdraw" | "spend" | "purchase" | "pending";
  date: string;
}

interface CoinOption {
  id: number;
  name: string;
  coins: number;
  price: number;
  bonus?: string;
  popular?: boolean;
}

const coinOptionsList: CoinOption[] = [
  { id: 1, name: "Expire after 5 days", coins: 10, price: 3 },
  { id: 2, name: "Expire after 5 days", coins: 20, price: 5 },
  { id: 3, name: "Expire after 5 days", coins: 50, price: 10 },
  { id: 4, name: "Expire after 30 days", coins: 100, price: 15.99 },
  { id: 5, name: "Expire after 30 days", coins: 250, price: 19.99 },
  { id: 6, name: "Expire after 30 days", coins: 600, price: 29.99 },
];

const defaultTransactions: Transaction[] = [
  {
    id: 2,
    title: "Gig Priority Booster Boost",
    description: "Dog Walker listing spotlight fee",
    amount: -15,
    currency: "COINS",
    type: "spend",
    date: "Jun 13, 11:45 AM",
  },
  {
    id: 3,
    title: "Bank Transfer Deposit",
    description: "Direct cash topup",
    amount: 1500.0,
    currency: "ZAR",
    type: "deposit",
    date: "Jun 10, 04:15 PM",
  },
  {
    id: 4,
    title: "Platform Maintenance Fee",
    description: "Priority Gigs listings",
    amount: -90.0,
    currency: "ZAR",
    type: "withdraw",
    date: "Jun 08, 09:00 AM",
  },
];

export interface PaymentProofData {
  coins: number;
  price: number;
  senderName: string;
  userAvatar?: string;
  fileUrl: string;
  fileName: string;
  timestamp: number;
  id: string;
  refString: string;
}

export default function CwalletView({
  coinBalance,
  setCoinBalance,
  onSubmitPayment,
}: {
  coinBalance: number;
  setCoinBalance: React.Dispatch<React.SetStateAction<number>>;
  onSubmitPayment?: (payment: PaymentProofData) => void;
}) {
  const [balance, setBalance] = useState<number>(1500.0);
  const [transactions, setTransactions] =
    useState<Transaction[]>(defaultTransactions);
  const [notification, setNotification] = useState<string | null>(null);

  // Top Up Modal State
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpStep, setTopUpStep] = useState<
    "method" | "packages" | "bank_details" | "success"
  >("method");
  const [paymentGateway, setPaymentGateway] = useState<
    "bank_transfer" | "paystack"
  >("bank_transfer");
  const [selectedPackage, setSelectedPackage] = useState<CoinOption | null>(
    null,
  );

  // Drag & Drop / File upload State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    dataUrl: string;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Simulated Bank Transfer State

  // App-level Live Pending State
  const [pendingVerification, setPendingVerification] = useState<{
    coins: number;
    price: number;
    fileName: string;
  } | null>(null);

  // Coin Transfer Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");
  const [transferNote, setTransferNote] = useState("");
  const [transferError, setTransferError] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    // Load persisted configurations
    const savedBalance = localStorage.getItem("cwallet_balance");
    const savedCoins = localStorage.getItem("cwallet_coins");
    const savedTrans = localStorage.getItem("cwallet_transactions");
    const savedPending = localStorage.getItem("cwallet_pending_topup");

    if (savedBalance !== null) setBalance(parseFloat(savedBalance));
    if (savedCoins !== null) setCoinBalance(parseInt(savedCoins));
    if (savedTrans !== null) setTransactions(JSON.parse(savedTrans));
    if (savedPending !== null) setPendingVerification(JSON.parse(savedPending));
  }, []);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError("");

    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setTransferError("Please enter a valid number of coins.");
      return;
    }
    if (amount > coinBalance) {
      setTransferError(`You only have ${coinBalance} coins left.`);
      return;
    }
    if (!transferRecipient) {
      setTransferError("Please select a contact to transfer coins to.");
      return;
    }

    setIsTransferring(true);

    setTimeout(() => {
      const recipientContact = CONTACTS.find(
        (c) => c.id === transferRecipient,
      ) || { name: transferRecipient };
      const nextCoins = coinBalance - amount;

      const newTx: Transaction = {
        id: Date.now(),
        title: `Coins Sent`,
        description: `Transferred to ${recipientContact.name} ${transferNote ? `"${transferNote}"` : ""}`,
        amount: -amount,
        currency: "COINS",
        type: "spend",
        date:
          new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
          }) +
          ", " +
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
      };

      const updatedTrans = [newTx, ...transactions];
      setCoinBalance(nextCoins);
      setTransactions(updatedTrans);

      localStorage.setItem("cwallet_coins", nextCoins.toString());
      localStorage.setItem(
        "cwallet_transactions",
        JSON.stringify(updatedTrans),
      );

      setIsTransferring(false);
      setShowTransferModal(false);

      // Clear input fields
      setTransferAmount("");
      setTransferRecipient("");
      setTransferNote("");

      triggerNotification(
        `💸 Sent ${amount} Coins to ${recipientContact.name}!`,
      );
    }, 1500);
  };

  const updateCashState = (newBalance: number, newTrans: Transaction[]) => {
    setBalance(newBalance);
    setTransactions(newTrans);
    localStorage.setItem("cwallet_balance", newBalance.toFixed(2));
    localStorage.setItem("cwallet_transactions", JSON.stringify(newTrans));
  };

  const updateCoinState = (newCoins: number, newTrans: Transaction[]) => {
    setCoinBalance(newCoins);
    setTransactions(newTrans);
    localStorage.setItem("cwallet_coins", newCoins.toString());
    localStorage.setItem("cwallet_transactions", JSON.stringify(newTrans));
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setIsUploading(true);
    setUploadProgress(10);

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const displaySize =
      parseFloat(sizeInMB) < 0.1
        ? `${(file.size / 1024).toFixed(0)} KB`
        : `${sizeInMB} MB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setSelectedFile({ name: file.name, size: displaySize, dataUrl });
            return 100;
          }
          return prev + 30;
        });
      }, 200);
    };
    reader.readAsDataURL(file);
  };

  // Core Submit Handler
  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || !selectedFile) return;

    // Create a pending review layout configuration
    const pendingData = {
      coins: selectedPackage.coins,
      price: selectedPackage.price,
      fileName: selectedFile.name,
    };

    if (onSubmitPayment) {
      onSubmitPayment({
        id: Date.now().toString(),
        coins: selectedPackage.coins,
        price: selectedPackage.price,
        senderName: "Lucihano Matthews",
        userAvatar:
          "https://ui-avatars.com/api/?name=Lucihano+Matthews&background=random",
        fileUrl: selectedFile.dataUrl,
        fileName: selectedFile.name,
        timestamp: Date.now(),
        refString: `${selectedPackage.coins}c R${selectedPackage.price.toFixed(2).replace(".", ",").replace(",00", "")}`,
      });
    }

    setPendingVerification(pendingData);
    localStorage.setItem("cwallet_pending_topup", JSON.stringify(pendingData));

    // Append to transactions with type 'pending'
    const newTx: Transaction = {
      id: Date.now(),
      title: `Coin Topup: Unverified`,
      description: `Pending Review - ${selectedPackage.coins} Coins`,
      amount: selectedPackage.price,
      currency: "ZAR",
      type: "pending",
      date: "Now",
    };

    const updatedTrans = [newTx, ...transactions];
    setTransactions(updatedTrans);
    localStorage.setItem("cwallet_transactions", JSON.stringify(updatedTrans));

    // Proceed to Review summary page inside modal
    setTopUpStep("review");
  };

  // Close flow and schedule automatic simulation completion
  const handleCompleteReviewFlow = () => {
    setShowTopUpModal(false);

    // Reset modal steps
    setTimeout(() => {
      setTopUpStep("method");
      setSelectedPackage(null);
      setSelectedFile(null);
    }, 500);

    // Schedule verification mock server reply
    setTimeout(() => {
      if (pendingVerification) {
        const addedCoins = pendingVerification.coins;
        const finalCoins = coinBalance + addedCoins;

        // Remove pending status transaction, replace with deposit
        setTransactions((prev) => {
          const filtered = prev.filter((t) => t.type !== "pending");
          const finalTx: Transaction = {
            id: Date.now(),
            title: `Coin Pack Credited!`,
            description: `Transferred ${addedCoins} 🪙 to wallet`,
            amount: addedCoins,
            currency: "COINS",
            type: "deposit",
            date:
              new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
              }) +
              ", " +
              new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
          };
          const next = [finalTx, ...filtered];
          localStorage.setItem("cwallet_transactions", JSON.stringify(next));
          return next;
        });

        const newCoinVal = coinBalance + addedCoins;
        setCoinBalance(newCoinVal);
        localStorage.setItem("cwallet_coins", newCoinVal.toString());
        setPendingVerification(null);
        localStorage.removeItem("cwallet_pending_topup");

        triggerNotification(
          `🎉 Coin Top-up Verified! +${addedCoins} Coins successfully added!`,
        );
      }
    }, 7000);
  };

  const handleStartPaymentMethod = (method: "bank_transfer" | "paystack") => {
    if (method === "paystack") {
      // Paystack in progress warning
      alert(
        "Paystack integration is currently in process. Please select 'Bank Transfer' for direct manual confirmation!",
      );
      return;
    }
    setPaymentGateway(method);
    setTopUpStep("packages");
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pb-24 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-6 left-4 right-4 bg-gray-900 border border-blue-500/30 text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3"
          >
            <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
              <Sparkles size={18} />
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              {notification}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <CreditCard className="text-blue-600" /> C-Wallet
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Earn custom Gigs, load tokens and manage balances
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded-full">
          <Coins className="text-yellow-600" size={14} />
          <span className="text-xs font-extrabold text-yellow-800">
            {coinBalance} 🪙
          </span>
        </div>
      </div>

      {/* Real-time pending validation banner */}
      {pendingVerification && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 flex gap-3 text-yellow-800"
        >
          <Clock
            className="text-yellow-600 shrink-0 mt-0.5 animate-spin"
            size={18}
          />
          <div className="flex-1">
            <h4 className="text-xs font-extrabold text-yellow-900">
              Purchase Under Verification
            </h4>
            <p className="text-[10px] text-yellow-700 mt-0.5 leading-relaxed">
              We are verifying bank receipt for{" "}
              <strong>{pendingVerification.coins} Coins</strong>. Typically
              verified automatically in 15 mins.
            </p>
          </div>
        </motion.div>
      )}

      {/* Futuristic Balance Card featuring Coins focus */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="relative bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 text-white p-6 rounded-3xl overflow-hidden shadow-2xl border border-white/5"
      >
        <div className="absolute -right-10 -top-10 w-36 h-36 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-blue-200 uppercase font-mono tracking-widest font-bold">
                Standard Coin Balance
              </p>
              <h2 className="text-4xl font-black mt-1.5 flex items-center gap-2">
                <Coins
                  className="text-yellow-400 drop-shadow-[0_4px_10px_rgba(234,179,8,0.3)] shrink-0 animate-pulse"
                  size={32}
                />
                {coinBalance}{" "}
                <span className="text-xs font-bold font-mono text-gray-300">
                  🪙
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={() => setShowTopUpModal(true)}
            className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg hover:shadow-yellow-500/20 active:scale-95 transition-all"
          >
            <PlusCircle size={15} /> Top up Coins
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center text-xs">
          <span className="text-gray-400 font-mono">ID: SEC-3984-COIN</span>
          <span className="bg-green-500/10 text-green-400 font-mono px-2.5 py-0.5 rounded-full border border-green-500/20 text-[10px]">
            ● Verified Wallet
          </span>
        </div>
      </motion.div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={() => setShowTransferModal(true)}
          className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer active:scale-95 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Send
              size={18}
              className="translate-x-0.5 -translate-y-0.5 rotate-[15deg]"
            />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-mono font-medium uppercase tracking-wider">
              Coin Transfer
            </p>
            <p className="text-xs font-bold text-gray-700">Send to Neighbors</p>
          </div>
        </div>
        <div
          onClick={() =>
            triggerNotification(
              "💡 Note: Daily login rewards credit 5 free Coins every 24 hours!",
            )
          }
          className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-mono font-medium uppercase tracking-wider">
              Daily Streaks
            </p>
            <p className="text-xs font-bold text-gray-700">Check Rewards</p>
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <History size={16} className="text-gray-400" /> Recent Transactions
          </h3>
          <span className="text-[10px] uppercase font-mono text-gray-400">
            Priced in Coins
          </span>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => {
            const isNegative = tx.amount < 0;
            const isPending = tx.type === "pending";
            return (
              <div
                key={tx.id}
                className={`bg-white p-4 rounded-2xl border transition-all ${
                  isPending
                    ? "border-yellow-200 bg-yellow-50/20"
                    : "border-gray-100 hover:shadow-sm"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isPending
                          ? "bg-yellow-50 text-yellow-600 animate-pulse"
                          : tx.currency === "COINS"
                            ? "bg-yellow-50 text-yellow-600"
                            : tx.amount < 0
                              ? "bg-red-50 text-red-600"
                              : "bg-green-50 text-green-600"
                      }`}
                    >
                      {isPending ? (
                        <Clock size={16} />
                      ) : tx.currency === "COINS" ? (
                        <Coins size={16} />
                      ) : tx.amount < 0 ? (
                        <ArrowUpRight size={18} />
                      ) : (
                        <ArrowDownLeft size={18} />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">
                        {tx.title}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">
                        {tx.description}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">
                        {tx.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-sm font-black font-mono ${
                        isPending
                          ? "text-yellow-600"
                          : tx.currency === "COINS"
                            ? isNegative
                              ? "text-gray-900"
                              : "text-yellow-600"
                            : isNegative
                              ? "text-gray-900"
                              : "text-green-650"
                      }`}
                    >
                      {isPending ? "" : isNegative ? "" : "+"}
                      {tx.currency === "ZAR" ? "R" : ""}
                      {Math.abs(tx.amount).toFixed(
                        tx.currency === "ZAR" ? 2 : 0,
                      )}
                      <span className="text-[10px] font-bold font-sans tracking-wide ml-1">
                        {tx.currency === "ZAR" ? "ZAR" : "🪙"}
                      </span>
                    </p>
                    {isPending && (
                      <span className="text-[9px] font-mono uppercase bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded ml-auto inline-block mt-1 font-bold">
                        Under Review
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main interactive Coins purchase Modal */}
      <AnimatePresence>
        {showTopUpModal && (
          <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ y: 150, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 150, opacity: 0 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm shadow-2xl relative space-y-6 max-h-[85vh] overflow-y-auto scrollbar-hide"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowTopUpModal(false);
                  setTopUpStep("method");
                  setSelectedPackage(null);
                  setSelectedFile(null);
                }}
                className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition"
              >
                <X size={20} />
              </button>

              {/* Step 1: Choose Gateway (Paystack vs Bank Transfer) */}
              {topUpStep === "method" && (
                <div className="space-y-4 pt-2">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2.5">
                      <PlusCircle size={24} />
                    </div>
                    <h3 className="font-extrabold text-lg text-gray-900">
                      Buy C-Wallet Coins
                    </h3>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">
                      Choose your preferred automatic secure payment gateway
                      provider
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => handleStartPaymentMethod("bank_transfer")}
                      className="w-full p-4 rounded-2xl border-2 border-blue-500 hover:bg-blue-50/50 transition-all flex justify-between items-center relative text-left"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-gray-950">
                            Bank Transfer
                          </span>
                          <span className="bg-blue-100 text-blue-700 text-[9px] px-2 py-0.5 rounded-full font-bold">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Pay manually of choice & upload transfer receipt
                          document
                        </p>
                      </div>
                      <ChevronRight
                        className="text-blue-500 shrink-0"
                        size={18}
                      />
                    </button>

                    <button
                      onClick={() => handleStartPaymentMethod("paystack")}
                      className="w-full p-4 rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-slate-50 transition-all flex justify-between items-center text-left opacity-80 group"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-gray-500">
                            Paystack Checkout
                          </span>
                          <span className="bg-amber-100 text-amber-800 text-[8px] px-2 py-0.5 rounded-full font-bold">
                            In Integration Process
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Secure instant token card payments - currently
                          processing
                        </p>
                      </div>
                      <ChevronRight
                        className="text-gray-300 group-hover:text-blue-500 shrink-0"
                        size={18}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: 6 Coin Package Options */}
              {topUpStep === "packages" && (
                <div className="space-y-4 pt-2">
                  <div className="text-center">
                    <h3 className="font-extrabold text-lg text-gray-900 flex items-center justify-center gap-2">
                      <Coins className="text-yellow-500" size={20} /> Select
                      Coin Package
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Get special bonus coins with premium master packs
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 max-h-[350px] overflow-y-auto pr-1">
                    {coinOptionsList.map((option) => (
                      <div
                        key={option.id}
                        onClick={() => {
                          setSelectedPackage(option);
                          setTopUpStep("bank_details");
                        }}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between text-left relative overflow-hidden ${
                          option.popular
                            ? "border-yellow-500 bg-yellow-50/20 shadow-[0_4px_12px_rgba(234,179,8,0.1)]"
                            : "border-slate-100 hover:border-blue-400 bg-white"
                        }`}
                      >
                        {option.popular && (
                          <div className="absolute right-[-18px] top-[10px] rotate-45 bg-yellow-500 text-slate-950 font-black text-[7px] py-0.5 px-4 uppercase tracking-wider">
                            Popular
                          </div>
                        )}
                        <div>
                          <p
                            className={`text-[9px] font-bold tracking-wide uppercase ${option.popular ? "text-yellow-700" : "text-slate-400"}`}
                          >
                            {option.name}
                          </p>
                          <h4 className="text-xl font-black text-gray-900 mt-1 leading-tight">
                            {option.coins}{" "}
                            <span className="text-xs font-bold text-gray-400">
                              🪙
                            </span>
                          </h4>
                        </div>
                        <div className="mt-4 pt-2 border-t border-slate-50 flex items-end justify-between">
                          <span className="text-sm font-black text-blue-600">
                            R
                            {option.price
                              .toFixed(2)
                              .replace(".", ",")
                              .replace(",00", "")}
                          </span>
                          {option.bonus && (
                            <span
                              className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                                option.popular
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {option.bonus}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setTopUpStep("method")}
                    className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 py-1"
                  >
                    ← Back to Payment Methods
                  </button>
                </div>
              )}

              {/* Step 3: Bank Details Transfer & File Drop Upload */}
              {topUpStep === "bank_details" && selectedPackage && (
                <form onSubmit={handleSubmitProof} className="space-y-4 pt-1">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">
                      Initiate Bank Transfer
                    </h3>
                    <p className="text-xs text-gray-400">
                      Please send total of{" "}
                      <strong className="text-blue-600">
                        R
                        {selectedPackage.price
                          .toFixed(2)
                          .replace(".", ",")
                          .replace(",00", "")}{" "}
                        ZAR
                      </strong>{" "}
                      for{" "}
                      <strong className="text-yellow-600">
                        {selectedPackage.coins} Coins
                      </strong>{" "}
                      to account below:
                    </p>
                  </div>

                  {/* Account detail card */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/5 rounded-full pointer-events-none" />
                    <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                      <span className="text-gray-400 font-medium">
                        Bank Name:
                      </span>
                      <strong className="text-gray-800 text-right">
                        Capitec
                      </strong>
                      <span className="text-gray-400 font-medium">
                        Account Name:
                      </span>
                      <strong className="text-gray-800 text-right">
                        Matthews
                      </strong>
                      <span className="text-gray-400 font-medium font-mono">
                        Account No:
                      </span>
                      <strong className="text-gray-800 text-right tracking-wider select-all font-mono font-bold">
                        1334067366
                      </strong>
                      <span className="text-gray-400 font-medium font-mono">
                        Branch Code:
                      </span>
                      <strong className="text-gray-800 text-right font-mono font-bold">
                        470010
                      </strong>
                      <span className="text-gray-400 font-medium">
                        Ref String:
                      </span>
                      <strong className="text-blue-600 text-right font-mono font-bold select-all">
                        {selectedPackage.coins}c R
                        {selectedPackage.price
                          .toFixed(2)
                          .replace(".", ",")
                          .replace(",00", "")}
                      </strong>
                    </div>
                  </div>

                  {/* Drag and Drop Upload Zone */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-gray-500">
                      Upload Receipt Proof (PDF, JPG or PNG)
                    </label>

                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[120px] ${
                        dragActive
                          ? "border-blue-500 bg-blue-50/40 scale-[0.99]"
                          : selectedFile
                            ? "border-green-400 bg-green-50/10"
                            : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/20"
                      }`}
                    >
                      <input
                        id="receipt-file-uploader"
                        type="file"
                        required={!selectedFile}
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      <label
                        htmlFor="receipt-file-uploader"
                        className="w-full flex flex-col items-center justify-center cursor-pointer"
                      >
                        {isUploading ? (
                          <div className="space-y-2">
                            <Loader2
                              className="animate-spin text-blue-500 mx-auto"
                              size={24}
                            />
                            <p className="text-xs text-gray-500">
                              Uploading: {uploadProgress}%
                            </p>
                          </div>
                        ) : selectedFile ? (
                          <div className="space-y-1.5 text-center">
                            <div className="bg-transparent text-green-500 p-2 rounded-full inline-block">
                              <CheckCircle2 size={24} className="mx-auto" />
                            </div>
                            <p className="text-xs font-extrabold text-slate-800 line-clamp-1 max-w-[200px] mx-auto">
                              {selectedFile.name}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              {selectedFile.size} • Click to replace
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <UploadCloud
                              className="text-slate-400 mx-auto"
                              size={28}
                            />
                            <p className="text-xs font-bold text-slate-700">
                              Drag & Drop receipt or{" "}
                              <span className="text-blue-600 underline">
                                browse
                              </span>
                            </p>
                            <p className="text-[9px] text-gray-400 mt-1">
                              PDF, JPG or PNG up to 5MB
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setTopUpStep("packages")}
                      className="w-1/3 p-3 bg-slate-150 hover:bg-slate-200 text-slate-600 text-xs font-extrabold rounded-2xl transition"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading || !selectedFile}
                      className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-2xl shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} /> Submit Proof of Payment
                    </button>
                  </div>
                </form>
              )}

              {/* Step 4: Verification Review Feedback Screen */}
              {topUpStep === "review" && selectedPackage && (
                <div className="space-y-5 py-4 text-center">
                  <div className="w-16 h-16 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <FileText size={28} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-extrabold text-xl text-slate-900 leading-tight">
                      Payment Proof Submitted
                    </h3>
                    <p className="text-xs text-slate-500 px-4 leading-relaxed">
                      Thanks for your manual bank transfer! Our compliance team
                      is currently reviewing your uploaded proof document.
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-w-sm mx-auto text-left space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">
                        Expected Coin Credit:
                      </span>
                      <strong className="text-yellow-600 font-extrabold">
                        +{selectedPackage.coins} Coins 🪙
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">
                        Price Incurred:
                      </span>
                      <strong className="text-slate-950">
                        R
                        {selectedPackage.price
                          .toFixed(2)
                          .replace(".", ",")
                          .replace(",00", "")}{" "}
                        ZAR
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">
                        Review ETA:
                      </span>
                      <strong className="text-blue-600">
                        Within 15 minutes
                      </strong>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={handleCompleteReviewFlow}
                      className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      Return to Coin Balance <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {showTransferModal && (
          <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ y: 150, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 150, opacity: 0 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm shadow-2xl relative space-y-5 max-h-[85vh] overflow-y-auto scrollbar-hide text-left"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setShowTransferModal(false);
                  setTransferError("");
                }}
                className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition"
              >
                <X size={20} />
              </button>

              <div className="text-center pb-2">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Send
                    size={22}
                    className="translate-x-0.5 -translate-y-0.5 rotate-[15deg]"
                  />
                </div>
                <h3 className="font-extrabold text-lg text-gray-900">
                  Transfer Coins
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Send standard coins directly to other South African neighbors
                </p>
              </div>

              <form onSubmit={handleTransferSubmit} className="space-y-4">
                {/* Select Recipient */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">
                    Select Recipient Neighbor
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    <select
                      value={transferRecipient}
                      onChange={(e) => setTransferRecipient(e.target.value)}
                      required
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl outline-none focus:ring-1.5 focus:ring-blue-500 bg-white"
                    >
                      <option value="">-- Choose local contact --</option>
                      {CONTACTS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.location})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Amount of Coins */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500">
                      Coins to Send
                    </label>
                    <span className="text-[10px] text-gray-400">
                      Available: {coinBalance} 🪙
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max={coinBalance}
                      placeholder="e.g. 15"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="w-full text-xs p-3 pr-10 border border-gray-200 rounded-xl outline-none focus:ring-1.5 focus:ring-blue-500 bg-white"
                    />
                    <div className="absolute right-3.5 top-3.5 text-gray-400 font-bold text-xs select-none">
                      🪙
                    </div>
                  </div>
                </div>

                {/* Optional Note */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">
                    Optional Note / Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Thank you for the dog walking!"
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl outline-none focus:ring-1.5 focus:ring-blue-500 bg-white"
                  />
                </div>

                {/* Error Banner */}
                {transferError && (
                  <div className="bg-red-50 border border-red-150 rounded-xl p-3 flex gap-2 text-red-700">
                    <AlertCircle
                      className="shrink-0 mt-0.5 text-red-500"
                      size={16}
                    />
                    <span className="text-[11px] font-medium leading-relaxed">
                      {transferError}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTransferModal(false);
                      setTransferError("");
                    }}
                    className="w-1/3 p-3 bg-slate-150 hover:bg-slate-200 text-slate-600 text-xs font-extrabold rounded-2xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isTransferring}
                    className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-2xl shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    {isTransferring ? (
                      <>
                        <Loader2 className="animate-spin" size={14} /> Doing
                        Transfer...
                      </>
                    ) : (
                      <>
                        <Check size={14} /> Send Transfer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
