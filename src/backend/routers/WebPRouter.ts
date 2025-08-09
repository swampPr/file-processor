import { Hono } from 'hono';
import Middlewares from '../middlewares/middlewares.ts';
import { WebPConvertHandler } from '../controllers/WebPConvertHandler.ts';
import { WEBPCompressHandler } from '../controllers/WebPCompressHandler.ts';

const app = new Hono();
const middlewares = new Middlewares();

app.use(middlewares.FileUnzip);
app.use('/png', middlewares.CheckForHeader('Accept'));
app.use('/jpeg', middlewares.CheckForHeader('Accept'));

app.use('/png', middlewares.PNGHeaders);
app.use('/jpeg', middlewares.JPGHeaders);
app.use('/compress', middlewares.WebPHeaders);

app.post('/jpeg', WebPConvertHandler);
app.post('/png', WebPConvertHandler);
app.post('/compress', WEBPCompressHandler);

export default app;
