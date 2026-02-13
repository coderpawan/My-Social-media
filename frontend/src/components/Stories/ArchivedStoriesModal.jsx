import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getArchivedStories } from "../../actions/storyAction";
import { XMarkIcon } from "@heroicons/react/24/outline";
import StoryViewer from "./StoryViewer";

const ArchivedStoriesModal = ({ onClose }) => {
    const dispatch = useDispatch();
    
    const { stories: archivedStories, loading } = useSelector(
        (state) => state.archivedStories
    );
    const { user } = useSelector((state) => state.user);

    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        dispatch(getArchivedStories());
    }, [dispatch]);

    const openStory = (index) => {
        setSelectedIndex(index);
        setViewerOpen(true);
    };

    const closeViewer = () => {
        setViewerOpen(false);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    return (
        <>
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-semibold">Story Archive</h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-full"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                            </div>
                        ) : archivedStories?.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">No Archived Stories</h3>
                                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                    When you archive your stories, they'll appear here. You can add archived stories to your highlights.
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-gray-500 mb-4">
                                    {archivedStories.length} archived {archivedStories.length === 1 ? 'story' : 'stories'}
                                </p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {archivedStories.map((story, index) => (
                                        <button
                                            key={story._id}
                                            onClick={() => openStory(index)}
                                            className="relative aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden group"
                                        >
                                            {story.mediaType === "video" ? (
                                                <>
                                                    <video
                                                        src={story.media?.url}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {/* Video indicator */}
                                                    <div className="absolute top-2 right-2">
                                                        <svg className="w-5 h-5 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                        </svg>
                                                    </div>
                                                </>
                                            ) : (
                                                <img
                                                    src={story.media?.url}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            )}

                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                                            {/* Date label */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                                <p className="text-white text-xs">
                                                    {formatDate(story.createdAt)}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t bg-gray-50">
                        <p className="text-xs text-gray-500 text-center">
                            Archived stories are saved here and can be added to highlights anytime.
                        </p>
                    </div>
                </div>
            </div>

            {/* Story Viewer */}
            {viewerOpen && archivedStories?.length > 0 && (
                <StoryViewer
                    storyData={{
                        user: user,
                        stories: archivedStories
                    }}
                    onClose={closeViewer}
                    onNextUser={closeViewer}
                    onPrevUser={closeViewer}
                    hasNextUser={false}
                    hasPrevUser={false}
                    isHighlight={true}
                    initialIndex={selectedIndex}
                />
            )}
        </>
    );
};

export default ArchivedStoriesModal;
