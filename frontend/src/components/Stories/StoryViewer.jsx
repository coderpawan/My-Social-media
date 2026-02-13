import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { viewStory, likeUnlikeStory, deleteStory } from "../../actions/storyAction";
import { Link } from "react-router-dom";
import { XMarkIcon, HeartIcon, TrashIcon, PauseIcon, PlayIcon, ArchiveBoxIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { toast } from "react-toastify";

const STORY_DURATION = 5000; // 5 seconds per story

const StoryViewer = ({
    storyData,
    onClose,
    onNextUser,
    onPrevUser,
    hasNextUser,
    hasPrevUser,
    isHighlight = false,
    initialIndex = 0
}) => {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.user);
    
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [likedStories, setLikedStories] = useState({});
    const [archivedStories, setArchivedStories] = useState({});
    
    const progressInterval = useRef(null);
    const videoRef = useRef(null);

    const stories = useMemo(() => storyData?.stories || [], [storyData?.stories]);
    const currentStory = stories[currentIndex];
    const storyUser = storyData?.user;

    // Mark story as viewed
    useEffect(() => {
        if (currentStory && !isHighlight) {
            dispatch(viewStory(currentStory._id));
        }
    }, [dispatch, currentStory, isHighlight]);

    // Initialize liked stories state
    useEffect(() => {
        const initialLiked = {};
        stories.forEach((story) => {
            initialLiked[story._id] = story.likes?.includes(currentUser?._id);
        });
        setLikedStories(initialLiked);
    }, [stories, currentUser]);

    // Progress bar logic
    const startProgress = useCallback(() => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }
        
        setProgress(0);
        
        const isVideo = currentStory?.mediaType === "video";
        const duration = isVideo && videoRef.current 
            ? videoRef.current.duration * 1000 
            : STORY_DURATION;
        
        const increment = 100 / (duration / 50); // Update every 50ms
        
        progressInterval.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval.current);
                    goToNext();
                    return 100;
                }
                return prev + increment;
            });
        }, 50);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex, currentStory]);

    // Start/stop progress based on pause state
    useEffect(() => {
        if (!isPaused && currentStory) {
            startProgress();
        } else if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [isPaused, currentStory, startProgress]);

    // Handle video events
    useEffect(() => {
        if (currentStory?.mediaType === "video" && videoRef.current) {
            if (isPaused) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    }, [isPaused, currentStory]);

    const goToNext = useCallback(() => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setProgress(0);
        } else if (hasNextUser) {
            setCurrentIndex(0);
            setProgress(0);
            onNextUser();
        } else {
            onClose();
        }
    }, [currentIndex, stories.length, hasNextUser, onNextUser, onClose]);

    const goToPrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
            setProgress(0);
        } else if (hasPrevUser) {
            onPrevUser();
        }
    }, [currentIndex, hasPrevUser, onPrevUser]);

    // Handle tap navigation
    const handleTap = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        if (x < width / 3) {
            goToPrev();
        } else if (x > (width * 2) / 3) {
            goToNext();
        }
    };

    // Handle hold to pause
    const handleMouseDown = () => setIsPaused(true);
    const handleMouseUp = () => setIsPaused(false);

    // Handle like
    const handleLike = (e) => {
        e.stopPropagation();
        if (currentStory) {
            dispatch(likeUnlikeStory(currentStory._id));
            setLikedStories((prev) => ({
                ...prev,
                [currentStory._id]: !prev[currentStory._id]
            }));
        }
    };

    // Handle delete
    const handleDelete = (e) => {
        e.stopPropagation();
        if (currentStory && window.confirm("Delete this story?")) {
            dispatch(deleteStory(currentStory._id));
            if (stories.length === 1) {
                onClose();
            } else {
                goToNext();
            }
        }
    };

    // Handle archive (save for highlights)
    const handleArchive = async (e) => {
        e.stopPropagation();
        if (currentStory && !currentStory.isArchived && !currentStory.inHighlight && !archivedStories[currentStory._id]) {
            try {
                await axios.post(`/api/v1/story/archive/${currentStory._id}`);
                setArchivedStories((prev) => ({ ...prev, [currentStory._id]: true }));
                toast.success("Story saved to archive! You can now add it to Highlights.");
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to archive story");
            }
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.key) {
                case "ArrowLeft":
                    goToPrev();
                    break;
                case "ArrowRight":
                    goToNext();
                    break;
                case "Escape":
                    onClose();
                    break;
                case " ":
                    e.preventDefault();
                    setIsPaused((prev) => !prev);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [goToNext, goToPrev, onClose]);

    // Format time ago
    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h`;
    };

    if (!currentStory || !storyUser) return null;

    const isOwnStory = storyUser._id === currentUser?._id;

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
            {/* Navigation arrows for desktop */}
            {hasPrevUser && (
                <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 hidden md:block"
                    onClick={() => {
                        setCurrentIndex(0);
                        onPrevUser();
                    }}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {hasNextUser && (
                <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-white/10 hover:bg-white/20 hidden md:block"
                    onClick={() => {
                        setCurrentIndex(0);
                        onNextUser();
                    }}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}

            {/* Story Container */}
            <div
                className="relative w-full max-w-md h-[90vh] max-h-[800px] bg-black rounded-lg overflow-hidden"
                onClick={handleTap}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
            >
                {/* Progress Bars */}
                <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
                    {stories.map((_, index) => (
                        <div
                            key={index}
                            className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
                        >
                            <div
                                className="h-full bg-white rounded-full transition-all duration-50 ease-linear"
                                style={{
                                    width: `${
                                        index < currentIndex
                                            ? 100
                                            : index === currentIndex
                                            ? progress
                                            : 0
                                    }%`
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-4 pt-2">
                    <Link
                        to={`/${storyUser.username}`}
                        className="flex items-center gap-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={storyUser.avatar?.url || "/default-avatar.png"}
                            alt={storyUser.username}
                            className="w-8 h-8 rounded-full object-cover border border-white/50"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-white font-semibold text-sm">
                                {storyUser.username}
                            </span>
                            <span className="text-white/70 text-xs">
                                {formatTimeAgo(currentStory.createdAt)}
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsPaused((prev) => !prev);
                            }}
                            className="text-white p-1"
                        >
                            {isPaused ? (
                                <PlayIcon className="w-6 h-6" />
                            ) : (
                                <PauseIcon className="w-6 h-6" />
                            )}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="text-white p-1"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Highlight Label */}
                {currentStory.inHighlight && (
                    <div className="absolute top-16 left-0 right-0 z-20 flex justify-center">
                        <div className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 px-4 py-1.5 rounded-full">
                            <span className="text-white text-xs font-medium">
                                Added to "{currentStory.inHighlight.highlightTitle}" highlight
                            </span>
                        </div>
                    </div>
                )}

                {/* Story Content */}
                <div className="w-full h-full flex items-center justify-center">
                    {currentStory.mediaType === "video" ? (
                        <video
                            ref={videoRef}
                            src={currentStory.media?.url}
                            className="w-full h-full object-contain"
                            autoPlay
                            muted={false}
                            playsInline
                            onLoadedMetadata={() => {
                                if (!isPaused) startProgress();
                            }}
                        />
                    ) : (
                        <img
                            src={currentStory.media?.url}
                            alt="Story"
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>

                {/* Caption */}
                {currentStory.caption && (
                    <div className="absolute bottom-20 left-0 right-0 px-4 z-20">
                        <p className="text-white text-center text-sm bg-black/50 rounded-lg py-2 px-4">
                            {currentStory.caption}
                        </p>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-t from-black/50 to-transparent">
                    {!isOwnStory ? (
                        <button
                            onClick={handleLike}
                            className="flex items-center gap-2 text-white"
                        >
                            {likedStories[currentStory._id] ? (
                                <HeartSolidIcon className="w-7 h-7 text-red-500" />
                            ) : (
                                <HeartIcon className="w-7 h-7" />
                            )}
                        </button>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className="text-white text-sm">
                                <span className="font-semibold">{currentStory.viewers?.length || 0}</span>
                                <span className="text-white/70 ml-1">viewers</span>
                            </div>
                            {!isHighlight && (
                                <button
                                    onClick={handleArchive}
                                    className={`text-white ${archivedStories[currentStory._id] || currentStory.isArchived || currentStory.inHighlight ? 'text-green-400' : 'hover:text-blue-400'}`}
                                    title={archivedStories[currentStory._id] || currentStory.isArchived || currentStory.inHighlight ? "Already archived" : "Save to archive for Highlights"}
                                    disabled={!!currentStory.inHighlight}
                                >
                                    <ArchiveBoxIcon className="w-6 h-6" />
                                </button>
                            )}
                            <button
                                onClick={handleDelete}
                                className="text-white hover:text-red-500"
                            >
                                <TrashIcon className="w-6 h-6" />
                            </button>
                        </div>
                    )}

                    {/* Story indicator */}
                    <div className="text-white/70 text-xs">
                        {currentIndex + 1} / {stories.length}
                    </div>
                </div>

                {/* Tap zones indicator (shows briefly) */}
                <div className="absolute inset-0 pointer-events-none flex">
                    <div className="w-1/3 h-full" />
                    <div className="w-1/3 h-full" />
                    <div className="w-1/3 h-full" />
                </div>
            </div>
        </div>
    );
};

export default StoryViewer;
