import { 
    ALL_CHATS_FAIL, 
    ALL_CHATS_REQUEST, 
    ALL_CHATS_SUCCESS, 
    CLEAR_ERRORS, 
    NEW_CHAT_FAIL, 
    NEW_CHAT_REQUEST, 
    NEW_CHAT_RESET, 
    NEW_CHAT_SUCCESS,
    DELETE_CHAT_REQUEST,
    DELETE_CHAT_SUCCESS,
    DELETE_CHAT_FAIL,
    DELETE_CHAT_RESET,
    UPDATE_CHAT_LATEST_MESSAGE,
    INCREMENT_CHAT_UNREAD,
    RESET_CHAT_UNREAD,
    SET_TOTAL_UNREAD,
    MESSAGES_READ_BY_RECEIVER
} from "../constants/chatConstants";

export const allChatsReducer = (state = { chats: [], totalUnread: 0 }, { type, payload }) => {
    switch (type) {
        case ALL_CHATS_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case ALL_CHATS_SUCCESS:
            return {
                loading: false,
                chats: payload.chats,
                totalUnread: payload.totalUnread || 0,
            };
        case ALL_CHATS_FAIL:
            return {
                ...state,
                loading: false,
                error: payload,
            };
        case UPDATE_CHAT_LATEST_MESSAGE:
            return {
                ...state,
                chats: state.chats.map(chat => 
                    chat._id === payload.chatId 
                        ? { ...chat, latestMessage: payload.latestMessage }
                        : chat
                ),
            };
        case INCREMENT_CHAT_UNREAD:
            return {
                ...state,
                chats: state.chats.map(chat => 
                    chat._id === payload.chatId 
                        ? { ...chat, unreadCount: (chat.unreadCount || 0) + 1, latestMessage: payload.latestMessage }
                        : chat
                ),
                totalUnread: state.totalUnread + 1,
            };
        case RESET_CHAT_UNREAD:
            const chat = state.chats.find(c => c._id === payload.chatId);
            const unreadToRemove = chat ? (chat.unreadCount || 0) : 0;
            return {
                ...state,
                chats: state.chats.map(c => 
                    c._id === payload.chatId 
                        ? { ...c, unreadCount: 0 }
                        : c
                ),
                totalUnread: Math.max(0, state.totalUnread - unreadToRemove),
            };
        case SET_TOTAL_UNREAD:
            return {
                ...state,
                totalUnread: payload,
            };
        case MESSAGES_READ_BY_RECEIVER:
            // When receiver reads messages, clear the unread indicator for that chat
            // This is from sender's perspective - no need to change totalUnread since
            // sender's unread count is for messages SENT TO them, not messages they sent
            return {
                ...state,
                chats: state.chats.map(c => 
                    c._id === payload.chatId 
                        ? { ...c, isReadByReceiver: true }
                        : c
                ),
            };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
}

// New Chat Reducer
export const newChatReducer = (state = {}, { type, payload }) => {
    switch (type) {
        case NEW_CHAT_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case NEW_CHAT_SUCCESS:
            return {
                ...state,
                loading: false,
                success: payload.success,
                chat: payload.newChat,
            };
        case NEW_CHAT_FAIL:
            return {
                ...state,
                loading: false,
                error: payload,
            };
        case NEW_CHAT_RESET:
            return {
                ...state,
                success: false,
            };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
}

// Delete Chat Reducer
export const deleteChatReducer = (state = {}, { type, payload }) => {
    switch (type) {
        case DELETE_CHAT_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case DELETE_CHAT_SUCCESS:
            return {
                loading: false,
                success: payload.success,
                chatId: payload.chatId,
            };
        case DELETE_CHAT_FAIL:
            return {
                ...state,
                loading: false,
                error: payload,
            };
        case DELETE_CHAT_RESET:
            return {
                ...state,
                success: false,
                chatId: null,
            };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
}