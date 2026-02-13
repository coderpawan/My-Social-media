import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStoriesFeed } from "../../actions/storyAction";
import StoryViewer from "./StoryViewer";
import NewStoryModal from "./NewStoryModal";
import { PlusIcon } from "@heroicons/react/24/outline";

const StoryBar = () => {
    const dispatch = useDispatch();
    const scrollRef = useRef(null);

    const { storyFeed, loading } = useSelector((state) => state.storyFeed);
    const { user } = useSelector((state) => state.user);

    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedUserIndex, setSelectedUserIndex] = useState(0);
    const [newStoryOpen, setNewStoryOpen] = useState(false);

    useEffect(() => {
        dispatch(getStoriesFeed());
    }, [dispatch]);

    const openStoryViewer = (index) => {
        setSelectedUserIndex(index);
        setViewerOpen(true);
    };

    const closeStoryViewer = () => {
        setViewerOpen(false);
    };

    const goToNextUser = () => {
        if (selectedUserIndex < storyFeed.length - 1) {
            setSelectedUserIndex(selectedUserIndex + 1);
        } else {
            closeStoryViewer();
        }
    };

    const goToPrevUser = () => {
        if (selectedUserIndex > 0) {
            setSelectedUserIndex(selectedUserIndex - 1);
        }
    };

    // Check if current user has stories
    const currentUserStories = storyFeed.find(
        (item) => item.user._id === user?._id
    );

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 200;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <>
            <div className="w-full bg-white border rounded-lg p-4 mb-4">
                <div className="relative">
                    {/* Scroll Buttons */}
                    <button
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1 hover:bg-gray-100 hidden sm:block"
                        onClick={() => scroll("left")}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1 hover:bg-gray-100 hidden sm:block"
                        onClick={() => scroll("right")}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Stories Container */}
                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto scrollbar-hide px-2"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                        {/* Add Story Button */}
                        <div
                            className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0"
                            onClick={() => setNewStoryOpen(true)}
                        >
                            <div className="relative w-16 h-16">
                                <img
                                    src={user?.avatar?.url || "/default-avatar.png"}
                                    alt="Your story"
                                    className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                                />
                                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 border-2 border-white">
                                    <PlusIcon className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <span className="text-xs text-gray-600 truncate w-16 text-center">
                                {currentUserStories ? "Your story" : "Add story"}
                            </span>
                        </div>

                        {/* Loading Skeleton */}
                        {loading && (
                            <>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
                                        <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
                                        <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Story Items */}
                        {!loading &&
                            storyFeed.map((item, index) => (
                                <div
                                    key={item.user._id}
                                    className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0"
                                    onClick={() => openStoryViewer(index)}
                                >
                                    <div
                                        className={`w-16 h-16 rounded-full p-0.5 ${
                                            item.hasUnviewed
                                                ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                                                : "bg-gray-300"
                                        }`}
                                    >
                                        <img
                                            src={item.user.avatar?.url || "/default-avatar.png"}
                                            alt={item.user.username}
                                            className="w-full h-full rounded-full object-cover border-2 border-white"
                                        />
                                    </div>
                                    <span className="text-xs text-gray-600 truncate w-16 text-center">
                                        {item.user._id === user?._id ? "Your story" : item.user.username}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Story Viewer Modal */}
            {viewerOpen && storyFeed.length > 0 && (
                <StoryViewer
                    storyData={storyFeed[selectedUserIndex]}
                    onClose={closeStoryViewer}
                    onNextUser={goToNextUser}
                    onPrevUser={goToPrevUser}
                    hasNextUser={selectedUserIndex < storyFeed.length - 1}
                    hasPrevUser={selectedUserIndex > 0}
                />
            )}

            {/* New Story Modal */}
            {newStoryOpen && (
                <NewStoryModal onClose={() => setNewStoryOpen(false)} />
            )}
        </>
    );
};

export default StoryBar;
