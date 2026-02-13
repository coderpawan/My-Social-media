const catchAsync = require("../middlewares/catchAsync");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/errorHandler");

// Send New Message
exports.newMessage = catchAsync(async (req, res, next) => {

    const { chatId, content } = req.body;

    const msgData = {
        sender: req.user._id,
        chatId,
        readBy: [req.user._id], // Sender has already read their own message
    }

    // Only add content if it's not empty
    if (content && content.trim()) {
        msgData.content = content;
    }

    // Handle media upload if present
    if (req.file) {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        const result = await cloudinary.v2.uploader.upload(dataURI, {
            folder: "chat_media",
            resource_type: "auto"
        });
        
        msgData.mediaUrl = {
            public_id: result.public_id,
            url: result.secure_url
        };
    }

    // Validate: either content or media must be present
    if (!msgData.content && !msgData.mediaUrl) {
        return next(new ErrorHandler("Message must have content or media", 400));
    }

    const newMessage = await Message.create(msgData);

    await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage, updatedAt: Date.now() });

    res.status(200).json({
        success: true,
        newMessage,
    });
});

// Get All Messages and mark them as read
exports.getMessages = catchAsync(async (req, res, next) => {

    // Mark all messages in this chat as read by the current user
    await Message.updateMany(
        {
            chatId: req.params.chatId,
            sender: { $ne: req.user._id },
            readBy: { $ne: req.user._id }
        },
        {
            $addToSet: { readBy: req.user._id }
        }
    );

    const messages = await Message.find({
        chatId: req.params.chatId,
        deletedFor: { $ne: req.user._id },
        deletedForEveryone: { $ne: true }
    });

    res.status(200).json({
        success: true,
        messages,
    });
});

// Mark messages as read
exports.markAsRead = catchAsync(async (req, res, next) => {
    const { chatId } = req.params;

    await Message.updateMany(
        {
            chatId,
            sender: { $ne: req.user._id },
            readBy: { $ne: req.user._id }
        },
        {
            $addToSet: { readBy: req.user._id }
        }
    );

    res.status(200).json({
        success: true,
        message: "Messages marked as read"
    });
});

// Edit Message
exports.editMessage = catchAsync(async (req, res, next) => {
    const { messageId, content } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
        return next(new ErrorHandler("Message not found", 404));
    }

    // Only sender can edit their message
    if (message.sender.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("You can only edit your own messages", 403));
    }

    message.content = content;
    message.editedAt = Date.now();
    await message.save();

    res.status(200).json({
        success: true,
        message,
    });
});

// Delete Message For Me
exports.deleteMessageForMe = catchAsync(async (req, res, next) => {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
        return next(new ErrorHandler("Message not found", 404));
    }

    // Add user to deletedFor array
    if (!message.deletedFor.includes(req.user._id)) {
        message.deletedFor.push(req.user._id);
        await message.save();
    }

    res.status(200).json({
        success: true,
        message: "Message deleted for you",
    });
});

// Delete Message For Everyone
exports.deleteMessageForEveryone = catchAsync(async (req, res, next) => {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
        return next(new ErrorHandler("Message not found", 404));
    }

    // Only sender can delete for everyone
    if (message.sender.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("You can only delete your own messages for everyone", 403));
    }

    // Delete media from cloudinary if exists
    if (message.mediaUrl && message.mediaUrl.public_id) {
        await cloudinary.v2.uploader.destroy(message.mediaUrl.public_id);
    }

    message.deletedForEveryone = true;
    message.mediaUrl = null;
    await message.save();

    // Update latest message in chat if this was the latest
    const chat = await Chat.findById(message.chatId).populate('latestMessage');
    if (chat && chat.latestMessage && chat.latestMessage._id.toString() === messageId) {
        // Find the previous non-deleted message
        const previousMessage = await Message.findOne({
            chatId: message.chatId,
            _id: { $ne: messageId },
            deletedForEveryone: { $ne: true }
        }).sort({ createdAt: -1 });
        
        if (previousMessage) {
            chat.latestMessage = previousMessage._id;
        } else {
            chat.latestMessage = null;
        }
        await chat.save();
    }

    res.status(200).json({
        success: true,
        message: "Message deleted for everyone",
    });
});

// Search Messages in Chat
exports.searchMessages = catchAsync(async (req, res, next) => {
    const { chatId, query } = req.query;

    const messages = await Message.find({
        chatId,
        content: { $regex: query, $options: 'i' },
        deletedFor: { $ne: req.user._id },
        deletedForEveryone: { $ne: true }
    });

    res.status(200).json({
        success: true,
        messages,
    });
});

// Add Reaction to Message
exports.addReaction = catchAsync(async (req, res, next) => {
    const { messageId, emoji } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
        return next(new ErrorHandler("Message not found", 404));
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
        r => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );

    let reactionAdded = false;

    if (existingReaction) {
        // Remove the reaction if same emoji is clicked again
        message.reactions = message.reactions.filter(
            r => !(r.user.toString() === req.user._id.toString() && r.emoji === emoji)
        );
    } else {
        // Remove any existing reaction from this user and add new one
        message.reactions = message.reactions.filter(
            r => r.user.toString() !== req.user._id.toString()
        );
        message.reactions.push({
            user: req.user._id,
            emoji
        });
        reactionAdded = true;
    }

    await message.save();

    res.status(200).json({
        success: true,
        message,
    });
});

// Remove Reaction from Message
exports.removeReaction = catchAsync(async (req, res, next) => {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
        return next(new ErrorHandler("Message not found", 404));
    }

    message.reactions = message.reactions.filter(
        r => r.user.toString() !== req.user._id.toString()
    );

    await message.save();

    res.status(200).json({
        success: true,
        message,
    });
});