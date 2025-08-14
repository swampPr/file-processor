import { Hono } from 'hono';
import Middlewares from '../middlewares/middlewares.ts';
import { PDFCompressHandler } from '../controllers/PDFCompressHandler.ts';
import { PDFConvertHandler } from '../controllers/PDFConvertHandler.ts';

const app = new Hono();
const middlewares = new Middlewares();

app.use('/compress', middlewares.PDFHeaders);
app.use('/convert/png', middlewares.PNGHeaders);
app.use('/convert/jpeg', middlewares.JPGHeaders);

app.post('/compress', PDFCompressHandler);
app.post('/convert/:format', PDFConvertHandler);

export default app;
