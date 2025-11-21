import { Chat } from "../model/Chat.js";

export default function socketConnection(io) {

  console.log("hello");
  
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log("User joined room:", roomId);
    });

    socket.on("send_message", async (data) => {
      try {
        const savedMsg = await Chat.create({
          senderId: data.senderId,
          receiverId: data.receiverId,
          productId: data.productId,
          message: data.message,
          roomId: data.roomId,
        });

        io.to(data.roomId).emit("receive_message", savedMsg);

      } catch (err) {
        console.error("❌ Error saving message:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });
}
