const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    media: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    caption: {
        type: String,
        trim: true,
        maxlength: 200
    },
    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    // Flag for archiving stories (for highlights feature)
    isArchived: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        // TTL index - automatically deletes document after 24 hours
        // Note: isArchived stories won't be deleted due to pre-remove hook
        expires: 86400 // 24 hours in seconds
    }
});

// Prevent deletion of archived stories (for highlights)
storySchema.pre('remove', function(next) {
    if (this.isArchived) {
        return next(new Error('Cannot delete archived story'));
    }
    next();
});

// Index for efficient querying of active stories
storySchema.index({ user: 1, createdAt: -1 });
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400, partialFilterExpression: { isArchived: false } });

module.exports = mongoose.model("Story", storySchema);
