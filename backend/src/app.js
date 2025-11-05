import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import pino from 'pino';
import pinoHttp from 'pino-http';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middlewares/error-handler.js';
import { configureCors } from './config/cors.js';

const app = express();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  } : undefined
});

app.use(pinoHttp({ logger }));
app.use(morgan('tiny'));
app.use(helmet());
app.use(cors(configureCors()));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
