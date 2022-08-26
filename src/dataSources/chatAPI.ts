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
        return await this.createChat(chatMeta);
      }

      return response;
    } catch (error) {
      throw error;
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
      throw error;
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

        socket.emit('update', {
          chat: await this.updateChat(data.combinedUserIds),
          lastMessage: await this.getLastMessages(data.combinedUserIds),
        });
        socket.to(data.combinedUserIds).emit('update', {
          chat: await this.updateChat(data.combinedUserIds),
          lastMessage: await this.getLastMessages(data.combinedUserIds),
        });

        return chatData;
      }

      const newChatData = await prisma.chatdata.create({
        data: {
          id: v4(),
          chatId: data.chatId,
          date: String(chatdate),
        },
      });

      const ack = await this.createMessage(newChatData, data);

      if (!ack) throw 'Failed to create message';

      socket.emit('update', {
        chat: await this.updateChat(data.combinedUserIds),
        lastMessage: await this.getLastMessages(data.combinedUserIds),
      });
      socket.to(data.combinedUserIds).emit('update', {
        chat: await this.updateChat(data.combinedUserIds),
        lastMessage: await this.getLastMessages(data.combinedUserIds),
      });

      return newChatData;
    } catch (error) {
      throw error;
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
      throw error;
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
          file: data.file,
          time: String(Date.now()),
        },
      });

      return response;
    } catch (error) {
      throw error;
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
      throw error;
    }
  }

  // GET LAST MESSAGE
  async getLastMessages(id: string) {
    try {
      const response = await prisma.chat.findFirst({
        where: {
          combinedUserIds: id,
        },
        include: {
          data: {
            include: {
              messages: {
                select: {
                  from: true,
                  time: true,
                  file: true,
                  message: true,
                },
                orderBy: {
                  time: 'desc',
                },
              },
            },
            orderBy: {
              date: 'desc',
            },
          },
        },
      });

      if (response) {
        const [target, ...rest] = response.data;
        const { messages } = target;
        const [targetMessage, ...restOfMessage] = messages;

        return targetMessage;
      }
    } catch (error) {
      throw error;
    }
  }

  // UPDATE CHAT
  async updateChat(combinedUserIds: string) {
    try {
      const response = await prisma.chat.findFirst({
        where: {
          combinedUserIds,
        },
        include: {
          data: {
            include: {
              messages: true,
            },
          },
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new ChatAPI();
