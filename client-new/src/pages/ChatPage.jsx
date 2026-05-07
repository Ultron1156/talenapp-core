import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ref, get, onValue, push, set, update, serverTimestamp, remove, off } from 'firebase/database';
import { db } from '../firebase';
import userService from '../services/userService';
import {
    FaceSmileIcon,
    PuzzlePieceIcon,
    UserPlusIcon,
    NoSymbolIcon,
    TrashIcon,
    PaperAirplaneIcon,
    ChatBubbleLeftRightIcon,
    UsersIcon,
    ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/solid';
import EmojiPicker from 'emoji-picker-react';

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

const WouldYouRatherMessage = ({ msg, userID, targetUserID, onVote, messageKey }) => {
    const myVote = msg.votes?.[userID];
    const opponentVote = msg.votes?.[targetUserID];
    const hasBothVoted = myVote && opponentVote;

    const handleVoteClick = (option) => {
        if (!myVote) onVote(messageKey, option);
    };

    const getOptionLabel = (optionNum) => {
        let label = optionNum === 1 ? msg.optionOneText : msg.optionTwoText;
        if (hasBothVoted) {
            const voters = [];
            if (myVote === optionNum) voters.push("You");
            if (opponentVote === optionNum) voters.push("Friend");
            if (voters.length > 0) label += ` (${voters.join(" & ")})`;
        }
        return label;
    };

    return (
        <div className="shrink-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-[2rem] shadow-xl my-4 w-full max-w-sm mx-auto text-center border border-white/50 dark:border-gray-700/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-monster-turquoise to-monster-purple"></div>
            <h3 className="font-extrabold text-2xl mb-6 text-gray-800 dark:text-white mt-2 tracking-tight">Would You Rather...</h3>

            <div className="flex flex-col gap-4">
                <button
                    onClick={() => handleVoteClick(1)}
                    disabled={myVote || hasBothVoted}
                    className={`w-full p-4 rounded-2xl text-[15px] font-extrabold transition-all shadow-sm leading-snug ${myVote === 1 ? 'bg-monster-turquoise text-white shadow-lg transform scale-[1.02]' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'} ${myVote && myVote !== 1 ? 'opacity-40 grayscale' : ''} ${hasBothVoted && opponentVote === 1 ? 'ring-2 ring-monster-purple ring-offset-2 dark:ring-offset-gray-800' : ''}`}
                >
                    {getOptionLabel(1)}
                </button>
                
                <div className="flex items-center justify-center -my-2 z-10 relative">
                    <span className="bg-white dark:bg-gray-800 text-xs font-bold px-2 py-1 rounded-full text-gray-400">OR</span>
                </div>

                <button
                    onClick={() => handleVoteClick(2)}
                    disabled={myVote || hasBothVoted}
                    className={`w-full p-4 rounded-2xl text-[15px] font-extrabold transition-all shadow-sm leading-snug ${myVote === 2 ? 'bg-monster-purple text-white shadow-lg transform scale-[1.02]' : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'} ${myVote && myVote !== 2 ? 'opacity-40 grayscale' : ''} ${hasBothVoted && opponentVote === 2 ? 'ring-2 ring-monster-turquoise ring-offset-2 dark:ring-offset-gray-800' : ''}`}
                >
                    {getOptionLabel(2)}
                </button>
            </div>

            {!myVote && !opponentVote && <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-6">Waiting for votes...</p>}
            {myVote && !opponentVote && <p className="text-xs font-bold text-monster-purple mt-6 animate-pulse">Vote sent! Waiting for them...</p>}
            {!myVote && opponentVote && <p className="text-xs font-bold text-monster-turquoise mt-6 animate-bounce">They voted! Your turn...</p>}
            {hasBothVoted && <p className="text-sm font-extrabold text-green-500 mt-6">Both have voted! Results are in.</p>}
        </div>
    );
};

const SuggestionsSidebar = ({ users }) => {
    return (
        <div className="p-5 border-t border-gray-100 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <h3 className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
                Suggested for You
            </h3>
            <div className="space-y-1">
                {users.map(user => (
                    <Link
                        to={`/profile/${user._id}`}
                        key={user._id}
                        className="flex items-center p-2 rounded-2xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm transition-all duration-200 border border-transparent hover:border-gray-100 dark:hover:border-gray-600 group"
                    >
                        <img
                            src={user.profilePic ? `${import.meta.env.VITE_API_URL}${user.profilePic}` : DEFAULT_AVATAR}
                            alt={user.username}
                            className="w-10 h-10 rounded-full mr-3 object-cover shadow-sm group-hover:scale-105 transition-transform"
                        />
                        <div>
                            <p className="font-bold text-sm text-gray-800 dark:text-gray-100 group-hover:text-monster-purple transition-colors">
                                {user.username}
                            </p>
                            <p className="text-xs font-medium text-gray-400">{user.country}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

const UserListItem = ({ user, isSelected, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center p-3 rounded-2xl cursor-pointer transition-all duration-200 mb-1 ${isSelected ? 'bg-monster-purple/10 border border-monster-purple/30 shadow-sm' : 'hover:bg-white dark:hover:bg-gray-700/50 border border-transparent hover:shadow-sm'}`}
    >
        <img
            src={user.profilePic ? `${import.meta.env.VITE_API_URL}${user.profilePic}` : DEFAULT_AVATAR}
            alt={user.username}
            className="w-12 h-12 rounded-full object-cover mr-3 shadow-sm"
        />
        <div>
            <p className={`font-bold text-sm ${isSelected ? 'text-monster-purple dark:text-purple-400' : 'text-gray-800 dark:text-gray-100'}`}>
                {user.username}
            </p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{user.country || 'Global'}</p>
        </div>
    </div>
);

const Chat = ({ userID, targetUser, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);

    const targetUserID = targetUser?._id || targetUser?.userID;
    const conversationId = targetUserID ? [userID, targetUserID].sort().join('_') : null;

    const isFriend = currentUser?.friends?.includes(targetUserID);
    const isBlockedByMe = currentUser?.blockedUsers?.includes(targetUserID);
    const isPrivacyRestricted = targetUser?.onlyFriendsCanMessage && !isFriend;
    const canSendMessage = !isBlockedByMe && !isPrivacyRestricted;
    const hasSentRequest = currentUser?.sentRequests?.includes(targetUserID);

    useEffect(() => {
        if (!conversationId) return;
        const messagesRef = ref(db, `conversations/${conversationId}/messages`);

        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                Object.keys(data).forEach(key => {
                    if (data[key].senderId !== userID && !data[key].read) {
                        update(ref(db, `conversations/${conversationId}/messages/${key}`), { read: true });
                    }
                });
                const messageList = Object.keys(data).map(key => ({ ...data[key], firebaseKey: key }));
                messageList.sort((a, b) => a.timestamp - b.timestamp);
                setMessages(messageList);
            } else {
                setMessages([]);
            }
        });
        return () => unsubscribe();
    }, [conversationId, userID]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleVote = (messageKey, option) => {
        update(ref(db, `conversations/${conversationId}/messages/${messageKey}/votes`), { [userID]: option });
    };

    const handleDeleteChat = async () => {
        if(window.confirm("Are you sure you want to delete this entire conversation?")) {
            try {
                await remove(ref(db, `conversations/${conversationId}`));
                setMessages([]);
            } catch (error) {
                console.error("Failed to delete chat", error);
            }
        }
    };

    const handleSendFriendRequest = async () => {
        try {
            await userService.sendFriendRequest(targetUserID);
            alert("Friend request sent!");
        } catch (error) {
            alert("Failed to send request.");
        }
    };

    const sendMessage = () => {
        if (!input.trim() || !conversationId || !canSendMessage) return;
        set(push(ref(db, `conversations/${conversationId}/messages`)), {
            type: 'text',
            senderId: userID,
            text: input.trim(),
            timestamp: serverTimestamp()
        });
        setInput('');
        setShowEmojiPicker(false);
    };

    const handleStartGame = async () => {
        if (!canSendMessage) return;
        try {
            const gameQuestion = await userService.getRandomGame(targetUserID);
            if (gameQuestion.message && !gameQuestion.optionOneText) {
                alert(gameQuestion.message);
                return;
            }
            set(push(ref(db, `conversations/${conversationId}/messages`)), {
                type: 'game_start',
                gameId: gameQuestion._id || 'temp',
                optionOneText: gameQuestion.optionOneText,
                optionTwoText: gameQuestion.optionTwoText,
                senderId: userID,
                timestamp: serverTimestamp(),
                votes: {}
            });
        } catch (error) {
            console.error("Failed to start game", error);
            alert("Failed to start the game. You might have reached your daily limit!");
        }
    };

    if (!targetUserID) return null;

    return (
        <div className="flex flex-col h-full w-full relative bg-[#F8FAFC] dark:bg-[#0B1120] rounded-r-[2.5rem] overflow-hidden">
            <div className="flex items-center justify-between p-4 px-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700/50 shadow-sm z-20 absolute top-0 w-full transition-colors">
                <Link to={`/profile/${targetUserID}`} className="flex items-center hover:opacity-80 transition-opacity group">
                    <img
                        src={targetUser.profilePic ? `${import.meta.env.VITE_API_URL}${targetUser.profilePic}` : DEFAULT_AVATAR}
                        className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-white dark:border-gray-700 shadow-sm group-hover:border-monster-purple transition-colors"
                        alt="profile"
                    />
                    <div>
                        <h2 className="font-extrabold text-lg text-gray-900 dark:text-white leading-tight">{targetUser.username}</h2>
                        <p className="text-xs text-monster-purple dark:text-purple-400 font-bold uppercase tracking-wider">{targetUser.country}</p>
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    <button onClick={handleDeleteChat} className="text-gray-400 hover:text-red-500 p-2.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <TrashIcon className="h-5 w-5" />
                    </button>
                    {!isFriend && !isBlockedByMe && (
                        <button
                            onClick={hasSentRequest ? null : handleSendFriendRequest}
                            disabled={hasSentRequest}
                            className={`flex items-center space-x-2 font-extrabold py-2 px-5 rounded-full text-sm shadow-sm transition-colors ${hasSentRequest ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'}`}
                        >
                            <UserPlusIcon className="h-4 w-4" />
                            <span>{hasSentRequest ? 'Request Sent' : 'Add Friend'}</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-grow p-6 pt-24 overflow-y-auto flex flex-col space-y-3 custom-scrollbar z-10 relative">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" style={{backgroundImage: `radial-gradient(#7E57C2 1px, transparent 1px)`, backgroundSize: '20px 20px'}}></div>

                {messages.length === 0 && (
                    <div className="text-center text-gray-400 dark:text-gray-500 mt-20 font-bold bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm py-4 px-8 rounded-[2rem] self-center shadow-sm border border-gray-100 dark:border-gray-700/50">
                        No messages here yet. Say hi! 👋
                    </div>
                )}

                {messages.map((msg, index) => {
                    if (msg.type === 'game_start') return ( <WouldYouRatherMessage key={msg.firebaseKey} msg={msg} userID={userID} targetUserID={targetUserID} messageKey={msg.firebaseKey} onVote={handleVote} /> );

                    const isMe = msg.senderId === userID;
                    const isLastFromSender = index === messages.length - 1 || messages[index + 1]?.senderId !== msg.senderId;

                    return (
                        <div key={msg.firebaseKey} className={`shrink-0 flex items-end gap-2 group relative z-10 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`px-5 py-3.5 max-w-[75%] md:max-w-[65%] text-[15px] leading-relaxed shadow-sm transition-all break-words overflow-hidden ${isMe ? `bg-gradient-to-tr from-monster-purple to-indigo-500 text-white shadow-purple-500/20 ${isLastFromSender ? 'rounded-[1.5rem] rounded-br-sm' : 'rounded-[1.5rem]'}` : `bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 ${isLastFromSender ? 'rounded-[1.5rem] rounded-bl-sm' : 'rounded-[1.5rem]'}`}`}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} className="h-4 shrink-0" />
            </div>

            <div className="p-4 pb-6 px-6 bg-transparent z-20">
                {isBlockedByMe ? (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-[2rem] text-center border border-red-100 dark:border-red-900/50">
                        <p className="text-red-500 dark:text-red-400 font-bold flex items-center justify-center gap-2">
                            <NoSymbolIcon className="h-5 w-5" /> You blocked this user.
                        </p>
                    </div>
                ) : isPrivacyRestricted ? (
                    <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-[2rem] text-center border border-gray-200 dark:border-gray-700/50">
                        <p className="text-gray-500 dark:text-gray-400 font-bold flex items-center justify-center gap-2">
                            <NoSymbolIcon className="h-5 w-5" /> This user only receives messages from friends.
                        </p>
                    </div>
                ) : (
                    <div className="relative flex items-center gap-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-2 pl-4 rounded-[2.5rem] shadow-lg border border-gray-200 dark:border-gray-700/50 transition-colors">
                        {showEmojiPicker && (
                            <div className="absolute bottom-20 left-0 z-50 shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700">
                                <EmojiPicker onEmojiClick={(emoji) => { setInput(prev => prev + emoji.emoji); }} height={350} />
                            </div>
                        )}
                        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-gray-400 hover:text-monster-purple dark:hover:text-purple-400 transition-colors rounded-full hover:bg-gray-50 dark:hover:bg-gray-700">
                            <FaceSmileIcon className="h-6 w-6" />
                        </button>

                        <button onClick={handleStartGame} className="p-2 text-white bg-gradient-to-r from-monster-turquoise to-teal-400 hover:from-teal-400 hover:to-teal-500 rounded-full shadow-md group relative transition-transform transform hover:scale-105">
                            <PuzzlePieceIcon className="h-5 w-5" />
                            <span className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-black text-white text-xs py-1.5 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold shadow-xl">Start Game</span>
                        </button>

                        <input
                            type="text"
                            placeholder="Message..."
                            className="flex-grow bg-transparent text-gray-900 dark:text-white px-2 py-3 text-[15px] font-medium focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 caret-monster-purple"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        />

                        <button
                            onClick={sendMessage}
                            disabled={!input.trim()}
                            className={`p-3.5 rounded-full transition-all flex items-center justify-center transform ${input.trim() ? 'bg-monster-purple hover:bg-purple-600 text-white shadow-md hover:-translate-y-0.5' : 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-500 cursor-not-allowed'}`}
                        >
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

function ChatPage({ currentUser }) {
    const [chatUsers, setChatUsers] = useState([]);
    const [friends, setFriends] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('chats');
    const location = useLocation();

    useEffect(() => {
        if (location.state?.selectedUserFromProfile) {
            setSelectedUser(location.state.selectedUserFromProfile);
            setActiveTab('chats');
        }
    }, [location.state]);

    // 🔥 CANLI SOHBET SIRALAMASI VE YÜKLEME EKRANI FIX'İ 🔥
    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const fetchInitialDataAndListen = async () => {
            try {
                const [friendData, suggestedUsers] = await Promise.all([
                    userService.getFriendsList(),
                    userService.getUserSuggestions()
                ]);
                const formattedFriends = friendData.map(f => ({ ...f, userID: f._id }));
                setFriends(formattedFriends);
                setSuggestions(suggestedUsers);

                const convRef = ref(db, 'conversations');
                onValue(convRef, async (snapshot) => {
                    try {
                        if (snapshot.exists()) {
                            const data = snapshot.val();
                            const myConversations = Object.keys(data).filter(key => key.includes(currentUser._id));
                            
                            let updatedChatUsers = [];

                            for (let key of myConversations) {
                                const otherUserId = key.replace(currentUser._id, '').replace('_', '');
                                if (!otherUserId) continue;

                                const msgs = data[key].messages || {};
                                const msgKeys = Object.keys(msgs);
                                let lastMsgTime = msgKeys.length > 0 ? msgs[msgKeys[msgKeys.length - 1]].timestamp || 0 : 0;

                                let userProfile = formattedFriends.find(f => f.userID === otherUserId) || 
                                                  suggestedUsers.find(s => s._id === otherUserId) ||
                                                  chatUsers.find(c => c.userID === otherUserId);

                                if (!userProfile) {
                                    try {
                                        userProfile = await userService.getUserProfile(otherUserId);
                                        userProfile.userID = userProfile._id;
                                    } catch (e) {
                                        continue;
                                    }
                                }

                                updatedChatUsers.push({
                                    ...userProfile,
                                    lastMsgTime
                                });
                            }

                            updatedChatUsers.sort((a, b) => b.lastMsgTime - a.lastMsgTime);
                            setChatUsers(updatedChatUsers);
                        } else {
                            setChatUsers([]);
                        }
                    } catch (error) {
                        console.error("Error processing chats:", error);
                    } finally {
                        setLoading(false); // 🔥 Hata olsa da olmasa da yükleme ekranını KAPAT 🔥
                    }
                }, (error) => {
                    console.error("Firebase Permission/Read Error:", error);
                    setLoading(false); // 🔥 Firebase izni reddetse bile yükleme ekranını KAPAT 🔥
                });
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false); // 🔥 Ana fetch çökse bile yükleme ekranını KAPAT 🔥
            }
        };

        fetchInitialDataAndListen();

        return () => {
            off(ref(db, 'conversations'));
        };
    }, [currentUser]);

    if (loading) {
        return (
            <div className="h-screen w-full flex justify-center items-center dark:text-white font-bold animate-pulse text-monster-purple">
                Loading messages...
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="h-screen w-full flex justify-center items-center dark:text-white font-bold">
                User information not found. Please log in.
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-70px)] w-full flex justify-center items-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 font-sans p-4 lg:p-6 transition-colors">
            <div className="w-full max-w-7xl h-full max-h-[850px] bg-white/90 dark:bg-gray-800/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-row border border-white/40 dark:border-gray-700/50">

                <div className="w-[35%] lg:w-[30%] flex-none bg-gray-50/50 dark:bg-gray-800/50 border-r border-gray-100 dark:border-gray-700/50 flex flex-col backdrop-blur-md z-10 overflow-hidden">
                    <div className="flex border-b border-gray-200 dark:border-gray-700 pt-4 px-4 bg-white/50 dark:bg-gray-800/50">
                        <button
                            onClick={() => setActiveTab('chats')}
                            className={`flex-1 pb-3 flex items-center justify-center gap-2 text-sm font-extrabold transition-all ${activeTab === 'chats' ? 'text-monster-purple border-b-2 border-monster-purple' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                            <ChatBubbleBottomCenterTextIcon className="w-4 h-4" /> Chats
                        </button>
                        <button
                            onClick={() => setActiveTab('friends')}
                            className={`flex-1 pb-3 flex items-center justify-center gap-2 text-sm font-extrabold transition-all ${activeTab === 'friends' ? 'text-monster-purple border-b-2 border-monster-purple' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                            <UsersIcon className="w-4 h-4" /> Friends
                        </button>
                    </div>

                    <div className="flex-shrink-0 h-full overflow-hidden flex flex-col pt-2">
                        <div className="flex-grow overflow-y-auto custom-scrollbar px-3">
                            {activeTab === 'chats' ? (
                                chatUsers.length > 0 ? (
                                    chatUsers.map(u => (
                                        <UserListItem
                                            key={u.userID}
                                            user={u}
                                            isSelected={selectedUser?.userID === u.userID || selectedUser?._id === u.userID}
                                            onClick={() => setSelectedUser(u)}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center p-6 text-gray-400 font-bold text-sm">No chats found. Go to Friends tab or Discover to start one!</div>
                                )
                            ) : (
                                friends.length > 0 ? (
                                    friends.map(f => (
                                        <UserListItem
                                            key={f.userID}
                                            user={f}
                                            isSelected={selectedUser?.userID === f.userID || selectedUser?._id === f.userID}
                                            onClick={() => setSelectedUser(f)}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center p-6 text-gray-400 font-bold text-sm">No friends yet. Add some from Discover!</div>
                                )
                            )}
                        </div>

                        <div className="flex-shrink-0">
                            {suggestions.length > 0 && <SuggestionsSidebar users={suggestions} />}
                        </div>
                    </div>
                </div>

                <div className="w-[65%] lg:w-[70%] flex-none flex flex-col bg-transparent relative z-0 overflow-hidden">
                    {selectedUser ? (
                        <Chat userID={currentUser._id} targetUser={selectedUser} currentUser={currentUser} />
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 relative overflow-hidden bg-[#F8FAFC] dark:bg-[#0B1120] rounded-r-[2.5rem]">
                            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-monster-purple/20 dark:bg-monster-purple/10 rounded-full blur-[80px] animate-pulse pointer-events-none"></div>
                            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[80px] animate-pulse pointer-events-none delay-1000"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-28 h-28 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-8 shadow-2xl border border-white dark:border-gray-700 transform transition-transform hover:scale-110 duration-500">
                                    <ChatBubbleLeftRightIcon className="h-12 w-12 text-monster-purple" />
                                </div>
                                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-monster-purple to-blue-500 mb-4 tracking-tight">
                                    Select a Conversation
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm font-medium text-lg leading-relaxed">
                                    Choose a friend from the left sidebar to dive into the chat or start a game!
                                </p>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default ChatPage;