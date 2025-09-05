import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    accountId?: string;
    regionCode?: 'us' | 'eu';
  }
}



