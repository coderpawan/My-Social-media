import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom'
import { SOCKET_ENDPOINT } from '../../utils/constants';
import { io } from 'socket.io-client';

const ChatListItem = ({ _id, users, latestMessage, unreadCount = 0 }) => {
    const params = useParams();
    const [friend, setFriend] = useState({});

    const socket = useRef(null);
    const [isOnline, setIsOnline] = useState(false);

    const { user } = useSelector((state) => state.user);

    useEffect(() => {
        const friendDetails = users.find((u) => u._id !== user._id);
        setFriend(friendDetails)
    }, [users, user._id]);

    useEffect(() => {
        socket.current = io(SOCKET_ENDPOINT);
    }, []);

    useEffect(() => {
        socket.current.on("getUsers", users => {
            // console.log(users);
            setIsOnline(users.some((u) => u.userId === friend._id));
        })
    }, [friend._id])

    // Determine the preview text to display
    const getPreviewText = () => {
        if (!latestMessage || latestMessage.deletedForEveryone || latestMessage.content === "This message was deleted") {
            return "";
        }
        
        // Check if this is a reaction notification - display like Instagram
        if (latestMessage.isReaction) {
            // Check if current user reacted or the other user reacted
            const isOwnReaction = latestMessage.sender === user._id;
            if (isOwnReaction) {
                return `Reacted ${latestMessage.content} to a message`;
            } else {
                return `Reacted ${latestMessage.content} to your message`;
            }
        }
        
        // Check if message has a shared post
        if (latestMessage.sharedPost) {
            const isOwnMessage = latestMessage.sender === user._id;
            return isOwnMessage ? "Shared a post" : "Sent you a post";
        }
        
        // Check if message has media attachment
        if (latestMessage.mediaUrl && latestMessage.mediaUrl.url) {
            return "Sent an attachment";
        }
        
        return latestMessage.content;
    };

    const hasUnread = unreadCount > 0;

    return (
        <Link to={`/direct/t/${_id}/${friend._id}`} className={`${params.chatId === _id && 'bg-gray-100'} flex gap-3 items-center py-2 px-4 cursor-pointer hover:bg-gray-100`}>
            <div className="w-14 h-14 relative">
                <img draggable="false" className="w-full h-full rounded-full object-cover" src={friend.avatar?.url} alt="avatar" />
                {isOnline && <div className="absolute right-0 bottom-0.5 h-3 w-3 bg-green-500 rounded-full"></div>}
            </div>
            <div className="flex flex-col items-start flex-1">
                <span className={`text-sm ${hasUnread ? 'font-semibold' : ''}`}>{friend.name}</span>
                <span className={`text-sm truncate w-36 ${hasUnread ? 'text-black font-medium' : 'text-gray-400'}`}>
                    {getPreviewText()}
                </span>
            </div>
            {hasUnread && (
                <div className="flex items-center justify-center min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full px-1.5">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </div>
            )}
        </Link>
    )
}

export default ChatListItem