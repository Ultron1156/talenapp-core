import React, { Fragment, useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { HomeIcon, ChatBubbleLeftRightIcon, MagnifyingGlassIcon, UserCircleIcon, Cog8ToothIcon, ArrowRightOnRectangleIcon, PencilIcon, BellIcon, HeartIcon, ChatBubbleLeftIcon, ArrowPathRoundedSquareIcon } from '@heroicons/react/24/solid';
import userService from '../services/userService';
import logo from '../assets/logo.jpg';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

const Navbar = ({ user, onLogout }) => {
  const [hasUnreadChats, setHasUnreadChats] = useState(false); 
  const [friendRequests, setFriendRequests] = useState([]); 
  const [notifications, setNotifications] = useState([]); 
  const [activeTab, setActiveTab] = useState('all'); 

  const handleLogoutClick = () => onLogout();

  // 🔥 1. GERÇEK ZAMANLI SOHBET BİLDİRİMİ (CHAT) 🔥
  useEffect(() => {
    if (!user) return;
    const currentUserID = user._id || user.userID;
    const conversationsRef = ref(db, 'conversations');
    
    const unsubscribe = onValue(conversationsRef, (snapshot) => {
      let unreadFound = false;
      snapshot.forEach(child => {
        if (child.key.includes(currentUserID)) {
          const messages = child.val().messages;
          if (messages) {
            const msgList = Object.values(messages);
            const lastMsg = msgList[msgList.length - 1];
            if (lastMsg && lastMsg.senderId !== currentUserID && !lastMsg.read) {
                unreadFound = true;
            }
          }
        }
      });
      setHasUnreadChats(unreadFound);
    });
    return () => unsubscribe();
  }, [user]);

  // 🔥 2. SİSTEM BİLDİRİMLERİ VE İSTEKLER (NOTIFICATIONS & REQUESTS) 🔥
  useEffect(() => {
      if (!user) return;
      const fetchNotificationsAndRequests = async () => {
          try {
              const profile = await userService.getMyProfile();
              if (profile.friendRequests && profile.friendRequests.length > 0) {
                  const requestDetails = await Promise.all(
                      profile.friendRequests.map(async (reqId) => await userService.getUserProfile(reqId))
                  );
                  setFriendRequests(requestDetails);
              } else {
                  setFriendRequests([]);
              }
              
              const notifs = await userService.getNotifications();
              
              // 🔥 FRONTEND KESİN SIRALAMA: Tarihi en yeni olan en üste gelecek şekilde zorla sıralıyoruz! 🔥
              const sortedNotifs = notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              setNotifications(sortedNotifs);
          } catch (error) { console.error("Could not fetch notifications", error); }
      };

      fetchNotificationsAndRequests();
      const interval = setInterval(fetchNotificationsAndRequests, 10000); 
      return () => clearInterval(interval);
  }, [user]);

  const handleBellClick = async () => {
      const hasUnreadNotifs = notifications.some(n => !n.isRead);
      if (hasUnreadNotifs) {
          try {
              await userService.markNotificationsAsRead();
              setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); 
          } catch (error) { console.error("Could not mark as read", error); }
      }
  };

  const handleAccept = async (reqUserId) => {
      try {
          await userService.acceptFriendRequest(reqUserId);
          setFriendRequests(prev => prev.filter(req => req._id !== reqUserId));
      } catch (error) { alert("An error occurred."); }
  };

  const handleReject = async (reqUserId) => {
    try {
        await userService.rejectFriendRequest(reqUserId);
        setFriendRequests(prev => prev.filter(req => req._id !== reqUserId));
    } catch (error) { alert("An error occurred."); }
  };

  const getNotificationIcon = (type) => {
      if (type === 'like') return <HeartIcon className="h-5 w-5 text-red-500" />;
      if (type === 'comment') return <ChatBubbleLeftIcon className="h-5 w-5 text-blue-500" />;
      if (type === 'repost') return <ArrowPathRoundedSquareIcon className="h-5 w-5 text-green-500" />;
      return <BellIcon className="h-5 w-5 text-monster-purple" />;
  };

  const getNotificationText = (type) => {
      if (type === 'like') return 'liked your post.';
      if (type === 'comment') return 'commented on your post.';
      if (type === 'repost') return 'reposted your post.';
      return 'sent you a new message.';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const totalBadges = friendRequests.length + unreadCount;

  return (
    <nav className="bg-[#F0F2F5] dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to={user ? "/feed" : "/"} className="flex items-center">
          <img src={logo} alt="TALEN Logo" className="h-8 w-auto" />
        </Link>

        {user ? (
          <div className="flex items-center space-x-2 md:space-x-4">
            <NavLink to="/feed" className={({ isActive }) => `hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-monster-purple dark:bg-monster-dark-blue text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-[#E4E6EB] dark:hover:bg-gray-700'}`}>
              <HomeIcon className="h-6 w-6" />
              <span className="hidden md:inline">Feed</span>
            </NavLink>
            
            <NavLink to="/chat" className={({ isActive }) => `hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors relative ${isActive ? 'bg-monster-purple dark:bg-monster-dark-blue text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-[#E4E6EB] dark:hover:bg-gray-700'}`}>
              <div className="relative">
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
                {hasUnreadChats && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#F0F2F5] dark:border-gray-800 animate-pulse"></span>}
              </div>
              <span className="hidden md:inline">Chat</span>
            </NavLink>

            <NavLink to="/discover" className={({ isActive }) => `hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-monster-purple dark:bg-monster-dark-blue text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-[#E4E6EB] dark:hover:bg-gray-700'}`}>
              <MagnifyingGlassIcon className="h-6 w-6" />
              <span className="hidden md:inline">Discover</span>
            </NavLink>

            <Menu as="div" className="relative">
              <Menu.Button onClick={handleBellClick} className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-[#E4E6EB] dark:hover:bg-gray-700 transition-colors focus:outline-none">
                <BellIcon className="h-6 w-6" />
                {totalBadges > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full border-2 border-[#F0F2F5] dark:border-gray-800">
                    {totalBadges}
                  </span>
                )}
              </Menu.Button>
              
              <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right bg-[#F0F2F5] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl focus:outline-none overflow-hidden z-50">
                  
                  <div className="flex border-b border-gray-300 dark:border-gray-700 bg-[#E4E6EB] dark:bg-gray-800/80">
                      <button onClick={() => setActiveTab('all')} className={`flex-1 py-3 text-sm font-bold text-center transition-colors relative ${activeTab === 'all' ? 'text-monster-purple border-b-2 border-monster-purple' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                          All Notifications
                      </button>
                      <button onClick={() => setActiveTab('requests')} className={`flex-1 py-3 text-sm font-bold text-center transition-colors relative ${activeTab === 'requests' ? 'text-monster-purple border-b-2 border-monster-purple' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                          Requests
                          {friendRequests.length > 0 && <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full">{friendRequests.length}</span>}
                      </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {activeTab === 'all' && (
                          notifications.length === 0 ? (
                              <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                  <BellIcon className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                  <p className="font-medium">No new notifications yet.</p>
                              </div>
                          ) : (
                              notifications.map(notif => (
                                  <div key={notif._id} className={`block p-4 border-b hover:bg-[#E4E6EB] dark:hover:bg-gray-700/50 transition-colors ${!notif.isRead ? 'bg-purple-50 dark:bg-gray-700/30 border-purple-100 dark:border-gray-600' : 'bg-[#F0F2F5] dark:bg-gray-800 border-gray-200 dark:border-gray-700/50'}`}>
                                      <div className="flex items-center space-x-3">
                                          <Link to={`/profile/${notif.sender._id}`} className="flex-shrink-0 hover:opacity-80 transition-opacity">
                                            <img src={notif.sender.profilePic ? `${import.meta.env.VITE_API_URL}${notif.sender.profilePic}` : DEFAULT_AVATAR} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600 shadow-sm" />
                                          </Link>
                                          <div className="flex-1 text-sm text-gray-800 dark:text-gray-200">
                                              <Link to={`/profile/${notif.sender._id}`} className="font-extrabold hover:underline">
                                                  {notif.sender.username}
                                              </Link>{' '}
                                              <Link to={`/feed#${notif.post}`} className="text-gray-600 dark:text-gray-400 hover:text-monster-purple transition-colors cursor-pointer">
                                                  {getNotificationText(notif.type)}
                                              </Link>
                                          </div>
                                          <div>{getNotificationIcon(notif.type)}</div>
                                      </div>
                                  </div>
                              ))
                          )
                      )}

                      {activeTab === 'requests' && (
                          friendRequests.length === 0 ? (
                              <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                  <UserCircleIcon className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                  <p className="font-medium">No pending friend requests.</p>
                              </div>
                          ) : (
                              friendRequests.map(reqUser => (
                                  <div key={reqUser._id} className="p-4 border-b border-gray-200 dark:border-gray-700/50 hover:bg-[#E4E6EB] dark:hover:bg-gray-700/50 transition-colors">
                                      <div className="flex items-center justify-between mb-3">
                                          <Link to={`/profile/${reqUser._id}`} className="flex items-center space-x-3 flex-grow hover:opacity-80">
                                              <img src={reqUser.profilePic ? `${import.meta.env.VITE_API_URL}${reqUser.profilePic}` : DEFAULT_AVATAR} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600 shadow-sm" />
                                              <div>
                                                  <p className="text-sm font-extrabold text-gray-900 dark:text-white">{reqUser.username}</p>
                                                  <p className="text-[11px] font-bold text-monster-purple uppercase tracking-wider">Sent you a request</p>
                                              </div>
                                          </Link>
                                      </div>
                                      <div className="flex gap-2 mt-1">
                                          <button onClick={() => handleAccept(reqUser._id)} className="flex-1 bg-monster-turquoise hover:bg-teal-500 text-white text-xs font-extrabold py-2 rounded-lg transition-colors shadow-sm transform hover:-translate-y-0.5">Accept</button>
                                          <button onClick={() => handleReject(reqUser._id)} className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-xs font-extrabold py-2 rounded-lg transition-colors shadow-sm transform hover:-translate-y-0.5">Reject</button>
                                      </div>
                                  </div>
                              ))
                          )
                      )}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            <Menu as="div" className="relative ml-2">
              <Menu.Button className="flex items-center space-x-2 focus:outline-none">
                <img src={user.profilePic ? `${import.meta.env.VITE_API_URL}${user.profilePic}` : DEFAULT_AVATAR} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-monster-purple transition-colors shadow-sm" />
              </Menu.Button>
              <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-[#F0F2F5] dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => ( <Link to={`/profile/${user._id}`} className={`${active ? 'bg-monster-purple text-white' : 'text-gray-900 dark:text-gray-200'} group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-bold transition-colors`}> <UserCircleIcon className="mr-3 h-5 w-5" /> My Profile </Link> )}
                    </Menu.Item>
                     <Menu.Item>
                      {({ active }) => ( <Link to="/profile/edit" className={`${active ? 'bg-monster-purple text-white' : 'text-gray-900 dark:text-gray-200'} group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-bold transition-colors`}> <PencilIcon className="mr-3 h-5 w-5" /> Edit Profile </Link> )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => ( <Link to="/settings" className={`${active ? 'bg-monster-purple text-white' : 'text-gray-900 dark:text-gray-200'} group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-bold transition-colors`}> <Cog8ToothIcon className="mr-3 h-5 w-5" /> Settings </Link> )}
                    </Menu.Item>
                  </div>
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => ( <button onClick={handleLogoutClick} className={`${active ? 'bg-red-500 text-white' : 'text-red-600 dark:text-red-400'} group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-extrabold transition-colors`}> <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" /> Logout </button> )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-monster-purple dark:hover:text-monster-dark-blue font-bold transition-colors">Login</Link>
            <Link to="/register" className="bg-gradient-to-r from-monster-purple to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-extrabold py-2 px-6 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;