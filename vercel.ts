import { routes, type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  buildCommand: 'cd client && npm ci && npm run build',
  installCommand: 'echo "no root install"',
  outputDirectory: 'client/dist',
  cleanUrls: true,
  rewrites: [
    routes.rewrite('/(.*)', '/index.html'),
  ],
  headers: [
    routes.cacheControl('/assets/(.*)', {
      public: true,
      maxAge: '1 year',
      immutable: true,
    }),
  ],
};
