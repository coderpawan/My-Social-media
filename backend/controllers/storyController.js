const Story = require("../models/storyModel");
const User = require("../models/userModel");
const catchAsync = require("../middlewares/catchAsync");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Helper: Upload to Cloudinary with streaming
const uploadToCloudinary = (fileBuffer, resourceType = "image") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "instagram/stories",
                resource_type: resourceType,
                // For videos, add additional options
                ...(resourceType === "video" && {
                    eager: [{ format: "mp4", transformation: { quality: "auto" } }],
                    eager_async: true
                })
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

// Create New Story
exports.createStory = catchAsync(async (req, res, next) => {
    const { file } = req;
    const { caption } = req.body;

    if (!file) {
        return next(new ErrorHandler("Please upload an image or video", 400));
    }

    // Determine media type
    const isVideo = file.mimetype.startsWith("video/");
    const resourceType = isVideo ? "video" : "image";

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.buffer, resourceType);

    const story = await Story.create({
        user: req.user._id,
        media: {
            public_id: result.public_id,
            url: result.secure_url
        },
        mediaType: isVideo ? "video" : "image",
        caption
    });

    await story.populate("user", "username avatar");

    res.status(201).json({
        success: true,
        story
    });
});

// Get Stories Feed (from followed users + own stories)
exports.getStoriesFeed = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    
    // Get stories from followed users and self
    const userIds = [...user.following, req.user._id];

    // Get active stories within 24 hours (including archived ones - they still show until expired)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const stories = await Story.find({
        user: { $in: userIds },
        createdAt: { $gte: twentyFourHoursAgo }
    })
    .populate("user", "username avatar")
    .sort({ createdAt: -1 });

    // Get all users' highlights to check which stories are in highlights
    const usersWithHighlights = await User.find({ _id: { $in: userIds } })
        .select("highlights");
    
    // Create a map of storyId -> highlight info
    const storyHighlightMap = {};
    usersWithHighlights.forEach(u => {
        u.highlights?.forEach(highlight => {
            highlight.stories?.forEach(storyId => {
                storyHighlightMap[storyId.toString()] = {
                    highlightId: highlight._id,
                    highlightTitle: highlight.title
                };
            });
        });
    });

    // Group stories by user and add highlight info
    const groupedStories = stories.reduce((acc, story) => {
        const userId = story.user._id.toString();
        if (!acc[userId]) {
            acc[userId] = {
                user: story.user,
                stories: [],
                hasUnviewed: false
            };
        }
        
        // Add highlight info to story
        const storyObj = story.toObject();
        const highlightInfo = storyHighlightMap[story._id.toString()];
        if (highlightInfo) {
            storyObj.inHighlight = highlightInfo;
        }
        
        acc[userId].stories.push(storyObj);
        // Check if user has unviewed stories
        if (!story.viewers.includes(req.user._id)) {
            acc[userId].hasUnviewed = true;
        }
        return acc;
    }, {});

    // Convert to array and sort (unviewed first, then by latest story)
    const storyFeed = Object.values(groupedStories).sort((a, b) => {
        if (a.hasUnviewed !== b.hasUnviewed) {
            return a.hasUnviewed ? -1 : 1;
        }
        return new Date(b.stories[0].createdAt) - new Date(a.stories[0].createdAt);
    });

    res.status(200).json({
        success: true,
        storyFeed
    });
});

// Get User's Stories (for profile/archive)
exports.getUserStories = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const stories = await Story.find({
        user: userId,
        createdAt: { $gte: twentyFourHoursAgo }
    })
    .populate("user", "username avatar")
    .sort({ createdAt: 1 });

    // Get user's highlights to check which stories are in highlights
    const userWithHighlights = await User.findById(userId).select("highlights");
    
    // Create a map of storyId -> highlight info
    const storyHighlightMap = {};
    userWithHighlights?.highlights?.forEach(highlight => {
        highlight.stories?.forEach(storyId => {
            storyHighlightMap[storyId.toString()] = {
                highlightId: highlight._id,
                highlightTitle: highlight.title
            };
        });
    });

    // Add highlight info to stories
    const storiesWithHighlightInfo = stories.map(story => {
        const storyObj = story.toObject();
        const highlightInfo = storyHighlightMap[story._id.toString()];
        if (highlightInfo) {
            storyObj.inHighlight = highlightInfo;
        }
        return storyObj;
    });

    res.status(200).json({
        success: true,
        stories: storiesWithHighlightInfo
    });
});

// Get Archived Stories (for creating highlights)
exports.getArchivedStories = catchAsync(async (req, res, next) => {
    const stories = await Story.find({
        user: req.user._id,
        isArchived: true
    })
    .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        stories
    });
});

// View Story (mark as viewed)
exports.viewStory = catchAsync(async (req, res, next) => {
    const story = await Story.findById(req.params.storyId);

    if (!story) {
        return next(new ErrorHandler("Story not found", 404));
    }

    // Add viewer if not already viewed
    if (!story.viewers.includes(req.user._id)) {
        story.viewers.push(req.user._id);
        await story.save();
    }

    res.status(200).json({
        success: true,
        message: "Story viewed"
    });
});

