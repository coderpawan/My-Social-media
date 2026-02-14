import axios from "axios";
import { 
    ALL_MESSAGES_FAIL, 
    ALL_MESSAGES_REQUEST, 
    ALL_MESSAGES_SUCCESS, 
    CLEAR_ERRORS, 
    NEW_MESSAGE_FAIL, 
    NEW_MESSAGE_REQUEST, 
    NEW_MESSAGE_SUCCESS,
    EDIT_MESSAGE_REQUEST,
    EDIT_MESSAGE_SUCCESS,
    EDIT_MESSAGE_FAIL,
    DELETE_MESSAGE_REQUEST,
    DELETE_MESSAGE_SUCCESS,
    DELETE_MESSAGE_FAIL,
    SEARCH_MESSAGES_REQUEST,
    SEARCH_MESSAGES_SUCCESS,
    SEARCH_MESSAGES_FAIL,
    REACT_MESSAGE_SUCCESS,
    REACT_MESSAGE_FAIL,
    ALL_MESSAGES_UPDATE,
    SHARE_POST_REQUEST,
    SHARE_POST_SUCCESS,
    SHARE_POST_FAIL
} from "../constants/messageConstants";

// Get All Messages
export const getAllMessages = (chatId) => async (dispatch) => {
    try {

        dispatch({ type: ALL_MESSAGES_REQUEST });

        const { data } = await axios.get(`/api/v1/messages/${chatId}`);

        dispatch({
            type: ALL_MESSAGES_SUCCESS,
            payload: data.messages,
        });

    } catch (error) {
        dispatch({
            type: ALL_MESSAGES_FAIL,
            payload: error.response.data.message,
        });
    }
};

// New Message
export const sendMessage = (msgData) => async (dispatch) => {
    try {

        dispatch({ type: NEW_MESSAGE_REQUEST });
        const config = { headers: { "Content-Type": "application/json" } }
        const { data } = await axios.post('/api/v1/newMessage/', msgData, config);

        dispatch({
            type: NEW_MESSAGE_SUCCESS,
            payload: data,
        });

    } catch (error) {
        dispatch({
            type: NEW_MESSAGE_FAIL,
            payload: error.response.data.message,
        });
    }
}

// Send Message with Media
export const sendMessageWithMedia = (formData) => async (dispatch) => {
    try {

        dispatch({ type: NEW_MESSAGE_REQUEST });
        const config = { headers: { "Content-Type": "multipart/form-data" } }
        const { data } = await axios.post('/api/v1/newMessage/', formData, config);

        dispatch({
            type: NEW_MESSAGE_SUCCESS,
            payload: data,
        });

        return data; // Return data so component can use it

    } catch (error) {
        dispatch({
            type: NEW_MESSAGE_FAIL,
            payload: error.response?.data?.message || 'Failed to send message',
        });
        throw error; // Re-throw so component can catch it
    }
}

// Edit Message
export const editMessage = (messageId, content) => async (dispatch) => {
    try {

        dispatch({ type: EDIT_MESSAGE_REQUEST });
        const config = { headers: { "Content-Type": "application/json" } }
        const { data } = await axios.put('/api/v1/message/edit', { messageId, content }, config);

        dispatch({
            type: EDIT_MESSAGE_SUCCESS,
            payload: data,
        });

    } catch (error) {
        dispatch({
            type: EDIT_MESSAGE_FAIL,
            payload: error.response.data.message,
        });
    }
}

// Delete Message For Me
export const deleteMessageForMe = (messageId) => async (dispatch) => {
    try {

        dispatch({ type: DELETE_MESSAGE_REQUEST });
        const { data } = await axios.delete(`/api/v1/message/deleteForMe/${messageId}`);

        dispatch({
            type: DELETE_MESSAGE_SUCCESS,
            payload: { ...data, messageId, type: 'forMe' },
        });

    } catch (error) {
        dispatch({
            type: DELETE_MESSAGE_FAIL,
            payload: error.response.data.message,
        });
    }
}

// Delete Message For Everyone
export const deleteMessageForEveryone = (messageId) => async (dispatch) => {
    try {

        dispatch({ type: DELETE_MESSAGE_REQUEST });
        const { data } = await axios.delete(`/api/v1/message/deleteForEveryone/${messageId}`);

        dispatch({
            type: DELETE_MESSAGE_SUCCESS,
            payload: { ...data, messageId, type: 'forEveryone' },
        });

    } catch (error) {
        dispatch({
            type: DELETE_MESSAGE_FAIL,
            payload: error.response.data.message,
        });
    }
}

// Search Messages
export const searchMessages = (chatId, query) => async (dispatch) => {
    try {

        dispatch({ type: SEARCH_MESSAGES_REQUEST });
        const { data } = await axios.get(`/api/v1/messages/search?chatId=${chatId}&query=${query}`);

        dispatch({
            type: SEARCH_MESSAGES_SUCCESS,
            payload: data.messages,
        });

    } catch (error) {
        dispatch({
            type: SEARCH_MESSAGES_FAIL,
            payload: error.response.data.message,
        });
    }
}

// React to Message (with optimistic UI update)
export const reactToMessage = (messageId, emoji, userId) => async (dispatch, getState) => {
    // Optimistic update: Immediately update UI before API call
    const { messages } = getState().allMessages;
    const targetMessage = messages.find(m => m._id === messageId);
    
    if (targetMessage) {
        // Create optimistic reaction data
        const currentReactions = targetMessage.reactions || [];
        const existingReaction = currentReactions.find(
            r => r.user === userId && r.emoji === emoji
        );
        
        let optimisticReactions;
        if (existingReaction) {
            // Remove reaction if same emoji clicked again
            optimisticReactions = currentReactions.filter(
                r => !(r.user === userId && r.emoji === emoji)
            );
        } else {
            // Remove any existing reaction from this user and add new one
            optimisticReactions = currentReactions.filter(r => r.user !== userId);
            optimisticReactions.push({ user: userId, emoji });
        }
        
        // Dispatch optimistic update immediately
        dispatch({
            type: ALL_MESSAGES_UPDATE,
            payload: { ...targetMessage, reactions: optimisticReactions }
        });
    }

    try {
        const config = { headers: { "Content-Type": "application/json" } }
        const { data } = await axios.post('/api/v1/message/react', { messageId, emoji }, config);

        dispatch({
            type: REACT_MESSAGE_SUCCESS,
            payload: data.message,
        });

        // Sync with server response (in case of any discrepancy)
        dispatch({
            type: ALL_MESSAGES_UPDATE,
            payload: data.message
        });

    } catch (error) {
        // Rollback to original state on error
        if (targetMessage) {
            dispatch({
                type: ALL_MESSAGES_UPDATE,
                payload: targetMessage
            });
        }
        dispatch({
            type: REACT_MESSAGE_FAIL,
            payload: error.response?.data?.message || 'Failed to add reaction',
        });
    }
}

// Share Post via Message
export const sharePost = (postId, receiverId) => async (dispatch) => {
    try {
        dispatch({ type: SHARE_POST_REQUEST });
        const config = { headers: { "Content-Type": "application/json" } }
        const { data } = await axios.post('/api/v1/sharePost', { postId, receiverId }, config);

        dispatch({
            type: SHARE_POST_SUCCESS,
            payload: data,
        });

        return data;

    } catch (error) {
        dispatch({
            type: SHARE_POST_FAIL,
            payload: error.response?.data?.message || 'Failed to share post',
        });
        throw error;
    }
}

// Clear All Errors
export const clearErrors = () => (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
}