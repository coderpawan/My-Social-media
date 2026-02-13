import {
    STORY_FEED_REQUEST,
    STORY_FEED_SUCCESS,
    STORY_FEED_FAIL,
    STORY_FEED_RESET,
    USER_STORIES_REQUEST,
    USER_STORIES_SUCCESS,
    USER_STORIES_FAIL,
    USER_STORIES_RESET,
    ARCHIVED_STORIES_REQUEST,
    ARCHIVED_STORIES_SUCCESS,
    ARCHIVED_STORIES_FAIL,
    NEW_STORY_REQUEST,
    NEW_STORY_SUCCESS,
    NEW_STORY_FAIL,
    NEW_STORY_RESET,
    VIEW_STORY_REQUEST,
    VIEW_STORY_SUCCESS,
    VIEW_STORY_FAIL,
    LIKE_STORY_REQUEST,
    LIKE_STORY_SUCCESS,
    LIKE_STORY_FAIL,
    DELETE_STORY_REQUEST,
    DELETE_STORY_SUCCESS,
    DELETE_STORY_FAIL,
    DELETE_STORY_RESET,
    USER_HIGHLIGHTS_REQUEST,
    USER_HIGHLIGHTS_SUCCESS,
    USER_HIGHLIGHTS_FAIL,
    HIGHLIGHT_STORIES_REQUEST,
    HIGHLIGHT_STORIES_SUCCESS,
    HIGHLIGHT_STORIES_FAIL,
    HIGHLIGHT_STORIES_RESET,
    NEW_HIGHLIGHT_REQUEST,
    NEW_HIGHLIGHT_SUCCESS,
    NEW_HIGHLIGHT_FAIL,
    NEW_HIGHLIGHT_RESET,
    DELETE_HIGHLIGHT_REQUEST,
    DELETE_HIGHLIGHT_SUCCESS,
    DELETE_HIGHLIGHT_FAIL,
    DELETE_HIGHLIGHT_RESET,
    UPDATE_HIGHLIGHT_REQUEST,
    UPDATE_HIGHLIGHT_SUCCESS,
    UPDATE_HIGHLIGHT_FAIL,
    UPDATE_HIGHLIGHT_RESET,
    CLEAR_ERRORS
} from "../constants/storyConstants";

// Story Feed Reducer
export const storyFeedReducer = (state = { storyFeed: [] }, { type, payload }) => {
    switch (type) {
        case STORY_FEED_REQUEST:
            return { ...state, loading: true };
        case STORY_FEED_SUCCESS:
            return { loading: false, storyFeed: payload };
        case STORY_FEED_FAIL:
            return { ...state, loading: false, error: payload };
        case STORY_FEED_RESET:
            return { storyFeed: [] };
        case CLEAR_ERRORS:
            return { ...state, error: null };
        default:
            return state;
    }
};

// User Stories Reducer
export const userStoriesReducer = (state = { stories: [] }, { type, payload }) => {
    switch (type) {
        case USER_STORIES_REQUEST:
            return { ...state, loading: true };
        case USER_STORIES_SUCCESS:
            return { loading: false, stories: payload };
        case USER_STORIES_FAIL:
            return { ...state, loading: false, error: payload };
        case USER_STORIES_RESET:
            return { stories: [] };
        case CLEAR_ERRORS:
            return { ...state, error: null };
        default:
            return state;
    }
};

// Archived Stories Reducer
export const archivedStoriesReducer = (state = { stories: [] }, { type, payload }) => {
    switch (type) {
        case ARCHIVED_STORIES_REQUEST:
            return { ...state, loading: true };
        case ARCHIVED_STORIES_SUCCESS:
            return { loading: false, stories: payload };
        case ARCHIVED_STORIES_FAIL:
            return { ...state, loading: false, error: payload };
        case CLEAR_ERRORS:
            return { ...state, error: null };
        default:
            return state;
    }
};

// New Story Reducer
export const newStoryReducer = (state = { story: {} }, { type, payload }) => {
    switch (type) {
        case NEW_STORY_REQUEST:
            return { ...state, loading: true };
        case NEW_STORY_SUCCESS:
            return { loading: false, success: payload.success, story: payload.story };
        case NEW_STORY_FAIL:
            return { ...state, loading: false, error: payload };
        case NEW_STORY_RESET:
            return { ...state, success: false };
        case CLEAR_ERRORS:
            return { ...state, error: null };
        default:
            return state;
    }
};

