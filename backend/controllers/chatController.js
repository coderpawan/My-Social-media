const catchAsync = require("../middlewares/catchAsync");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const ErrorHandler = require("../utils/errorHandler");

// Create New Chat
exports.newChat = catchAsync(async (req, res, next) => {

    const chatExists = await Chat.findOne({
        users: {
            $all: [req.user._id, req.body.receiverId]
        }
    });

    if (chatExists) {
        return res.status(200).json({
            success: true,
            newChat: chatExists
        });
    }

    const newChat = await Chat.create({
        users: [req.user._id, req.body.receiverId],
    });

    res.status(200).json({
        success: true,
        newChat
    });
});

// Get All Chats with unread counts
exports.getChats = catchAsync(async (req, res, next) => {

    const chats = await Chat.find(
        {
            users: {
                $in: [req.user._id]
            }
        }
    ).sort({ updatedAt: -1 }).populate("users latestMessage");

    // Get unread counts for each chat
    const chatsWithUnread = await Promise.all(chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
            chatId: chat._id,
            sender: { $ne: req.user._id },
            readBy: { $ne: req.user._id },
            deletedFor: { $ne: req.user._id },
            deletedForEveryone: { $ne: true }
        });
        return {
            ...chat.toObject(),
            unreadCount
        };
    }));

    // Calculate total unread messages
    const totalUnread = chatsWithUnread.reduce((sum, chat) => sum + chat.unreadCount, 0);

    res.status(200).json({
        success: true,
        chats: chatsWithUnread,
        totalUnread
    });
});

// Get total unread message count
exports.getTotalUnread = catchAsync(async (req, res, next) => {
    const chats = await Chat.find({
        users: { $in: [req.user._id] }
    });

    const chatIds = chats.map(chat => chat._id);

    const totalUnread = await Message.countDocuments({
        chatId: { $in: chatIds },
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
        deletedFor: { $ne: req.user._id },
        deletedForEveryone: { $ne: true }
    });

    res.status(200).json({
        success: true,
        totalUnread
    });
});

// Delete Chat
exports.deleteChat = catchAsync(async (req, res, next) => {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) {
        return next(new ErrorHandler("Chat not found", 404));
    }

    // Check if user is part of the chat
    if (!chat.users.includes(req.user._id)) {
        return next(new ErrorHandler("You are not authorized to delete this chat", 403));
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chatId });

    // Delete the chat
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json({
        success: true,
        message: "Chat deleted successfully"
    });
});