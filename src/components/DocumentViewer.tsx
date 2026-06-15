import React from 'react';
import { X, ZoomIn, ZoomOut, Download, ShieldCheck, FileText, Calendar, MapPin, User, ArrowLeft, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DocumentInfo {
  id: string;
  title: string;
  type: 'ID' | 'Certification' | 'PoliceCheck' | 'Profile';
  url: string;
  issuer?: string;
  expiryDate?: string;
  status: 'Verified' | 'Pending' | 'Expired';
}

interface GigSeekerInfo {
  name: string;
  avatar: string;
  role: string;
  rating: number;
  location: string;
  memberSince: string;
  documents: DocumentInfo[];
}

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  seeker: GigSeekerInfo;
  initialDocId?: string;
  onApprove?: () => void;
  onReject?: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ isOpen, onClose, seeker, initialDocId, onApprove, onReject }) => {
  const [selectedDoc, setSelectedDoc] = React.useState<DocumentInfo | null>(
    seeker.documents.find(d => d.id === initialDocId) || seeker.documents[0]
  );
  const [scale, setScale] = React.useState(1);

  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(0.5, prev + delta), 3));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-gray-950 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 flex justify-between items-center bg-gray-900/50 backdrop-blur-xl border-b border-white/5 relative z-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
                id="close-viewer-btn"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <img src={seeker.avatar} className="w-10 h-10 rounded-full border-2 border-blue-500/30" alt="" />
                <div>
                  <h2 className="text-white font-black text-sm">{seeker.name} — <span className="text-blue-400">Verifications</span></h2>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <ShieldCheck size={12} className="text-blue-400" />
                    Secure Document Vault
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {onReject && (
                <button 
                  onClick={onReject}
                  className="p-2.5 px-5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition-all text-xs font-black uppercase tracking-widest border border-white/5"
                >
                  Decline
                </button>
              )}
              {onApprove && (
                <button 
                  onClick={onApprove}
                  className="p-2.5 px-5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-900/40"
                >
                  <ShieldCheck size={16} />
                  Approve Seeker
                </button>
              )}
              <div className="w-[1px] h-6 bg-white/10 mx-2" />
              <button 
                onClick={() => handleZoom(0.2)}
                className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <ZoomIn size={20} />
              </button>
              <button 
                onClick={() => handleZoom(-0.2)}
                className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <ZoomOut size={20} />
              </button>
              <div className="w-[1px] h-6 bg-white/10 mx-1" />
              <button className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-lg shadow-blue-900/20 px-4">
                <Download size={18} />
                Download
              </button>
            </div>
          </div>

          <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar with all documents */}
            <div className="w-full md:w-80 bg-gray-900/30 backdrop-blur-md border-r border-white/5 p-6 space-y-6 overflow-y-auto hidden md:block">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Worker Credential File</h3>
                <div className="space-y-2">
                  {seeker.documents.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => { setSelectedDoc(doc); setScale(1); }}
                      className={`w-full p-4 rounded-2xl flex items-center gap-3 border transition-all text-left ${
                        selectedDoc?.id === doc.id 
                          ? 'bg-blue-600/20 border-blue-500/50 text-white' 
                          : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedDoc?.id === doc.id ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                        {doc.type === 'ID' && <User size={18} />}
                        {doc.type === 'Certification' && <ShieldCheck size={18} />}
                        {doc.type === 'PoliceCheck' && <FileText size={18} />}
                        {doc.type === 'Profile' && <FileText size={18} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{doc.title}</p>
                        <p className="text-[9px] uppercase tracking-wider opacity-60 font-black mt-0.5">{doc.status}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Worker Context</h3>
                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-gray-300">
                      <MapPin size={16} className="text-blue-400" />
                      <p className="text-xs font-medium">{seeker.location}</p>
                   </div>
                   <div className="flex items-center gap-3 text-gray-300">
                      <Calendar size={16} className="text-blue-400" />
                      <p className="text-xs font-medium">Joined {seeker.memberSince}</p>
                   </div>
                   <div className="flex items-center gap-3 text-gray-300">
                      <ShieldCheck size={16} className="text-green-400" />
                      <p className="text-xs font-medium">Community Scram Filter Enabled</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Main Stage */}
            <div className="flex-grow bg-black relative overflow-hidden flex items-center justify-center p-4 md:p-12">
               <motion.div 
                 drag
                 dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                 style={{ scale }}
                 className="w-full max-w-4xl bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col origin-center cursor-grab active:cursor-grabbing"
               >
                 {selectedDoc?.type === 'Profile' ? (
                   <div className="p-12 space-y-8 bg-white min-h-[600px]">
                      <div className="flex justify-between items-start border-b border-gray-100 pb-10">
                        <div className="space-y-1">
                          <h1 className="text-5xl font-black text-gray-900 tracking-tight">{seeker.name}</h1>
                          <div className="flex items-center gap-3">
                            <p className="text-indigo-600 font-extrabold uppercase tracking-[0.2em] text-sm">{seeker.role}</p>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            <p className="text-gray-400 font-bold text-sm">{seeker.location}</p>
                          </div>
                        </div>
                        <div className="relative">
                          <img src={seeker.avatar} className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl rotate-3" alt="" />
                          <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
                            <ShieldCheck size={20} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-12">
                         <div className="col-span-3 space-y-10">
                            <section className="space-y-4">
                               <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Professional Summary</h4>
                               <p className="text-gray-600 text-base leading-relaxed font-medium">
                                  Expert-level service provider with extensive experience in local community gigs. Specializing in technical assembly, delivery logistics, and general home services. 
                                  Committed to safety and high-quality results. Peer-verified and background-checked for your peace of mind.
                               </p>
                            </section>

                            <section className="space-y-4">
                               <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Verified Skills</h4>
                               <div className="flex flex-wrap gap-2">
                                  {['Assembly', 'Maintenance', 'Technical', 'Logistics', 'Delivery'].map(skill => (
                                    <span key={skill} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[11px] font-bold text-gray-600 uppercase tracking-wider">{skill}</span>
                                  ))}
                               </div>
                            </section>
                         </div>

                         <div className="col-span-2 space-y-8 bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                            <section className="space-y-4">
                               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Community Statistics</h4>
                               <div className="space-y-4">
                                  <div className="flex justify-between items-center text-sm font-bold">
                                     <span className="text-gray-500 font-medium">Job Success</span>
                                     <span className="text-indigo-600">98%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                     <div className="bg-indigo-500 h-full w-[98%]" />
                                  </div>
                                  
                                  <div className="flex justify-between items-center text-sm font-bold">
                                     <span className="text-gray-500 font-medium">Rating</span>
                                     <span className="text-amber-500 flex items-center gap-1"><Star size={14} fill="currentColor" /> {seeker.rating}</span>
                                  </div>
                               </div>
                            </section>

                            <section className="pt-6 border-t border-gray-200 space-y-4">
                               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Status</h4>
                               <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex gap-4">
                                  <ShieldCheck size={24} className="text-green-600" />
                                  <div>
                                     <p className="text-xs font-black text-green-900 uppercase">Identity Verified</p>
                                     <p className="text-[10px] text-green-700 font-medium tracking-tight">Active Biometric Check</p>
                                  </div>
                               </div>
                            </section>
                         </div>
                      </div>

                      <div className="space-y-6 pt-4">
                         <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Work Showcase</h4>
                         <div className="grid grid-cols-4 gap-4">
                            <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&q=80" className="aspect-[4/3] object-cover rounded-2xl grayscale hover:grayscale-0 transition-all cursor-pointer shadow-sm hover:shadow-xl" alt="" />
                            <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500&q=80" className="aspect-[4/3] object-cover rounded-2xl grayscale hover:grayscale-0 transition-all cursor-pointer shadow-sm hover:shadow-xl" alt="" />
                            <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&q=80" className="aspect-[4/3] object-cover rounded-2xl grayscale hover:grayscale-0 transition-all cursor-pointer shadow-sm hover:shadow-xl" alt="" />
                            <img src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=500&q=80" className="aspect-[4/3] object-cover rounded-2xl grayscale hover:grayscale-0 transition-all cursor-pointer shadow-sm hover:shadow-xl" alt="" />
                         </div>
                      </div>
                   </div>
                 ) : (
                    <div className="relative aspect-[3/4] md:aspect-auto">
                       <img 
                         src={selectedDoc?.url} 
                         className="w-full h-auto" 
                         alt={selectedDoc?.title}
                         onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1634733988138-bf2c3a2a13fa?w=800&q=80';
                         }} 
                       />
                       {/* Watermark */}
                       <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 rotate-[-45deg]">
                          <span className="text-8xl font-black uppercase tracking-[0.5em] text-gray-900">VERIFIED COPY</span>
                       </div>
                    </div>
                 )}
               </motion.div>

               {/* Mobile selector bubble */}
               <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-gray-900/60 backdrop-blur-xl rounded-full border border-white/10 md:hidden overflow-x-auto max-w-[90vw] no-scrollbar">
                  {seeker.documents.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => { setSelectedDoc(doc); setScale(1); }}
                      className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-all ${
                        selectedDoc?.id === doc.id ? 'bg-blue-600 text-white animate-pulse' : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {doc.type === 'ID' && <User size={20} />}
                      {doc.type === 'Certification' && <ShieldCheck size={20} />}
                      {doc.type === 'PoliceCheck' && <FileText size={20} />}
                      {doc.type === 'Profile' && <FileText size={20} />}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DocumentViewer;
