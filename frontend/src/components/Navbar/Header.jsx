import React, { useEffect, useRef, useState } from "react";
import {
  exploreOutline,
  homeFill,
  homeOutline,
  likeOutline,
  messageFill,
  messageOutline,
  postUploadOutline,
} from "./SvgIcons";
import { Link, useLocation } from "react-router-dom";
import NewPost from "./NewPost";
import { useSelector, useDispatch } from "react-redux";
import SearchBox from "./SearchBar/SearchBox";
import { getAllChats } from "../../actions/chatAction";
import { INCREMENT_CHAT_UNREAD } from "../../constants/chatConstants";
import { SOCKET_ENDPOINT } from "../../utils/constants";
import { io } from "socket.io-client";

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { totalUnread } = useSelector((state) => state.allChats);
  const socket = useRef(null);

  const [newPost, setNewPost] = useState(false);

  const location = useLocation();
  const [onHome, setOnHome] = useState(false);
  const [onChat, setOnChat] = useState(false);

  useEffect(() => {
    setOnHome(location.pathname === "/");
    setOnChat(location.pathname.split("/").includes("direct"));
  }, [location]);

  // Fetch initial chat data to get unread counts
  useEffect(() => {
    if (user?._id) {
      dispatch(getAllChats());
    }
  }, [dispatch, user?._id]);

  // Setup global socket listener for incoming messages (when not on chat page)
  useEffect(() => {
    if (user?._id) {
      socket.current = io(SOCKET_ENDPOINT);
      socket.current.emit("addUser", user._id);

      socket.current.on("getMessage", (data) => {
        // Only show unread notification if not viewing that chat
        if (!onChat && data.chatId) {
          dispatch({
            type: INCREMENT_CHAT_UNREAD,
            payload: {
              chatId: data.chatId,
              latestMessage: {
                content: data.content,
                sender: data.senderId,
                createdAt: Date.now()
              }
            }
          });
        }
      });

      return () => {
        socket.current.disconnect();
      };
    }
  }, [user?._id, onChat, dispatch]);

  return (
    <nav className="fixed top-0 w-full border-b bg-white z-10">
      {/* <!-- navbar container --> */}
      <div className="flex flex-row justify-between items-center py-2 px-3.5 sm:w-full sm:py-2 sm:px-4 md:w-full md:py-2 md:px-6 xl:w-4/6 xl:py-3 xl:px-8 mx-auto">
        {/* <!-- logo --> */}
        <Link to="/">
          <img
            draggable="false"
            className="hidden sm:block mt-1.5 w-full h-full object-contain"
            src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
            alt=""
          />
        </Link>

        <SearchBox />

        {/* <!-- icons container  --> */}
        <div className="flex items-center space-x-6 sm:mr-5">
          <Link to="/">
            {onHome ? homeFill : homeOutline}
          </Link>

          <Link to="/direct/inbox" className="relative">
            {onChat ? messageFill : messageOutline}
            {totalUnread > 0 && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </Link>

          <div onClick={() => setNewPost(true)} className="cursor-pointer">
            {postUploadOutline}
          </div>

          <span className="hidden sm:block">{exploreOutline}</span>
          <span className="hidden sm:block">{likeOutline}</span>

          <Link
            to={`/${user.username}`}
            className={`${
              !onHome && !onChat && "border-black border"
            } rounded-full cursor-pointer h-7 w-7 p-[0.5px]`}
          >
            <img
              draggable="false"
              loading="lazy"
              className="w-full h-full rounded-full object-cover"
              src={user.avatar.url}
              alt=""
            />
          </Link>
        </div>

        <NewPost newPost={newPost} setNewPost={setNewPost} />
      </div>
    </nav>
  );
};

export default Header;
