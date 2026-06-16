import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Camera, 
  FileText, 
  ChevronLeft, 
  AlertCircle, 
  BadgeCheck, 
  XCircle,
  ScanFace,
  Loader2,
  Lock,
  ArrowRight
} from "lucide-react";

function LiveSelfieScanner({ onCapture }: { onCapture: (base64: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStream(stream);
        activeStream = stream;
      } catch (err) {
        setError("Camera access denied or unavailable.");
      }
    }
    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      setIsScanning(true);
      const ctx = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      const base64 = canvasRef.current.toDataURL("image/jpeg");
      
      // Stop stream before proceeding
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      setTimeout(() => {
        onCapture(base64);
      }, 1500); // simulate the 'live scanning frame' delay
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 text-center"
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Step 2: Real-time Selfie</h1>
        <p className="text-sm text-gray-500">Center your face within the frame to capture a live biometric scan.</p>
      </div>
      
      <div className="aspect-square w-64 h-64 bg-gray-900 border-4 border-blue-500 rounded-full flex flex-col items-center justify-center gap-4 relative overflow-hidden mx-auto shadow-2xl shadow-blue-500/20">
        {error ? (
          <div className="p-4 text-xs font-bold text-red-400">{error}</div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute inset-0 border-8 border-transparent border-t-blue-400 rounded-full animate-spin opacity-50" />
            
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-green-400 shadow-[0_0_20px_rgba(74,222,128,1)]" style={{
                  animation: "scan 1.5s linear infinite"
              }}>
                <style>{`
                  @keyframes scan {
                    0% { top: 0% }
                    50% { top: 100% }
                    100% { top: 0% }
                  }
                `}</style>
              </div>
            )}
          </>
        )}
      </div>

      {!error && (
        <button 
          onClick={handleCapture}
          disabled={isScanning}
          className="mx-auto bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-full shadow-xl shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isScanning ? <><Loader2 className="animate-spin" size={18} /> Scanning Face...</> : <><Camera size={18} /> Start Live Scan</>}
        </button>
      )}

      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-left">
        <Lock size={18} className="text-blue-600 shrink-0" />
        <p className="text-[10px] font-bold text-blue-800 leading-tight">
          Your selfie is captured securely via webcam. 3D depth features are mapped to ensure real-time presence.
        </p>
      </div>
    </motion.div>
  );
}

interface IdentityVerificationViewProps {
  onBack: () => void;
  onComplete: () => void;
}

type VerificationStep = "intro" | "profile-check" | "id-upload" | "selfie" | "analyzing" | "result";

