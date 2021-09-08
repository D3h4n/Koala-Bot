import { Message } from 'discord.js';
import guildServices from '../../services/guild.services';
import Command from '../common.commands.config';

export default class togglePostureCheckCommand extends Command {
  constructor() {
    super(
      'Toggle Posture Check',
      'toggleposturecheck',
      ['Toggle Posture checks', 'Usage:', '$tpc', '$tpc <frequency in hours>'],
      ['tpc'],
      ['MANAGE_CHANNELS']
    );
  }

  async action(message: Message, args: string[]) {
    if (!this.checkPermission(message)) {
      return message.channel.send('`You cannot use this command`');
    }

    const guildId = message.guild?.id;

    if (!guildId) {
      return console.error('`Guild not found`');
    }

    const guild = await guildServices.GetGuild(guildId);

    if (guild.runPostureCheck) {
      await guildServices.UpdateGuild({ guildId, runPostureCheck: false });
      return message.channel.send('`Stopping posture checks`');
    }

    if (args.length < 2) {
      message.channel.send('`Must include frequency`');
      return;
    }

    let postureCheckFrequency = Math.round(Number(args[1]) * 3.6e6);

    if (Number.isNaN(postureCheckFrequency)) {
      message.channel.send(`\`${args[1]} is not a valid number\``);
      return;
    }

    guildServices.UpdateGuild({
      guildId,
      postureCheckChannelId: message.channel.id,
      runPostureCheck: true,
      postureCheckFrequency,
    });

    return message.channel.send(
      `\`Running posture checks in this channel every ${args[1]} hours\``
    );
  }
}