// Like/Unlike Story
exports.likeUnlikeStory = catchAsync(async (req, res, next) => {
    const story = await Story.findById(req.params.storyId);

    if (!story) {
        return next(new ErrorHandler("Story not found", 404));
    }

    const isLiked = story.likes.includes(req.user._id);

    if (isLiked) {
        story.likes = story.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
        story.likes.push(req.user._id);
    }

    await story.save();

    res.status(200).json({
        success: true,
        message: isLiked ? "Story unliked" : "Story liked",
        isLiked: !isLiked
    });
});

// Delete Story
exports.deleteStory = catchAsync(async (req, res, next) => {
    const story = await Story.findById(req.params.storyId);

    if (!story) {
        return next(new ErrorHandler("Story not found", 404));
    }

    if (story.user.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("Unauthorized", 401));
    }

    // Delete from Cloudinary
    const resourceType = story.mediaType === "video" ? "video" : "image";
    await cloudinary.uploader.destroy(story.media.public_id, { resource_type: resourceType });

    await story.deleteOne();

    res.status(200).json({
        success: true,
        message: "Story deleted"
    });
});

// Archive Story (for highlights)
exports.archiveStory = catchAsync(async (req, res, next) => {
    const story = await Story.findById(req.params.storyId);

    if (!story) {
        return next(new ErrorHandler("Story not found", 404));
    }

    if (story.user.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("Unauthorized", 401));
    }

    story.isArchived = true;
    await story.save();

    res.status(200).json({
        success: true,
        message: "Story archived"
    });
});

// ============= HIGHLIGHTS =============

// Create Highlight
exports.createHighlight = catchAsync(async (req, res, next) => {
    const { title, storyIds, coverImageId } = req.body;

    if (!title || !storyIds || storyIds.length === 0) {
        return next(new ErrorHandler("Title and at least one story are required", 400));
    }

    // Verify all stories exist and belong to user
    const stories = await Story.find({
        _id: { $in: storyIds },
        user: req.user._id
    });

    if (stories.length !== storyIds.length) {
        return next(new ErrorHandler("One or more stories not found", 404));
    }

    // Archive stories if not already
    await Story.updateMany(
        { _id: { $in: storyIds }, isArchived: false },
        { isArchived: true }
    );

    // Get cover image (use first story if not specified)
    const coverStory = coverImageId 
        ? stories.find(s => s._id.toString() === coverImageId) 
        : stories[0];

    const user = await User.findById(req.user._id);
    
    user.highlights.push({
        title,
        coverImage: coverStory.media,
        stories: storyIds
    });

    await user.save();

    res.status(201).json({
        success: true,
        highlight: user.highlights[user.highlights.length - 1]
    });
});

// Get User Highlights
exports.getUserHighlights = catchAsync(async (req, res, next) => {
    const { userId } = req.params;

    const user = await User.findById(userId)
        .select("highlights")
        .populate({
            path: "highlights.stories",
            select: "media mediaType caption createdAt"
        });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        highlights: user.highlights
    });
});

// Update Highlight
exports.updateHighlight = catchAsync(async (req, res, next) => {
    const { highlightId } = req.params;
    const { title, storyIds, coverImageId } = req.body;

    const user = await User.findById(req.user._id);
    const highlight = user.highlights.id(highlightId);

    if (!highlight) {
        return next(new ErrorHandler("Highlight not found", 404));
    }

    if (title) highlight.title = title;
    
    if (storyIds && storyIds.length > 0) {
        // Archive new stories
        await Story.updateMany(
            { _id: { $in: storyIds }, isArchived: false },
            { isArchived: true }
        );
        highlight.stories = storyIds;
    }

    if (coverImageId) {
        const coverStory = await Story.findById(coverImageId);
        if (coverStory) {
            highlight.coverImage = coverStory.media;
        }
    }

    await user.save();

    res.status(200).json({
        success: true,
        highlight
    });
});

// Delete Highlight
exports.deleteHighlight = catchAsync(async (req, res, next) => {
    const { highlightId } = req.params;

    const user = await User.findById(req.user._id);
    const highlight = user.highlights.id(highlightId);

    if (!highlight) {
        return next(new ErrorHandler("Highlight not found", 404));
    }

    highlight.deleteOne();
    await user.save();

    res.status(200).json({
        success: true,
        message: "Highlight deleted"
    });
});

// Get Highlight Stories (for viewing)
exports.getHighlightStories = catchAsync(async (req, res, next) => {
    const { userId, highlightId } = req.params;

    const user = await User.findById(userId)
        .select("highlights username avatar");
    
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    const highlight = user.highlights.id(highlightId);
    
    if (!highlight) {
        return next(new ErrorHandler("Highlight not found", 404));
    }

    const stories = await Story.find({ _id: { $in: highlight.stories } })
        .populate("user", "username avatar")
        .sort({ createdAt: 1 });

    res.status(200).json({
        success: true,
        highlight: {
            ...highlight.toObject(),
            stories
        },
        user: {
            _id: user._id,
            username: user.username,
            avatar: user.avatar
        }
    });
});
