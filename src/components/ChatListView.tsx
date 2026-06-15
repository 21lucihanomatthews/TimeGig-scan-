import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, ChevronRight, Clock, ShieldCheck, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface Contact {
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

interface ChatListViewProps {
  onSelectContact: (name: string, avatar: string) => void;
  onBack: () => void;
}

const ChatListView: React.FC<ChatListViewProps> = ({ onSelectContact, onBack }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Collect all contacts from localStorage chat keys
    const allContacts: Contact[] = [];
    
    // We also look for specific pre-defined keys or just scan localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('chat_messages_')) {
            const name = key.replace('chat_messages_', '').replace(/_/g, ' ');
            const messages = JSON.parse(localStorage.getItem(key) || '[]');
            
            if (messages.length > 0) {
                const lastMsg = messages[messages.length - 1];
                
                // Try to find avatar from partner data if exists
                // For simplicity, we'll use dicebear as fallback or look in active_chat_partner if it matches
                let avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
                
                const activePartner = JSON.parse(localStorage.getItem('active_chat_partner') || '{}');
                if (activePartner.name === name) {
                    avatar = activePartner.avatar;
                }

                allContacts.push({
                    name,
                    avatar,
                    lastMessage: lastMsg.text,
                    timestamp: lastMsg.timestamp,
                    unreadCount: 0 // Mocking unread
                });
            }
        }
    }

    // Add some mock contacts if list is empty to make it look alive
    if (allContacts.length === 0) {
      allContacts.push({
        name: "Jessica Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica%20Smith",
        lastMessage: "Is the dog walking gig still available?",
        timestamp: "10:30 AM",
        unreadCount: 1
      });
      allContacts.push({
        name: "Professor Paul",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Professor%20Paul",
        lastMessage: "I'll see you for the tutoring session at 4pm.",
        timestamp: "Yesterday",
        unreadCount: 0
      });
    }

    setContacts(allContacts.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
  }, []);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="p-6 bg-white border-b border-slate-100 flex flex-col gap-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <button 
                onClick={onBack}
                className="p-2 -ml-2 text-slate-400 hover:text-blue-600 transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Messages</h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Verified Neighbor Chats</p>
              </div>
           </div>
           <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <MessageSquare size={20} />
           </div>
        </div>

        <div className="relative">
           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
             type="text" 
             placeholder="Search conversations..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-slate-100 border-none rounded-2xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
           />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-2 mt-4">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact, idx) => (
            <motion.div
              key={contact.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelectContact(contact.name, contact.avatar)}
              className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer group"
            >
              <div className="relative">
                <img src={contact.avatar} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-50" alt="" />
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-sm" />
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-slate-900 truncate tracking-tight">{contact.name}</h3>
                    <ShieldCheck size={14} className="text-blue-500" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{contact.timestamp}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium truncate leading-tight pr-4">
                  {contact.lastMessage}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                {contact.unreadCount > 0 && (
                   <div className="bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                      {contact.unreadCount}
                   </div>
                )}
                <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mx-auto">
                <MessageSquare size={32} />
             </div>
             <div>
                <p className="text-slate-900 font-black">No messages yet</p>
                <p className="text-slate-400 text-xs font-medium max-w-[200px] mx-auto mt-1">Start a conversation with neighbors from the Gigs or Seekers market.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatListView;
