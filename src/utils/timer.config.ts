import { dataBaseCleanup, postureCheck } from './helper_functions.config';
import lottoConfig from '../commands/economy/lotto.config';
import config from './config';

const events: Array<() => void> = [
   lottoConfig.checkLotto,
   dataBaseCleanup,
   postureCheck,
];

function eventLoop() {
   console.log('[server] executing event loop');
   events.forEach((event) => event());
}

export default function initEventLoop() {
   // find time to next hour
   const time = new Date().valueOf();

   const timeToHour =
      Math.ceil(time / config.eventLoopTimeDelay) * config.eventLoopTimeDelay -
      time;

   setTimeout(() => {
      eventLoop();

      setInterval(() => {
         eventLoop();
      }, config.eventLoopTimeDelay);
   }, timeToHour);
}
