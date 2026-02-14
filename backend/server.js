const path = require("path");
const express = require("express");
const app = require("./app");
require("dotenv").config();
const connectDB = require("./utils/connectDB");
const PORT = process.env.PORT || 4000;
const multer = require("multer");
const cloudinary = require("cloudinary");

// Initialize database connection (for non-serverless environments)
connectDB().catch((error) => {
  console.error("Initial database connection error:", error);
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// deployment
__dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Server is Running! 🚀");
  });
}

const server = app.listen(PORT, () => {
  console.log(`Server Running on http://localhost:${PORT}`);
});

// ============= socket.io ==============

const io = require("socket.io")(server, {
  // pingTimeout: 60000,
  cors: {
    origin: ["http://localhost:3000", "https://socially4u.vercel.app"],
    credentials: true,
  },
});

let users = [];
let activeChats = {}; // Track which chat each user is currently viewing

const addUser = (userId, socketId) => {
  const existingUserIndex = users.findIndex((user) => user.userId === userId);
  if (existingUserIndex !== -1) {
    // Update socketId for existing user (handles reconnections)
    users[existingUserIndex].socketId = socketId;
  } else {
    users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  // Also remove from activeChats
  const user = users.find((u) => u.socketId === socketId);
  if (user) {
    delete activeChats[user.userId];
  }
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

// Check if a user is currently viewing a specific chat
const isUserInChat = (userId, chatId) => {
  return activeChats[userId] === chatId;
};

io.on("connection", (socket) => {
  console.log("🚀 Someone connected!");
  // console.log(users);

  // get userId and socketId from client
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  // User joins a chat (starts viewing it)
  socket.on("joinChat", ({ userId, chatId, otherUserId }) => {
    activeChats[userId] = chatId;
    // Notify the other user that this user is now viewing the chat (messages are being read)
    const otherUser = getUser(otherUserId);
    if (otherUser) {
      io.to(otherUser.socketId).emit("messagesRead", {
        chatId,
        readByUserId: userId
      });
    }
  });

  // User leaves a chat (navigates away)
  socket.on("leaveChat", ({ userId }) => {
    delete activeChats[userId];
  });

  // get and send message
  socket.on("sendMessage", ({ _id, senderId, receiverId, content, chatId, mediaUrl, sharedPost }) => {
    const receiver = getUser(receiverId);
    
    // Check if receiver is currently viewing this chat
    const isReceiverActive = isUserInChat(receiverId, chatId);

    io.to(receiver?.socketId).emit("getMessage", {
      _id,
      senderId,
      content,
      chatId,
      isReceiverActive, // Let receiver know if they should mark as read immediately
      mediaUrl,
      sharedPost,
    });

    // If receiver is active in this chat, notify sender that message was read instantly
    if (isReceiverActive && receiver) {
      const sender = getUser(senderId);
      if (sender) {
        io.to(sender.socketId).emit("messageReadInstantly", {
          chatId,
        });
      }
    }
  });

  // edit message - forward to receiver for real-time update
  socket.on("editMessage", ({ messageId, content, receiverId }) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit("messageEdited", {
        messageId,
        content,
      });
    }
  });

  // delete message - forward to receiver for real-time update
  socket.on("deleteMessage", ({ messageId, receiverId }) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit("messageDeleted", {
        messageId,
      });
    }
  });

  // react to message - forward to receiver for real-time update
  socket.on("reactToMessage", ({ messageId, emoji, userId, receiverId, chatId, reactions }) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit("messageReacted", {
        messageId,
        emoji,
        userId,
        chatId,
        reactions
      });
    }
  });

  // typing states
  socket.on("typing", ({ senderId, receiverId }) => {
    const user = getUser(receiverId);
    console.log(user);
    io.to(user?.socketId).emit("typing", senderId);
  });

  socket.on("typing stop", ({ senderId, receiverId }) => {
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("typing stop", senderId);
  });

  // user disconnected
  socket.on("disconnect", () => {
    console.log("⚠️ Someone disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
    // console.log(users);
  });
});
