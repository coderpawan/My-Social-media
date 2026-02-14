import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import {
  allUsersReducer,
  followUserReducer,
  forgotPasswordReducer,
  profileReducer,
  userDetailsReducer,
  userReducer,
} from "./reducers/userReducer";
import {
  deletePostReducer,
  likePostReducer,
  newCommentReducer,
  newPostReducer,
  postDetailsReducer,
  postOfFollowingReducer,
  savePostReducer,
} from "./reducers/postReducer";
import { allChatsReducer, newChatReducer, deleteChatReducer } from "./reducers/chatsReducer";
import {
  allMessagesReducer,
  newMessageReducer,
  editMessageReducer,
  deleteMessageReducer,
  searchMessagesReducer,
  sharePostReducer,
} from "./reducers/messageReducer";
import {
  storyFeedReducer,
  userStoriesReducer,
  archivedStoriesReducer,
  newStoryReducer,
  storyActionsReducer,
  deleteStoryReducer,
  userHighlightsReducer,
  highlightStoriesReducer,
  newHighlightReducer,
  deleteHighlightReducer,
  updateHighlightReducer,
} from "./reducers/storyReducer";

const reducer = combineReducers({
  user: userReducer,
  forgotPassword: forgotPasswordReducer,
  newPost: newPostReducer,
  userDetails: userDetailsReducer,
  allUsers: allUsersReducer,
  postOfFollowing: postOfFollowingReducer,
  likePost: likePostReducer,
  followUser: followUserReducer,
  newComment: newCommentReducer,
  savePost: savePostReducer,
  deletePost: deletePostReducer,
  profile: profileReducer,
  postDetails: postDetailsReducer,
  allChats: allChatsReducer,
  allMessages: allMessagesReducer,
  newMessage: newMessageReducer,
  newChat: newChatReducer,
  deleteChat: deleteChatReducer,
  editMessage: editMessageReducer,
  deleteMessage: deleteMessageReducer,
  searchMessages: searchMessagesReducer,
  sharePost: sharePostReducer,
  // Story reducers
  storyFeed: storyFeedReducer,
  userStories: userStoriesReducer,
  archivedStories: archivedStoriesReducer,
  newStory: newStoryReducer,
  storyActions: storyActionsReducer,
  deleteStory: deleteStoryReducer,
  userHighlights: userHighlightsReducer,
  highlightStories: highlightStoriesReducer,
  newHighlight: newHighlightReducer,
  deleteHighlight: deleteHighlightReducer,
  updateHighlight: updateHighlightReducer,
});

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk)));

export default store;
