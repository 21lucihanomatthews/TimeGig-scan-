import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  MessageSquare, 
  User, 
  Filter, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Plus, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Upload,
  Trash2,
  Trophy,
  Crown,
  Heart
} from 'lucide-react';

export const formatPriceForMarketplace = (priceStr: string) => {
  if (!priceStr) return 'ZAR 0';
  let cleaned = priceStr.trim();
  // Decode R to ZAR
  if (cleaned.toLowerCase().startsWith('r')) {
    cleaned = 'ZAR' + cleaned.substring(1).trim();
  }
  // Standardize prefix
  if (!cleaned.toUpperCase().startsWith('ZAR')) {
    cleaned = 'ZAR' + cleaned;
  }
  return cleaned;
};

export interface Seeker {
  id: number | string;
  name: string;
  avatar: string;
  title: string;
  description: string;
  budget: string; // This handles pricing/rate, e.g., "R150/hr"
  location: string;
  province: string;
  category: string;
  skillsNeeded: string[]; // Keep key compatible with existing code
  images: string[];
  likes: number;
  isUserCreated?: boolean;
}

const provinces = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape'
];

const initialSeekers: Seeker[] = [
  {
    id: 1,
    name: 'Sipho M.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sipho',
    title: 'Professional A/V & Event Setup',
    description: 'Offering high-quality setup for sound, staging, lights, and power rigs. Ideal for corporate events, weddings, and local celebrations. Standard rate includes essential equipment and quick setup.',
    budget: 'R150/hr',
    location: 'Sunninghill, JHB',
    province: 'Gauteng',
    category: 'Labor',
    skillsNeeded: ['Sound Engineering', 'Stage Lighting', 'Heavy Lifting'],
    images: ['https://images.unsplash.com/photo-1511578314328-91216d802117?w=300&q=80'],
    likes: 42
  },
  {
    id: 2,
    name: 'Lerato K.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lerato',
    title: 'Social Media Strategy & Canva Creator',
    description: 'Offering custom 30-day Instagram/Facebook content grids, eye-catching baking and aesthetic graphics, reels templates, and strategic post schedules to help local businesses grow their presence.',
    budget: 'R1,200/flat',
    location: 'Soweto, JHB',
    province: 'Gauteng',
    category: 'Creative',
    skillsNeeded: ['Canva Graphics', 'Social Media Copywriting', 'Reels Editing'],
    images: ['https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&q=80'],
    likes: 89
  },
  {
    id: 3,
    name: 'Arthur P.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arthur',
    title: 'Precision Handyman & Furniture Assembly',
    description: 'Offering reliable, clean assembly for Kallax shelves, Pax wardrobes, custom desks, and general wall mounting/drilling services. All professional hand and power tools provided.',
    budget: 'R180/hr',
    location: 'Green Point, CPT',
    province: 'Western Cape',
    category: 'Labor',
    skillsNeeded: ['Furniture assembly', 'Drilling & Mounting', 'Plumbing Basics'],
    images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&q=80'],
    likes: 56
  },
  {
    id: 4,
    name: 'Dr. Sarah K.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    title: 'Conversational French Language Tutor',
    description: 'Offering immersive conversational French tutoring and business translation. Tailored lesson plans for adults, high-school students, and companies looking to expand into Francophone markets.',
    budget: 'R220/hr',
    location: 'Hatfield, PTA',
    province: 'Gauteng',
    category: 'Education',
    skillsNeeded: ['Conversational French', 'Private Tutoring', 'Business Translation'],
    images: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&q=80'],
    likes: 31
  },
  {
    id: 5,
    name: 'Jenny Cooke',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jenny',
    title: 'Pet Care & Puppy Coaching Expert',
    description: 'Providing comprehensive puppy socialization, friendly day-sitting on Durban afternoons, confidence coaching, leash-walk training, and loving house-sitting services. Highly experienced.',
    budget: 'R120/hr',
    location: 'Umhlanga, DBN',
    province: 'KwaZulu-Natal',
    category: 'Care',
    skillsNeeded: ['Puppy Coaching', 'Dog Walking', 'Loving Patience'],
    images: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&q=80'],
    likes: 74
  },
  {
    id: 6,
    name: 'Thabo N.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thabo',
    title: 'General Maintenance & Painting',
    description: 'Reliable painting and general home maintenance services. Quality work guaranteed.',
    budget: 'R100/hr',
    location: 'Gqeberha',
    province: 'Eastern Cape',
    category: 'Labor',
    skillsNeeded: ['Painting', 'Repair', 'General Labor'],
    images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&q=80'],
    likes: 25
  },
  {
    id: 7,
    name: 'Zanele M.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zanele',
    title: 'Academic Support & Reading Coach',
    description: 'Helping children develop strong reading and writing skills through personalized coaching.',
    budget: 'R150/hr',
    location: 'Bloemfontein',
    province: 'Free State',
    category: 'Education',
    skillsNeeded: ['Child Tutoring', 'Reading Coach', 'Literature'],
    images: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&q=80'],
    likes: 38
  },
  {
    id: 8,
    name: 'Khotso R.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khotso',
    title: 'Solar Panel Installation Specialist',
    description: 'Professional solar energy solutions for your home or small business. Off-grid systems expert.',
    budget: 'R500/hr',
    location: 'Polokwane',
    province: 'Limpopo',
    category: 'Labor',
    skillsNeeded: ['Solar Energy', 'Electrical', 'Installation'],
    images: ['https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=300&q=80'],
    likes: 62
  },
  {
    id: 9,
    name: 'Nomsa S.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nomsa',
    title: 'Professional Cleaning & Organization',
    description: 'Keep your workplace or home pristine with meticulous deep-cleaning and decluttering services.',
    budget: 'R80/hr',
    location: 'Nelspruit',
    province: 'Mpumalanga',
    category: 'Labor',
    skillsNeeded: ['Deep Cleaning', 'Organization', 'Punctuality'],
    images: ['https://images.unsplash.com/photo-1581578731548-c64695ce6958?w=300&q=80'],
    likes: 45
  },
  {
    id: 10,
    name: 'Pieter v. d. Merwe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pieter',
    title: 'Livestock Care & Farm Management',
    description: 'Offering experienced help with cattle, sheep, and general farm operations. Temporary relief work available.',
    budget: 'R300/day',
    location: 'Rustenburg',
    province: 'North West',
    category: 'Labor',
    skillsNeeded: ['Animal Husbandry', 'Farming', 'Operation'],
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&q=80'],
    likes: 51
  },
  {
    id: 11,
    name: 'Johan S.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johan',
    title: 'Stargazing Guide & Desert Tours',
    description: 'Expert-led night sky tours and unique desert experiences in the Northern Cape.',
    budget: 'R400/tour',
    location: 'Upington',
    province: 'Northern Cape',
    category: 'Creative',
    skillsNeeded: ['Astronomy', 'Tour Guiding', 'Storytelling'],
    images: ['https://images.unsplash.com/photo-1532974297617-c0f05fe48bff?w=300&q=80'],
    likes: 67
  }
];

