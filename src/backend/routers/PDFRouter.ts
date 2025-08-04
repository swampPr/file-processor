import { Hono } from 'hono';
import Middlewares from '../middlewares/middlewares.ts';
import { PDFCompressHandler } from '../controllers/PDFCompressHandler.ts';

const app = new Hono();
const middlewares = new Middlewares();

app.use(middlewares.PDFGunzip);
app.use(middlewares.PDFGzipHeaders);

//INFO: Routes
app.post('/compress', PDFCompressHandler);

export default app;
