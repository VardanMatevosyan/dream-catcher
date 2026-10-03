import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import helmet from 'helmet'
import { initDatabase } from './config/database-init.js';
import dreamsRouter from './routes/dreams.js';
import pool from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();

/*
Challenge:
  1. Push this code to GitHub.
  hint.md for git command help.
*/

if (process.env.NODE_ENV === 'production'){
  app.use(helmet());
}

const PORT = process.env.PORT || 3001;
 
// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// API Routes
app.use('/api/dreams', dreamsRouter);

// health endpoint

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      db: 'connected',
      uptime: process.uptime()
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      db: 'disconnected',
      message: err.message,
      uptime: process.uptime()
    })
  }
})

process.on('SIGTERM', gracefulShutdown);

let server;
// Initialize database then start server
initDatabase().then(() => {
  server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
});


async function gracefulShutdown() {
  console.log('SIGTERM received, shutting down gracefully');
  // Close the server first (stop accepting new connections)
  server.close(() => {
    console.log('HTTP server closed');
  });
  // Then close database pool
  try {
    await pool.end();
    console.log('Database pool closed');
    process.exit(0)
  } catch (error) {
    console.error('Error closing database pool:', error);
    process.exit(1)
  }
}
