import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import { existsSync, mkdirSync } from 'fs';
import { createServer } from 'graphql-yoga';
import http from 'http';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import { Server } from 'socket.io';
import schema from './graphql/schema';

dotenv.config({
  path: './.env',
});

const app: Application = express();
const port = String(process.env.PORT);

export const prisma = new PrismaClient();

const fileStorage = multer.diskStorage({
  destination(_, __, callback) {
    const profilePath = path.resolve(__dirname, `../public/profile`);

    if (!existsSync(profilePath)) mkdirSync(profilePath);

    callback(null, profilePath);
  },
  filename(req, _, callback) {
    const { id } = req.headers;
    callback(null, `profile-${id}`);
  },
});

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(multer({ storage: fileStorage }).single('profile'));
app.use(express.static(path.join(__dirname, '../public/profile')));

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:4200'],
  },
});

io.on('connection', (socket) => {
  const graphqlServer = createServer({ schema, context: { socket } });
  app.use('/graphql', graphqlServer);
  console.log(`A connection with id ${socket.id} has been created`);

  socket.emit('connected', socket.id);

  socket.on('join-room', (data: any) => {
    socket.join(data);
  });
});

app.post('/upload_pfp', (req: Request, res: Response) => {
  const { file } = req;

  if (file) {
    res.status(200).json({ status: 'success', data: file.filename });
  } else {
    res.status(400).json({ status: 'failed', data: 'Failed to upload image' });
  }
});

httpServer.listen(port, () =>
  console.log(`Server is listening at port ${port}/graphql`)
);
