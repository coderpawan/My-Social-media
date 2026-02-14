import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addComment, getPostDetails, likePost, savePost, clearErrors } from '../../actions/postAction';
import { commentIcon, emojiIcon, likeIconOutline, saveIconFill, saveIconOutline, shareIcon } from '../Home/SvgIcons';
import { likeFill } from '../Navbar/SvgIcons';
import { Picker } from 'emoji-mart';
import moment from 'moment';
import MetaData from '../Layouts/MetaData';
import BackdropLoader from '../Layouts/BackdropLoader';
import SharePostModal from '../Home/SharePostModal';
import { io } from 'socket.io-client';
import { SOCKET_ENDPOINT } from '../../utils/constants';
import { LIKE_UNLIKE_POST_RESET, NEW_COMMENT_RESET, POST_DETAILS_RESET, SAVE_UNSAVE_POST_RESET } from '../../constants/postConstants';

const PostDetail = () => {
    const dispatch = useDispatch();
    const params = useParams();
    const navigate = useNavigate();
    const commentInput = useRef(null);
    const socket = useRef(null);

    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [comment, setComment] = useState("");
    const [showEmojis, setShowEmojis] = useState(false);
    const [likeEffect, setLikeEffect] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const { user } = useSelector((state) => state.user);
    const { loading, post, error } = useSelector((state) => state.postDetails);
    const { error: likeError, message: likeMessage, success: likeSuccess } = useSelector((state) => state.likePost);
    const { error: commentError, success: commentSuccess } = useSelector((state) => state.newComment);
    const { error: saveError, success: saveSuccess, message: saveMessage } = useSelector((state) => state.savePost);

    // Initialize socket connection for sharing posts
    useEffect(() => {
        socket.current = io(SOCKET_ENDPOINT);
        socket.current.emit("addUser", user._id);
        
        return () => {
            socket.current?.disconnect();
        };
    }, [user._id]);

    useEffect(() => {
        dispatch(getPostDetails(params.postId));
        
        return () => {
            dispatch({ type: POST_DETAILS_RESET });
        }
    }, [dispatch, params.postId]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearErrors());
            navigate('/');
        }
        if (likeError) {
            toast.error(likeError);
            dispatch(clearErrors());
        }
        if (likeSuccess) {
            toast.success(likeMessage);
            dispatch({ type: LIKE_UNLIKE_POST_RESET });
            dispatch(getPostDetails(params.postId)); // Refresh to get updated likes
        }
        if (commentError) {
            toast.error(commentError);
            dispatch(clearErrors());
        }
        if (commentSuccess) {
            toast.success("Comment Added");
            dispatch({ type: NEW_COMMENT_RESET });
            dispatch(getPostDetails(params.postId)); // Refresh to get updated comments
        }
        if (saveError) {
            toast.error(saveError);
            dispatch(clearErrors());
        }
        if (saveSuccess) {
            toast.success(saveMessage);
            dispatch({ type: SAVE_UNSAVE_POST_RESET });
            dispatch(getPostDetails(params.postId)); // Refresh to get updated savedBy
        }
    }, [dispatch, error, likeError, likeSuccess, likeMessage, commentError, commentSuccess, saveError, saveSuccess, saveMessage, params.postId, navigate]);

    useEffect(() => {
        if (post?.likes) {
            setLiked(post.likes.some((u) => u._id === user._id));
        }
    }, [post?.likes, user._id]);

    useEffect(() => {
        if (post?.savedBy) {
            setSaved(post.savedBy.some((id) => id === user._id));
        }
    }, [post?.savedBy, user._id]);

    const handleLike = () => {
        setLiked(!liked);
        dispatch(likePost(post._id));
    };

    const handleComment = (e) => {
        e.preventDefault();
        dispatch(addComment(post._id, comment));
        setComment("");
    };

    const handleSave = () => {
        setSaved(!saved);
        dispatch(savePost(post._id));
    };

    const setLike = () => {
        setLikeEffect(true);
        setTimeout(() => {
            setLikeEffect(false);
        }, 500);
        if (liked) {
            return;
        }
        handleLike();
    };

    if (loading) {
        return <BackdropLoader />;
    }

    if (!post) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span className="text-gray-500">Post not found</span>
            </div>
        );
    }

    return (
        <>
            <MetaData title={`${post.postedBy?.username}'s post • Instagram`} />

            <div className="flex justify-center items-center min-h-screen bg-gray-50 pt-16 pb-8">
                <div className="flex sm:flex-row flex-col max-w-5xl w-full mx-4 bg-white border rounded shadow-sm">
                    
                    {/* Post Image */}
                    <div 
                        className="relative flex items-center justify-center bg-black sm:w-3/5 h-[50vh] sm:h-[80vh]" 
                        onDoubleClick={setLike}
                    >
                        <img 
                            draggable="false" 
                            className="object-contain h-full w-full" 
                            src={post.image?.url} 
                            alt="post" 
                        />
                        {likeEffect && (
                            <img 
                                draggable="false" 
                                height="80px" 
                                className="likeEffect" 
                                alt="heart" 
                                src="https://img.icons8.com/ios-filled/2x/ffffff/like.png" 
                            />
                        )}
                    </div>

                    {/* Post Details */}
                    <div className="flex flex-col justify-between sm:w-2/5 w-full rounded bg-white">
                        
                        {/* Header with user info */}
                        <div className="flex justify-between px-3 py-2 border-b items-center">
                            <div className="flex space-x-3 items-center">
                                <Link to={`/${post.postedBy?.username}`}>
                                    <img 
                                        draggable="false" 
                                        className="w-10 h-10 rounded-full object-cover" 
                                        src={post.postedBy?.avatar?.url} 
                                        alt="avatar" 
                                    />
                                </Link>
                                <Link 
                                    to={`/${post.postedBy?.username}`} 
                                    className="text-black text-sm font-semibold hover:underline"
                                >
                                    {post.postedBy?.username}
                                </Link>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="p-4 w-full flex-1 max-h-[40vh] sm:max-h-[50vh] overflow-y-auto">
                            {/* Caption */}
                            <div className="flex items-start mb-4">
                                <Link to={`/${post.postedBy?.username}`} className="w-12">
                                    <img 
                                        draggable="false" 
                                        className="w-9 h-9 rounded-full object-cover" 
                                        src={post.postedBy?.avatar?.url} 
                                        alt="avatar" 
                                    />
                                </Link>
                                <div className="flex-1">
                                    <Link 
                                        to={`/${post.postedBy?.username}`} 
                                        className="text-sm font-semibold hover:underline mr-2"
                                    >
                                        {post.postedBy?.username}
                                    </Link>
                                    <span className="text-sm whitespace-pre-line">{post.caption}</span>
                                </div>
                            </div>

                            {/* Comments */}
                            {post.comments?.map((c) => (
                                <div className="flex items-start space-x-1 mb-3" key={c._id}>
                                    <Link to={`/${c.user?.username}`}>
                                        <img 
                                            draggable="false" 
                                            className="w-9 h-9 rounded-full object-cover mr-2.5" 
                                            src={c.user?.avatar?.url} 
                                            alt="avatar" 
                                        />
                                    </Link>
                                    <div className="flex-1">
                                        <Link 
                                            to={`/${c.user?.username}`} 
                                            className="text-sm font-semibold hover:underline mr-2"
                                        >
                                            {c.user?.username}
                                        </Link>
                                        <span className="text-sm whitespace-pre-line">{c.comment}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions Section */}
                        <div className="border-t">
                            {/* Like, Comment, Share, Save icons */}
                            <div className="flex flex-col px-3 space-y-1 pb-2">
                                <div className="flex items-center justify-between py-2">
                                    <div className="flex space-x-4">
                                        <button onClick={handleLike}>
                                            {liked ? likeFill : likeIconOutline}
                                        </button>
                                        <button onClick={() => commentInput.current.focus()}>
                                            {commentIcon}
                                        </button>
                                        <button onClick={() => setShowShareModal(true)}>
                                            {shareIcon}
                                        </button>
                                    </div>
                                    <button onClick={handleSave}>
                                        {saved ? saveIconFill : saveIconOutline}
                                    </button>
                                </div>

                                {/* Likes count */}
                                <span className="w-full font-semibold text-sm">
                                    {post.likes?.length || 0} likes
                                </span>

                                {/* Time */}
                                <span className="text-xs text-gray-500">
                                    {moment(post.createdAt).fromNow()}
                                </span>
                            </div>

                            {/* Comment Input */}
                            <form 
                                onSubmit={handleComment} 
                                className="flex items-center justify-between p-3 w-full space-x-3 border-t relative"
                            >
                                <span 
                                    onClick={() => setShowEmojis(!showEmojis)} 
                                    className="cursor-pointer"
                                >
                                    {emojiIcon}
                                </span>

                                {showEmojis && (
                                    <div className="absolute bottom-12 -left-2">
                                        <Picker
                                            set="google"
                                            onSelect={(e) => setComment(comment + e.native)}
                                            title="Emojis"
                                        />
                                    </div>
                                )}

                                <input
                                    className="flex-auto text-sm outline-none border-none bg-transparent"
                                    type="text"
                                    value={comment}
                                    ref={commentInput}
                                    required
                                    onClick={() => setShowEmojis(false)}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add a comment..."
                                />
                                <button 
                                    type="submit" 
                                    className={`${comment.trim().length < 1 ? 'text-blue-300' : 'text-primary-blue'} text-sm font-semibold`} 
                                    disabled={comment.trim().length < 1}
                                >
                                    Post
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Post Modal */}
            <SharePostModal 
                open={showShareModal} 
                onClose={() => setShowShareModal(false)} 
                postId={post._id}
                socket={socket}
            />
        </>
    );
};

export default PostDetail;
