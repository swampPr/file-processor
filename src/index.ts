import { Hono } from 'hono';
import { logger } from 'hono/logger';
import MainRouter from './backend/routers/MainRouter.ts';

const app = new Hono();

app.use(logger());

app.get('/', (c) => {
    return c.text('Hello Hono!');
});

//INFO: API ROUTES
app.route('/api', MainRouter);

export default app;
