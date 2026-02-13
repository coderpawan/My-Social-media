const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat"
        },
        content: {
            type: String,
            trim: true,
            default: '',
        },
        mediaUrl: {
            public_id: String,
            url: String
        },
        deletedFor: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        deletedForEveryone: {
            type: Boolean,
            default: false
        },
        editedAt: {
            type: Date,
            default: null
        },
        reactions: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                emoji: {
                    type: String,
                    required: true
                }
            }
        ],
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        isReaction: {
            type: Boolean,
            default: false
        },
        reactionTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);