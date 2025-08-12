import { Hono } from 'hono';
import Middlewares from '../middlewares/middlewares.ts';
import PDFRouter from './PDFRouter.ts';
import PNGRouter from './PNGRouter.ts';
import JPGRouter from './JPGRouter.ts';
import WebPRouter from './WebPRouter.ts';
import MP4Router from './MP4Router.ts';

const app = new Hono();
const middlewares = new Middlewares();

//TODO: Add a middleware that checks whether the file sent is a gzip if not then return status 400
app.use(middlewares.ParseFile);
app.use(middlewares.FileUnzip);

app.route('/pdf', PDFRouter);
app.route('/png', PNGRouter);
app.route('/jpeg', JPGRouter);
app.route('/webp', WebPRouter);
app.route('/mp4', MP4Router);

export default app;