// Story Actions Reducer (view, like)
export const storyActionsReducer = (state = {}, { type, payload }) => {
    switch (type) {
        case VIEW_STORY_REQUEST:
        case LIKE_STORY_REQUEST:
            return { ...state, loading: true };
        case VIEW_STORY_SUCCESS:
        case LIKE_STORY_SUCCESS:
            return { loading: false, success: true, message: payload.message };
        case VIEW_STORY_FAIL:
        case LIKE_STORY_FAIL:
            return { ...state, loading: false, error: payload };
        case CLEAR_ERRORS:
            return { ...state, error: null };
        default:
            return state;
    }
};

// Delete Story Reducer
export const deleteStoryReducer = (state = {}, { type, payload }) => {
    switch (type) {
        case DELETE_STORY_REQUEST:
            return { ...state, loading: true };
        case DELETE_STORY_SUCCESS:
            return { loading: false, success: true };
        case DELETE_STORY_FAIL:
            return { ...state, loading: false, error: payload };
        case DELETE_STORY_RESET:
            return { success: false };
        case CLEAR_ERRORS:
            return { ...state, error: null };
        default:
            return state;
    }
};

// User Highlights Reducer
export const userHighlightsReducer = (state = { highlights: [] }, { type, payload }) => {
    switch (type) {
        case USER_HIGHLIGHTS_REQUEST:
            return { ...state, loading: true };
        case USER_HIGHLIGHTS_SUCCESS:
            return { loading: false, highlights: payload };
        case USER_HIGHLIGHTS_FAIL:
            return { ...state, loading: false, error: payload };
        case CLEAR_ERRORS:
            return { ...state, error: null };
        default:
            return state;
    }
};

// Highlight Stories Reducer
export const highlightStoriesReducer = (state = { highlight: null, user: null }, { type, payload }) => {
    switch (type) {
        case HIGHLIGHT_STORIES_REQUEST:
            return { ...state, loading: true };
        case HIGHLIGHT_STORIES_SUCCESS:
            return { loading: false, highlight: payload.highlight, user: payload.user };
        case HIGHLIGHT_STORIES_FAIL:
            return { ...state, loading: false, error: payload };
        case HIGHLIGHT_STORIES_RESET:
            return { highlight: null, user: null };
        case CLEAR_ERRORS:
            return { ...state, error: null };
        default:
            return state;
    }
};

// New Highlight Reducer
export const newHighlightReducer = (state = {}, { type, payload }) => {
    switch (type) {
        case NEW_HIGHLIGHT_REQUEST:
            return { ...state, loading: true };
        case NEW_HIGHLIGHT_SUCCESS:
            return { loading: false, success: true, highlight: payload.highlight };
        case NEW_HIGHLIGHT_FAIL:
            return { ...state, loading: false, error: payload };
        case NEW_HIGHLIGHT_RESET:
            return { success: false };
        case CLEAR_ERRORS:
            return { ...state, error: null };
        default:
            return state;
    }
};

// Delete Highlight Reducer
export const deleteHighlightReducer = (state = {}, { type, payload }) => {
    switch (type) {
        case DELETE_HIGHLIGHT_REQUEST:
            return { ...state, loading: true };
        case DELETE_HIGHLIGHT_SUCCESS:
            return { loading: false, success: true };
        case DELETE_HIGHLIGHT_FAIL:
            return { ...state, loading: false, error: payload };
        case DELETE_HIGHLIGHT_RESET:
            return { success: false };
        case CLEAR_ERRORS:
            return { ...state, error: null };
        default:
            return state;
    }
};

// Update Highlight Reducer
export const updateHighlightReducer = (state = {}, { type, payload }) => {
    switch (type) {
        case UPDATE_HIGHLIGHT_REQUEST:
            return { ...state, loading: true };
        case UPDATE_HIGHLIGHT_SUCCESS:
            return { loading: false, success: true, highlight: payload.highlight };
        case UPDATE_HIGHLIGHT_FAIL:
            return { ...state, loading: false, error: payload };
        case UPDATE_HIGHLIGHT_RESET:
            return { success: false };
        case CLEAR_ERRORS:
            return { ...state, error: null };
        default:
            return state;
    }
};
