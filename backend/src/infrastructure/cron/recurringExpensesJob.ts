import cron from 'node-cron';
import { container } from '../container';

export function startCronJobs() {
  cron.schedule('0 6 * * *', async () => {
    try {
      const result = await container.recurring.generate.execute(new Date());
      if (result.generated > 0) {
        console.log(`[cron] ${result.generated} despesa(s) recorrente(s) gerada(s)`);
      }
    } catch (error) {
      console.error('[cron] Erro ao gerar despesas recorrentes:', error);
    }
  });
}
