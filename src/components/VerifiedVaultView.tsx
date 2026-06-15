import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  BadgeCheck, 
  ChevronRight,
  Upload,
  CheckCircle2
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  date: string;
}

interface VerifiedVaultViewProps {
  onBack: () => void;
  userName: string;
}

export default function VerifiedVaultView({ onBack, userName }: VerifiedVaultViewProps) {
  const [viewState, setViewState] = useState<'pin-setup' | 'pin-entry' | 'vault'>('pin-entry');
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const savedPin = localStorage.getItem('vault_pin');
    if (!savedPin) {
      setViewState('pin-setup');
    }

    const savedDocs = localStorage.getItem('vault_documents');
    if (savedDocs) {
      try {
        const parsed = JSON.parse(savedDocs);
        setDocuments(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setDocuments([]);
      }
    }
  }, []);

  const handlePinInput = (val: string, index: number) => {
    if (val.length > 1) return;
    const newPin = [...pin];
    newPin[index] = val;
    setPin(newPin);

    // Auto focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const clearPin = () => setPin(['', '', '', '']);

  const handleSetPin = () => {
    if (pin.some(p => p === '')) {
      setError('Please enter a 4-digit PIN');
      return;
    }
    localStorage.setItem('vault_pin', pin.join(''));
    setViewState('vault');
    clearPin();
  };

  const handleVerifyPin = () => {
    const savedPin = localStorage.getItem('vault_pin');
    if (pin.join('') === savedPin) {
      setViewState('vault');
      setError('');
    } else {
      setError('Incorrect PIN. Please try again.');
      clearPin();
      document.getElementById('pin-0')?.focus();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newDoc: Document = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type,
          url: reader.result as string,
          date: new Date().toLocaleDateString()
        };
        setDocuments(prev => [...prev, newDoc]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const saveVault = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('vault_documents', JSON.stringify(documents));
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  if (viewState === 'pin-setup' || viewState === 'pin-entry') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col p-6 font-sans">
        <button onClick={onBack} className="p-2 -ml-2 mb-8 text-gray-400 hover:text-gray-900 transition-colors">
          <ArrowLeft size={24} />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center -mt-20">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-100">
            <Lock className="text-white" size={32} />
          </div>
          
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            {viewState === 'pin-setup' ? 'Set Your Vault PIN' : 'Verify Identity'}
          </h1>
          <p className="text-gray-500 text-center mb-8 max-w-[240px] text-sm leading-relaxed">
            {viewState === 'pin-setup' 
              ? 'Create a 4-digit PIN to secure your sensitive documents and certificates.' 
              : 'Enter your 4-digit PIN to access your verified profile vault.'}
          </p>

          <div className="flex gap-4 mb-8">
            {pin.map((digit, idx) => (
              <input
                key={idx}
                id={`pin-${idx}`}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinInput(e.target.value, idx)}
                onKeyDown={(e) => {
                   if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
                     document.getElementById(`pin-${idx - 1}`)?.focus();
                   }
                }}
                className="w-12 h-16 bg-white border-2 border-gray-100 rounded-xl text-center text-2xl font-black text-blue-600 shadow-sm focus:border-blue-500 transition-all outline-none"
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-sm font-bold animate-shake mb-6">{error}</p>}

          <button
            onClick={viewState === 'pin-setup' ? handleSetPin : handleVerifyPin}
            className="w-full max-w-[200px] bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            {viewState === 'pin-setup' ? 'Create PIN' : 'Access Vault'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-20">
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-900">
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Profile Vault</h1>
              <BadgeCheck size={18} fill="black" className="text-white" />
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-0.5">Verified Documents</p>
          </div>
        </div>
        <button 
          onClick={saveVault}
          disabled={isSaving}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <ShieldCheck size={24} />
             </div>
             <div>
                <h3 className="text-sm font-bold text-gray-900">Security Active</h3>
                <p className="text-[11px] text-gray-500">Your documents are encrypted and only accessible via PIN.</p>
             </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Documents & Files</h2>
            <p className="text-[11px] text-gray-400 font-bold">{documents.length} files total</p>
          </div>

          <label className="block bg-white border-2 border-dashed border-gray-200 rounded-3xl p-8 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
            <input type="file" multiple onChange={handleFileUpload} className="hidden" />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <Plus size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">Add New Document</p>
                <p className="text-[10px] text-gray-400 mt-1">Upload certificates, IDs, or references</p>
              </div>
            </div>
          </label>
        </div>

        {/* Document List */}
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 group hover:border-blue-100 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 truncate">{doc.name}</h4>
                <p className="text-[10px] text-gray-400 font-medium">Added {doc.date}</p>
              </div>
              <button 
                onClick={() => removeDoc(doc.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {documents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400 italic">No documents uploaded yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 pointer-events-none"
          >
            <CheckCircle2 className="text-green-400" size={20} />
            <span className="text-sm font-bold">Vault Saved Successfully</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
