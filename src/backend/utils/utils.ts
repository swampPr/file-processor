import { mkdir, rmdir } from 'node:fs/promises';
import { ungzip, gzip } from 'node-gzip';
import chalk from 'chalk';

export type SessionID = string;

export async function createSession(): Promise<SessionID> {
    try {
        const id: SessionID = crypto.randomUUID();

        await mkdir(`./src/backend/sessions/${id}`);

        return id;
    } catch (err) {
        throw err;
    }
}

export async function cleanSession(id: SessionID) {
    try {
        await rmdir(`./src/backend/sessions/${id}`, { recursive: true });

        return true;
    } catch (err) {
        throw err;
    }
}

export async function PDFGzip(file: Buffer) {
    try {
        const zipped: Buffer = await gzip(file);
        return zipped;
    } catch (err) {
        throw err;
    }
}

export class Logger {
    Error(err: unknown) {
        console.error(chalk.redBright(err));
    }

    Log(msg: string) {
        console.log(chalk.greenBright(msg));
    }

    Warn(msg: string) {
        console.warn(chalk.rgb(255, 165, 0)(msg));
    }
}
