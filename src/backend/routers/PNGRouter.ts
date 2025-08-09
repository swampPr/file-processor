import { Hono } from 'hono';
import Middlewares from '../middlewares/middlewares.ts';
import { PNGConvertHandler } from '../controllers/PNGConvertHandler.ts';

const app = new Hono();
const middlewares = new Middlewares();

app.use(middlewares.FileUnzip);

app.use('/jpeg', middlewares.CheckForHeader('Accept'));
app.use('/webp', middlewares.CheckForHeader('Accept'));
app.use('/jpeg', middlewares.JPGHeaders);
app.use('/webp', middlewares.WebPHeaders);

app.post('/jpeg', PNGConvertHandler);
app.post('/webp', PNGConvertHandler);

export default app;
