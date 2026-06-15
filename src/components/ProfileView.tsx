import React, { useState } from 'react';
import { ArrowLeft, Star, MapPin, User, MoreVertical, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ProfileViewProps {
  onBack: () => void;
  userName: string;
  avatarUrl: string;
  isVerified?: boolean;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onBack, userName, avatarUrl, isVerified }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-bold text-lg">Profile</h2>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="text-gray-500"><MoreVertical size={24} /></button>
          {showMenu && (
            <div className="absolute top-8 right-0 bg-white border rounded shadow p-2 z-20 w-32">
               <button onClick={() => alert('Reported')} className="flex items-center text-red-600 block w-full"><ShieldAlert size={16} className="mr-2" /> Report</button>
               <button onClick={() => alert('Blocked')} className="text-gray-600 block w-full">Block User</button>
            </div>
          )}
        </div>
      </header>
      
      <div className="p-6 flex flex-col items-center">
        <div className="relative mb-4">
          <img 
            src={avatarUrl} 
            alt={userName} 
            className="w-32 h-32 rounded-full border-4 border-gray-100"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + userName[0] + '&background=random'; }}
          />
          {isVerified && (
            <div className="absolute bottom-1 right-1 bg-black text-white p-1 rounded-full border-4 border-white shadow-lg">
              <CheckCircle2 size={24} />
            </div>
          )}
        </div>
        <h1 className="text-2xl font-black mb-1 flex items-center gap-2">
          {userName}
        </h1>
        <p className="text-gray-500 mb-4 flex items-center gap-1">
          <MapPin size={16} /> San Francisco, CA
        </p>

        <div className="bg-gray-50 p-4 rounded-lg w-full mb-6">
          <h3 className="font-semibold mb-2">About</h3>
          <p className="text-gray-600 text-sm">Passionate service provider with over 5 years of experience delivering high-quality results. Always happy to help with new projects!</p>
        </div>

        <div className="flex justify-between w-full text-center">
          <div className="bg-gray-50 p-3 rounded w-[48%]">
            <div className="font-bold">4.9/5</div>
            <div className="text-xs text-gray-500">Rating</div>
          </div>
          <div className="bg-gray-50 p-3 rounded w-[48%]">
            <div className="font-bold">120</div>
            <div className="text-xs text-gray-500">Gigs completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
