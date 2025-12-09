import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

class SocketService {
  private socket: Socket | null = null;

  async connect(): Promise<Socket> {
    const token = await AsyncStorage.getItem("token");

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.log("Socket connection error:", error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Join a chat room
  joinRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit("join-room", roomId);
    }
  }

  // Leave a chat room
  leaveRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit("leave-room", roomId);
    }
  }

  // Send a message
  sendMessage(data: {
    roomId: string;
    message: string;
    senderId: string;
  }): void {
    if (this.socket) {
      this.socket.emit("send-message", data);
    }
  }

  // Listen for new messages
  onNewMessage(callback: (message: any) => void): void {
    if (this.socket) {
      this.socket.on("new-message", callback);
    }
  }

  // Listen for typing status
  onTyping(
    callback: (data: { userId: string; isTyping: boolean }) => void
  ): void {
    if (this.socket) {
      this.socket.on("typing", callback);
    }
  }

  // Emit typing status
  emitTyping(roomId: string, isTyping: boolean): void {
    if (this.socket) {
      this.socket.emit("typing", { roomId, isTyping });
    }
  }
}

export default new SocketService();
