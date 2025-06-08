import cron from 'node-cron';
import { fetchAllContests } from './utils/scrapAllcontests.js';

cron.schedule('0 */6 * * *', fetchAllContests);
