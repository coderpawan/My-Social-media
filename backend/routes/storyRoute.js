const express = require("express");
const {
    createStory,
    getStoriesFeed,
    getUserStories,
    getArchivedStories,
    viewStory,
    likeUnlikeStory,
    deleteStory,
    archiveStory,
    createHighlight,
    getUserHighlights,
    updateHighlight,
    deleteHighlight,
    getHighlightStories
} = require("../controllers/storyController");
const { isAuthenticated } = require("../middlewares/auth");
const storyUpload = require("../middlewares/storyUpload");

const router = express.Router();

// Story Routes
router.route("/story/new").post(isAuthenticated, storyUpload.single("story"), createStory);
router.route("/stories/feed").get(isAuthenticated, getStoriesFeed);
router.route("/stories/user/:userId").get(isAuthenticated, getUserStories);
router.route("/stories/archived").get(isAuthenticated, getArchivedStories);
router.route("/story/view/:storyId").post(isAuthenticated, viewStory);
router.route("/story/like/:storyId").post(isAuthenticated, likeUnlikeStory);
router.route("/story/archive/:storyId").post(isAuthenticated, archiveStory);
router.route("/story/:storyId").delete(isAuthenticated, deleteStory);

// Highlight Routes
router.route("/highlight/new").post(isAuthenticated, createHighlight);
router.route("/highlights/:userId").get(isAuthenticated, getUserHighlights);
router.route("/highlight/:highlightId")
    .put(isAuthenticated, updateHighlight)
    .delete(isAuthenticated, deleteHighlight);
router.route("/highlight/:userId/:highlightId/stories").get(isAuthenticated, getHighlightStories);

module.exports = router;
