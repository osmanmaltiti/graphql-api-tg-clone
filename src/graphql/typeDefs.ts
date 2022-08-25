export const typeDefs = `
  type Query {
    getUsers: [User!]
    loginUser(data: LoginData!): User!
    user(id: ID!): User!
    getChat(id: ID!): Chat!
  }
  
  type Mutation {
    createUser(data: UserData!): User!
    openChat(data: ChatMeta!): Chat!
    createMessage(message: MessageData!): Chatdata!
  }

  type User {
    id: ID!
    fullname: String!
    number: Int!
    profile: String!
    password: String!
    chats: [Chat]
  }

  type Chat {
    id: ID!
    combinedUserIds: String!
    refereeId: String!
    data: [Chatdata]
    user: User
  }

  type Chatdata {
    id: ID!
    chatId: String!
    date: String!
    messages: [Messages]!
    chat: Chat
  }

  type Messages {
    id: ID!
    chatDataId: String!
    from: String!
    time: String!
    message: String!
    file: String!
    chatData: Chatdata
  }

  input UserData {
    fullname: String!
    number: Int!
    profile: String!
    password: String!
  }

  input LoginData {
    number: Int!
    password: String!
  }

  input ChatMeta {
    refereeId: String!
    combinedUserIds: String!
  }

  input MessageData {
    chatId: String!
    message: String!
    file: String!
    from: String!
    combinedUserIds: String!
  }
`;