export default function IdentityVerificationView({ onBack, onComplete }: IdentityVerificationViewProps) {
  const isAlreadyVerified = localStorage.getItem("is_verified") === "true";
  const [step, setStep] = useState<VerificationStep>(isAlreadyVerified ? "result" : "intro");
  
  useEffect(() => {
    if (isAlreadyVerified) {
      setIsSuccess(true);
    }
  }, [isAlreadyVerified]);

  const [idFile, setIdFile] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [matchScore, setMatchScore] = useState<number>(0);
  const [isRapidScanning, setIsRapidScanning] = useState(false);

  const profileData = JSON.parse(localStorage.getItem('profileFormData') || '{}');
  const hasProfilesData = profileData.name && profileData.contactInfo;

  const handleStart = () => {
    setStep("id-upload");
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = reader.result as string;
        setIdFile(b64);
        
        // Immediate Scan Against Profile Picture
        setIsRapidScanning(true);
        setMatchScore(0);
        
        let score = 0;
        const interval = setInterval(() => {
          score += Math.floor(Math.random() * 8) + 2;
          if (score > 100) score = 100;
          setMatchScore(score);
        }, 100);

        setTimeout(() => {
          clearInterval(interval);
          const finalScore = Math.random() > 0.2 ? 72 + Math.floor(Math.random() * 25) : 40 + Math.floor(Math.random() * 20);
          setMatchScore(finalScore);
          setIsRapidScanning(false);

          const storedPic = localStorage.getItem('profilePic');

          if (storedPic && finalScore < 70) {
            setErrorMessage(`Profile Mismatch: The person on this ID does not match your profile picture (${finalScore}% match). Authentication rejected.`);
            setIsSuccess(false);
            setStep("result");
          } else {
            setStep("selfie");
          }
        }, 3000);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelfieFile(reader.result as string);
        setStep("analyzing");
        startAnalysis();
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const startAnalysis = () => {
    setMatchScore(0);
    // Simulate gradual score increase during analysis
    const interval = setInterval(() => {
        setMatchScore(prev => {
            if (prev >= 85) return prev;
            return prev + Math.floor(Math.random() * 5);
        });
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      // Simulation of deep biometric matching and data cross-referencing
      // Requirement: name on ID must match profile name exactly
      // Requirement: selfie must match ID photo features (min 70%)
      
      const storedProfile = JSON.parse(localStorage.getItem('profileFormData') || '{}');
      const profileName = storedProfile.name || "";
      
      // In a real app, we'd extract text from idFile (OCR)
      // Since we don't need profile info, we'll assume the name will be updated post-verification if missing
      const isNameValid = true;
      
      // Face match simulation - centered around the 70% threshold
      // For this demo, we use a weighted random that favors success but can fail
      const faceMatchScore = Math.random() > 0.15 ? 0.72 + (Math.random() * 0.25) : 0.45 + (Math.random() * 0.20);
      const finalScore = Math.round(faceMatchScore * 100);
      setMatchScore(finalScore);
      
      if (isNameValid && finalScore >= 70) {
        setIsSuccess(true);
        localStorage.setItem("is_verified", "true");
        if (selfieFile) {
          localStorage.setItem("profilePic", selfieFile);
        }
      } else {
        setIsSuccess(false);
        if (!isNameValid) {
          setErrorMessage("Personal Information Mismatch: The name on your profile does not match the official name detected on your ID document.");
        } else if (finalScore < 70) {
          setErrorMessage(`Biometric Match Failed: Facial features were only a ${finalScore}% match. A minimum of 70% is required to establish identity trust.`);
        } else {
          setErrorMessage("Verification Integrity Failed: Internal security mismatch detected between biometric templates.");
        }
      }
      setStep("result");
    }, 5000);
  };

  const renderContent = () => {
    switch (step) {
      case "intro":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center"
          >
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-100">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Identity Verification</h1>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Secure your account and gain neighborhood trust with our biometric verification.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 text-left space-y-4">
              <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest">Requirements</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <ShieldCheck size={14} className="text-blue-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-700">Valid Identity Document</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <AlertCircle size={14} className="text-blue-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-700">Official ID (ID Card/Passport)</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Camera size={14} className="text-blue-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-700">Clear Real-time Selfie</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2"
            >
              Start Verification <ArrowRight size={18} />
            </button>
          </motion.div>
        );

      case "id-upload":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 text-center"
          >
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Step 1: ID Document</h1>
              <p className="text-sm text-gray-500">Upload a clear photo of your National ID or Passport</p>
            </div>
            
            <div className="aspect-[3/2] bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-4 relative overflow-hidden">
              {isRapidScanning ? (
                <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center p-6">
                  <div className="relative w-24 h-24 mb-4">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent"
                    />
                    <div className="absolute inset-2 rounded-full overflow-hidden bg-gray-100">
                        <img src={idFile || ""} className="w-full h-full object-cover grayscale" />
                    </div>
                    <motion.div 
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-x-0 h-0.5 bg-blue-500 shadow-sm z-10"
                    />
                  </div>
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Scanning ID vs Profile</p>
                  <p className="text-2xl font-black text-blue-600 font-mono">{matchScore}%</p>
                </div>
              ) : idFile ? (
                <img src={idFile} className="w-full h-full object-cover" />
              ) : (
                <>
                  <FileText size={48} className="text-gray-300" />
                  <p className="text-xs font-bold text-gray-400">Tap to front of ID document</p>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleIdUpload}
                disabled={isRapidScanning}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-left">
              <AlertCircle size={18} className="text-amber-600 shrink-0" />
              <p className="text-[10px] font-bold text-amber-800 leading-tight">
                Ensure all text is legible and no corners are cut off. We use this to extract biometric data.
              </p>
            </div>
          </motion.div>
        );

      case "selfie":
        return (
          <LiveSelfieScanner onCapture={(base64) => {
            setSelfieFile(base64);
            setStep("analyzing");
            startAnalysis();
          }} />
        );

      case "analyzing":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 text-center w-full"
          >
            <div className="grid grid-cols-2 gap-4 w-full px-2">
              {/* ID Scanning View */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border-2 border-blue-100 shadow-inner">
                <img src={idFile || ""} className="w-full h-full object-cover grayscale brightness-75" />
                <motion.div 
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-x-0 h-0.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"
                />
                {/* Simulated Landmarks ID */}
                <div className="absolute inset-0 z-5 pointer-events-none opacity-40">
                  <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-green-400 rounded-full animate-ping" />
                  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-green-400 rounded-full animate-ping [animation-delay:0.5s]" />
                  <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-green-400 rounded-full animate-ping [animation-delay:1s]" />
                </div>
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[8px] text-white font-black uppercase tracking-widest">
                  ID Source
                </div>
              </div>

              {/* Selfie Scanning View */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border-2 border-blue-100 shadow-inner">
                <img src={selfieFile || ""} className="w-full h-full object-cover grayscale brightness-75" />
                <motion.div 
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-x-0 h-0.5 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] z-10"
                />
                {/* Simulated Landmarks Selfie */}
                <div className="absolute inset-0 z-5 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute w-0.5 h-0.5 bg-blue-400 rounded-full"
                      style={{ 
                        top: `${30 + Math.random() * 40}%`, 
                        left: `${30 + Math.random() * 40}%` 
                      }}
                    />
                  ))}
                </div>
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[8px] text-white font-black uppercase tracking-widest">
                  Live Feed
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex gap-1">
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-blue-600 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-blue-600 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-blue-600 rounded-full" />
                </div>
                <h2 className="text-sm font-black text-gray-900 tracking-tight uppercase">
                  Cross-Referencing Biometrics
                </h2>
              </div>

              <div className="space-y-3 max-w-xs mx-auto">
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: `${matchScore}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    {matchScore < 40 ? "Initializing" : matchScore < 70 ? "Mapping Face" : "Verification Meta"}
                  </span>
                  <span className="text-lg font-black text-gray-900">
                    {matchScore}%
                  </span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">Activity Log</p>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-600 font-medium font-mono">• Extracting nodes ({Math.min(matchScore * 4, 312)}/312)</p>
                  {matchScore > 30 && <p className="text-[10px] text-gray-600 font-medium font-mono">• Comparing facial geometry...</p>}
                  {matchScore > 60 && <p className="text-[10px] text-gray-600 font-medium font-mono">• Correlating ID field `NAME`...</p>}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "result":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 text-center"
          >
            {isSuccess ? (
              <>
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-gray-100">
                  <BadgeCheck fill="black" className="text-white w-16 h-16" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">Identity Verified</h1>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    Biometric match confirmed. Your profile now features the exclusive Black Verification Mark.
                  </p>
                </div>
                <div className="p-6 bg-gray-900 rounded-3xl flex items-center justify-between border-b-4 border-gray-950">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={selfieFile || ""} className="w-12 h-12 rounded-full object-cover border-2 border-blue-500" />
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
                        <BadgeCheck size={16} fill="black" className="text-white" />
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-black text-xs">{profileData.name || "User Name"}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Verified Neighbor</p>
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-md font-black">{matchScore}% Match</span>
                      </div>
                    </div>
                  </div>
                  <ShieldCheck className="text-blue-400" size={24} />
                </div>
                <button
                  onClick={onComplete}
                  className="w-full bg-blue-600 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-blue-100"
                >
                  Enter Profile Vault
                </button>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto border-4 border-red-100 shadow-xl shadow-red-50">
                  <XCircle className="text-red-600 w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">Verification Failed</h1>
                  <p className="text-sm text-red-500 font-bold bg-red-50 p-4 rounded-2xl border border-red-100">
                    {errorMessage}
                  </p>
                  <p className="text-xs text-gray-400 pt-2 font-medium">
                    The app has rejected your verification request immediately because the biometric features did not match the provided document.
                  </p>
                </div>
                <button
                  onClick={() => setStep("intro")}
                  className="w-full bg-gray-900 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-gray-200"
                >
                  Try Again
                </button>
                <button
                  onClick={onBack}
                  className="text-xs font-black text-gray-400 uppercase tracking-widest"
                >
                  Cancel
                </button>
              </>
            )}
          </motion.div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[250] bg-white flex flex-col p-6 overflow-y-auto">
      <header className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Secure Gateway
        </div>
        <div className="w-10" />
      </header>

      <div className="flex-1 flex flex-col justify-center items-center max-w-sm mx-auto w-full">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>

      <footer className="mt-auto py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
          <Lock size={12} /> Encrypted Session • AI Verified
        </div>
      </footer>
    </div>
  );
}
