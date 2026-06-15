import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Lock, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';

interface PersonalProfileEditViewProps {
  onBack: () => void;
  onSubmit: () => void;
  onUnlock: () => void;
  onVerify: () => void;
  isLocked?: boolean;
}

interface FileWithPreview {
  file: File;
  previewUrl: string;
}

const PersonalProfileEditView: React.FC<PersonalProfileEditViewProps> = ({ onBack, onSubmit, onUnlock, onVerify, isLocked }) => {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [cv, setCv] = useState<FileWithPreview | null>(null);
  const [certificates, setCertificates] = useState<FileWithPreview[]>([]);
  const [idDocs, setIdDocs] = useState<FileWithPreview[]>([]);
  
  const [pin, setPin] = useState('');
  const [unlockPin, setUnlockPin] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    workExperience: '',
    preferences: '',
    contactInfo: '',
    skills: ''
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedPin = localStorage.getItem('profilePin');
    if (savedPin) {
      setPin(savedPin);
    }
    const savedData = localStorage.getItem('profileFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    const savedPic = localStorage.getItem('profilePic');
    if (savedPic) {
      setProfilePic(savedPic);
    }
    const verified = localStorage.getItem('is_verified') === 'true';
    setIsVerified(verified);

    const savedIdDocs = localStorage.getItem('profileIdDocs');
    if (savedIdDocs) {
      setIdDocsBase64(JSON.parse(savedIdDocs));
    }
  }, []);

  const [idDocsBase64, setIdDocsBase64] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanScore, setScanScore] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);
  
  const handleIdDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    if (e.target.files) {
      const filesArray = Array.from(e.target.files) as File[];
      const newBase64s: string[] = [];
      let processed = 0;

      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newBase64s.push(reader.result as string);
          processed++;
          if (processed === filesArray.length) {
            const updated = [...idDocsBase64, ...newBase64s];
            
            // START BIOMETRIC SCAN SIMULATION
            if (profilePic) {
              setIsScanning(true);
              setScanScore(0);
              setScanError(null);
              
              let score = 0;
              const interval = setInterval(() => {
                score += Math.floor(Math.random() * 10) + 2;
                if (score > 100) score = 100;
                setScanScore(score);
              }, 150);

              setTimeout(() => {
                clearInterval(interval);
                const finalMatch = Math.random() > 0.2 ? 70 + Math.floor(Math.random() * 30) : 35 + Math.floor(Math.random() * 25);
                setScanScore(finalMatch);
                
                if (finalMatch < 70) {
                  setScanError(`Biometric Rejection: ID photo does not match profile picture (${finalMatch}%).`);
                  setIsScanning(false);
                  // Do not update ID docs
                } else {
                  setIdDocsBase64(updated);
                  localStorage.setItem('profileIdDocs', JSON.stringify(updated));
                  setIsScanning(false);
                }
              }, 3000);
            } else {
              setIdDocsBase64(updated);
              localStorage.setItem('profileIdDocs', JSON.stringify(updated));
              // Try to extract profile picture from ID (simulation)
              if (updated.length > 0) {
                setProfilePic(updated[0]);
                localStorage.setItem('profilePic', updated[0]);
              }
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (isLocked) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfilePic(base64);
        localStorage.setItem('profilePic', base64);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<any>
  ) => {
    if (isLocked) return;
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files) as File[];
      const filesWithPreviews: FileWithPreview[] = filesArray.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      
      if (e.target.multiple) {
        setter((prev: FileWithPreview[]) => [...(prev || []), ...filesWithPreviews]);
      } else {
        setter(filesWithPreviews[0]);
      }
    }
  };

  const handleCreatePin = (value: string) => {
    if (value.length <= 4) {
        setPin(value);
        localStorage.setItem('profilePin', value);
    }
  }

  const handleSubmit = () => {
    if (isLocked) return;
    if (pin.length !== 4) {
      alert('PIN must be 4 digits');
      return;
    }
    localStorage.setItem('profileFormData', JSON.stringify(formData));
    localStorage.setItem('profilePin', pin);
    setIsSaved(true);
    setTimeout(() => {
        onSubmit();
        setIsSaved(false);
    }, 1500);
  };
  
  const handleUnlock = () => {
    if (unlockPin === pin) {
        onUnlock();
        setUnlockPin('');
    } else {
        alert('Incorrect PIN');
    }
  }

  const renderFilePreview = (item: FileWithPreview) => {
    const isImage = item.file.type.startsWith('image/');
    return (
      <div className="border p-2 rounded flex items-center gap-2 mt-2">
        {isImage ? (
          <img src={item.previewUrl} alt="preview" className="w-16 h-16 object-cover rounded" />
        ) : (
          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded text-xs text-gray-500 italic">File</div>
        )}
        <span className="text-sm truncate flex-1">{item.file.name}</span>
      </div>
    );
  };

  if (isLocked) {
      return (
        <div className="p-4 bg-gray-100 min-h-screen flex flex-col items-center justify-center gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] flex flex-col items-center gap-6 border-b-8 border-gray-200 w-full max-w-sm">
                <div className="relative group">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                    {profilePic ? <img src={profilePic} alt="profile" className="w-full h-full object-cover" /> : <User size={48} className="text-gray-400" />}
                  </div>
                  {isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-black text-white p-1 rounded-full border-2 border-white shadow-lg">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </div>
                
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">Profile Locked</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Neighbor Security Active</p>
                </div>

                <div className="w-full space-y-4">
                  {isVerified ? (
                    <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <ShieldCheck className="text-green-600" size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-green-900">Identity Secure</h4>
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-wide">AI Verified Biometrics</p>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={onVerify}
                      className="w-full p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between group hover:bg-blue-100 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <ShieldCheck className="text-blue-600" size={20} />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-black text-blue-900">Get Verified</h4>
                          <p className="text-[10px] font-bold text-blue-500 uppercase">Unlock Black Mark</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-blue-300 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Security PIN</label>
                    <input 
                        type="password" 
                        maxLength={4}
                        value={unlockPin}
                        onChange={(e) => setUnlockPin(e.target.value)}
                        className="w-full p-4 border border-gray-100 rounded-2xl text-center text-3xl font-mono tracking-widest bg-gray-50 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                        placeholder="****"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={onBack}
                      className="flex-1 p-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleUnlock} 
                      className="flex-[2] p-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
                    >
                      Unlock Profile
                    </button>
                  </div>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="p-4 bg-white min-h-screen">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={onBack}><ArrowLeft /></button>
        <h2 className="text-xl font-bold">Edit Profile</h2>
      </header>

      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-50">
            {profilePic ? <img src={profilePic} alt="profile" className="w-full h-full object-cover" /> : <User size={48} className="text-gray-400" />}
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-black text-white p-1 rounded-full border-2 border-white shadow-lg">
                <CheckCircle2 size={16} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleProfilePicChange} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Change Picture</p>
        </div>

        <input type="text" placeholder="Name" disabled={isLocked} value={formData.name} className="w-full p-2 border rounded" onChange={(e) => handleInputChange('name', e.target.value)} />
        <textarea placeholder="Bio" disabled={isLocked} value={formData.bio} className="w-full p-2 border rounded" onChange={(e) => handleInputChange('bio', e.target.value)} />
        <textarea placeholder="Work Experience" disabled={isLocked} value={formData.workExperience} className="w-full p-2 border rounded" onChange={(e) => handleInputChange('workExperience', e.target.value)} />
        <textarea placeholder="Preferences" disabled={isLocked} value={formData.preferences} className="w-full p-2 border rounded" onChange={(e) => handleInputChange('preferences', e.target.value)} />
        <input type="text" placeholder="Contact Information" disabled={isLocked} value={formData.contactInfo} className="w-full p-2 border rounded" onChange={(e) => handleInputChange('contactInfo', e.target.value)} />
        <textarea placeholder="Side Hustling Skills" disabled={isLocked} value={formData.skills} className="w-full p-2 border rounded" onChange={(e) => handleInputChange('skills', e.target.value)} />

        <label className="block text-sm font-medium text-gray-700">Create 4-digit PIN</label>
        <input 
            type="password" 
            maxLength={4}
            value={pin}
            onChange={(e) => handleCreatePin(e.target.value)}
            className="w-full p-2 border rounded"
        />

        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Upload CV</label>
            <input type="file" disabled={isLocked} onChange={(e) => handleFileChange(e, setCv)} />
            {cv && renderFilePreview(cv)}
        </div>

        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Upload Certificates</label>
            <input type="file" disabled={isLocked} multiple onChange={(e) => handleFileChange(e, setCertificates)} />
            {certificates.map((f, i) => <div key={i}>{renderFilePreview(f)}</div>)}
        </div>

        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Upload ID Documents</label>
            <div className="relative">
                <input type="file" disabled={isLocked || isScanning} multiple onChange={handleIdDocsChange} className="w-full" />
                {isScanning && (
                    <div className="absolute inset-x-0 -bottom-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: "0%" }}
                            animate={{ width: `${scanScore}%` }}
                            className="h-full bg-blue-600"
                        />
                    </div>
                )}
            </div>
            {isScanning && <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center mt-1">Biometric Analysis: {scanScore}%</p>}
            {scanError && <p className="text-[10px] font-black text-red-600 uppercase tracking-widest text-center mt-1">{scanError}</p>}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {idDocsBase64.map((doc, i) => (
                <div key={i} className="relative aspect-[3/2] rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                  <img src={doc} className="w-full h-full object-cover" alt={`ID ${i}`} />
                  <button 
                    onClick={() => {
                        const updated = idDocsBase64.filter((_, idx) => idx !== i);
                        setIdDocsBase64(updated);
                        localStorage.setItem('profileIdDocs', JSON.stringify(updated));
                    }}
                    className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-colors"
                  >
                    <ArrowLeft size={10} className="rotate-45" />
                  </button>
                </div>
              ))}
            </div>
        </div>

        <button onClick={handleSubmit} disabled={isLocked} className="w-full p-3 bg-blue-600 text-white rounded-lg font-bold disabled:bg-gray-400">
            {isSaved ? "Saved" : "Save Profile"}
        </button>
      </div>
    </div>
  );
};

export default PersonalProfileEditView;
