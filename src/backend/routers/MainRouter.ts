import { Hono } from 'hono';
import Middlewares from '../middlewares/middlewares.ts';
import PDFRouter from './PDFRouter.ts';

const app = new Hono();
const middlewares = new Middlewares();

app.use(middlewares.ParseFile);

app.route('/pdf', PDFRouter);

export default app;
