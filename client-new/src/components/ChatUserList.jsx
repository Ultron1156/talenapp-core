import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

const UserListItem = ({ user, selectedUser, onSelectUser, currentUserID }) => {
    const [hasUnread, setHasUnread] = useState(false);
    const [lastMessage, setLastMessage] = useState('');

    useEffect(() => {
        const conversationId = [currentUserID, user.userID].sort().join('_');
        const messagesRef = ref(db, `conversations/${conversationId}/messages`);
        
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            if (snapshot.exists()) {
                const msgs = Object.values(snapshot.val());
                const lastMsg = msgs[msgs.length - 1];
                
                if (lastMsg) {
                    setLastMessage(lastMsg.text || (lastMsg.type === 'game_start' ? '🎮 Game Started' : 'Attachment'));
                    
                    if (lastMsg.senderId !== currentUserID && !lastMsg.read) {
                        setHasUnread(true);
                    } else {
                        setHasUnread(false);
                    }
                }
            } else { 
                setLastMessage(''); 
                setHasUnread(false); 
            }
        });
        return () => unsubscribe();
    }, [currentUserID, user.userID]);

    const isSelected = selectedUser && selectedUser._id === user._id;

    return (
        <div 
            onClick={() => onSelectUser(user)} 
            className={`flex items-center p-3 mb-2 rounded-2xl cursor-pointer transition-all duration-300 border ${isSelected ? 'bg-monster-purple/10 border-monster-purple/30 dark:bg-monster-purple/20 dark:border-monster-purple/50 shadow-sm' : 'border-transparent hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'}`}
        >
            <div className="relative">
                <img 
                    src={user.profilePic ? `${import.meta.env.VITE_API_URL}${user.profilePic}` : DEFAULT_AVATAR} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-transparent" 
                    alt="profile"
                />
                {hasUnread && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse shadow-sm"></span>
                )}
            </div>
            <div className="ml-4 flex-grow overflow-hidden">
                <p className={`text-sm truncate transition-all ${hasUnread ? 'font-black text-gray-900 dark:text-white' : 'font-bold text-gray-700 dark:text-gray-200'}`}>
                    {user.username}
                </p>
                <p className={`text-xs truncate transition-all ${hasUnread ? 'font-bold text-monster-purple dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 font-medium'}`}>
                    {lastMessage || user.country}
                </p>
            </div>
        </div>
    );
};

const ChatUserList = ({ users, onSelectUser, selectedUser, currentUserID }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredUsers = users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex flex-col h-full bg-transparent">
            <div className="p-5 pb-3">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-2">
                        <ChatBubbleLeftRightIcon className="h-7 w-7 text-monster-purple" />
                        Chats
                    </h2>
                    <span className="bg-monster-purple/10 dark:bg-monster-purple/20 text-monster-purple dark:text-purple-300 text-xs font-extrabold px-3 py-1 rounded-full border border-monster-purple/20">
                        {users.length}
                    </span>
                </div>
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search friends..." 
                        className="w-full bg-white dark:bg-gray-700/50 text-gray-800 dark:text-white pl-11 pr-4 py-3 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-monster-purple/50 border border-gray-100 dark:border-gray-600 transition-shadow shadow-sm placeholder-gray-400" 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto px-3 pt-2 custom-scrollbar">
                {filteredUsers.length === 0 ? (
                    <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-6 font-bold">No chats found.</p>
                ) : (
                    filteredUsers.map(user => (
                        <UserListItem 
                            key={user._id} 
                            user={user} 
                            selectedUser={selectedUser} 
                            onSelectUser={onSelectUser} 
                            currentUserID={currentUserID} 
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatUserList;