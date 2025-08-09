import { Hono } from 'hono';
import Middlewares from '../middlewares/middlewares.ts';
import { PDFCompressHandler } from '../controllers/PDFCompressHandler.ts';
import { convertToPNGHandler } from '../controllers/PDFToPNGHandler.ts';
import { convertToJPGHandler } from '../controllers/PDFToJPGHandler.ts';

const app = new Hono();
const middlewares = new Middlewares();

app.use(middlewares.FileUnzip);

app.use('/compress', middlewares.PDFGzipHeaders);
app.use('/png', middlewares.PNGHeaders);
app.use('/jpg', middlewares.JPGHeaders);

app.post('/compress', PDFCompressHandler);
app.post('/png', convertToPNGHandler);
app.post('/jpg', convertToJPGHandler);

export default app;
