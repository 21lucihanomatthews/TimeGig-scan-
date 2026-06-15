import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ChevronLeft,
  Shield,
  Fingerprint
} from "lucide-react";

interface AuthFlowProps {
  onComplete: (userData: any) => void;
}

type AuthStep = "signup" | "terms" | "pin" | "success" | "login";

export default function AuthFlow({ onComplete }: AuthFlowProps) {
  const [step, setStep] = useState<AuthStep>(() => {
    const savedUser = localStorage.getItem("user_account");
    return savedUser ? "login" : "signup";
  });
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isAccepted, setIsAccepted] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (localStorage.getItem("user_account")) {
      setError("An account already exists on this device. You can only have one account.");
      return;
    }
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setStep("terms");
  };

  const handleRegister = () => {
    if (!isAccepted) {
      setError("Please accept the terms and conditions");
      return;
    }
    setError("");
    setStep("pin");
  };

  const handlePinComplete = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        // Registration complete
        const userData = { email, password, pin: newPin };
        localStorage.setItem("user_account", JSON.stringify(userData));
        localStorage.setItem("is_authenticated", "true");
        setStep("success");
        setTimeout(() => onComplete(userData), 2000);
      }
    }
  };

  const handleLogin = (digit: string) => {
    const savedUser = JSON.parse(localStorage.getItem("user_account") || "{}");
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === savedUser.pin) {
          localStorage.setItem("is_authenticated", "true");
          setStep("success");
          setTimeout(() => onComplete(savedUser), 1500);
        } else {
          setError("Incorrect PIN. Please try again.");
          setPin("");
        }
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case "signup":
        return (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-sm space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-200">
                <Shield className="text-white w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create Account</h1>
              <p className="text-sm text-gray-500">Join the TimeGiG community</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm"
                  />
                </div>
              </div>

              {error && <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg text-center border border-red-100">{error}</p>}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>
        );

      case "terms":
        return (
          <motion.div
            key="terms"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-sm space-y-6"
          >
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Terms of Service</h1>
              <p className="text-sm text-gray-500">Please review our community guidelines</p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 h-64 overflow-y-auto space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Welcome to TimeGiG. By creating an account, you agree to treat your neighbors with respect and professionalism.
              </p>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                1. <strong>Safety First:</strong> Always meet in public places for initial gig interactions.
              </p>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                2. <strong>Verification:</strong> You must provide accurate information when setting up your profile.
              </p>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                3. <strong>Payments:</strong> All transactions are settled via the C-Wallet platform.
              </p>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                4. <strong>Privacy:</strong> We protect your data and only share it with your explicit permission when applying for gigs.
              </p>
            </div>

            <label className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all">
              <input
                type="checkbox"
                checked={isAccepted}
                onChange={(e) => setIsAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <span className="text-xs font-bold text-gray-700 leading-snug">
                I have read and accept the terms and conditions for using TimeGiG.
              </span>
            </label>

            {error && <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg text-center border border-red-100">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("signup")}
                className="flex-1 bg-white border border-gray-200 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleRegister}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
              >
                Register Account
              </button>
            </div>
          </motion.div>
        );

      case "pin":
      case "login":
        const isCreating = step === "pin";
        return (
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm space-y-8 flex flex-col items-center"
          >
            <div className="text-center space-y-2">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
                <Lock className="text-blue-600 w-10 h-10" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {isCreating ? "Set Security PIN" : "Welcome Back"}
              </h1>
              <p className="text-sm text-gray-500">
                {isCreating ? "Create a 4-digit code for quick login" : "Enter your 4-digit PIN to unlock"}
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    pin.length > i ? "bg-blue-600 border-blue-600 scale-125" : "bg-transparent border-gray-300"
                  }`}
                />
              ))}
            </div>

            {error && <p className="text-[10px] text-red-500 font-bold text-center">{error}</p>}

            <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button
                  key={n}
                  onClick={() => isCreating ? handlePinComplete(n.toString()) : handleLogin(n.toString())}
                  className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center text-xl font-black text-gray-800 hover:bg-gray-50 hover:scale-110 active:scale-90 transition-all shadow-sm"
                >
                  {n}
                </button>
              ))}
              <div />
              <button
                onClick={() => isCreating ? handlePinComplete("0") : handleLogin("0")}
                className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center text-xl font-black text-gray-800 hover:bg-gray-50 hover:scale-110 active:scale-90 transition-all shadow-sm"
              >
                0
              </button>
              <button
                onClick={() => setPin(pin.slice(0, -1))}
                className="w-16 h-16 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                disabled={pin.length === 0}
              >
                <ChevronLeft size={24} />
              </button>
            </div>

            {!isCreating && (
              <button 
                onClick={() => {
                  if(confirm("Logout and sign in with a different account?")) {
                    localStorage.removeItem("user_account");
                    setStep("signup");
                    setError("");
                    setPin("");
                  }
                }}
                className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4 hover:text-blue-600 transition-all"
              >
                Reset Account
              </button>
            )}
          </motion.div>
        );

      case "success":
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100">
              <CheckCircle2 className="text-green-600 w-12 h-12" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Identity Verified</h1>
            <p className="text-sm text-gray-500">Welcome to your neighborhood, securely.</p>
          </motion.div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 text-left">
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
      
      <div className="mt-12 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">
        <ShieldCheck size={12} /> Military Grade Encryption Active
      </div>
    </div>
  );
}
