import axios from "axios";
import { 
    ALL_CHATS_FAIL, 
    ALL_CHATS_REQUEST, 
    ALL_CHATS_SUCCESS, 
    CLEAR_ERRORS, 
    NEW_CHAT_FAIL, 
    NEW_CHAT_REQUEST, 
    NEW_CHAT_SUCCESS,
    DELETE_CHAT_REQUEST,
    DELETE_CHAT_SUCCESS,
    DELETE_CHAT_FAIL,
    SET_TOTAL_UNREAD
} from "../constants/chatConstants";

// Get All Chats
export const getAllChats = () => async (dispatch) => {
    try {

        dispatch({ type: ALL_CHATS_REQUEST });

        const { data } = await axios.get('/api/v1/chats');

        dispatch({
            type: ALL_CHATS_SUCCESS,
            payload: {
                chats: data.chats,
                totalUnread: data.totalUnread
            },
        });

    } catch (error) {
        dispatch({
            type: ALL_CHATS_FAIL,
            payload: error.response.data.message,
        });
    }
};

// Get Total Unread Count
export const getTotalUnread = () => async (dispatch) => {
    try {
        const { data } = await axios.get('/api/v1/chats/unread');
        dispatch({
            type: SET_TOTAL_UNREAD,
            payload: data.totalUnread,
        });
    } catch (error) {
        console.error('Error fetching unread count:', error);
    }
};

// New Chat
export const addNewChat = (userId) => async (dispatch) => {
    try {

        dispatch({ type: NEW_CHAT_REQUEST });
        const config = { header: { "Content-Type": "application/json" } }
        const { data } = await axios.post("/api/v1/newChat", { receiverId: userId }, config);

        dispatch({
            type: NEW_CHAT_SUCCESS,
            payload: data,
        });

    } catch (error) {
        dispatch({
            type: NEW_CHAT_FAIL,
            payload: error.response.data.message,
        });
    }
}

// Delete Chat
export const deleteChat = (chatId) => async (dispatch) => {
    try {

        dispatch({ type: DELETE_CHAT_REQUEST });
        const { data } = await axios.delete(`/api/v1/chat/${chatId}`);

        dispatch({
            type: DELETE_CHAT_SUCCESS,
            payload: { ...data, chatId },
        });

    } catch (error) {
        dispatch({
            type: DELETE_CHAT_FAIL,
            payload: error.response.data.message,
        });
    }
}

// Clear All Errors
export const clearErrors = () => (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
}