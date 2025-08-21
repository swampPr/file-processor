import { Hono } from 'hono';
import Middlewares from '../middlewares/middlewares.ts';
import { PDFCompressHandler } from '../controllers/PDFCompressHandler.ts';
import { PDFConvertHandler } from '../controllers/PDFConvertHandler.ts';
import { PDFSplitHandler } from '../controllers/PDFSplitHandler.ts';

const app = new Hono();
const middlewares = new Middlewares();

app.use('/compress', middlewares.PDFHeaders);
app.use('/convert/png', middlewares.PNGHeaders);
app.use('/convert/jpeg', middlewares.JPGHeaders);
app.use('/split', middlewares.ZipHeaders);

app.post('/compress', PDFCompressHandler);
app.post('/convert/:format', PDFConvertHandler);
app.post('/split', PDFSplitHandler);

export default app;
