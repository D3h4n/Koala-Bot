import economyServices from '../commands/economy/economy.services';
import { MessageEmbed, TextChannel } from 'discord.js';
import { endLotto } from '../commands/economy/lotto.config';
import { client } from '../index';
import config from './config';

const checkLotto = async () => {
  console.log('[server] checking for end of lotto');
  const lotto = await economyServices.getLotto();

  const lottoChannel = client.channels.cache.get(
    '842552370960400415'
  ) as TextChannel;

  // check if latest lotto is done
  if (!lotto || lotto.done) {
    const endDate = new Date(
      (Math.floor(new Date().valueOf() / 8.64e7) + config.lottoLength) * 8.64e7
    );

    const newLotto = await economyServices.createLotto(endDate);

    const response = new MessageEmbed();

    response
      .setTitle('New Lotto')
      .setAuthor(client.user?.username, client.user?.displayAvatarURL())
      .setDescription([
        `**ID:** ${newLotto.id}`,
        `**End Date:** ${endDate.toDateString()}`,
      ]);

    lottoChannel.send(response);
    return;
  }

  // check if lotto should have ended
  const today = new Date();

  if (today.valueOf() > lotto.endDate.valueOf()) {
    endLotto(lotto);
    return;
  }

  const difTime = Math.round(
    (lotto.endDate.valueOf() - today.valueOf()) / 3.6e6
  );

  if (difTime <= 5) {
    const response = new MessageEmbed();

    response
      .setTitle(`\`Lotto ends in ${difTime} hours\``)
      .setDescription([
        `**ID:** ${lotto.id}`,
        `**End Date:** ${lotto.endDate.toDateString()}`,
        `**Entries:** ${lotto.guesses.length}`,
      ])
      .setAuthor(client.user?.username, client.user?.displayAvatarURL());

    lottoChannel.send(response);
  }
};

const events: Array<() => void> = [checkLotto];

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
