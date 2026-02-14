import Dialog from '@mui/material/Dialog';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { sharePost } from '../../actions/messageAction';
import { SHARE_POST_RESET } from '../../constants/messageConstants';
import { Skeleton } from '@mui/material';
import axios from 'axios';

const SharePostModal = ({ open, onClose, postId, socket }) => {
    const dispatch = useDispatch();

    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [sharing, setSharing] = useState(null);

    const { user: self } = useSelector((state) => state.user);
    const { success, error, newMessage, chatId } = useSelector((state) => state.sharePost);

    // Fetch following list
    const fetchFollowingUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/v1/user/${self.username}`);
            const following = data.user.following || [];
            setUsers(following);
        } catch (err) {
            toast.error("Failed to load users");
        }
        setLoading(false);
    }, [self.username]);

    // Search users
    const searchUsers = useCallback(async (term) => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/v1/users?keyword=${term}`);
            // Filter to only show users the current user follows
            const userDetails = await axios.get(`/api/v1/user/${self.username}`);
            const followingIds = new Set(userDetails.data.user.following.map(u => u._id));
            const filteredUsers = data.users.filter((u) => u._id !== self._id && followingIds.has(u._id));
            setUsers(filteredUsers);
        } catch (err) {
            toast.error("Failed to search users");
        }
        setLoading(false);
    }, [self._id, self.username]);

    useEffect(() => {
        if (open) {
            if (searchTerm.trim().length > 0) {
                searchUsers(searchTerm);
            } else {
                fetchFollowingUsers();
            }
        }
    }, [open, searchTerm, fetchFollowingUsers, searchUsers]);

    const handleShare = async (userId) => {
        setSharing(userId);
        try {
            const result = await dispatch(sharePost(postId, userId));
            
            // Emit socket event for real-time update
            if (socket?.current && result?.newMessage) {
                socket.current.emit("sendMessage", {
                    _id: result.newMessage._id,
                    senderId: self._id,
                    receiverId: userId,
                    content: '',
                    chatId: result.chatId,
                    sharedPost: result.newMessage.sharedPost,
                });
            }
        } catch (err) {
            // Error handled by redux
        }
    };

    useEffect(() => {
        if (success) {
            toast.success("Post shared successfully!");
            dispatch({ type: SHARE_POST_RESET });
            setSharing(null);
            onClose();
        }
        if (error) {
            toast.error(error);
            dispatch({ type: SHARE_POST_RESET });
            setSharing(null);
        }
    }, [success, error, dispatch, onClose]);

    const handleClose = () => {
        setSearchTerm("");
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <div className="flex flex-col w-80 sm:w-96">
                <div className="flex justify-between items-center px-4 border-b py-2.5">
                    <span className="font-medium mx-auto">Share Post</span>
                    <svg 
                        onClick={handleClose} 
                        className="cursor-pointer" 
                        aria-label="Close" 
                        color="#262626" 
                        fill="#262626" 
                        height="24" 
                        role="img" 
                        viewBox="0 0 24 24" 
                        width="24"
                    >
                        <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="3" y2="21"></line>
                        <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="21" y2="3"></line>
                    </svg>
                </div>

                <div className="flex items-center gap-3 border-b p-3">
                    <span className="font-medium">To:</span>
                    <input
                        className="outline-none w-full"
                        type="text"
                        placeholder="Search from people you follow..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-col overflow-x-hidden h-96 w-full">
                    {users.length === 0 && !loading && (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            {searchTerm ? "No users found" : "You're not following anyone yet"}
                        </div>
                    )}

                    {loading ? (
                        Array(5).fill("").map((_, i) => (
                            <div className="flex items-center gap-2 py-2 px-4" key={i}>
                                <Skeleton animation="wave" variant="circular" width={50} height={50} />
                                <div className="flex flex-col gap-0 w-full">
                                    <Skeleton height={20} width="45%" animation="wave" />
                                    <Skeleton height={20} width="30%" animation="wave" />
                                </div>
                            </div>
                        ))
                    ) : (
                        users.map((user) => (
                            <div 
                                key={user._id}
                                className="flex items-center justify-between hover:bg-gray-50 py-2 px-4"
                            >
                                <div className="flex space-x-3 items-center">
                                    <img 
                                        draggable="false" 
                                        className="w-11 h-11 rounded-full object-cover" 
                                        src={user.avatar?.url} 
                                        alt="avatar" 
                                    />
                                    <div className="flex flex-col items-start">
                                        <span className="text-black text-sm font-semibold">{user.username}</span>
                                        <span className="text-gray-400 text-sm">{user.name}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleShare(user._id)}
                                    disabled={sharing === user._id}
                                    className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                                        sharing === user._id
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-primary-blue text-white hover:bg-blue-600'
                                    }`}
                                >
                                    {sharing === user._id ? 'Sending...' : 'Send'}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Dialog>
    );
};

export default SharePostModal;
