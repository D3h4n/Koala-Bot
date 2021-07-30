import Command from '../common.commands.config';
import config from '../../utils/config';
import { Message } from 'discord.js';
import economyServices from './economy.services';

export default class toggleLottosCommand extends Command {
  constructor() {
    super(
      'Toggle Lottos',
      'togglelottos',
      ['Turn lottos on and off', 'Usage: $togglelottos'],
      ['tlotto'],
      ['ADMINISTRATOR']
    );
  }

  async action(message: Message) {
    config.runLottos = !config.runLottos;

    if (config.runLottos) {
      config.lottoChannelId = message.channel.id;
      message.channel.send('`Running Lottos in this channel`');
    } else {
      const lotto = await economyServices.getLotto();

      if (lotto) {
        lotto.done = true;
        lotto.save();
      }

      message.channel.send('`Stopped Lottos`');
    }
  }
}
