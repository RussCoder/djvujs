import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';
import serveStatic from 'serve-static';
import { create as createContentDisposition } from 'content-disposition-header';
import URL from 'url';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
    plugins: [react({
        babel: {
            plugins: ['babel-plugin-styled-components'],
        }
    }), {
        name: 'custom-middlewares',
        configureServer(server) {
            server.middlewares.use('/djvufile',
                (req, res, next) => {
                    const query = URL.parse(req.url, true).query;
                    const contentDispositionType = query.cd || 'inline';
                    let filename = query.fname || 'TheMap.djvu';
                    const cdHeader = createContentDisposition(filename, { type: contentDispositionType });
                    res.setHeader('Content-Disposition', cdHeader);

                    fs.createReadStream('../library/assets/carte.djvu').pipe(res);
                }
            );

            server.middlewares.use(serveStatic('../library/assets'));
        },
    }],
    build: {
        rollupOptions: {
            output: {
                entryFileNames: 'djvu_viewer.js',
            }
        }
    },
}));
