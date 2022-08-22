import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'graphql-yoga';
import http from 'http';
import morgan from 'morgan';
import { Server } from 'socket.io';
import schema from './graphql/schema';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './socket/types';

dotenv.config({
  path: './.env',
});

const app = express();
const port = String(process.env.PORT);

export const prisma = new PrismaClient();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

const httpServer = http.createServer(app);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:4200'],
  },
});

io.on('connection', (socket) => {
  const graphqlServer = createServer({ schema, context: { socket } });
  app.use('/graphql', graphqlServer);
  console.log(`A connection with id ${socket.id} has been created`);

  socket.on('join-room', (data: any) => {
    socket.join(data);
  });
});

httpServer.listen(port, () =>
  console.log(`Server is listening at port ${port}/graphql`)
);
