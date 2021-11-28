import { CommandInteraction } from 'discord.js';
import guildServices from '../../services/guild.services';
import Command from '../../common.commands.config';

export default class togglePostureCheckCommand extends Command {
  constructor() {
    super(
      'toggleposturecheck',
      'Toggle Posture checks',
      [
        {
          id: '829531557785894923',
          type: 'ROLE',
          permission: true
        }
      ]
    );

    this.addNumberOption(option=>(
      option.setName('frequency').setDescription('How often to run posture checks')
    ));

    this.addStringOption(option=>(
      option.setName('message').setDescription('The message to send for each posture check')
    ))
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

    // calculate posture frequency
    let frequency = interaction.options.getNumber('frequency');
    
    // assert valid posture frequency
    if (!frequency) {
      interaction.reply(`\`Please specify a valid frequency\``);
      return;
    }

    let postureCheckFrequency = Math.round(frequency * 3.6e6);


    // update guild with new info
    guildServices.UpdateGuild({
      guildId,
      postureCheckChannelId: interaction?.channel?.id,
      runPostureCheck: true,
      postureCheckFrequency,
      postureCheckMessage: interaction.options.getString('message'),
    });

    // send message
    interaction.reply(
      `\`Running posture checks in this channel every ${frequency} hours\``
    );
  }
}
