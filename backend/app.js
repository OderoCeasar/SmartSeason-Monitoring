const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const fieldRoutes = require('./routes/fields');
const updateRoutes = require('./routes/updates');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    message: 'SmartSeason backend is healthy',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api', updateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND',
  });
});

app.use((err, _req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message =
    statusCode >= 500 ? 'An unexpected error occurred' : err.message || 'Request failed';

  const payload = {
    error: true,
    message,
    code,
  };

  if (Array.isArray(err.details) && err.details.length > 0) {
    payload.details = err.details;
  }

  res.status(statusCode).json(payload);
});

module.exports = app;
