import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getArchivedStories, createHighlight, getUserHighlights } from "../../actions/storyAction";
import { NEW_HIGHLIGHT_RESET } from "../../constants/storyConstants";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

const CreateHighlightModal = ({ onClose, userId }) => {
    const dispatch = useDispatch();

    const { stories: archivedStories, loading: loadingArchived } = useSelector(
        (state) => state.archivedStories
    );
    const { loading, success, error } = useSelector((state) => state.newHighlight);

    const [step, setStep] = useState(1); // 1: Select stories, 2: Set title
    const [selectedStories, setSelectedStories] = useState([]);
    const [title, setTitle] = useState("");
    const [coverImageId, setCoverImageId] = useState(null);

    useEffect(() => {
        dispatch(getArchivedStories());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            toast.success("Highlight created!");
            dispatch({ type: NEW_HIGHLIGHT_RESET });
            dispatch(getUserHighlights(userId));
            onClose();
        }
        if (error) {
            toast.error(error);
        }
    }, [success, error, dispatch, onClose, userId]);

    const toggleStorySelection = (storyId) => {
        setSelectedStories((prev) => {
            if (prev.includes(storyId)) {
                // If removing the cover image, reset it
                if (coverImageId === storyId) {
                    setCoverImageId(null);
                }
                return prev.filter((id) => id !== storyId);
            }
            // Set first selected as cover by default
            if (prev.length === 0) {
                setCoverImageId(storyId);
            }
            return [...prev, storyId];
        });
    };

    const handleNext = () => {
        if (selectedStories.length === 0) {
            toast.error("Please select at least one story");
            return;
        }
        setStep(2);
    };

    const handleCreate = () => {
        if (!title.trim()) {
            toast.error("Please enter a title");
            return;
        }

        dispatch(
            createHighlight({
                title: title.trim(),
                storyIds: selectedStories,
                coverImageId
            })
        );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <button
                        onClick={step === 2 ? () => setStep(1) : onClose}
                        className="text-gray-600"
                    >
                        {step === 2 ? "Back" : "Cancel"}
                    </button>
                    <h2 className="text-lg font-semibold">
                        {step === 1 ? "Select Stories" : "New Highlight"}
                    </h2>
                    <button
                        onClick={step === 1 ? handleNext : handleCreate}
                        disabled={loading || (step === 1 && selectedStories.length === 0)}
                        className="text-blue-500 font-semibold disabled:text-blue-300"
                    >
                        {step === 1 ? "Next" : loading ? "Creating..." : "Create"}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {step === 1 ? (
                        <>
                            {loadingArchived ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
                                    <p className="text-gray-500 mt-4">Loading archived stories...</p>
                                </div>
                            ) : archivedStories?.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-gray-500">
                                        No archived stories yet.
                                    </p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Stories you've posted will be available here after they expire.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-1 p-1">
                                    {archivedStories?.map((story) => (
                                        <button
                                            key={story._id}
                                            onClick={() => toggleStorySelection(story._id)}
                                            className="relative aspect-[9/16] bg-gray-100 overflow-hidden"
                                        >
                                            {story.mediaType === "video" ? (
                                                <video
                                                    src={story.media?.url}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={story.media?.url}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            )}

                                            {/* Selection overlay */}
                                            <div
                                                className={`absolute inset-0 flex items-center justify-center ${
                                                    selectedStories.includes(story._id)
                                                        ? "bg-blue-500/30"
                                                        : "bg-black/20 hover:bg-black/30"
                                                }`}
                                            >
                                                <div
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                        selectedStories.includes(story._id)
                                                            ? "bg-blue-500 border-blue-500"
                                                            : "border-white"
                                                    }`}
                                                >
                                                    {selectedStories.includes(story._id) && (
                                                        <CheckIcon className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Date label */}
                                            <div className="absolute bottom-1 left-1 text-white text-xs bg-black/50 px-1 rounded">
                                                {formatDate(story.createdAt)}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="p-4 space-y-6">
                            {/* Cover Preview */}
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                                    {coverImageId && archivedStories ? (
                                        (() => {
                                            const coverStory = archivedStories.find(
                                                (s) => s._id === coverImageId
                                            );
                                            return coverStory?.mediaType === "video" ? (
                                                <video
                                                    src={coverStory?.media?.url}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={coverStory?.media?.url}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            );
                                        })()
                                    ) : (
                                        <div className="w-full h-full bg-gray-200" />
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    {selectedStories.length} stories selected
                                </p>
                            </div>

                            {/* Title Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Highlight Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Add a title..."
                                    maxLength={50}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-400 text-right mt-1">
                                    {title.length}/50
                                </p>
                            </div>

                            {/* Cover Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Cover Image
                                </label>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {selectedStories.map((storyId) => {
                                        const story = archivedStories?.find(
                                            (s) => s._id === storyId
                                        );
                                        if (!story) return null;

                                        return (
                                            <button
                                                key={storyId}
                                                onClick={() => setCoverImageId(storyId)}
                                                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                                                    coverImageId === storyId
                                                        ? "border-blue-500"
                                                        : "border-transparent"
                                                }`}
                                            >
                                                {story.mediaType === "video" ? (
                                                    <video
                                                        src={story.media?.url}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={story.media?.url}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateHighlightModal;
