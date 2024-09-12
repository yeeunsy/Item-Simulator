import express from 'express';
import cookieParser from 'cookie-parser';
import LogMiddleware from './middlewares/log.middleware.js';
import UsersRouter from './routes/users.router.js';
import CharacterRouter from './routes/character.router.js';
import ItemRouter from './routes/item.router.js';
import ErrorHandlingMiddleware from './middlewares/error-handling.middleware.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3019;

app.use(LogMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use('/api', [UsersRouter, CharacterRouter, ItemRouter]);
app.use(ErrorHandlingMiddleware);

app.listen(PORT, () => {
    console.log(PORT, '포트 서버가 열렸어요!!');
});