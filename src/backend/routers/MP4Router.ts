import { Hono } from 'hono';
import Middlewares from '../middlewares/middlewares.ts';
import { MP4ConverHandler } from '../controllers/MP4ConvertHandler.ts';
import { MP4CompressHandler } from '../controllers/MP4CompressHandler.ts';

const app = new Hono();
const middlewares = new Middlewares();

app.use('/convert/mp3', middlewares.MP3Headers);
app.use('/convert/webm', middlewares.WebMHeaders);
app.use('/convert/flac', middlewares.FLACHeaders);
app.use('/compress', middlewares.MP4Headers);

app.post('/convert/:format', MP4ConverHandler);
app.post('/compress', MP4CompressHandler);

export default app;
