import { Hono } from 'hono';
import Middlewares from '../middlewares/middlewares.ts';
import { PNGConvertHandler } from '../controllers/PNGConvertHandler.ts';
import { PNGCompressHandler } from '../controllers/PNGCompressHandler.ts';

const app = new Hono();
const middlewares = new Middlewares();

app.use(middlewares.FileUnzip);

app.use('/jpeg', middlewares.CheckForHeader('Accept'));
app.use('/webp', middlewares.CheckForHeader('Accept'));

app.use('/convert/jpeg', middlewares.JPGHeaders);
app.use('/convert/webp', middlewares.WebPHeaders);
app.use('/compress', middlewares.PNGHeaders);

app.post('/compress', PNGCompressHandler);
app.post('/convert/:format', PNGConvertHandler);

export default app;
