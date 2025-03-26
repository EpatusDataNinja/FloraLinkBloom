import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { markMessageAsRead } from '../services/messagesService.js';

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5000"],
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Authorization", "Content-Type"]
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    connectTimeout: 45000,
    path: '/socket.io/',
    serveClient: false,
    maxHttpBufferSize: 1e8
  });

  const onlineUsers = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      console.error('Socket authentication error:', err);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user.id);
    const userId = socket.user.id;
    
    try {
      if (onlineUsers.has(userId)) {
        const oldSocketId = onlineUsers.get(userId);
        const oldSocket = io.sockets.sockets.get(oldSocketId);
        if (oldSocket) {
          oldSocket.disconnect(true);
        }
      }

      socket.join(`user_${userId}`);
      onlineUsers.set(userId, socket.id);
      io.emit('userOnline', userId);

      // Add heartbeat handler
      socket.on('heartbeat', () => {
        socket.emit('heartbeat-ack');
      });

      socket.on('join', ({ userId }) => {
        console.log(`User ${userId} joining room`);
        socket.join(`user_${userId}`);
      });

      socket.on('sendMessage', async (data) => {
        try {
          console.log('Received message:', data);
          const receiverRoom = `user_${data.receiverId}`;
          
          socket.to(receiverRoom).emit('newMessage', data.message);
          
          // Emit chat history update to both users
          io.to(receiverRoom).emit('chatHistoryUpdate', { userId: data.receiverId });
          socket.emit('chatHistoryUpdate', { userId: socket.user.id });
          
          socket.emit('messageDelivered', { 
            messageId: data.message.id 
          });
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('messageError', { error: error.message });
        }
      });

      socket.on('sendMedia', async (data) => {
        try {
          console.log('Received media message:', data);
          const receiverRoom = `user_${data.receiverId}`;
          
          socket.to(receiverRoom).emit('newMedia', data.message);
          
          // Emit chat history update to both users
          io.to(receiverRoom).emit('chatHistoryUpdate', { userId: data.receiverId });
          socket.emit('chatHistoryUpdate', { userId: socket.user.id });
          
          socket.emit('mediaDelivered', { 
            messageId: data.message.id 
          });
        } catch (error) {
          console.error('Error sending media:', error);
          socket.emit('mediaError', { error: error.message });
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('User disconnected:', userId, 'Reason:', reason);
        onlineUsers.delete(userId);
        socket.leave(`user_${userId}`);
        io.emit('userOffline', userId);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      socket.on('typing', ({ receiverId }) => {
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
          io.to(receiverSocket).emit('typing', { senderId: socket.user.id });
        }
      });

      socket.on('messagesRead', async ({ messageIds, senderId }) => {
        try {
          await Promise.all(messageIds.map(id => 
            markMessageAsRead(id, socket.user.id)
          ));
          
          const senderSocket = onlineUsers.get(senderId);
          if (senderSocket) {
            io.to(senderSocket).emit('messagesRead', { messageIds });
          }
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      });
    } catch (error) {
      console.error('Error in socket connection setup:', error);
      socket.disconnect(true);
    }
  });

  return io;
};

export default setupSocket;