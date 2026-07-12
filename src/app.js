import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './auth/auth.routes.js';
import vehiclesRoutes from './vehicles/vehicles.routes.js';
import driversRoutes from './drivers/drivers.routes.js';
import tripsRoutes from './trips/trips.routes.js';
import maintenanceRoutes from './maintenance/maintenance.routes.js';
import fuelRoutes from './fuel/fuel.routes.js';
import expenseRoutes from './expenses/expenses.routes.js';
import dashboardRoutes from './dashboard/dashboard.routes.js';
import reportsRoutes from './reports/reports.routes.js';
import { ApiError } from './shared/errors/apiError.js';

const app = express();

// Security HTTP headers protection
app.use(helmet());

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: '*', // Customize this domain list in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Morgan HTTP request logs format
const morganFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express global rate limiting to mitigate DDoS/brute-force attacks
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: {
    success: false,
    message: 'Too many requests originating from this IP address. Please wait and try again.',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/auth/login', limiter); // Specifically target authentication path for rate limiting

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TransitOps Backend is running",
    version: "1.0.0"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK"
  });
});

// Mount modular sub-routers
app.use('/auth', authRoutes);
app.use('/vehicles', vehiclesRoutes);
app.use('/drivers', driversRoutes);
app.use('/api/v1/trips', tripsRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/fuel', fuelRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', reportsRoutes);

// Catch all unmatched routes and trigger 404 ApiError
app.use((req, res, next) => {
  next(ApiError.notFound(`Requested resource route not found: ${req.method} ${req.originalUrl}`));
});

// Plug in standard global error response interceptor
app.use(errorHandler);

export default app;
