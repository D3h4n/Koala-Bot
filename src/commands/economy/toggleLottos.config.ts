import Command from '../common.commands.config';
import config from '../../utils/config';
import { Message } from 'discord.js';

export default class toggleLottosCommand extends Command {
  constructor() {
    super('togglelottos', ['Turn lottos on and off', 'Usage: $togglelottos']);
  }

  action(message: Message) {
    if (!message.member?.hasPermission('ADMINISTRATOR')) {
      message.channel.send('`Only admins can toggle lottos for now`');
      return;
    }

    config.runLottos = !config.runLottos;

    if (config.runLottos) {
      message.channel.send('`Running Lottos`');
    } else {
      message.channel.send('`Stopped Lottos`');
    }
  }
}
