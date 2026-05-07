import React, { useState, useRef, useEffect } from 'react';
import postService from '../services/postService';
import { FaceSmileIcon, GlobeAmericasIcon, UsersIcon } from '@heroicons/react/24/outline';
import EmojiPicker from 'emoji-picker-react';

const CreatePostForm = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [privacy, setPrivacy] = useState('public');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Emoji penceresinin dışını algılamak için referans oluşturuyoruz
    const emojiRef = useRef(null);

    // HATANIN ÇÖZÜMÜ: Dışarı tıklandığında emoji penceresini kapatan kod
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiRef.current && !emojiRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        // Fare tıklamalarını dinle
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        setIsSubmitting(true);
        try {
            const newPost = await postService.createPost({ content, privacy });
            onPostCreated(newPost);
            setContent('');
            setShowEmojiPicker(false);
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create post.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onEmojiClick = (emojiObject) => {
        setContent(prev => prev + emojiObject.emoji);
    };

    return (
        // BEYAZ GİTTİ: Tamamen Karanlık Mod Uyumlu Tasarım
        <div className="bg-gray-800 p-6 rounded-[2.5rem] shadow-xl border border-gray-700 mb-8 relative z-20 transition-colors">
            <form onSubmit={handleSubmit}>
                <textarea
                    className="w-full bg-gray-900/50 text-white p-5 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-monster-purple/50 border border-gray-700 placeholder-gray-500 custom-scrollbar"
                    rows="3"
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>
                
                <div className="flex items-center justify-between mt-4">
                    
                    {/* EMOJİ VE GİZLİLİK BUTONLARI (ref eklendi) */}
                    <div className="flex items-center space-x-3 relative" ref={emojiRef}>
                        
                        {/* EMOJİ BUTONU */}
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={`p-2.5 rounded-full transition-colors ${showEmojiPicker ? 'bg-monster-purple text-white' : 'text-gray-400 bg-gray-700/50 hover:text-monster-purple hover:bg-gray-700'}`}
                        >
                            <FaceSmileIcon className="h-6 w-6" />
                        </button>
                        
                        {/* EMOJİ PENCERESİ (theme="dark" eklendi) */}
                        {showEmojiPicker && (
                            <div className="absolute top-14 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-gray-700 animate-fadeIn">
                                <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" height={350} />
                            </div>
                        )}

                        {/* GİZLİLİK AYARI */}
                        <div className="flex bg-gray-900/50 rounded-full p-1 border border-gray-700">
                            <button
                                type="button"
                                onClick={() => setPrivacy('public')}
                                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${privacy === 'public' ? 'bg-monster-purple text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                <GlobeAmericasIcon className="h-4 w-4" />
                                <span>Public</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPrivacy('friends')}
                                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${privacy === 'friends' ? 'bg-monster-purple text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                <UsersIcon className="h-4 w-4" />
                                <span>Friends Only</span>
                            </button>
                        </div>
                    </div>

                    {/* PAYLAŞ BUTONU */}
                    <button
                        type="submit"
                        disabled={!content.trim() || isSubmitting}
                        className={`px-8 py-2.5 rounded-full font-extrabold text-sm transition-all transform flex items-center justify-center ${content.trim() && !isSubmitting ? 'bg-monster-purple hover:bg-purple-600 text-white shadow-lg hover:-translate-y-0.5' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                        ) : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePostForm;