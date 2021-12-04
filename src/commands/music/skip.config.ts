import Command from '../../utils/common.commands.config';
import { CommandInteraction } from 'discord.js';
import { distube } from '../../index';

export default class skipCommand extends Command {
  constructor() {
    super('skip', 'Skip the current song');
  }

  action(interaction: CommandInteraction) {
    try {
      let queue = distube.getQueue(interaction);
      
      if (queue && queue.songs.length > 1) {
        queue.skip();
      }
      else {
        queue?.stop();
      }

      interaction.reply('`Skipped song`');
    } catch (error) {
      interaction.reply('`Unable to skip song`');
      return;
    }
  }
}
