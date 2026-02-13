import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createStory, getStoriesFeed } from "../../actions/storyAction";
import { NEW_STORY_RESET } from "../../constants/storyConstants";
import { XMarkIcon, PhotoIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

const NewStoryModal = ({ onClose }) => {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    const { loading, success, error } = useSelector((state) => state.newStory);

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null);
    const [caption, setCaption] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (success) {
            toast.success("Story posted!");
            dispatch({ type: NEW_STORY_RESET });
            dispatch(getStoriesFeed());
            onClose();
        }
        if (error) {
            toast.error(error);
        }
    }, [success, error, dispatch, onClose]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        processFile(selectedFile);
    };

    const processFile = (selectedFile) => {
        if (!selectedFile) return;

        const isVideo = selectedFile.type.startsWith("video/");
        const isImage = selectedFile.type.startsWith("image/");

        if (!isVideo && !isImage) {
            toast.error("Please select an image or video file");
            return;
        }

        // Check file size (100MB for video, 10MB for image)
        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        if (selectedFile.size > maxSize) {
            toast.error(`File too large. Max size: ${isVideo ? "100MB" : "10MB"}`);
            return;
        }

        setFile(selectedFile);
        setMediaType(isVideo ? "video" : "image");
        setPreview(URL.createObjectURL(selectedFile));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        processFile(droppedFile);
    };

    const handleSubmit = () => {
        if (!file) {
            toast.error("Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append("story", file);
        if (caption.trim()) {
            formData.append("caption", caption);
        }

        dispatch(createStory(formData));
    };

    const resetFile = () => {
        setFile(null);
        setPreview(null);
        setMediaType(null);
        setCaption("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Create Story</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {!preview ? (
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center ${
                                isDragging
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-300"
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="flex justify-center gap-4 mb-4">
                                <PhotoIcon className="w-12 h-12 text-gray-400" />
                                <VideoCameraIcon className="w-12 h-12 text-gray-400" />
                            </div>
                            <p className="text-gray-600 mb-2">
                                Drag and drop your photo or video here
                            </p>
                            <p className="text-gray-400 text-sm mb-4">
                                or click to browse
                            </p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            >
                                Select File
                            </button>
                            <p className="text-xs text-gray-400 mt-4">
                                Images: JPG, PNG, GIF (max 10MB) • Videos: MP4, MOV (max 100MB)
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Preview */}
                            <div className="relative aspect-[9/16] max-h-96 mx-auto bg-black rounded-lg overflow-hidden">
                                {mediaType === "video" ? (
                                    <video
                                        src={preview}
                                        className="w-full h-full object-contain"
                                        controls
                                        autoPlay
                                        muted
                                    />
                                ) : (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                    />
                                )}
                                <button
                                    onClick={resetFile}
                                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Caption */}
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Add a caption... (optional)"
                                maxLength={200}
                                rows={2}
                                className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-400 text-right">
                                {caption.length}/200
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {preview && (
                    <div className="p-4 border-t flex gap-3">
                        <button
                            onClick={resetFile}
                            className="flex-1 py-2 border rounded-lg hover:bg-gray-50 transition"
                            disabled={loading}
                        >
                            Change
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Posting...
                                </span>
                            ) : (
                                "Post Story"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewStoryModal;
