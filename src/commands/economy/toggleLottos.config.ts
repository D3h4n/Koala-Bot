import Command from '../common.commands.config';
import config from '../../utils/config';
import { Message } from 'discord.js';

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

  action(message: Message) {
    config.runLottos = !config.runLottos;

    if (config.runLottos) {
      message.channel.send('`Running Lottos`');
    } else {
      message.channel.send('`Stopped Lottos`');
    }
  }
}
