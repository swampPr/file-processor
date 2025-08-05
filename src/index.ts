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

export default {
    port: 3000,
    fetch: app.fetch,
    maxRequestBodySize: 1024 * 1024 * 500, //INFO: Max size upload: 500mb
};
