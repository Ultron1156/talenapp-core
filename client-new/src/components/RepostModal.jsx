import React, { useState } from 'react';

const RepostModal = ({ post, onClose, onRepost }) => {
  const [content, setContent] = useState('');

  const handleRepost = () => {
    onRepost(post._id, content);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h3 className="text-xl font-bold mb-4">Gönderiyi Alıntıla</h3>
        
        <div className="border border-gray-200 rounded-lg p-3 mb-4">
          <div className="flex items-center mb-2">
            <img src={post.author.profilePic || 'https://placehold.co/40x40'} alt={post.author.username} className="w-8 h-8 rounded-full mr-2"/>
            <span className="font-semibold">{post.author.username}</span>
          </div>
          <p className="text-gray-600 max-h-24 overflow-y-auto">{post.content}</p>
        </div>

        <textarea
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-monster-purple"
          rows="3"
          placeholder="Bir yorum ekle..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
        
        <div className="flex justify-end space-x-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">İptal</button>
          <button onClick={handleRepost} className="px-4 py-2 bg-monster-purple text-white rounded-lg hover:bg-purple-700">Repost</button>
        </div>
      </div>
    </div>
  );
};

export default RepostModal;