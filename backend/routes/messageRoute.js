const express = require('express');
const { newMessage, getMessages, editMessage, deleteMessageForMe, deleteMessageForEveryone, searchMessages, addReaction, removeReaction, markAsRead, sharePost } = require('../controllers/messageController');
const { isAuthenticated } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express();

router.route("/newMessage").post(isAuthenticated, upload.single('media'), newMessage);
router.route("/sharePost").post(isAuthenticated, sharePost);
router.route("/messages/search").get(isAuthenticated, searchMessages);
router.route("/messages/:chatId").get(isAuthenticated, getMessages);
router.route("/messages/read/:chatId").put(isAuthenticated, markAsRead);
router.route("/message/edit").put(isAuthenticated, editMessage);
router.route("/message/deleteForMe/:messageId").delete(isAuthenticated, deleteMessageForMe);
router.route("/message/deleteForEveryone/:messageId").delete(isAuthenticated, deleteMessageForEveryone);
router.route("/message/react").post(isAuthenticated, addReaction);
router.route("/message/react/:messageId").delete(isAuthenticated, removeReaction);

module.exports = router;