import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function startServer() {
  try {
    const server = await createServer({
      configFile: path.resolve(__dirname, 'vite.config.ts'),
      root: __dirname,
      server: {
        port: 4001,
        strictPort: true,
      },
    });

    await server.listen();
    server.printUrls();

    // Handle server-specific errors
    server.middlewares.use((err, req, res, next) => {
      if (err) {
        console.error('Server Middleware Error:', err);
        next(err);
      } else {
        next();
      }
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down server...');
      await server.close();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
