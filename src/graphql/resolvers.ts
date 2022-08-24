import ChatAPI from '../dataSources/chatAPI';
import UserAPI from '../dataSources/userAPI';
import { Pipe } from '../helpers/pipe';

export const resolvers = {
  Query: {
    getUsers: async (parent: any, args: any, ctx: any, info: any) => {
      return await UserAPI.getUsers();
    },
    loginUser: async (parent: any, args: any, ctx: any, info: any) => {
      return await UserAPI.loginUser(args.data);
    },
    user: async (parent: any, args: any, ctx: any, info: any) => {
      return await UserAPI.getUser(args.id);
    },
    getChat: async (parent: any, args: any, ctx: any, info: any) => {
      const data = {
        combinedUserIds: args.id,
      };
      const response = await ChatAPI.openChat(data);
      return response;
    },
  },
  Mutation: {
    createUser: async (parent: any, args: any, ctx: any, info: any) => {
      const data = Pipe(args.data);
      return await UserAPI.createUser(data);
    },
    openChat: async (parent: any, args: any, ctx: any, info: any) => {
      const data = Pipe(args.data);
      return await ChatAPI.openChat(data);
    },
    createMessage: async (parent: any, args: any, ctx: any, info: any) => {
      const { socket } = ctx;

      const data = Pipe(args.message);
      return await ChatAPI.createChatData(data, socket);
    },
  },
  Chat: {
    data: async (parent: any, args: any, ctx: any, info: any) => {
      return await ChatAPI.getChatData(parent.id);
    },
  },
  Chatdata: {
    messages: async (parent: any, args: any, ctx: any, info: any) => {
      return await ChatAPI.getMessages(parent.id);
    },
  },
};
