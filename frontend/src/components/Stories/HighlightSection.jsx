import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserHighlights, getHighlightStories } from "../../actions/storyAction";
import { HIGHLIGHT_STORIES_RESET } from "../../constants/storyConstants";
import StoryViewer from "./StoryViewer";
import CreateHighlightModal from "./CreateHighlightModal";
import EditHighlightModal from "./EditHighlightModal";
import ArchivedStoriesModal from "./ArchivedStoriesModal";
import { PlusIcon, ArchiveBoxIcon, PencilIcon } from "@heroicons/react/24/outline";

const HighlightSection = ({ userId, isOwnProfile }) => {
    const dispatch = useDispatch();
    
    const { highlights, loading } = useSelector((state) => state.userHighlights);
    const { highlight: activeHighlight, user: highlightUser } = useSelector(
        (state) => state.highlightStories
    );

    const [viewerOpen, setViewerOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [archiveModalOpen, setArchiveModalOpen] = useState(false);
    const [selectedHighlight, setSelectedHighlight] = useState(null);

    useEffect(() => {
        if (userId) {
            dispatch(getUserHighlights(userId));
        }
    }, [dispatch, userId]);

    const openHighlight = (highlightId) => {
        dispatch(getHighlightStories(userId, highlightId));
        setViewerOpen(true);
    };

    const closeViewer = () => {
        setViewerOpen(false);
        dispatch({ type: HIGHLIGHT_STORIES_RESET });
    };

    const openEditModal = (e, highlight) => {
        e.stopPropagation();
        setSelectedHighlight(highlight);
        setEditModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex gap-4 px-4 py-6 overflow-x-auto">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 animate-pulse" />
                        <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    if (!highlights?.length && !isOwnProfile) {
        return null;
    }

    return (
        <>
            <div className="border-t">
                <div className="flex gap-4 md:gap-6 px-4 py-6 overflow-x-auto scrollbar-hide">
                    {/* Add Highlight Button (only for own profile) */}
                    {isOwnProfile && (
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="flex flex-col items-center gap-2 flex-shrink-0"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition">
                                <PlusIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <span className="text-xs text-gray-600">New</span>
                        </button>
                    )}

                    {/* View Archive Button (only for own profile) */}
                    {isOwnProfile && (
                        <button
                            onClick={() => setArchiveModalOpen(true)}
                            className="flex flex-col items-center gap-2 flex-shrink-0"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition">
                                <ArchiveBoxIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <span className="text-xs text-gray-600">Archive</span>
                        </button>
                    )}

                    {/* Highlight Items */}
                    {highlights?.map((highlight) => (
                        <div
                            key={highlight._id}
                            className="flex flex-col items-center gap-2 flex-shrink-0 group relative"
                        >
                            <button
                                onClick={() => openHighlight(highlight._id)}
                                className="relative"
                            >
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 group-hover:scale-105 transition">
                                    <div className="w-full h-full rounded-full bg-white p-0.5">
                                        <img
                                            src={highlight.coverImage?.url || "/default-highlight.png"}
                                            alt={highlight.title}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                </div>
                            </button>
                            {/* Edit Button (only for own profile) */}
                            {isOwnProfile && (
                                <button
                                    onClick={(e) => openEditModal(e, highlight)}
                                    className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                                >
                                    <PencilIcon className="w-3.5 h-3.5 text-gray-600" />
                                </button>
                            )}
                            <span className="text-xs text-gray-800 truncate max-w-16 md:max-w-20">
                                {highlight.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Story Viewer for Highlights */}
            {viewerOpen && activeHighlight && highlightUser && (
                <StoryViewer
                    storyData={{
                        user: highlightUser,
                        stories: activeHighlight.stories || []
                    }}
                    onClose={closeViewer}
                    onNextUser={closeViewer}
                    onPrevUser={closeViewer}
                    hasNextUser={false}
                    hasPrevUser={false}
                    isHighlight={true}
                />
            )}

            {/* Create Highlight Modal */}
            {createModalOpen && (
                <CreateHighlightModal
                    onClose={() => setCreateModalOpen(false)}
                    userId={userId}
                />
            )}

            {/* Edit Highlight Modal */}
            {editModalOpen && selectedHighlight && (
                <EditHighlightModal
                    highlight={selectedHighlight}
                    onClose={() => {
                        setEditModalOpen(false);
                        setSelectedHighlight(null);
                    }}
                />
            )}

            {/* Archived Stories Modal */}
            {archiveModalOpen && (
                <ArchivedStoriesModal
                    onClose={() => setArchiveModalOpen(false)}
                />
            )}
        </>
    );
};

export default HighlightSection;
