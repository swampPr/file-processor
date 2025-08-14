import { mkdir, rmdir } from 'node:fs/promises';
import { gzip } from 'node-gzip';
import chalk from 'chalk';

export type SessionID = string;

export async function checkFormat(sessionPath: string, fileName: string, formatToCheck: string) {
    try {
        const proc = Bun.spawn(
            [
                'ffprobe',
                '-v',
                'error',
                '-select_streams',
                'v:0',
                '-show_entries',
                'format=format_name,stream=codec_name',
                '-of',
                'csv=p=0:s=,',
                fileName,
            ],
            {
                cwd: sessionPath,
                stdout: 'pipe',
            }
        );

        const procStdout: string = await proc.stdout.text();
        await proc.exited;

        return procStdout.includes(formatToCheck);
    } catch (err) {
        throw err;
    }
}

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
    } catch (err) {
        console.warn(chalk.rgb(255, 165, 0)(`Couldn't clean session ID: ${chalk.redBright(id)}`));
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
