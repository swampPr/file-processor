import { Hono } from 'hono';
import Middlewares from '../middlewares/middlewares.ts';
import { PDFCompressHandler } from '../controllers/PDFCompressHandler.ts';
import { convertToPNGHandler } from '../controllers/PDFToPNGHandler.ts';
import { convertToJPGHandler } from '../controllers/PDFToJPGHandler.ts';

const app = new Hono();
const middlewares = new Middlewares();

app.use(middlewares.PDFGunzip);
app.use(middlewares.PDFGzipHeaders);

//INFO: Routes
app.post('/compress', PDFCompressHandler);
app.post('/png', convertToPNGHandler);
app.post('/jpg', convertToJPGHandler);

export default app;
