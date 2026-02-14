import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { clearErrors, getAllMessages, sendMessage, sendMessageWithMedia, searchMessages } from '../../actions/messageAction';
import { getUserDetailsById, blockUser } from '../../actions/userAction';
import { deleteChat, getAllChats } from '../../actions/chatAction';
import { ALL_MESSAGES_ADD, SEARCH_MESSAGES_RESET, NEW_MESSAGE_RESET, ALL_MESSAGES_UPDATE, ALL_MESSAGES_DELETE } from '../../constants/messageConstants';
import { DELETE_CHAT_RESET, UPDATE_CHAT_LATEST_MESSAGE, INCREMENT_CHAT_UNREAD, RESET_CHAT_UNREAD, MESSAGES_READ_BY_RECEIVER } from '../../constants/chatConstants';
import { SOCKET_ENDPOINT } from '../../utils/constants';
import Sidebar from './Sidebar';
import { io } from 'socket.io-client';
import Message from './Message';
import { Picker } from 'emoji-mart'
import SearchModal from './SearchModal';
import SpinLoader from '../Layouts/SpinLoader';
import MetaData from '../Layouts/MetaData';
import { USER_DETAILS_RESET } from '../../constants/userConstants';

const Inbox = () => {

    const dispatch = useDispatch();
    const params = useParams();
    const navigate = useNavigate();

    const [message, setMessage] = useState("");
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const scrollRef = useRef(null);
    const socket = useRef(null);

    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingData, setTypingData] = useState({});

    const [isOnline, setIsOnline] = useState(false);
    const [showEmojis, setShowEmojis] = useState(false);

    const [showSearch, setShowSearch] = useState(false);
    
    // New states for menu and search
    const [showMenu, setShowMenu] = useState(false);
    const [showChatSearch, setShowChatSearch] = useState(false);
    const [chatSearchQuery, setChatSearchQuery] = useState("");
    const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    
    // File upload ref
    const fileInputRef = useRef(null);
    
    // Media upload loading state
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);

    const { user: loggedInUser } = useSelector((state) => state.user)
    const { user: friend } = useSelector((state) => state.userDetails);
    const { error, messages, loading } = useSelector((state) => state.allMessages)
    const { success, newMessage } = useSelector((state) => state.newMessage);
    const { success: deleteChatSuccess } = useSelector((state) => state.deleteChat);
    const { searchResults } = useSelector((state) => state.searchMessages);

    const userId = params.userId;

    useEffect(() => {
        socket.current = io(SOCKET_ENDPOINT);
        socket.current.on("getMessage", (data) => {
            setArrivalMessage({
                _id: data._id || `msg-${Date.now()}`, // Use server _id or generate temp one
                sender: data.senderId,
                content: data.content,
                createdAt: Date.now(),
                chatId: data.chatId,
                isReceiverActive: data.isReceiverActive, // Track if we're active viewers
                mediaUrl: data.mediaUrl, // Include media URL for image messages
                sharedPost: data.sharedPost, // Include shared post data
            });
        });
        socket.current.on("typing", (senderId) => {
            setTypingData({ senderId, typing: true })
        });
        socket.current.on("typing stop", (senderId) => {
            setTypingData({ senderId, typing: false })
        });
        
        // Listen for message edits in real-time
        socket.current.on("messageEdited", (data) => {
            dispatch({
                type: ALL_MESSAGES_UPDATE,
                payload: {
                    _id: data.messageId,
                    content: data.content,
                    editedAt: Date.now()
                }
            });
        });
        
        // Listen for message deletions in real-time
        socket.current.on("messageDeleted", (data) => {
            dispatch({
                type: ALL_MESSAGES_DELETE,
                payload: data.messageId
            });
        });

        // Listen for message reactions in real-time
        socket.current.on("messageReacted", (data) => {
            const { messageId, emoji, userId: reactorId, chatId: reactionChatId } = data;
            
            // Update the message with the new reaction
            dispatch(getAllMessages(params.chatId));
            
            // Update sidebar preview with reaction notification (virtual message, not saved to DB)
            // This shows "Reacted [emoji] to a message" in the chat list like Instagram
            dispatch({
                type: UPDATE_CHAT_LATEST_MESSAGE,
                payload: {
                    chatId: reactionChatId || params.chatId,
                    latestMessage: {
                        _id: `reaction-${messageId}-${Date.now()}`,
                        content: emoji,
                        isReaction: true,
                        sender: reactorId,
                        createdAt: Date.now()
                    }
                }
            });
        });

        // Listen for when receiver reads messages (real-time read receipts)
        socket.current.on("messagesRead", (data) => {
            dispatch({
                type: MESSAGES_READ_BY_RECEIVER,
                payload: { chatId: data.chatId }
            });
        });

        // Listen for instant read confirmation when receiver is active in chat
        socket.current.on("messageReadInstantly", (data) => {
            dispatch({
                type: MESSAGES_READ_BY_RECEIVER,
                payload: { chatId: data.chatId }
            });
        });

        return () => {
            // Leave chat when component unmounts
            if (socket.current && loggedInUser?._id) {
                socket.current.emit("leaveChat", { userId: loggedInUser._id });
            }
            socket.current.disconnect();
        };
    }, [dispatch, params.chatId, loggedInUser?._id]);

    useEffect(() => {
        typingData && typingData.senderId === userId &&
            setIsTyping(typingData.typing)
    }, [typingData, userId])


    useEffect(() => {
        if (arrivalMessage) {
            // If the message is from the currently viewed chat, add it to messages
            if (arrivalMessage.sender === userId) {
                dispatch({
                    type: ALL_MESSAGES_ADD,
                    payload: arrivalMessage
                });
                // Update latest message (no unread increment since we're viewing it)
                dispatch({
                    type: UPDATE_CHAT_LATEST_MESSAGE,
                    payload: {
                        chatId: params.chatId,
                        latestMessage: arrivalMessage
                    }
                });
            } else {
                // Message is for a different chat, increment unread count
                // We need to find which chat this message belongs to
                const messageChatId = arrivalMessage.chatId;
                if (messageChatId) {
                    dispatch({
                        type: INCREMENT_CHAT_UNREAD,
                        payload: {
                            chatId: messageChatId,
                            latestMessage: arrivalMessage
                        }
                    });
                }
            }
        }
    }, [arrivalMessage, userId, dispatch, params.chatId])


    useEffect(() => {
        socket.current.emit("addUser", loggedInUser._id);
        socket.current.on("getUsers", users => {
            // console.log(users);
            setIsOnline(users.some((u) => u.userId === userId));
        })
    }, [loggedInUser._id, userId])

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearErrors());
        }
        if (params.chatId && userId) {
            dispatch(getAllMessages(params.chatId));
            dispatch(getUserDetailsById(userId));
            // Reset unread count for this chat when opened
            dispatch({
                type: RESET_CHAT_UNREAD,
                payload: { chatId: params.chatId }
            });
            
            // Notify server that user has joined this chat (for real-time read receipts)
            socket.current?.emit("joinChat", {
                userId: loggedInUser._id,
                chatId: params.chatId,
                otherUserId: userId
            });
        }

        return () => {
            // Leave chat when navigating away
            if (params.chatId && loggedInUser?._id) {
                socket.current?.emit("leaveChat", { userId: loggedInUser._id });
            }
            dispatch({ type: USER_DETAILS_RESET })
        }

    }, [dispatch, error, params.chatId, userId, loggedInUser._id]);

    useEffect(() => {
        if (success && newMessage) {
            // Skip media messages - they're handled directly in handleFileChange
            if (newMessage.mediaUrl?.url) {
                return;
            }
            
            dispatch({
                type: ALL_MESSAGES_ADD,
                payload: newMessage
            })
            // Update chat list's latest message in real-time
            dispatch({
                type: UPDATE_CHAT_LATEST_MESSAGE,
                payload: {
                    chatId: params.chatId,
                    latestMessage: newMessage
                }
            });
            
            dispatch({ type: NEW_MESSAGE_RESET });
        }
    }, [dispatch, success, newMessage, params.chatId])

    // Handle delete chat success
    useEffect(() => {
        if (deleteChatSuccess) {
            toast.success("Chat deleted successfully");
            dispatch({ type: DELETE_CHAT_RESET });
            dispatch(getAllChats());
            navigate('/direct/inbox');
        }
    }, [deleteChatSuccess, dispatch, navigate])


    const handleSubmit = (e, msg = message) => {
        e.preventDefault();

        socket?.current.emit("sendMessage", {
            senderId: loggedInUser._id,
            receiverId: userId,
            content: msg,
            chatId: params.chatId,
        });

        const msgData = {
            chatId: params.chatId,
            content: msg
        }

        dispatch(sendMessage(msgData));
        setMessage("");
    }

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages]);

    const handleTyping = (e) => {
        setMessage(e.target.value);

        if (!typing) {
            setTyping(true);
            socket?.current.emit("typing", {
                senderId: loggedInUser._id,
                receiverId: userId
            });
        }

        setTimeout(() => {
            socket?.current.emit("typing stop", {
                senderId: loggedInUser._id,
                receiverId: userId
            });
            setTyping(false);
        }, 2000);
    }

    const handleModalClose = useCallback(() => {
        setShowSearch(false);
    }, []);

    const openModal = () => {
        setShowSearch(true);
    }

    // New handler functions
    const handleMenuToggle = () => {
        setShowMenu(!showMenu);
    }

    const handleSearchInChat = () => {
        setShowChatSearch(true);
        setShowMenu(false);
    }

    const handleChatSearchChange = (e) => {
        setChatSearchQuery(e.target.value);
    }

    const handleChatSearchSubmit = (e) => {
        e.preventDefault();
        if (chatSearchQuery.trim()) {
            dispatch(searchMessages(params.chatId, chatSearchQuery));
        }
    }

    const closeChatSearch = () => {
        setShowChatSearch(false);
        setChatSearchQuery("");
        dispatch({ type: SEARCH_MESSAGES_RESET });
    }

    const handleDeleteChat = () => {
        setShowDeleteChatModal(true);
        setShowMenu(false);
    }

    const confirmDeleteChat = () => {
        dispatch(deleteChat(params.chatId));
        setShowDeleteChatModal(false);
    }

    const handleBlockUser = () => {
        setShowBlockModal(true);
        setShowMenu(false);
    }

    const confirmBlockUser = () => {
        dispatch(blockUser(userId));
        toast.success("User blocked successfully");
        setShowBlockModal(false);
        dispatch(deleteChat(params.chatId));
    }

    // Handle file upload
    const handleFileSelect = () => {
        fileInputRef.current.click();
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsUploadingMedia(true);
            
            const formData = new FormData();
            formData.append('media', file);
            formData.append('chatId', params.chatId);
            // Content will be empty for media-only messages
            formData.append('content', '');

            try {
                const result = await dispatch(sendMessageWithMedia(formData));
                
                if (result && result.newMessage) {
                    // Reset first to prevent useEffect race condition
                    dispatch({ type: NEW_MESSAGE_RESET });
                    
                    // Add message to UI
                    dispatch({
                        type: ALL_MESSAGES_ADD,
                        payload: result.newMessage
                    });
                    
                    // Update chat list
                    dispatch({
                        type: UPDATE_CHAT_LATEST_MESSAGE,
                        payload: {
                            chatId: params.chatId,
                            latestMessage: result.newMessage
                        }
                    });
                    
                    // Notify other user via socket
                    socket?.current?.emit("sendMessage", {
                        _id: result.newMessage._id,
                        senderId: loggedInUser._id,
                        receiverId: userId,
                        content: result.newMessage.content || '',
                        chatId: params.chatId,
                        mediaUrl: result.newMessage.mediaUrl,
                    });
                }
            } catch (error) {
                toast.error('Failed to upload image');
            } finally {
                setIsUploadingMedia(false);
            }
            e.target.value = null;
        }
    }

    return (
        <>
            <MetaData title="Instagram • Chats" />

            <div className="mt-14 sm:mt-[4.7rem] pb-4 rounded h-[90vh] xl:w-2/3 mx-auto sm:pr-14 sm:pl-8">
                <div className="flex border h-full rounded w-full bg-white">

                    {/* sidebar */}
                    <Sidebar openModal={openModal} userId={userId} />

                    {!userId ?
                        <div className="hidden sm:flex flex-col items-center justify-center w-full sm:w-4/6 gap-2">
                            <div className="w-24 h-24 flex items-center p-2 justify-center border-2 border-black rounded-full">
                                <img draggable="false" loading="lazy" className="w-full h-full rotate-12 object-contain" src="https://static.thenounproject.com/png/172101-200.png" alt="message" />
                            </div>
                            <h2 className="text-2xl font-thin">Your Messages</h2>
                            <p className="text-gray-400 text-sm">Send private photos and messages to a friend or group.</p>
                            <button onClick={openModal} className="bg-primary-blue rounded px-2.5 mt-2 py-1.5 text-white text-sm font-medium hover:drop-shadow-lg">Send Message</button>
                        </div>
                        :
                        <div className="flex flex-col justify-between w-full sm:w-4/6">

                            {/* header */}
                            <div className="flex py-3 px-6 border-b items-center justify-between">
                                <div className="flex gap-2 items-center">
                                    {/* Back button - visible only on mobile */}
                                    <button 
                                        onClick={() => navigate('/direct/inbox')} 
                                        className="sm:hidden p-1 mr-2 hover:bg-gray-100 rounded-full"
                                    >
                                        <svg aria-label="Back" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                                            <path d="M21 11H6.414l5.293-5.293-1.414-1.414L2.586 12l7.707 7.707 1.414-1.414L6.414 13H21z"></path>
                                        </svg>
                                    </button>
                                    <div className="w-8 h-8 relative">
                                        <img draggable="false" loading="lazy" className="w-full h-full rounded-full object-cover" src={friend.avatar?.url} alt="avatar" />
                                        {isOnline && <div className="absolute -right-0.5 -bottom-0.5 h-3 w-3 bg-green-500 rounded-full"></div>}
                                    </div>
                                    <span className="font-medium cursor-pointer">{friend.name}</span>
                                </div>
                                
                                {/* 3 dots menu */}
                                <div className="relative">
                                    <button onClick={handleMenuToggle} className="cursor-pointer p-1 hover:bg-gray-100 rounded-full">
                                        <svg aria-label="Options" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24">
                                            <circle cx="12" cy="12" r="1.5"></circle>
                                            <circle cx="12" cy="6" r="1.5"></circle>
                                            <circle cx="12" cy="18" r="1.5"></circle>
                                        </svg>
                                    </button>
                                    
                                    {/* Dropdown menu */}
                                    {showMenu && (
                                        <div className="absolute right-0 top-10 bg-white border rounded-lg shadow-lg z-50 w-48">
                                            <button 
                                                onClick={handleSearchInChat}
                                                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <svg height="16" width="16" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M21.53 20.47l-4.69-4.69a8.5 8.5 0 10-1.06 1.06l4.69 4.69a.75.75 0 001.06-1.06zM10.5 17a6.5 6.5 0 116.5-6.5 6.508 6.508 0 01-6.5 6.5z"></path>
                                                </svg>
                                                Search in chat
                                            </button>
                                            <button 
                                                onClick={handleDeleteChat}
                                                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 text-red-500 flex items-center gap-2"
                                            >
                                                <svg height="16" width="16" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                                                </svg>
                                                Delete chat
                                            </button>
                                            <button 
                                                onClick={handleBlockUser}
                                                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 text-red-500 flex items-center gap-2"
                                            >
                                                <svg height="16" width="16" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.902 7.902 0 014 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.902 7.902 0 0120 12c0 4.42-3.58 8-8 8z"></path>
                                                </svg>
                                                Block user
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Chat search bar */}
                            {showChatSearch && (
                                <div className="px-4 py-2 border-b bg-gray-50">
                                    <form onSubmit={handleChatSearchSubmit} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="Search in conversation..."
                                            value={chatSearchQuery}
                                            onChange={handleChatSearchChange}
                                            className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none focus:border-gray-400"
                                            autoFocus
                                        />
                                        <button type="submit" className="px-3 py-2 bg-primary-blue text-white text-sm rounded-lg">
                                            Search
                                        </button>
                                        <button type="button" onClick={closeChatSearch} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                                            Cancel
                                        </button>
                                    </form>
                                    {searchResults.length > 0 && (
                                        <div className="mt-2 text-sm text-gray-600">
                                            Found {searchResults.length} message(s)
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* messages */}
                            <div className="w-full flex-1 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden p-4">
                                {loading ? <SpinLoader /> :
                                    (showChatSearch && searchResults.length > 0 ? searchResults : messages).map((m, i) => (
                                        <React.Fragment key={m._id}>
                                            <Message 
                                                ownMsg={m.sender === loggedInUser._id} 
                                                messageId={m._id}
                                                chatId={params.chatId}
                                                socket={socket}
                                                receiverId={userId}
                                                {...friend} 
                                                {...m} 
                                            />
                                            <div ref={scrollRef}></div>
                                        </React.Fragment>
                                    ))
                                }
                                {isTyping &&
                                    <>
                                        <div className="flex items-center gap-3 max-w-xs">
                                            <img draggable="false" loading="lazy" className="w-7 h-7 rounded-full object-cover" src={friend?.avatar?.url} alt="avatar" />
                                            <span className="text-sm text-gray-500">typing...</span>
                                        </div>
                                        <div ref={scrollRef}></div>
                                    </>
                                }
                            </div>

                            {/* message input */}
                            <form onSubmit={handleSubmit} className="flex items-center gap-3 justify-between border rounded-full py-2.5 px-4 m-5 relative">
                                <span onClick={() => setShowEmojis(!showEmojis)} className="cursor-pointer hover:opacity-60">
                                    <svg aria-label="Emoji" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M15.83 10.997a1.167 1.167 0 101.167 1.167 1.167 1.167 0 00-1.167-1.167zm-6.5 1.167a1.167 1.167 0 10-1.166 1.167 1.167 1.167 0 001.166-1.167zm5.163 3.24a3.406 3.406 0 01-4.982.007 1 1 0 10-1.557 1.256 5.397 5.397 0 008.09 0 1 1 0 00-1.55-1.263zM12 .503a11.5 11.5 0 1011.5 11.5A11.513 11.513 0 0012 .503zm0 21a9.5 9.5 0 119.5-9.5 9.51 9.51 0 01-9.5 9.5z"></path></svg>
                                </span>

                                {showEmojis && (
                                    <div className="absolute bottom-14 -left-10">
                                        <Picker
                                            set="google"
                                            onSelect={(e) => setMessage(message + e.native)}
                                            title="Emojis"
                                        />
                                    </div>
                                )}

                                <input
                                    className="flex-1 outline-none text-sm"
                                    type="text"
                                    placeholder="Message..."
                                    value={message}
                                    onFocus={() => setShowEmojis(false)}
                                    onChange={handleTyping}
                                    required
                                />
                                {message.trim().length > 0 ?
                                    <button className="text-primary-blue font-medium text-sm">Send</button>
                                    :
                                    <>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        {isUploadingMedia ? (
                                            <div className="flex items-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span className="text-xs text-gray-500">Uploading...</span>
                                            </div>
                                        ) : (
                                            <svg onClick={handleFileSelect} className="cursor-pointer hover:opacity-70" aria-label="Add Photo or Video" color="#262626" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M6.549 5.013A1.557 1.557 0 108.106 6.57a1.557 1.557 0 00-1.557-1.557z" fillRule="evenodd"></path><path d="M2 18.605l3.901-3.9a.908.908 0 011.284 0l2.807 2.806a.908.908 0 001.283 0l5.534-5.534a.908.908 0 011.283 0l3.905 3.905" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path><path d="M18.44 2.004A3.56 3.56 0 0122 5.564h0v12.873a3.56 3.56 0 01-3.56 3.56H5.568a3.56 3.56 0 01-3.56-3.56V5.563a3.56 3.56 0 013.56-3.56z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                        )}
                                    </>
                                }
                            </form>

                        </div>

                    }
                </div>

                <SearchModal open={showSearch} onClose={handleModalClose} />

                {/* Delete Chat Modal */}
                {showDeleteChatModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-80">
                            <h3 className="text-lg font-semibold mb-4">Delete Chat</h3>
                            <p className="text-gray-600 text-sm mb-6">Are you sure you want to delete this entire conversation? This action cannot be undone.</p>
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={confirmDeleteChat}
                                    className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    Delete
                                </button>
                                <button 
                                    onClick={() => setShowDeleteChatModal(false)}
                                    className="w-full py-2 border rounded-lg hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Block User Modal */}
                {showBlockModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-80">
                            <h3 className="text-lg font-semibold mb-4">Block User</h3>
                            <p className="text-gray-600 text-sm mb-6">Are you sure you want to block {friend.name}? They won't be able to message you anymore.</p>
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={confirmBlockUser}
                                    className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    Block
                                </button>
                                <button 
                                    onClick={() => setShowBlockModal(false)}
                                    className="w-full py-2 border rounded-lg hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    )
}

export default Inbox