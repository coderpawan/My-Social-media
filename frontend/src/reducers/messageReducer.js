import { 
    ALL_MESSAGES_ADD, 
    ALL_MESSAGES_FAIL, 
    ALL_MESSAGES_REQUEST, 
    ALL_MESSAGES_SUCCESS, 
    ALL_MESSAGES_UPDATE,
    ALL_MESSAGES_DELETE,
    CLEAR_ERRORS, 
    NEW_MESSAGE_FAIL, 
    NEW_MESSAGE_REQUEST, 
    NEW_MESSAGE_RESET, 
    NEW_MESSAGE_SUCCESS,
    EDIT_MESSAGE_REQUEST,
    EDIT_MESSAGE_SUCCESS,
    EDIT_MESSAGE_FAIL,
    EDIT_MESSAGE_RESET,
    DELETE_MESSAGE_REQUEST,
    DELETE_MESSAGE_SUCCESS,
    DELETE_MESSAGE_FAIL,
    DELETE_MESSAGE_RESET,
    SEARCH_MESSAGES_REQUEST,
    SEARCH_MESSAGES_SUCCESS,
    SEARCH_MESSAGES_FAIL,
    SEARCH_MESSAGES_RESET,
    SHARE_POST_REQUEST,
    SHARE_POST_SUCCESS,
    SHARE_POST_FAIL,
    SHARE_POST_RESET
} from "../constants/messageConstants";

export const allMessagesReducer = (state = { messages: [] }, { type, payload }) => {
    switch (type) {
        case ALL_MESSAGES_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case ALL_MESSAGES_SUCCESS:
            return {
                loading: false,
                messages: payload,
            };
        case ALL_MESSAGES_FAIL:
            return {
                ...state,
                loading: false,
                error: payload,
            };
        case ALL_MESSAGES_ADD:
            return {
                ...state,
                messages: [...state.messages, payload]
            };
        case ALL_MESSAGES_UPDATE:
            return {
                ...state,
                messages: state.messages.map(m => 
                    m._id === payload._id ? { ...m, ...payload } : m
                )
            };
        case ALL_MESSAGES_DELETE:
            return {
                ...state,
                messages: state.messages.filter(m => m._id !== payload)
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

export const newMessageReducer = (state = {}, { type, payload }) => {
    switch (type) {
        case NEW_MESSAGE_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case NEW_MESSAGE_SUCCESS:
            return {
                loading: false,
                success: payload.success,
                newMessage: payload.newMessage,
            };
        case NEW_MESSAGE_RESET:
            return {
                ...state,
                success: false,
                newMessage: {}
            };
        case NEW_MESSAGE_FAIL:
            return {
                ...state,
                loading: false,
                error: payload,
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

export const editMessageReducer = (state = {}, { type, payload }) => {
    switch (type) {
        case EDIT_MESSAGE_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case EDIT_MESSAGE_SUCCESS:
            return {
                loading: false,
                success: payload.success,
                message: payload.message,
            };
        case EDIT_MESSAGE_FAIL:
            return {
                ...state,
                loading: false,
                error: payload,
            };
        case EDIT_MESSAGE_RESET:
            return {
                ...state,
                success: false,
                message: {}
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

export const deleteMessageReducer = (state = {}, { type, payload }) => {
    switch (type) {
        case DELETE_MESSAGE_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case DELETE_MESSAGE_SUCCESS:
            return {
                loading: false,
                success: payload.success,
                messageId: payload.messageId,
                deleteType: payload.type,
            };
        case DELETE_MESSAGE_FAIL:
            return {
                ...state,
                loading: false,
                error: payload,
            };
        case DELETE_MESSAGE_RESET:
            return {
                ...state,
                success: false,
                messageId: null,
                deleteType: null,
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

export const searchMessagesReducer = (state = { searchResults: [] }, { type, payload }) => {
    switch (type) {
        case SEARCH_MESSAGES_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case SEARCH_MESSAGES_SUCCESS:
            return {
                loading: false,
                searchResults: payload,
            };
        case SEARCH_MESSAGES_FAIL:
            return {
                ...state,
                loading: false,
                error: payload,
            };
        case SEARCH_MESSAGES_RESET:
            return {
                ...state,
                searchResults: [],
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

export const sharePostReducer = (state = {}, { type, payload }) => {
    switch (type) {
        case SHARE_POST_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case SHARE_POST_SUCCESS:
            return {
                loading: false,
                success: true,
                newMessage: payload.newMessage,
                chatId: payload.chatId,
            };
        case SHARE_POST_FAIL:
            return {
                ...state,
                loading: false,
                error: payload,
            };
        case SHARE_POST_RESET:
            return {
                ...state,
                success: false,
                newMessage: null,
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