const categories = ['All', 'Labor', 'Creative', 'Education', 'Care'];

interface SeekersViewProps {
  onStartChat: (seekerName: string, messageText: string, seekerAvatar: string) => void;
  onCreatingChange?: (isCreating: boolean) => void;
}

export default function SeekersView({ onStartChat, onCreatingChange }: SeekersViewProps) {
  const [seekers, setSeekers] = useState<Seeker[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pitchedSeekers, setPitchedSeekers] = useState<number[]>([]);
  const [likedSeekerIds, setLikedSeekerIds] = useState<(string | number)[]>([]);
  const [followedSeekerIds, setFollowedSeekerIds] = useState<(string | number)[]>([]);
  const [showPitchModal, setShowPitchModal] = useState<Seeker | null>(null);
  const [pitchMessage, setPitchMessage] = useState('');

  // Service creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newProvince, setNewProvince] = useState('Gauteng');
  const [newCategory, setNewCategory] = useState('Labor');
  const [newSkillsStr, setNewSkillsStr] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newName, setNewName] = useState('');

  // Active user profile states
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);
  const [userProfileName, setUserProfileName] = useState<string>('');

  // New multi-image upload & full screen detail states
  const [newImagesList, setNewImagesList] = useState<string[]>([]);
  const [imageError, setImageError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  
  const [selectedSeekerForDetails, setSelectedSeekerForDetails] = useState<Seeker | null>(null);
  const [currentDetailsImageIndex, setCurrentDetailsImageIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const handleMultipleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files) as File[];
    
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setImageError('Please select image files only.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB max to keep localStorage budget safe
        setImageError('Some images are too large. Maximum size is 2MB per image.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setNewImagesList(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset file input value so same files can be re-uploaded
    e.target.value = '';
  };

  const handleAddUrl = () => {
    setImageError('');
    if (!urlInput.trim()) return;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://')) {
      setImageError('Please enter a valid HTTP or HTTPS image URL.');
      return;
    }
    setNewImagesList(prev => [...prev, urlInput.trim()]);
    setUrlInput('');
  };

  const handleRemoveImageFromNewList = (index: number) => {
    setNewImagesList(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const saved = localStorage.getItem('seekers_list_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure all seekers have a valid numeric 'likes' field to prevent NaN errors
        const migrated = parsed.map((s: any) => ({
          ...s,
          likes: typeof s.likes === 'number' && !isNaN(s.likes) ? s.likes : 0
        }));
        setSeekers(migrated);
      } catch (e) {
        setSeekers(initialSeekers);
      }
    } else {
      setSeekers(initialSeekers);
      localStorage.setItem('seekers_list_v2', JSON.stringify(initialSeekers));
    }

    const savedLikes = localStorage.getItem('user_liked_seeker_ids');
    if (savedLikes) {
      try {
        setLikedSeekerIds(JSON.parse(savedLikes));
      } catch (e) {
        setLikedSeekerIds([]);
      }
    }

    const savedFollows = localStorage.getItem('user_followed_seeker_ids');
    if (savedFollows) {
      try {
        setFollowedSeekerIds(JSON.parse(savedFollows));
      } catch (e) {
        setFollowedSeekerIds([]);
      }
    }
  }, []);

  useEffect(() => {
    onCreatingChange?.(showCreateModal);
  }, [showCreateModal, onCreatingChange]);

  // Update dynamic user profile information whenever modal shows
  useEffect(() => {
    if (showCreateModal) {
      const savedPic = localStorage.getItem('profilePic');
      const savedFormDataStr = localStorage.getItem('profileFormData');
      if (savedPic) {
        setUserProfilePic(savedPic);
      } else {
        setUserProfilePic(null);
      }
      if (savedFormDataStr) {
        try {
          const parsed = JSON.parse(savedFormDataStr);
          if (parsed.name) {
            setUserProfileName(parsed.name);
            setNewName(parsed.name);
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }, [showCreateModal]);

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSkills = newSkillsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const savedPic = localStorage.getItem('profilePic');

    let finalImages = [...newImagesList];
    if (finalImages.length === 0) {
      if (newImage.trim()) {
        finalImages.push(newImage.trim());
      } else {
        // Fallback placeholders depending on selected category
        if (newCategory === 'Labor') {
          finalImages.push('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80');
        } else if (newCategory === 'Creative') {
          finalImages.push('https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80');
        } else if (newCategory === 'Care') {
          finalImages.push('https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80');
        } else if (newCategory === 'Education') {
          finalImages.push('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80');
        } else {
          finalImages.push('https://images.unsplash.com/photo-1521791136365-1a108575094d?w=400&q=80');
        }
      }
    }

    const created: Seeker = {
      id: Date.now(),
      name: newName || 'Me (Local Provider)',
      avatar: savedPic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(newName || 'me').toLowerCase()}`,
      title: newTitle,
      description: newDesc,
      budget: newBudget.startsWith('R') ? newBudget : `R${newBudget}`,
      location: newLocation,
      province: newProvince,
      category: newCategory,
      skillsNeeded: cleanSkills.length > 0 ? cleanSkills : ['Independent expert', 'Professional'],
      images: finalImages,
      likes: 0,
      isUserCreated: true
    };

    const nextSeekers = [created, ...seekers];
    setSeekers(nextSeekers);
    localStorage.setItem('seekers_list_v2', JSON.stringify(nextSeekers));

    // Reset fields
    setNewTitle('');
    setNewDesc('');
    setNewBudget('');
    setNewLocation('');
    setNewProvince('Gauteng');
    setNewCategory('Labor');
    setNewSkillsStr('');
    setNewImage('');
    setNewName('');
    setNewImagesList([]);
    setImageError('');
    setUrlInput('');
    setShowCreateModal(false);
  };

  const filteredSeekers = seekers.filter(seeker => {
    const matchesSearch = 
      seeker.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seeker.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seeker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seeker.skillsNeeded.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || seeker.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenPitch = (seeker: Seeker) => {
    setShowPitchModal(seeker);
    setPitchMessage(`Hello ${seeker.name}, I'm interested in hiring your "${seeker.title}" services for my local school or business. Let's connect!`);
  };

  const handleSendPitch = () => {
    if (!showPitchModal) return;
    const seekerId = showPitchModal.id;
    setPitchedSeekers(prev => [...prev, seekerId]);
    
    // Launch chat flow
    onStartChat(showPitchModal.name, pitchMessage, showPitchModal.avatar);
    setShowPitchModal(null);
    setPitchMessage('');
  };

  const handleLike = (id: string | number) => {
    const isCurrentlyLiked = likedSeekerIds.includes(id);
    let newLikedIds;
    
    if (isCurrentlyLiked) {
      newLikedIds = likedSeekerIds.filter(likedId => likedId !== id);
    } else {
      newLikedIds = [...likedSeekerIds, id];
    }
    
    setLikedSeekerIds(newLikedIds);
    localStorage.setItem('user_liked_seeker_ids', JSON.stringify(newLikedIds));

    const nextSeekers = seekers.map(s => {
      if (s.id === id) {
        const currentLikes = typeof s.likes === 'number' && !isNaN(s.likes) ? s.likes : 0;
        return { 
          ...s, 
          likes: isCurrentlyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1 
        };
      }
      return s;
    });
    setSeekers(nextSeekers);
  };

  const handleFollow = (id: string | number) => {
    const isCurrentlyFollowed = followedSeekerIds.includes(id);
    let newFollowedIds;

    if (isCurrentlyFollowed) {
      newFollowedIds = followedSeekerIds.filter(fId => fId !== id);
    } else {
      newFollowedIds = [...followedSeekerIds, id];
    }

    setFollowedSeekerIds(newFollowedIds);
    localStorage.setItem('user_followed_seeker_ids', JSON.stringify(newFollowedIds));
  };

  const handleDeleteSeeker = (id: string | number) => {
    const nextSeekers = seekers.filter(s => s.id !== id);
    setSeekers(nextSeekers);
    localStorage.setItem('seekers_list_v2', JSON.stringify(nextSeekers));
    setSelectedSeekerForDetails(null);
  };

  const sortedFilteredSeekers = [...filteredSeekers].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  const topSeeker = sortedFilteredSeekers[0];

  const provinceLeaderboard = provinces.map(province => {
    const provinceSeekers = seekers.filter(s => s.province === province);
    const topPerProvince = provinceSeekers.length > 0 
      ? [...provinceSeekers].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0]
      : null;
    return { province, seeker: topPerProvince };
  }).filter(item => item.seeker !== null);

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pb-24 text-left">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-blue-600 animate-pulse" size={24} /> Service Seekers
          </h1>
          <p className="text-xs text-gray-400 font-medium">Local experts hiring their services to users & businesses in need</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1 shrink-0"
        >
          <Plus size={14} /> Offer Service
        </button>
      </div>

      {/* Rating Leaderboard Table */}
      {sortedFilteredSeekers.length > 0 && selectedCategory === 'All' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-5 text-white shadow-xl overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Trophy size={120} />
          </div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <Crown className="text-yellow-400" size={20} />
              <h2 className="font-black text-sm uppercase tracking-widest">Best Seekers Ranking</h2>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full font-bold backdrop-blur-sm">Weekly Ranking</span>
          </div>

          <div className="space-y-3 relative z-10">
            {sortedFilteredSeekers.slice(0, 3).map((s, idx) => (
              <div 
                key={s.id} 
                className={`flex items-center justify-between p-3 rounded-2xl transition-all ${idx === 0 ? 'bg-white/15 scale-105 shadow-inner' : 'bg-white/5 opacity-80'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={s.avatar} className="w-10 h-10 rounded-full border-2 border-white/30" alt="" />
                    <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      idx === 0 ? 'bg-yellow-400 text-yellow-900' : 
                      idx === 1 ? 'bg-slate-300 text-slate-800' : 
                      'bg-amber-600 text-amber-50'
                    }`}>
                      {idx + 1}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-xs truncate max-w-[120px]">{s.name}</p>
                    <p className="text-[10px] opacity-70">{s.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs">{s.likes}</p>
                  <p className="text-[8px] uppercase font-bold opacity-60 flex items-center gap-0.5 justify-end">
                    <Heart 
                      size={8} 
                      className={`fill-current ${likedSeekerIds.includes(s.id) ? 'text-red-400' : 'text-white/60'}`} 
                    /> Likes
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Provincial Heroes Leaderboard */}
      {provinceLeaderboard.length > 0 && selectedCategory === 'All' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
              <MapPin size={12} className="text-blue-500" /> Provincial Top Seekers
            </h2>
            <span className="text-[10px] text-blue-600 font-bold">Regional Best</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {provinceLeaderboard.map((item) => (
              <motion.div
                key={item.province}
                whileHover={{ y: -2 }}
                onClick={() => {
                  if (item.seeker) {
                    setSelectedSeekerForDetails(item.seeker);
                    setCurrentDetailsImageIndex(0);
                  }
                }}
                className="shrink-0 w-40 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm flex flex-col items-center text-center gap-2 cursor-pointer"
              >
                <div className="relative">
                  <img src={item.seeker?.avatar} className="w-12 h-12 rounded-full border-2 border-blue-50" alt="" />
                  <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5 border border-white">
                    <Trophy size={10} className="text-yellow-900" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-gray-900 truncate w-32">{item.seeker?.name}</p>
                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">{item.province}</p>
                </div>
                <div className="w-full h-[1px] bg-gray-50 my-0.5" />
                <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                  <Heart size={10} className="text-red-400 fill-current" />
                  <span>{item.seeker?.likes} Likes</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search services, skills, experts..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white rounded-full pl-10 pr-4 py-2.5 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
        />
        <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Seekers Grid - styled identical to Gigs Feed */}
      <div className="grid grid-cols-2 gap-4 pb-20">
        {filteredSeekers.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200 p-6">
            <Filter size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="font-semibold text-gray-600">No service providers found</p>
            <p className="text-xs mt-1">Try another category or different search words!</p>
          </div>
        ) : (
          sortedFilteredSeekers.map(seeker => (
            <motion.div
              key={seeker.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                setSelectedSeekerForDetails(seeker);
                setCurrentDetailsImageIndex(0);
              }}
              className="cursor-pointer group flex flex-col text-left"
            >
              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-50 border border-gray-100/60 flex items-center justify-center">
                <img 
                  src={seeker.images[0] || 'https://images.unsplash.com/photo-1521791136365-1a108575094d?w=300&q=80'} 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://images.unsplash.com/photo-1521791136365-1a108575094d?w=300&q=80';
                  }}
                  alt={seeker.title} 
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                
                {/* Photo Count tag if more than 1 image */}
                {seeker.images && seeker.images.length > 1 && (
                  <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-[8px] font-bold text-white px-1.5 py-0.5 rounded">
                    {seeker.images.length}
                  </div>
                )}

                {/* Service Category Marker top-left of photo */}
                <span className="absolute top-1.5 left-1.5 text-[8px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded shadow-xs bg-white text-blue-600 border border-slate-100">
                  {seeker.category}
                </span>
                
                {/* Micro Avatar Icon top-right */}
                <div className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-xs p-0.5 rounded-full border border-gray-100 shadow-xs flex items-center">
                  <img 
                    src={seeker.avatar} 
                    alt="avatar" 
                    className="w-4 h-4 rounded-full object-cover" 
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(seeker.name) + '&background=random'; }}
                  />
                </div>

                {/* Like Count Overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(seeker.id);
                  }}
                  className={`absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-gray-100 shadow-sm flex items-center gap-1 transition-all active:scale-95 hover:bg-white`}
                >
                  <Heart 
                    size={10} 
                    className={`${likedSeekerIds.includes(seeker.id) ? 'text-red-500 fill-current' : 'text-gray-400'} transition-colors`} 
                  />
                  <span className={`text-[9px] font-black ${likedSeekerIds.includes(seeker.id) ? 'text-red-600' : 'text-gray-800'}`}>
                    {(seeker.likes || 0)}
                  </span>
                </button>
              </div>

              {/* Minimal Text Container - Identical style with Facebook Marketplace */}
              <div className="mt-2 px-0.5 space-y-0.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs text-gray-900 leading-snug flex-1">
                    <span className="font-extrabold text-[#111827]">{formatPriceForMarketplace(seeker.budget)}</span>
                    <span className="text-gray-400 font-bold mx-1.5">·</span>
                    <span className="font-medium text-[#374151] group-hover:text-blue-600 transition-colors line-clamp-1">{seeker.title}</span>
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollow(seeker.id);
                    }}
                    className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md transition-all ${
                      followedSeekerIds.includes(seeker.id)
                        ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        : 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
                    }`}
                  >
                    {followedSeekerIds.includes(seeker.id) ? 'Following' : 'Follow'}
                  </button>
                </div>
                
                {/* Small non-intrusive metadata line */}
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                  <p className="flex items-center gap-0.5 truncate max-w-[80px]">
                    <MapPin size={9} />
                    <span className="truncate">{seeker.location.split(',')[0]}</span>
                  </p>
                  <p className="font-semibold text-gray-350 truncate max-w-[60px]">{seeker.name}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pitch / Message Modal */}
      <AnimatePresence>
        {showPitchModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={showPitchModal.avatar} 
                  alt="avatar" 
                  className="w-12 h-12 rounded-full border object-cover" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(showPitchModal.name) + '&background=random';
                  }}
                />
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">Request from {showPitchModal.name}</h3>
                  <p className="text-[11px] text-gray-400">Offer: {showPitchModal.title}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono font-bold text-gray-400">Write Message</label>
                <textarea
                  rows={4}
                  value={pitchMessage}
                  onChange={(e) => setPitchMessage(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl outline-none focus:ring-1.5 focus:ring-blue-500 resize-none bg-gray-50/50 font-medium"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowPitchModal(null)}
                  className="flex-1 py-2.5 text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendPitch}
                  className="flex-1 py-2.5 text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md flex items-center justify-center gap-1.5 transition"
                >
                  Send & Chat
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Create Seeker Listing (Offer Service) Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-sm shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto scrollbar-hide text-left"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition"
              >
                <X size={18} />
              </button>

              <div className="text-center pb-1">
                <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles size={22} className="animate-spin" />
                </div>
                <h3 className="font-extrabold text-base text-gray-900">Offer Your Service</h3>
                <p className="text-xs text-gray-400 mt-1">
                  List your service to be hired by local users and businesses
                </p>
              </div>

              <form onSubmit={handleCreateService} className="space-y-3.5">
                {/* Linked Profile Badge */}
                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full border border-blue-200 bg-slate-100 overflow-hidden shrink-0 shadow-xs">
                      {userProfilePic ? (
                        <img 
                          src={userProfilePic} 
                          alt="Active profile pic" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = 'https://ui-avatars.com/api/?name=User&background=random';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-sm">
                          {newName ? newName.charAt(0).toUpperCase() : 'M'}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[9px] text-blue-600 font-bold uppercase tracking-wider font-mono">Linked Profile Photo</p>
                      <p className="text-[11px] text-gray-500 font-medium">Auto-applied to seek list</p>
                    </div>
                  </div>
                  <span className="text-[8px] bg-green-150 text-green-800 font-extrabold uppercase tracking-wider px-2 py-1 rounded-full border border-green-200 font-mono">
                    Linked Account
                  </span>
                </div>

                {/* Your Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sipho Mulaudzi"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl outline-none focus:ring-1.5 focus:ring-blue-500 bg-white"
                  />
                </div>

                {/* Service Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">What service do you offer?</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Academic Math & Science Tutoring"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl outline-none focus:ring-1.5 focus:ring-blue-500 bg-white"
                  />
                </div>

                {/* Service Rate */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Hourly Rate / Budget (ZAR)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. R200/hr or R1500/flat"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl outline-none focus:ring-1.5 focus:ring-blue-500 bg-white"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Your Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sandton, JHB"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl outline-none focus:ring-1.5 focus:ring-blue-500 bg-white"
                  />
                </div>

                {/* Province Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Province</label>
                  <select
                    value={newProvince}
                    onChange={(e) => setNewProvince(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl outline-none focus:ring-1.5 focus:ring-blue-500 bg-white"
                  >
                    {provinces.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Service Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl outline-none focus:ring-1.5 focus:ring-blue-500 bg-white"
                  >
                    <option value="Labor">Labor & Physical Handyman</option>
                    <option value="Creative">Creative, Media & Writing</option>
                    <option value="Education">Education, Language & Tutoring</option>
                    <option value="Care">Domestic, Pet & Healthcare</option>
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Service Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Explain your expertise, deliverables, files provided, and schedule availability..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl outline-none focus:ring-1.5 focus:ring-blue-500 resize-none bg-white"
                  />
                </div>

                {/* Skills/Tags */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Searchable Skills (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Algebra, Trigonometry, Calculus"
                    value={newSkillsStr}
                    onChange={(e) => setNewSkillsStr(e.target.value)}
                    className="w-full text-xs p-3 border border-gray-200 rounded-xl outline-none focus:ring-1.5 focus:ring-blue-500 bg-white"
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2 bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-gray-650 flex items-center gap-1">
                      <ImageIcon size={14} className="text-blue-500" /> Showcase Pictures
                    </label>
                    <p className="text-[10px] text-gray-450 mt-0.5 leading-snug">Add up to 5 photos of your gear, past jobs, or self to get hired quickly.</p>
                  </div>

                  {/* Thumbnail Previews Queue */}
                  {newImagesList.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-gray-100 rounded-xl">
                      {newImagesList.map((img, idx) => (
                        <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 group bg-slate-50">
                          <img 
                            src={img} 
                            alt="Showcase thumbnail" 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'https://images.unsplash.com/photo-1521791136365-1a108575094d?w=300&q=80';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImageFromNewList(idx)}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center p-0 shadow transition-transform active:scale-90"
                            title="Remove picture"
                          >
                            <X size={10} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Controls Row */}
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {/* File Upload Trigger */}
                    <label className="flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50/40 rounded-xl cursor-pointer text-xs font-extrabold text-slate-600 hover:text-blue-600 transition bg-white shadow-xs">
                      <Upload size={14} className="text-slate-400 group-hover:text-blue-500" />
                      <span>Upload Local Photos</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleMultipleFilesUpload} 
                      />
                    </label>

                    {/* Or URL input */}
                    <div className="space-y-1">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider text-center">or add by web address</p>
                      <div className="flex gap-1.5">
                        <input
                          type="url"
                          placeholder="Paste image web URL..."
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1.5 focus:ring-blue-500 bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddUrl}
                          className="bg-slate-600 hover:bg-slate-700 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-xl transition"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>
                  </div>



                  {imageError && (
                    <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-2.5 text-[10px] font-bold leading-normal">
                      ⚠️ {imageError}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="w-1/3 p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-extrabold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-1"
                  >
                    Publish Listing
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Fullscreen Seeker Details Modal */}
        {selectedSeekerForDetails && (
          <div className="fixed inset-0 z-45 bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-250 text-left">
            {/* Header Sticky Navigation Bar */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-gray-100 flex items-center justify-between z-10 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedSeekerForDetails(null)}
                className="p-1 text-gray-550 hover:bg-gray-100 rounded-full transition flex items-center gap-1"
              >
                <ChevronLeft size={20} />
                <span className="text-xs font-bold text-gray-650">Back</span>
              </button>
              <div className="text-center">
                <p className="text-[9px] uppercase tracking-wider font-mono font-bold text-blue-600">Service Profile</p>
                <p className="text-xs font-black text-gray-800 truncate max-w-[150px]">{selectedSeekerForDetails.name}'s Service</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleOpenPitch(selectedSeekerForDetails);
                  setSelectedSeekerForDetails(null);
                }}
                className="bg-blue-50 text-blue-600 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition"
              >
                Chat
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
              {/* Image Showcase Slider */}
              <div className="relative h-80 w-full bg-black/5 shrink-0 group">
                <img
                  src={selectedSeekerForDetails.images[currentDetailsImageIndex]}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://images.unsplash.com/photo-1521791136365-1a108575094d?w=300&q=80';
                  }}
                  alt={selectedSeekerForDetails.title}
                  onClick={() => setLightboxImage(selectedSeekerForDetails.images[currentDetailsImageIndex])}
                  className="w-full h-full object-cover cursor-zoom-in transition-opacity duration-300"
                />

                {/* Left/Right Buttons inside slider */}
                {selectedSeekerForDetails.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentDetailsImageIndex(prev => 
                          prev === 0 ? selectedSeekerForDetails.images.length - 1 : prev - 1
                        );
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-xs transition active:scale-90 z-20"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentDetailsImageIndex(prev => 
                          prev === selectedSeekerForDetails.images.length - 1 ? 0 : prev + 1
                        );
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-xs transition active:scale-90 z-20"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Tap to zoom tip helper */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] font-bold text-white flex items-center gap-1 select-none z-10">
                  <Maximize2 size={10} />
                  <span>Tap to view full screen</span>
                </div>

                {/* Dot markers at the bottom center of the banner */}
                {selectedSeekerForDetails.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full flex gap-1 items-center z-10">
                    {selectedSeekerForDetails.images.map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          idx === currentDetailsImageIndex 
                            ? 'bg-blue-400 w-2.5' 
                            : 'bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Information body layout */}
              <div className="p-5 space-y-5">
                {/* Provider Detail Header Box */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedSeekerForDetails.avatar} 
                      alt={selectedSeekerForDetails.name} 
                      className="w-12 h-12 rounded-full border border-gray-200 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedSeekerForDetails.name) + '&background=random'; }}
                    />
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1 text-left">
                        {selectedSeekerForDetails.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono flex items-center gap-0.5 mt-0.5">
                        <MapPin size={10} />
                        {selectedSeekerForDetails.location}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-extrabold uppercase font-mono text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    {selectedSeekerForDetails.category}
                  </span>
                </div>

                {/* Service Title details */}
                <div className="space-y-1.5 text-left">
                  <p className="text-[10px] uppercase tracking-wider font-mono font-black text-gray-400">Offer Title</p>
                  <h2 className="font-extrabold text-base text-gray-950 leading-snug">{selectedSeekerForDetails.title}</h2>
                </div>

                {/* Service Description */}
                <div className="space-y-1.5 text-left">
                  <p className="text-[10px] uppercase tracking-wider font-mono font-black text-gray-400 font-bold">Expertise & Service Details</p>
                  <p className="text-xs text-gray-650 whitespace-pre-wrap leading-relaxed font-normal bg-white p-4 rounded-2xl border border-gray-100 shadow-xxs">
                    {selectedSeekerForDetails.description}
                  </p>
                </div>

                {selectedSeekerForDetails.isUserCreated && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to remove yourself from the seekers list?')) {
                          handleDeleteSeeker(selectedSeekerForDetails.id);
                        }
                      }}
                      className="w-full py-4 bg-red-50 text-red-600 border border-red-100 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-100 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} /> Delete My Seeker Profile
                    </button>
                  </div>
                )}

                {/* Showcase Mini Image previews block */}
                {selectedSeekerForDetails.images.length > 1 && (
                  <div className="space-y-2 text-left">
                    <p className="text-[10px] uppercase tracking-wider font-mono font-bold text-gray-400">Showcase Gallery ({selectedSeekerForDetails.images.length} photos)</p>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedSeekerForDetails.images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentDetailsImageIndex(idx)}
                          className={`relative aspect-square rounded-xl overflow-hidden border bg-stone-100 transition-all ${
                            idx === currentDetailsImageIndex 
                              ? 'ring-2 ring-blue-500 border-transparent scale-95' 
                              : 'border-gray-200 opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img 
                            src={img} 
                            alt="Showcase mini" 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'https://images.unsplash.com/photo-1521791136365-1a108575094d?w=300&q=80';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills/Tags */}
                <div className="space-y-2 text-left">
                  <p className="text-[10px] uppercase tracking-wider font-mono font-black text-gray-400">Core Expert Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSeekerForDetails.skillsNeeded.map(skill => (
                      <span key={skill} className="px-2.5 py-1 bg-gray-150 text-gray-650 text-[10px] rounded-lg font-mono border border-gray-200">
                        #{skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Hire Bar */}
            <div className="sticky bottom-0 inset-x-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 flex items-center justify-between gap-4 z-10 shrink-0 shadow-lg">
              <div className="text-left">
                <p className="text-[9px] uppercase font-mono font-bold text-gray-400">Proposed Budget</p>
                <p className="text-sm font-black text-green-700">{selectedSeekerForDetails.budget}</p>
              </div>

              {pitchedSeekers.includes(selectedSeekerForDetails.id) ? (
                <button 
                  type="button"
                  className="flex-1 py-3 bg-green-150 text-green-800 text-xs font-black rounded-xl border border-green-250 flex items-center justify-center gap-1.5 cursor-not-allowed"
                >
                  <CheckCircle2 size={13} /> Called / Contacted
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleOpenPitch(selectedSeekerForDetails);
                    setSelectedSeekerForDetails(null);
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <MessageSquare size={13} /> Chat & Start Hire
                </button>
              )}
            </div>
          </div>
        )}

        {/* Fullscreen Lightbox Zoom View */}
        {lightboxImage && (
          <div className="fixed inset-0 z-55 bg-black/98 flex flex-col justify-between p-4 max-w-md mx-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Top Close bar */}
            <div className="flex items-center justify-between text-white py-2 shrink-0">
              <span className="text-[11px] font-mono font-bold text-gray-400">
                {selectedSeekerForDetails && selectedSeekerForDetails.images.indexOf(lightboxImage) !== -1 ? (
                  `Photo ${selectedSeekerForDetails.images.indexOf(lightboxImage) + 1} of ${selectedSeekerForDetails.images.length}`
                ) : (
                  'Fullscreen View'
                )}
              </span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 border border-white/10 transition-colors"
                title="Close fullscreen photo"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Picture Center Container */}
            <div className="flex-1 flex items-center justify-center relative">
              <img
                src={lightboxImage}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://images.unsplash.com/photo-1521791136365-1a108575094d?w=300&q=80';
                }}
                alt="Fullscreen show"
                className="max-w-full max-h-[75vh] object-contain rounded-md shadow-2xl select-none"
              />

              {/* Lightbox Next/Prev navigation if selected seeker is active and has multiple images */}
              {selectedSeekerForDetails && selectedSeekerForDetails.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const idx = selectedSeekerForDetails.images.indexOf(lightboxImage);
                      const prevIdx = idx === 0 ? selectedSeekerForDetails.images.length - 1 : idx - 1;
                      setLightboxImage(selectedSeekerForDetails.images[prevIdx]);
                    }}
                    className="absolute left-1 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full p-3 transition active:scale-90"
                    title="Previous photo"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const idx = selectedSeekerForDetails.images.indexOf(lightboxImage);
                      const nextIdx = idx === selectedSeekerForDetails.images.length - 1 ? 0 : idx + 1;
                      setLightboxImage(selectedSeekerForDetails.images[nextIdx]);
                    }}
                    className="absolute right-1 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full p-3 transition active:scale-90"
                    title="Next photo"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Bottom info label */}
            <p className="text-center text-gray-500 text-[10px] py-2 leading-none">
              Tap navigation buttons to rotate • Contained layout for elegant viewing
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
