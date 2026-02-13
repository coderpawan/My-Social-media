const express = require('express');
const { newChat, getChats, deleteChat, getTotalUnread } = require('../controllers/chatController');
const { isAuthenticated } = require('../middlewares/auth');

const router = express();

router.route("/newChat").post(isAuthenticated, newChat);
router.route("/chats").get(isAuthenticated, getChats);
router.route("/chats/unread").get(isAuthenticated, getTotalUnread);
router.route("/chat/:chatId").delete(isAuthenticated, deleteChat);

module.exports = router;