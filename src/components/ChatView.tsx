import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Video as VideoIcon, MessageSquare, ShieldAlert, X, ShieldCheck, Camera, PhoneOff, Mic, Settings, MapPin, AlertTriangle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'other';
  type: 'text' | 'image' | 'video';
  fileUrl?: string;
  timestamp: string;
  senderAvatar?: string;
}

interface ChatViewProps {
  partner: { name: string; avatar: string };
  onBack: () => void;
  onViewProfile: () => void;
  onViewDocuments: () => void;
  onMeetingConfirmed: () => void;
  soundEnabled: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ 
  partner,
  onBack, 
  onViewProfile, 
  onViewDocuments, 
  onMeetingConfirmed, 
  soundEnabled 
}) => {
  const chatKey = `chat_messages_${partner.name.replace(/\s+/g, '_')}`;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingFile, setPendingFile] = useState<{type: 'image' | 'video', url: string} | null>(null);
  const [showSecurityPrompt, setShowSecurityPrompt] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'active'>('connecting');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const partnerVideoRef = useRef<HTMLVideoElement>(null);

  const emojis = ['😊', '😂', '😍', '👍', '🔥', '🎉', '🙌', '😎', '😜', '💖', '🤔'];

  const MEETING_KEYWORDS = [
    'meet', 'location', 'address', 'see you', 'pick up', 'drop off', 
    'place', 'where', 'google map', 'coming', 'way', 'at the shop'
  ];

  useEffect(() => {
    const savedMessages = localStorage.getItem(chatKey);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      const globalStub = localStorage.getItem('chat_messages');
      if (globalStub && partner.name === 'Service Provider') {
        setMessages(JSON.parse(globalStub));
      } else {
        setMessages([]);
      }
    }
  }, [chatKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
        if (partnerVideoRef.current) partnerVideoRef.current.srcObject = stream;
        
        // After small delay, move from connecting to active
        setTimeout(() => setCallStatus('active'), 2000);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCallStatus('active'); // fallback to show UI even if camera fails
      }
    };

    if (showVideoCall) {
      startCamera();
    } else {
      // Stop all tracks when call ends
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      setCallStatus('connecting');
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showVideoCall]);

  useEffect(() => {
    if (localStream) {
      if (videoRef.current) videoRef.current.srcObject = localStream;
      if (callStatus === 'active' && partnerVideoRef.current) {
        partnerVideoRef.current.srcObject = localStream;
      }
    }
  }, [callStatus, localStream]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsCameraOff(!isCameraOff);
    }
  };

  const saveMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    const messagesToSave = newMessages.map(m => ({
      ...m,
      fileUrl: m.type === 'text' ? m.fileUrl : undefined
    }));
    localStorage.setItem(chatKey, JSON.stringify(messagesToSave));
  };

  const checkMeetingIntent = (text: string) => {
    const lowerText = text.toLowerCase();
    const hasKeyword = MEETING_KEYWORDS.some(kw => lowerText.includes(kw));
    if (hasKeyword) {
      setShowSecurityPrompt(true);
    }
  };

  const handleSendMessage = (type: 'text' | 'image' | 'video', fileUrl?: string, text = inputText) => {
    if (!text && !fileUrl) return;

    const newMessage: Message = {
      id: Date.now(),
      text: text,
      sender: 'user',
      type,
      fileUrl,
      timestamp: new Date().toLocaleTimeString(),
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    };

    saveMessages([...messages, newMessage]);
    
    if (type === 'text') {
      checkMeetingIntent(text);
    }

    setInputText('');
    setPendingFile(null); 
    setShowEmojiPicker(false);
    
    setTimeout(() => {
      const reply: Message = {
        id: Date.now() + 1,
        text: 'Received! Looking great.',
        sender: 'other',
        type: 'text',
        timestamp: new Date().toLocaleTimeString(),
        senderAvatar: partner.avatar,
      };
      saveMessages([...messages, newMessage, reply]);
      if (soundEnabled) {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
        audio.play().catch(() => {});
      }
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPendingFile({type, url});
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      <header className="px-4 py-2 border-b flex justify-between items-center bg-white/95 backdrop-blur-md sticky top-0 z-[100]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-blue-600 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onViewProfile}>
            <div className="relative shrink-0">
              <img 
                src={partner.avatar} 
                className="w-9 h-9 rounded-xl object-cover border border-slate-100 shadow-sm" 
                alt={partner.name} 
                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=random`; }}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-slate-900 leading-tight text-xs truncate max-w-[120px] tracking-tight">{partner.name}</h2>
              <div className="flex items-center gap-1">
                <ShieldCheck size={10} className="text-blue-500" />
                <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Trusted Neighbor</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button 
            onClick={onViewDocuments}
            className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-blue-600 transition-all active:scale-90"
            title="View Credentials"
          >
            <ShieldCheck size={18} />
          </button>
          <button 
            onClick={() => setShowVideoCall(true)}
            className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-all active:scale-90 shadow-sm shadow-blue-500/5"
          >
            <VideoIcon size={18} />
          </button>
        </div>
      </header>
      
      <div className="flex-grow p-4 overflow-y-auto space-y-4 no-scrollbar">
        {messages.map(msg => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
            {msg.sender === 'other' && <img src={msg.senderAvatar} alt="avatar" className="w-8 h-8 rounded-full border border-gray-100" onClick={onViewProfile} onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=U&background=random'; }} />}
            <div 
               className={`p-3 rounded-[20px] max-w-[80%] shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}
            >
              {msg.type === 'image' && (
                <img 
                  src={msg.fileUrl} 
                  alt="chat" 
                  className="max-w-full rounded-xl mb-1.5" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=300&q=80';
                  }}
                />
              )}
              {msg.type === 'video' && (
                <video src={msg.fileUrl} controls preload="metadata" className="max-w-full rounded-xl mb-1.5">
                    Your browser does not support the video tag.
                </video>
              )}
              <div className="text-sm font-medium leading-relaxed">
                {msg.text}
              </div>
              <div className={`text-[9px] mt-1 font-bold uppercase opacity-60 ${msg.sender === 'user' ? 'text-white' : 'text-gray-400'}`}>
                {msg.timestamp}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <AnimatePresence>
        {showSecurityPrompt && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-20 left-4 right-4 z-40"
          >
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 shadow-xl flex gap-3 items-start">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                <ShieldAlert size={20} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-black text-amber-900 uppercase tracking-widest">Meeting Detection</h3>
                  <button onClick={() => setShowSecurityPrompt(false)}><X size={14} className="text-amber-400" /></button>
                </div>
                <p className="text-[11px] text-amber-800 font-medium leading-tight">
                  You're setting up a meeting. To prevent scams, use <span className="font-bold">Neighbor Verification Call</span> and check documents.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setShowSecurityPrompt(false);
                        setShowVideoCall(true);
                      }}
                      className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-amber-700 transition-all active:scale-95"
                    >
                      Start Safety Call
                    </button>
                    <button 
                      onClick={() => {
                        setShowSecurityPrompt(false);
                        onViewDocuments();
                      }}
                      className="flex-1 py-2.5 bg-white border border-amber-200 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 transition-all active:scale-95"
                    >
                      View Documents
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      setShowSecurityPrompt(false);
                      onMeetingConfirmed();
                    }}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    Confirm Meeting & Arrive
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 border-t bg-white flex flex-col gap-2 relative z-10">
        <AnimatePresence>
          {pendingFile && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative p-2 bg-gray-50 rounded-2xl border border-gray-100 inline-block w-fit">
              {pendingFile.type === 'image' && <img src={pendingFile.url} alt="preview" className="h-20 rounded-xl" />}
              {pendingFile.type === 'video' && (
                <video src={pendingFile.url} controls preload="metadata" className="h-20 rounded-xl">
                  Your browser does not support the video tag.
                </video>
              )}
              <button onClick={() => setPendingFile(null)} className="absolute -top-2 -right-2 p-1.5 bg-white border shadow-md rounded-full text-red-500"><X size={12}/></button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {showEmojiPicker && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-2xl border mb-1">
            {emojis.map(e => (
              <button 
                key={e} 
                onClick={() => setInputText(prev => prev + e)}
                className="text-xl hover:scale-125 transition-transform"
              >
                {e}
              </button>
            ))}
            <button onClick={() => setShowEmojiPicker(false)} className="ml-auto text-gray-400 hover:text-gray-600"><X size={16}/></button>
          </motion.div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2">
             <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-lg grayscale hover:grayscale-0 transition-all">😊</button>
             <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Image size={20} /></button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, e.target.files?.[0].type.startsWith('video') ? 'video' : 'image')} />
          <div className="flex-grow relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage('text')}
              placeholder="Type your message..."
              className="w-full py-3 px-4 bg-gray-100 rounded-full text-sm outline-none focus:ring-1 focus:ring-blue-400 transition-all font-medium"
            />
          </div>
          <button 
            onClick={() => handleSendMessage(pendingFile?.type || 'text', pendingFile?.url)} 
            className={`p-3 rounded-full shadow-lg transition-all active:scale-90 ${inputText || pendingFile ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Full-Screen Video Call Simulation */}
      <AnimatePresence>
        {showVideoCall && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-between p-6 text-white overflow-hidden"
          >
            {/* Security Header */}
            <div className="w-full flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 bg-blue-600/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-400/30">
                <ShieldCheck size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Safety Check</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live</span>
              </div>
            </div>

            {/* Main Stream Area */}
            <div className="flex-grow flex flex-col items-center justify-center w-full relative">
              {/* Self View Floating Overlay - Visible only when call is active to avoid redundancy during connecting */}
              <AnimatePresence>
                {localStream && callStatus === 'active' && (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    drag
                    dragConstraints={{ left: -100, right: 100, top: -200, bottom: 200 }}
                    className="absolute top-6 right-6 w-32 h-48 bg-black rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl z-[110] cursor-move"
                  >
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                      <p className="text-[8px] font-black uppercase tracking-widest">You</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {callStatus === 'connecting' ? (
                  <motion.div 
                    key="connecting" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full relative flex items-center justify-center"
                  >
                    {/* User's own camera as background preview while connecting */}
                    <div className="absolute inset-0 bg-black">
                      <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover opacity-60"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                    </div>

                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-6 z-10"
                    >
                      <div className="relative">
                         <img src={partner.avatar} className="w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl" alt="" />
                         <motion.div 
                           animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                           transition={{ repeat: Infinity, duration: 2 }}
                           className="absolute inset-0 bg-blue-500 rounded-full"
                         />
                      </div>
                      <div className="text-center space-y-1">
                        <h3 className="text-xl font-black">{partner.name}</h3>
                        <p className="text-xs text-blue-400 font-bold uppercase tracking-[0.3em] animate-pulse">Connecting Safely...</p>
                      </div>

                      <div className="mt-8 bg-black/40 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 max-w-xs text-center">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5">Verification Tip</p>
                        <p className="text-[10px] text-gray-300 font-medium leading-tight">Your camera is active. Use this time to ensure you're in a well-lit area for a successful verification.</p>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full rounded-[40px] overflow-hidden bg-gray-800 relative shadow-2xl"
                  >
                    {/* Simulated Partner Video (Showing the camera for "seeing each other") */}
                    <div className="absolute inset-0">
                       <video 
                         ref={partnerVideoRef}
                         autoPlay 
                         playsInline 
                         className="w-full h-full object-cover"
                         style={{ transform: 'scaleX(-1)' }} // Mirror the partner view for simulation
                       />
                       {isCameraOff && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-md">
                            <img src={partner.avatar} className="w-48 h-48 rounded-full border-4 border-white shadow-2xl mb-4" alt="" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Camera is Off</p>
                         </div>
                       )}
                    </div>

                    {/* Location Badge (Simulated) */}
                    <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/10">
                       <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <MapPin size={18} />
                       </div>
                       <div>
                          <p className="text-[8px] text-gray-400 font-black uppercase">Verified Location</p>
                          <p className="text-[10px] font-bold">Within 50m of Meeting Point</p>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="w-full flex flex-col items-center gap-8 relative z-10">
              <div className="bg-amber-600/20 border border-amber-500/30 backdrop-blur-xl p-4 rounded-3xl max-w-sm flex gap-3 text-left">
                 <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                 <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Neighborhood Warning</p>
                    <p className="text-[9px] text-gray-300 font-medium leading-snug">Verify that the person in video matches their profile picture. If they refuse to show their face, cancel the meeting immediately.</p>
                 </div>
              </div>

              <div className="flex items-center gap-6">
                <button 
                  onClick={toggleMute}
                  className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all ${isMuted ? 'bg-red-600 border-red-500' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
                >
                  <Mic size={24} className={isMuted ? 'text-white' : ''} />
                </button>
                <button 
                  onClick={() => setShowVideoCall(false)}
                  className="w-20 h-20 rounded-[32px] bg-red-600 flex items-center justify-center shadow-xl shadow-red-900/40 hover:bg-red-700 transition-all active:scale-95"
                >
                  <PhoneOff size={32} />
                </button>
                <button 
                  onClick={toggleCamera}
                  className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all ${isCameraOff ? 'bg-red-600 border-red-500' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
                >
                  <Camera size={24} className={isCameraOff ? 'text-white' : ''} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest opacity-50">End call to return to chat</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatView;
