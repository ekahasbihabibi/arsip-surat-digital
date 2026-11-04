import type { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'node:path';

export function mountFrontend(app: NestExpressApplication) {
    const publicPath = resolve(__dirname, '../public');
    const index = resolve(publicPath, 'index.html');
    app.useStaticAssets(publicPath, { index: false });
    const routes = [
        '/',
        '/surat',
        '/surat/:id',
        '/agenda/:id/kehadiran',
        '/agenda/:id/kehadiran/isi',
        '/agenda/:id/dokumen',
        '/agenda/:id/dokumen/kirim',
    ];
    for (const route of routes) {
        app.getHttpAdapter().get(route, (_request: unknown, response: { sendFile: (path: string) => void }) => {
            response.sendFile(index);
        });
    }
}
