import { mkdir, rmdir } from 'node:fs/promises';

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
        await rmdir(`./src/backend/sessions/${id}`);

        return true;
    } catch (err) {
        throw err;
    }
}

export async function PDFGzip(file: Uint8Array) {
    const compressed = Bun.gunzipSync(file);
    return compressed;
}
