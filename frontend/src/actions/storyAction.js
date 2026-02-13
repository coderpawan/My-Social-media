import axios from "axios";
import {
    STORY_FEED_REQUEST,
    STORY_FEED_SUCCESS,
    STORY_FEED_FAIL,
    USER_STORIES_REQUEST,
    USER_STORIES_SUCCESS,
    USER_STORIES_FAIL,
    ARCHIVED_STORIES_REQUEST,
    ARCHIVED_STORIES_SUCCESS,
    ARCHIVED_STORIES_FAIL,
    NEW_STORY_REQUEST,
    NEW_STORY_SUCCESS,
    NEW_STORY_FAIL,
    VIEW_STORY_REQUEST,
    VIEW_STORY_SUCCESS,
    VIEW_STORY_FAIL,
    LIKE_STORY_REQUEST,
    LIKE_STORY_SUCCESS,
    LIKE_STORY_FAIL,
    DELETE_STORY_REQUEST,
    DELETE_STORY_SUCCESS,
    DELETE_STORY_FAIL,
    USER_HIGHLIGHTS_REQUEST,
    USER_HIGHLIGHTS_SUCCESS,
    USER_HIGHLIGHTS_FAIL,
    HIGHLIGHT_STORIES_REQUEST,
    HIGHLIGHT_STORIES_SUCCESS,
    HIGHLIGHT_STORIES_FAIL,
    NEW_HIGHLIGHT_REQUEST,
    NEW_HIGHLIGHT_SUCCESS,
    NEW_HIGHLIGHT_FAIL,
    DELETE_HIGHLIGHT_REQUEST,
    DELETE_HIGHLIGHT_SUCCESS,
    DELETE_HIGHLIGHT_FAIL,
    UPDATE_HIGHLIGHT_REQUEST,
    UPDATE_HIGHLIGHT_SUCCESS,
    UPDATE_HIGHLIGHT_FAIL,
    CLEAR_ERRORS
} from "../constants/storyConstants";

// Get Stories Feed
export const getStoriesFeed = () => async (dispatch) => {
    try {
        dispatch({ type: STORY_FEED_REQUEST });

        const { data } = await axios.get("/api/v1/stories/feed");

        dispatch({
            type: STORY_FEED_SUCCESS,
            payload: data.storyFeed
        });
    } catch (error) {
        dispatch({
            type: STORY_FEED_FAIL,
            payload: error.response?.data?.message || "Failed to fetch stories"
        });
    }
};

// Get User Stories
export const getUserStories = (userId) => async (dispatch) => {
    try {
        dispatch({ type: USER_STORIES_REQUEST });

        const { data } = await axios.get(`/api/v1/stories/user/${userId}`);

        dispatch({
            type: USER_STORIES_SUCCESS,
            payload: data.stories
        });
    } catch (error) {
        dispatch({
            type: USER_STORIES_FAIL,
            payload: error.response?.data?.message || "Failed to fetch user stories"
        });
    }
};

// Get Archived Stories
export const getArchivedStories = () => async (dispatch) => {
    try {
        dispatch({ type: ARCHIVED_STORIES_REQUEST });

        const { data } = await axios.get("/api/v1/stories/archived");

        dispatch({
            type: ARCHIVED_STORIES_SUCCESS,
            payload: data.stories
        });
    } catch (error) {
        dispatch({
            type: ARCHIVED_STORIES_FAIL,
            payload: error.response?.data?.message || "Failed to fetch archived stories"
        });
    }
};

// Create New Story
export const createStory = (formData) => async (dispatch) => {
    try {
        dispatch({ type: NEW_STORY_REQUEST });

        const config = { headers: { "Content-Type": "multipart/form-data" } };
        const { data } = await axios.post("/api/v1/story/new", formData, config);

        dispatch({
            type: NEW_STORY_SUCCESS,
            payload: data
        });
    } catch (error) {
        dispatch({
            type: NEW_STORY_FAIL,
            payload: error.response?.data?.message || "Failed to create story"
        });
    }
};

