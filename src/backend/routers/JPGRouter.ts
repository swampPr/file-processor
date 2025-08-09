import { Hono } from 'hono';
import Middlewares from '../middlewares/middlewares.ts';
import { JPGConvertHandler } from '../controllers/JPGConvertHandler.ts';
import { JPGCompressHandler } from '../controllers/JPGCompressHandler.ts';

const app = new Hono();
const middlewares = new Middlewares();

app.use(middlewares.FileUnzip);

app.use('/png', middlewares.CheckForHeader('Accept'));
app.use('/webp', middlewares.CheckForHeader('Accept'));
app.use('/png', middlewares.PNGHeaders);
app.use('/webp', middlewares.WebPHeaders);
app.use('/compress', middlewares.JPGHeaders);

app.post('/png', JPGConvertHandler);
app.post('/webp', JPGConvertHandler);
app.post('/compress', JPGCompressHandler);

export default app;
