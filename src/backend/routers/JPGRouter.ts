import { Hono } from 'hono';
import Middlewares from '../middlewares/middlewares.ts';
import { JPGConvertHandler } from '../controllers/JPGConvertHandler.ts';
import { JPGCompressHandler } from '../controllers/JPGCompressHandler.ts';

const app = new Hono();
const middlewares = new Middlewares();

app.use('/convert/png', middlewares.PNGHeaders);
app.use('/convert/webp', middlewares.WebPHeaders);
app.use('/compress', middlewares.JPGHeaders);

app.post('/convert/:format', JPGConvertHandler);
app.post('/compress', JPGCompressHandler);

export default app;
