import { Socket } from 'socket.io';
import { v4 } from 'uuid';
import { prisma } from '../index';

class ChatAPI {
  // GET CHAT DATA
  async openChat(chatMeta: any) {
    const { combinedUserIds } = chatMeta;

    try {
      const response = await prisma.chat.findFirst({
        where: {
          combinedUserIds,
        },
      });

      if (!response) {
        return this.createChat(chatMeta);
      }

      return response;
    } catch (error) {
      console.log(error);
    }
  }

  // CREATE CHAT
  async createChat(chatMeta: any) {
    const { combinedUserIds, refereeId } = chatMeta;

    try {
      const response = await prisma.chat.create({
        data: {
          id: v4(),
          combinedUserIds,
          refereeId,
        },
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  }

  // CREATE CHAT DATA
  async createChatData(data: any, socket: Socket) {
    const date = new Date();
    const chatdate = `${date.getMonth()}, ${date.getDate()}, ${date.getFullYear()}`;

    try {
      const chatData = await prisma.chatdata.findFirst({
        where: {
          date: String(chatdate),
          chatId: data.chatId,
        },
      });

      if (chatData) {
        const ack = await this.createMessage(chatData, data);

        if (!ack) throw 'Failed to create message';

        socket.emit('update', 'new message');
        socket.to(data.combinedUserIds).emit('update', 'new message');

        return chatData;
      }

      const newChatData = await prisma.chatdata.create({
        data: {
          id: v4(),
          chatId: data.chatId,
          date: String(chatdate),
        },
      });

      this.createMessage(newChatData, data);

      socket.emit('update', 'new message');
      socket.broadcast.to(data.combinedUserIds).emit('update', 'new message');
      return chatData;
    } catch (error) {
      console.log(error);
    }
  }

  // GET CHAT DATA
  async getChatData(chatId: string) {
    try {
      const response = await prisma.chatdata.findMany({
        where: {
          chatId,
        },
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  }

  // CREATE CHAT MESSAGE
  async createMessage(chatdata: any, data: any) {
    try {
      const response = await prisma.messages.create({
        data: {
          id: v4(),
          chatDataId: chatdata.id,
          message: data.message,
          from: data.from,
          time: String(Date.now()),
        },
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  }

  // GET MESSAGE
  async getMessages(chatDataId: string) {
    try {
      const response = await prisma.messages.findMany({
        where: {
          chatDataId,
        },
        orderBy: {
          time: 'asc',
        },
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  }
}

export default new ChatAPI();
