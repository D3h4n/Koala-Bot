import { CommandInteraction } from 'discord.js';
import { distube } from '../../index';
import Command from '../../utils/common.commands.config';

export default class loopCommand extends Command {
  constructor() {
    super(
      'loop',
      'Loop the entire queue or stop looping',
    );
  }

  action(interaction: CommandInteraction) {
    const queue = distube.getQueue(interaction);

    // check if queue is playing
    if (!queue?.playing) {
      return interaction.reply('`Error looping queue`');
    }

    // if queue is looping, stop looping queue
    if (queue.repeatMode === 2) {
      distube.setRepeatMode(interaction, 0);

      return interaction.reply(`\`Stopped looping queue\``);
    }

    // if queue is not looping, start looping queue
    distube.setRepeatMode(interaction, 2);

    return interaction.reply(`\`Started looping queue\``);
  }
}