// View Story
export const viewStory = (storyId) => async (dispatch) => {
    try {
        dispatch({ type: VIEW_STORY_REQUEST });

        const { data } = await axios.post(`/api/v1/story/view/${storyId}`);

        dispatch({
            type: VIEW_STORY_SUCCESS,
            payload: data
        });
    } catch (error) {
        dispatch({
            type: VIEW_STORY_FAIL,
            payload: error.response?.data?.message || "Failed to view story"
        });
    }
};

// Like/Unlike Story
export const likeUnlikeStory = (storyId) => async (dispatch) => {
    try {
        dispatch({ type: LIKE_STORY_REQUEST });

        const { data } = await axios.post(`/api/v1/story/like/${storyId}`);

        dispatch({
            type: LIKE_STORY_SUCCESS,
            payload: data
        });
    } catch (error) {
        dispatch({
            type: LIKE_STORY_FAIL,
            payload: error.response?.data?.message || "Failed to like story"
        });
    }
};

// Delete Story
export const deleteStory = (storyId) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_STORY_REQUEST });

        const { data } = await axios.delete(`/api/v1/story/${storyId}`);

        dispatch({
            type: DELETE_STORY_SUCCESS,
            payload: data
        });
    } catch (error) {
        dispatch({
            type: DELETE_STORY_FAIL,
            payload: error.response?.data?.message || "Failed to delete story"
        });
    }
};

// Get User Highlights
export const getUserHighlights = (userId) => async (dispatch) => {
    try {
        dispatch({ type: USER_HIGHLIGHTS_REQUEST });

        const { data } = await axios.get(`/api/v1/highlights/${userId}`);

        dispatch({
            type: USER_HIGHLIGHTS_SUCCESS,
            payload: data.highlights
        });
    } catch (error) {
        dispatch({
            type: USER_HIGHLIGHTS_FAIL,
            payload: error.response?.data?.message || "Failed to fetch highlights"
        });
    }
};

// Get Highlight Stories
export const getHighlightStories = (userId, highlightId) => async (dispatch) => {
    try {
        dispatch({ type: HIGHLIGHT_STORIES_REQUEST });

        const { data } = await axios.get(`/api/v1/highlight/${userId}/${highlightId}/stories`);

        dispatch({
            type: HIGHLIGHT_STORIES_SUCCESS,
            payload: data
        });
    } catch (error) {
        dispatch({
            type: HIGHLIGHT_STORIES_FAIL,
            payload: error.response?.data?.message || "Failed to fetch highlight stories"
        });
    }
};

// Create New Highlight
export const createHighlight = (highlightData) => async (dispatch) => {
    try {
        dispatch({ type: NEW_HIGHLIGHT_REQUEST });

        const config = { headers: { "Content-Type": "application/json" } };
        const { data } = await axios.post("/api/v1/highlight/new", highlightData, config);

        dispatch({
            type: NEW_HIGHLIGHT_SUCCESS,
            payload: data
        });
    } catch (error) {
        dispatch({
            type: NEW_HIGHLIGHT_FAIL,
            payload: error.response?.data?.message || "Failed to create highlight"
        });
    }
};

// Delete Highlight
export const deleteHighlight = (highlightId) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_HIGHLIGHT_REQUEST });

        const { data } = await axios.delete(`/api/v1/highlight/${highlightId}`);

        dispatch({
            type: DELETE_HIGHLIGHT_SUCCESS,
            payload: data
        });
    } catch (error) {
        dispatch({
            type: DELETE_HIGHLIGHT_FAIL,
            payload: error.response?.data?.message || "Failed to delete highlight"
        });
    }
};

// Update Highlight
export const updateHighlight = (highlightId, highlightData) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_HIGHLIGHT_REQUEST });

        const config = { headers: { "Content-Type": "application/json" } };
        const { data } = await axios.put(`/api/v1/highlight/${highlightId}`, highlightData, config);

        dispatch({
            type: UPDATE_HIGHLIGHT_SUCCESS,
            payload: data
        });
    } catch (error) {
        dispatch({
            type: UPDATE_HIGHLIGHT_FAIL,
            payload: error.response?.data?.message || "Failed to update highlight"
        });
    }
};

// Clear Errors
export const clearStoryErrors = () => (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
};
