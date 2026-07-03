import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './presentation/routes';
import { errorHandler } from './presentation/middlewares';
import { setupSwagger } from './presentation/swagger';
import { startCronJobs } from './infrastructure/cron/recurringExpensesJob';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

setupSwagger(app);
app.use('/api/v1', routes);
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  startCronJobs();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Swagger docs: http://localhost:${port}/api/docs`);
  });
}

export default app;
