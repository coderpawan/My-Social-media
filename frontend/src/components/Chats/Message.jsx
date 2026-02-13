import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editMessage, deleteMessageForMe, deleteMessageForEveryone, reactToMessage } from '../../actions/messageAction';
import { ALL_MESSAGES_UPDATE, ALL_MESSAGES_DELETE, DELETE_MESSAGE_RESET, EDIT_MESSAGE_RESET } from '../../constants/messageConstants';
import { UPDATE_CHAT_LATEST_MESSAGE } from '../../constants/chatConstants';

// Common emojis for reactions
const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '👏', '🎉'];

const Message = ({ ownMsg, avatar, content, messageId, chatId, socket, receiverId, mediaUrl, editedAt, reactions = [] }) => {
    const dispatch = useDispatch();
    
    const [showOptions, setShowOptions] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(content);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    
    const { success: editSuccess, message: editedMessage } = useSelector((state) => state.editMessage);
    const { success: deleteSuccess, deleteType, messageId: deletedMessageId } = useSelector((state) => state.deleteMessage);
    const { user } = useSelector((state) => state.user);

    useEffect(() => {
        if (editSuccess && editedMessage?._id === messageId) {
            dispatch({
                type: ALL_MESSAGES_UPDATE,
                payload: editedMessage
            });
            dispatch({ type: EDIT_MESSAGE_RESET });
            setIsEditing(false);
        }
    }, [editSuccess, editedMessage, messageId, dispatch]);

    useEffect(() => {
        if (deleteSuccess && deletedMessageId === messageId) {
            if (deleteType === 'forMe' || deleteType === 'forEveryone') {
                dispatch({
                    type: ALL_MESSAGES_DELETE,
                    payload: messageId
                });
            }
            dispatch({ type: DELETE_MESSAGE_RESET });
            setShowDeleteModal(false);
        }
    }, [deleteSuccess, deleteType, deletedMessageId, messageId, dispatch]);

    const handleEdit = () => {
        setIsEditing(true);
        setShowOptions(false);
    }

    const handleSaveEdit = () => {
        if (editContent.trim() && editContent !== content) {
            dispatch(editMessage(messageId, editContent));
            // Emit socket event for real-time update
            socket?.current?.emit("editMessage", {
                messageId,
                content: editContent,
                receiverId
            });
        } else {
            setIsEditing(false);
        }
    }

    const handleCancelEdit = () => {
        setEditContent(content);
        setIsEditing(false);
    }

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
        setShowOptions(false);
    }

    const handleDeleteForMe = () => {
        dispatch(deleteMessageForMe(messageId));
    }

    const handleDeleteForEveryone = () => {
        dispatch(deleteMessageForEveryone(messageId));
        // Emit socket event for real-time deletion
        socket?.current?.emit("deleteMessage", {
            messageId,
            receiverId
        });
    }

    // Render media if exists
    const renderMedia = () => {
        if (mediaUrl && mediaUrl.url) {
            return (
                <img 
                    src={mediaUrl.url} 
                    alt="shared media" 
                    className="max-w-full rounded-lg max-h-60 object-cover"
                />
            );
        }
        return null;
    }

    // Handle emoji reaction with optimistic UI update
    const handleReaction = (emoji) => {
        dispatch(reactToMessage(messageId, emoji, user._id));
        
        // Update sidebar preview with reaction notification (for sender's view)
        dispatch({
            type: UPDATE_CHAT_LATEST_MESSAGE,
            payload: {
                chatId,
                latestMessage: {
                    _id: `reaction-${messageId}-${Date.now()}`,
                    content: emoji,
                    isReaction: true,
                    sender: user._id,
                    createdAt: Date.now()
                }
            }
        });
        
        // Emit socket event for real-time reaction update to other user
        socket?.current?.emit("reactToMessage", {
            messageId,
            emoji,
            userId: user._id,
            chatId,
            receiverId
        });
        setShowReactionPicker(false);
    }

    // Render reactions
    const renderReactions = () => {
        if (!reactions || reactions.length === 0) return null;
        
        // Group reactions by emoji
        const reactionGroups = reactions.reduce((acc, r) => {
            if (!acc[r.emoji]) acc[r.emoji] = [];
            acc[r.emoji].push(r.user);
            return acc;
        }, {});

        return (
            <div className={`flex gap-1 mt-1 ${ownMsg ? 'justify-end' : 'justify-start ml-9'}`}>
                {Object.entries(reactionGroups).map(([emoji, users]) => (
                    <span 
                        key={emoji} 
                        className="text-xs bg-gray-100 rounded-full px-1.5 py-0.5 flex items-center gap-0.5 cursor-pointer hover:bg-gray-200"
                        title={`${users.length} reaction(s)`}
                        onClick={() => handleReaction(emoji)}
                    >
                        {emoji} {users.length > 1 && <span className="text-gray-500">{users.length}</span>}
                    </span>
                ))}
            </div>
        );
    }

    // Reaction picker component
    const ReactionPicker = () => (
        <div className={`absolute ${ownMsg ? 'right-0' : 'left-0'} bottom-full mb-2 bg-white shadow-lg rounded-full px-2 py-1.5 flex gap-1 z-50 border`}>
            {REACTION_EMOJIS.map(emoji => (
                <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="hover:scale-125 transition-transform text-lg p-1"
                >
                    {emoji}
                </button>
            ))}
        </div>
    );

    return (
        <div 
            className={`relative group ${ownMsg ? 'self-end' : ''}`}
            onMouseEnter={() => setShowOptions(true)}
            onMouseLeave={() => {
                if (!showDeleteModal && !showReactionPicker) {
                    setShowOptions(false);
                    setShowReactionPicker(false);
                }
            }}
        >
            {ownMsg ? (
                content === '❤️' ? (
                    <>
                        <div className="flex items-center gap-2">
                            {showOptions && (
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowReactionPicker(!showReactionPicker)}
                                        className="p-1 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        😊
                                    </button>
                                    {showReactionPicker && <ReactionPicker />}
                                </div>
                            )}
                            <span className="text-4xl">{content}</span>
                        </div>
                        {renderReactions()}
                    </>
                ) : isEditing ? (
                    <div className="flex flex-col gap-2 max-w-xs">
                        <input
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="px-3 py-2 text-sm border rounded-lg outline-none focus:border-violet-500"
                            autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                            <button 
                                onClick={handleCancelEdit}
                                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveEdit}
                                className="px-2 py-1 text-xs bg-violet-600 text-white rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            {/* Options button (shows on hover) */}
                            {showOptions && !isEditing && (
                                <div className="relative flex items-center gap-1">
                                    <button 
                                        onClick={() => setShowReactionPicker(!showReactionPicker)}
                                        className="p-1 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                                        title="React"
                                    >
                                        😊
                                    </button>
                                    {showReactionPicker && <ReactionPicker />}
                                    <button 
                                        onClick={handleDeleteClick}
                                        className="p-1 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg height="16" width="16" viewBox="0 0 24 24" fill="#737373">
                                            <circle cx="12" cy="12" r="1.5"></circle>
                                            <circle cx="6" cy="12" r="1.5"></circle>
                                            <circle cx="18" cy="12" r="1.5"></circle>
                                        </svg>
                                    </button>
                                </div>
                            )}
                            <div className="flex flex-col items-end">
                                {renderMedia()}
                                {content && content.trim() !== '' && (
                                    <span className="text-sm text-white bg-violet-600 px-4 py-3 rounded-3xl max-w-xs">
                                        {content}
                                    </span>
                                )}
                                {editedAt && (
                                    <span className="text-xs text-gray-400 mt-1">edited</span>
                                )}
                            </div>
                        </div>
                        {renderReactions()}
                    </>
                )
            ) : (
                content === '❤️' ? (
                    <>
                        <div className="flex items-end gap-2 max-w-xs">
                            <img draggable="false" className="w-7 h-7 rounded-full object-cover" src={avatar?.url} alt="avatar" />
                            <span className="text-4xl">{content}</span>
                            {showOptions && (
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowReactionPicker(!showReactionPicker)}
                                        className="p-1 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                                    >
                                        😊
                                    </button>
                                    {showReactionPicker && <ReactionPicker />}
                                </div>
                            )}
                        </div>
                        {renderReactions()}
                    </>
                ) : (
                    <>
                        <div className="flex items-end gap-2 max-w-xs">
                            <img draggable="false" className="w-7 h-7 rounded-full object-cover" src={avatar?.url} alt="avatar" />
                            <div className="flex flex-col">
                                {renderMedia()}
                                {content && content.trim() !== '' && (
                                    <span className="px-4 py-3 text-sm bg-gray-200 rounded-3xl max-w-xs overflow-hidden">
                                        {content}
                                    </span>
                                )}
                                {editedAt && (
                                    <span className="text-xs text-gray-400 mt-1">edited</span>
                                )}
                            </div>
                            {/* Options for received messages */}
                            {showOptions && (
                                <div className="relative flex items-center gap-1">
                                    <button 
                                        onClick={() => setShowReactionPicker(!showReactionPicker)}
                                        className="p-1 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                                        title="React"
                                    >
                                        😊
                                    </button>
                                    {showReactionPicker && <ReactionPicker />}
                                    <button 
                                        onClick={handleDeleteForMe}
                                        className="p-1 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete for me"
                                    >
                                        <svg height="16" width="16" viewBox="0 0 24 24" fill="#737373">
                                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                        {renderReactions()}
                    </>
                )
            )}

            {/* Delete Modal */}
            {showDeleteModal && ownMsg && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(false)}>
                    <div className="bg-white rounded-lg w-72 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col">
                            <button 
                                onClick={handleEdit}
                                className="px-4 py-3 text-sm hover:bg-gray-100 border-b"
                            >
                                Edit message
                            </button>
                            <button 
                                onClick={handleDeleteForEveryone}
                                className="px-4 py-3 text-sm text-red-500 hover:bg-gray-100 border-b"
                            >
                                Delete for everyone
                            </button>
                            <button 
                                onClick={handleDeleteForMe}
                                className="px-4 py-3 text-sm text-red-500 hover:bg-gray-100 border-b"
                            >
                                Delete for me
                            </button>
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-3 text-sm hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Message