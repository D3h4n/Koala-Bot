import { CommandInteraction } from 'discord.js';
import guildServices from '../../services/guild.services';
import Command from '../../common.commands.config';

export default class togglePostureCheckCommand extends Command {
  constructor() {
    super(
      'toggleposturecheck',
      'Toggle Posture checks',
      ['MANAGE_CHANNELS']
    );
  }

  async action(interaction: CommandInteraction) {
    // get the guild id
    const guildId = interaction.guild?.id;

    // assert guildId
    if (!guildId) {
      return interaction.reply('`Error finding guild`');
    }

    // get guild record
    const guild = await guildServices.GetGuild(guildId);

    // if posture checks are running turn them off
    // and send message
    if (guild.runPostureCheck) {
      await guildServices.UpdateGuild({ guildId, runPostureCheck: false });
      interaction.reply('`Stopping posture checks`');
      return; 
    }

    // if posture checks are not running
    const args = interaction.options.data;

    // calculate posture frequency
    let postureCheckFrequency = Math.round(Number(args[1]) * 3.6e6);

    // assert valid posture frequency
    if (Number.isNaN(postureCheckFrequency)) {
      interaction.reply(`\`${args[1].value} is not a valid number\``);
      return;
    }

    // update guild with new info
    guildServices.UpdateGuild({
      guildId,
      postureCheckChannelId: interaction?.channel?.id,
      runPostureCheck: true,
      postureCheckFrequency,
      postureCheckMessage: args[2].value as string | undefined,
    });

    // send message
    interaction.reply(
      `\`Running posture checks in this channel every ${args[1]} hours\``
    );
  }
}
