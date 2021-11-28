import { CommandInteraction, TextChannel } from 'discord.js';
import config from '../../utils/config';
import Command from '../../common.commands.config';
// import config from '../../utils/config';

export default class purgeCommand extends Command {
  constructor() {
    super(
      'purge',
      'Remove all messages from a chat',
      ['MANAGE_MESSAGES']
    );
    this.addStringOption(
      option => option
        .setName("channel")
        .setDescription("Name of this channel")
        .setRequired(true)
    );
  }

  async action(interaction: CommandInteraction) {
    const channelName = interaction.options.getString('channel');

    let channel = interaction.channel as TextChannel;

    if (channelName === channel.name) {
      let newChannel = await channel.clone();

      interaction.deleteReply();
      channel.delete("Purging");

      setTimeout((await newChannel.send('`New channel created`')).delete, config.msgTimeout);
    }
  }  
}
