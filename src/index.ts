import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { logger } from 'hono/logger';
import MainRouter from './backend/routers/MainRouter.ts';

const app = new Hono();

app.use(logger());

//INFO: WEBSITE ASSETS AND PAGES
app.use('/icons/*', serveStatic({ root: './src/public/' }));
app.use('/pdf/compress/*', serveStatic({ root: './src/public/' }));
app.use('/utils/*', serveStatic({ root: './src/public/' }));
app.use('/pdf/convert/*', serveStatic({ root: './src/public/' }));
app.use('/png/compress/*', serveStatic({ root: './src/public/' }));
app.use('/png/convert/*', serveStatic({ root: './src/public/' }));
app.use('/jpeg/convert/*', serveStatic({ root: './src/public/' }));
app.use('/jpeg/compress/*', serveStatic({ root: './src/public/' }));
app.use('/webp/compress/*', serveStatic({ root: './src/public/' }));
app.use('/webp/convert/*', serveStatic({ root: './src/public/' }));
app.use('/mp4/convert/*', serveStatic({ root: './src/public/' }));
app.use('/mp4/compress/*', serveStatic({ root: './src/public/' }));
app.use('/shared/*', serveStatic({ root: './src/public' }));
app.use('/*', serveStatic({ root: './src/public/home/' }));

//INFO: API ROUTES
app.route('/api', MainRouter);

export default {
    port: 3000,
    fetch: app.fetch,
    maxRequestBodySize: 1024 * 1024 * 500, //INFO: Max size upload: 500mb
};
