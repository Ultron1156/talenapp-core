import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import postService from '../services/postService';
import userService from '../services/userService';
import CreatePostForm from '../components/CreatePostForm';
import RepostModal from '../components/RepostModal';
import { HeartIcon as HeartOutline, ChatBubbleOvalLeftIcon, ArrowPathRoundedSquareIcon, TrashIcon, PencilIcon, FaceSmileIcon, FireIcon, ClockIcon, SparklesIcon, XMarkIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import EmojiPicker from 'emoji-picker-react';
import { countryOptions } from '../data/options';

const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

// 🔥 YENİ: AKILLI ZAMAN DAMGASI ALGORİTMASI 🔥
const timeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const LikesModal = ({ likes, onClose, currentUser }) => {
    const sortedLikes = [...likes].sort((a, b) => {
        const aIsFriend = currentUser?.friends?.some(f => f._id === a._id || f === a._id) ? 1 : 0;
        const bIsFriend = currentUser?.friends?.some(f => f._id === b._id || f === b._id) ? 1 : 0;
        return bIsFriend - aIsFriend; 
    });

    return (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-[#F0F2F5] dark:bg-gray-800 rounded-[2rem] w-full max-w-sm max-h-[70vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden transform transition-all">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700/50 flex justify-between items-center bg-[#E4E6EB] dark:bg-gray-800">
                    <h3 className="font-extrabold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                        <HeartSolid className="h-5 w-5 text-red-500 drop-shadow-sm" /> Likes
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-300/50 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded-full transition-colors">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-3 overflow-y-auto custom-scrollbar">
                    {sortedLikes.length === 0 ? (
                        <p className="text-center text-gray-500 font-medium py-8">No likes yet.</p>
                    ) : (
                        sortedLikes.map(user => {
                            const isFriend = currentUser?.friends?.some(f => f._id === user._id || f === user._id);
                            return (
                                <Link to={`/profile/${user._id}`} key={user._id} className="flex items-center space-x-4 p-3 hover:bg-[#E4E6EB] dark:hover:bg-gray-700/50 rounded-2xl transition-all duration-200 relative group" onClick={onClose}>
                                    <img src={user.profilePic ? `${import.meta.env.VITE_API_URL}${user.profilePic}` : DEFAULT_AVATAR} alt={user.username || "User"} className="w-12 h-12 rounded-full object-cover border border-gray-300 dark:border-gray-600 shadow-sm transition-colors" />
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1.5 group-hover:text-monster-purple transition-colors">
                                            {user.username || "Unknown User"}
                                            {isFriend && <span className="bg-gradient-to-r from-monster-turquoise to-teal-400 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">Friend</span>}
                                        </p>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{user.country ? (countryOptions.find(c => c.label.includes(user.country))?.label || user.country) : ""}</p>
                                    </div>
                                </Link>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

const CommentSection = ({ post, onCommentAdded, onCommentDeleted, onCommentLiked, currentUserID }) => {
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState(post.comments || []);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const newComment = await postService.addComment(post._id, commentText);
            setComments([newComment, ...comments]);
            setCommentText('');
            setShowEmojiPicker(false);
            onCommentAdded(post._id, newComment);
        } catch (error) { console.error("Comment error:", error); }
    };
    
    const onEmojiClick = (emojiObject) => { setCommentText(prev => prev + emojiObject.emoji); };
    const handleEditClick = (comment) => { setEditingComment(comment._id); setEditText(comment.content); };
    const handleSaveEdit = async (commentId) => { try { const updatedComment = await postService.editComment(post._id, commentId, editText); setComments(comments.map(c => c._id === commentId ? updatedComment : c)); setEditingComment(null); setEditText(''); } catch (error) {} };
    const handleDeleteComment = async (commentId) => { if(window.confirm("Are you sure you want to delete your comment?")) { try { await postService.deleteComment(post._id, commentId); setComments(comments.filter(c => c._id !== commentId)); onCommentDeleted(post._id, commentId); } catch (error) {} } };
    const handleLikeComment = async (commentId) => { try { const updatedComment = await postService.likeComment(post._id, commentId); setComments(comments.map(c => c._id === commentId ? updatedComment : c)); onCommentLiked(post._id, updatedComment); } catch (error) {} };

    return (
        <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700/50">
            <div className="relative">
                {showEmojiPicker && ( <div className="absolute bottom-14 left-0 z-50 shadow-2xl rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700"><EmojiPicker onEmojiClick={onEmojiClick} height={350} /></div> )}
                <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 mb-6 bg-[#E4E6EB] dark:bg-gray-800/50 p-2 rounded-full border border-gray-300 dark:border-gray-700 focus-within:ring-2 focus-within:ring-monster-purple/30 transition-all">
                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-500 hover:text-monster-purple p-2 transition-colors rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 shadow-sm"><FaceSmileIcon className="h-6 w-6" /></button>
                    <input type="text" className="flex-grow bg-transparent text-gray-800 dark:text-white px-2 py-2 text-sm font-medium focus:outline-none placeholder-gray-500 dark:placeholder-gray-500" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                    <button type="submit" disabled={!commentText.trim()} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${commentText.trim() ? 'bg-monster-purple hover:bg-purple-600 text-white shadow-md transform hover:-translate-y-0.5' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'}`}>Post</button>
                </form>
            </div>
            <div className="space-y-5">
                {(comments || []).map(comment => {
                    const isLiked = currentUserID && comment.likes?.includes(currentUserID);
                    return (
                        <div key={comment._id} className="flex items-start group">
                            <Link to={`/profile/${comment.author?._id}`}>
                                <img src={comment.author?.profilePic ? `${import.meta.env.VITE_API_URL}${comment.author.profilePic}` : DEFAULT_AVATAR} alt={comment.author?.username || "User"} className="w-10 h-10 rounded-full mr-3 object-cover border border-gray-300 dark:border-gray-600 shadow-sm" />
                            </Link>
                            <div className="bg-[#E4E6EB] dark:bg-gray-700/40 py-3 px-5 rounded-[1.5rem] rounded-tl-sm w-full border border-gray-200 dark:border-gray-700/50 relative">
                                <div className="flex justify-between items-center mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <Link to={`/profile/${comment.author?._id}`} className="font-extrabold text-sm text-gray-800 dark:text-gray-100 hover:text-monster-purple dark:hover:text-purple-400 transition-colors">{comment.author?.username || "Unknown User"}</Link>
                                        {/* 🔥 ZAMAN DAMGASI (Yorumlar) 🔥 */}
                                        <span className="text-[11px] font-bold text-gray-400">{timeAgo(comment.createdAt)}</span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                        <button onClick={() => handleLikeComment(comment._id)} className="flex items-center space-x-1 group/like">
                                            {isLiked ? <HeartSolid className="h-4 w-4 text-red-500 drop-shadow-sm" /> : <HeartOutline className="h-4 w-4 text-gray-500 group-hover/like:text-red-500 transition-colors" />}
                                            <span className={`text-xs font-bold ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>{comment.likes?.length || 0}</span>
                                        </button>

                                        {currentUserID && comment.author && String(comment.author._id) === String(currentUserID) && (
                                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditClick(comment)} title="Edit Comment" className="text-gray-500 hover:text-blue-600 transition-colors"><PencilIcon className="h-4 w-4" /></button>
                                                <button onClick={() => handleDeleteComment(comment._id)} title="Delete Comment" className="text-gray-500 hover:text-red-500 transition-colors"><TrashIcon className="h-4 w-4" /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {editingComment === comment._id ? (
                                    <div className="mt-2">
                                        <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(comment._id)} className="bg-[#F0F2F5] dark:bg-gray-800 text-gray-800 dark:text-white py-2 px-4 rounded-xl text-sm w-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-monster-purple/50" />
                                        <p className="text-[10px] font-bold text-gray-500 mt-1.5 ml-1">Press Enter to save</p>
                                    </div>
                                ) : ( <p className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">{comment.content}</p> )}
                                {comment.isEdited && <span className="text-[11px] text-gray-500 mt-1.5 block font-semibold">(edited)</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const FeedPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeCommentSection, setActiveCommentSection] = useState(null);
    const [repostTarget, setRepostTarget] = useState(null);
    const [sortBy, setSortBy] = useState('foryou');
    const [likesModalData, setLikesModalData] = useState(null); 
    const [currentUserProfile, setCurrentUserProfile] = useState(null); 

    const currentUserID = currentUserProfile ? currentUserProfile._id : null;
    const location = useLocation();

    useEffect(() => {
        const fetchPostsAndUser = async () => {
            setLoading(true);
            try {
                const [fetchedPosts, userProfile] = await Promise.all([ postService.getAllPosts(sortBy), userService.getMyProfile() ]);
                setPosts(fetchedPosts); setCurrentUserProfile(userProfile);
            } catch (err) { setError(err.message); } finally { setLoading(false); }
        };
        fetchPostsAndUser();
    }, [sortBy]);

    useEffect(() => {
        if (!loading && posts.length > 0 && location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(`post-${id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('ring-4', 'ring-monster-purple', 'shadow-xl', 'scale-[1.02]', 'transition-all', 'duration-500', 'z-10');
                setActiveCommentSection(id);
                setTimeout(() => { element.classList.remove('ring-4', 'ring-monster-purple', 'shadow-xl', 'scale-[1.02]', 'z-10'); }, 2000);
            }
        }
    }, [loading, posts, location.hash]);

    const handlePostCreated = (newPost) => setPosts(prevPosts => [newPost, ...prevPosts]);
    const handleCommentAddedToPost = (postId, newComment) => { setPosts(currentPosts => currentPosts.map(p => p._id === postId ? { ...p, comments: [newComment, ...(p.comments || [])] } : p)); };
    const handleCommentDeletedFromPost = (postId, commentId) => { setPosts(currentPosts => currentPosts.map(p => p._id === postId ? { ...p, comments: p.comments.filter(c => c._id !== commentId) } : p)); };
    const handleCommentLikedInPost = (postId, updatedComment) => { setPosts(currentPosts => currentPosts.map(p => p._id === postId ? { ...p, comments: p.comments.map(c => c._id === updatedComment._id ? updatedComment : c) } : p)); };
    const handleRepost = async (postId, content) => { try { const reposted = await postService.repostPost(postId, { content }); setPosts([reposted, ...posts]); setRepostTarget(null); } catch (error) {} };
    const handleLike = async (postId) => { try { const updatedPost = await postService.likePost(postId); setPosts(currentPosts => currentPosts.map(p => p._id === postId ? updatedPost : p)); } catch (error) {} };
    const handleDelete = async (postId) => { if (window.confirm('Are you sure you want to delete this post?')) { try { await postService.deletePost(postId); setPosts(currentPosts => currentPosts.filter(p => p._id !== postId)); } catch (error) {} } };
    const handleToggleHideLikes = async (postId, currentHideStatus) => { try { const updatedPost = await postService.editPost(postId, { hideLikes: !currentHideStatus }); setPosts(currentPosts => currentPosts.map(p => p._id === postId ? updatedPost : p)); } catch (error) {} };

    return (
        <div className="min-h-screen bg-[#E4E6EB] dark:bg-[#0B1120] transition-colors duration-500 pt-8 pb-20 relative">

            <div className="container mx-auto max-w-2xl p-4 relative z-10">
                {likesModalData && <LikesModal likes={likesModalData} onClose={() => setLikesModalData(null)} currentUser={currentUserProfile} />}
                
                <CreatePostForm onPostCreated={handlePostCreated} />

                <div className="bg-[#F0F2F5] dark:bg-gray-800 p-2.5 rounded-[1.5rem] shadow-sm border border-gray-200 dark:border-gray-700 mb-8 flex justify-center space-x-2 relative z-0 mx-auto max-w-lg">
                    <button onClick={() => setSortBy('foryou')} className={`px-6 py-2.5 rounded-xl text-sm font-extrabold flex items-center space-x-2 transition-all ${sortBy === 'foryou' ? 'bg-monster-purple text-white shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-800 hover:bg-[#E4E6EB] dark:text-gray-400 dark:hover:bg-gray-700'}`}><SparklesIcon className="h-5 w-5" /> <span>For You</span></button>
                    <button onClick={() => setSortBy('latest')} className={`px-6 py-2.5 rounded-xl text-sm font-extrabold flex items-center space-x-2 transition-all ${sortBy === 'latest' ? 'bg-monster-purple text-white shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-800 hover:bg-[#E4E6EB] dark:text-gray-400 dark:hover:bg-gray-700'}`}><ClockIcon className="h-5 w-5" /> <span>Latest</span></button>
                    <button onClick={() => setSortBy('popular')} className={`px-6 py-2.5 rounded-xl text-sm font-extrabold flex items-center space-x-2 transition-all ${sortBy === 'popular' ? 'bg-monster-purple text-white shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-800 hover:bg-[#E4E6EB] dark:text-gray-400 dark:hover:bg-gray-700'}`}><FireIcon className="h-5 w-5" /> <span>Popular</span></button>
                </div>

                {loading ? <div className="text-center p-12 font-extrabold text-gray-500 dark:text-gray-500 animate-pulse">Loading amazing posts...</div> : error ? <div className="text-center p-10 text-red-500 font-bold bg-red-50 rounded-2xl">Error: {error}</div> : (
                    <div className="space-y-8">
                        {posts.map(post => {
                            const isLiked = currentUserID && post.likes.some(likeUser => String(likeUser._id || likeUser) === String(currentUserID));
                            const isAuthor = currentUserID && String(post.author?._id) === String(currentUserID);
                            const authorCountryLabel = post.author?.country ? (countryOptions.find(c => c.label.includes(post.author.country))?.label || post.author.country) : '';
                            const isCommentsActive = activeCommentSection === post._id;

                            return (
                                <div key={post._id} id={`post-${post._id}`} className="bg-[#F0F2F5] dark:bg-gray-800 p-6 md:p-8 rounded-[2.5rem] shadow-md dark:shadow-none border border-gray-200 dark:border-gray-700 relative transition-all duration-300">
                                    
                                    {isAuthor && (
                                        <div className="absolute top-6 right-6 flex items-center space-x-2">
                                            <button onClick={() => handleToggleHideLikes(post._id, post.hideLikes)} title={post.hideLikes ? "Show Likes" : "Hide Likes"} className={`p-2.5 rounded-full transition-all ${post.hideLikes ? 'text-monster-purple bg-purple-100 dark:bg-gray-700 shadow-inner' : 'text-gray-500 hover:bg-[#E4E6EB] dark:hover:bg-gray-700'}`}>
                                                <EyeSlashIcon className="h-5 w-5" />
                                            </button>
                                            <button onClick={() => handleDelete(post._id)} className="text-gray-400 hover:text-red-500 p-2.5 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center mb-6 pr-24">
                                        <Link to={`/profile/${post.author?._id}`}>
                                            <img src={post.author?.profilePic ? `${import.meta.env.VITE_API_URL}${post.author.profilePic}` : DEFAULT_AVATAR} alt={post.author?.username || "User"} className="w-14 h-14 rounded-full mr-4 object-cover border border-gray-300 dark:border-gray-700 shadow-sm" />
                                        </Link>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Link to={`/profile/${post.author?._id}`} className="font-black text-lg text-gray-900 dark:text-gray-100 hover:text-monster-purple transition-colors">{post.author?.username || "Unknown User"}</Link>
                                                {/* 🔥 ZAMAN DAMGASI (Ana Post) 🔥 */}
                                                <span className="text-[12px] font-bold text-gray-400">• {timeAgo(post.createdAt)}</span>
                                            </div>
                                            {authorCountryLabel && <p className="text-xs font-extrabold text-gray-500 dark:text-gray-500 mt-0.5 uppercase tracking-widest">{authorCountryLabel}</p>}
                                        </div>
                                    </div>
                                    
                                    {post.content && <p className="text-gray-800 dark:text-gray-200 text-[16px] leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>}
                                    {post.imageUrl && <img src={`${import.meta.env.VITE_API_URL}${post.imageUrl}`} alt="Post content" className="w-full rounded-[2rem] mb-6 object-cover max-h-[500px] shadow-sm border border-gray-200 dark:border-gray-700" />}
                                    
                                    {post.originalPost && (
                                        <div className="border border-gray-200 dark:border-gray-700 bg-[#E4E6EB] dark:bg-gray-800/50 rounded-[2rem] p-5 mb-6">
                                            <div className="flex items-center mb-4">
                                                <img src={post.originalPost.author?.profilePic ? `${import.meta.env.VITE_API_URL}${post.originalPost.author.profilePic}` : DEFAULT_AVATAR} alt={post.originalPost.author?.username || "User"} className="w-8 h-8 rounded-full mr-3 object-cover border border-gray-300 dark:border-gray-600"/>
                                                <span className="font-extrabold text-sm text-gray-800 dark:text-gray-200">{post.originalPost.author?.username || "Unknown User"}</span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 text-[15px] whitespace-pre-wrap leading-relaxed">{post.originalPost.content}</p>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-center pt-5 border-t border-gray-200 dark:border-gray-700/50 px-2">
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => handleLike(post._id)} className={`p-2.5 rounded-full transition-transform transform hover:scale-110 ${isLiked ? 'text-red-500 bg-red-50 dark:bg-gray-700' : 'text-gray-500 hover:text-red-500 hover:bg-[#E4E6EB] dark:hover:bg-gray-700'}`}>
                                                {isLiked ? <HeartSolid className="h-6 w-6 drop-shadow-sm" /> : <HeartOutline className="h-6 w-6" />}
                                            </button>
                                            
                                            {post.hideLikes && !isAuthor ? (
                                                <span className="text-xs font-bold text-gray-500 bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-full">Hidden</span>
                                            ) : (
                                                <button onClick={() => setLikesModalData(post.likes)} className="font-extrabold text-sm text-gray-600 dark:text-gray-300 hover:text-monster-purple dark:hover:text-white transition-colors">
                                                    {post.likes.length}
                                                </button>
                                            )}
                                        </div>

                                        <button onClick={() => setActiveCommentSection(isCommentsActive ? null : post._id)} className={`flex items-center space-x-2 p-2.5 px-4 rounded-full transition-all font-bold text-sm ${isCommentsActive ? 'text-blue-600 bg-blue-50 dark:bg-gray-700' : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-[#E4E6EB] dark:hover:bg-gray-700'}`}>
                                            <ChatBubbleOvalLeftIcon className="h-6 w-6" />
                                            <span>{post.comments.length}</span>
                                        </button>
                                        
                                        <button onClick={() => setRepostTarget(post)} className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-green-600 hover:bg-[#E4E6EB] dark:hover:bg-gray-700 p-2.5 px-4 rounded-full transition-all font-bold text-sm">
                                            <ArrowPathRoundedSquareIcon className="h-6 w-6" />
                                            <span>{post.repostCount}</span>
                                        </button>
                                    </div>
                                    
                                    {isCommentsActive && (
                                        <CommentSection post={post} onCommentAdded={handleCommentAddedToPost} onCommentDeleted={handleCommentDeletedFromPost} onCommentLiked={handleCommentLikedInPost} currentUserID={currentUserID} />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
                {repostTarget && <RepostModal post={repostTarget} onClose={() => setRepostTarget(null)} onRepost={handleRepost} />}
            </div>
        </div>
    );
};

export default FeedPage;