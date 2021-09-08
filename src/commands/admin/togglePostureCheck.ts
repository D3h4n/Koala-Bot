import { Message } from 'discord.js';
import guildServices from '../../services/guild.services';
import Command from '../common.commands.config';

export default class togglePostureCheckCommand extends Command {
  constructor() {
    super(
      'Toggle Posture Check',
      'toggleposturecheck',
      [
        'Toggle Posture checks',
        'Usage:',
        '$toggleposturecheck <frequency in hours>',
        '$toggleposturecheck <frequency in hours> <posture check message>',
      ],
      ['tpc'],
      ['MANAGE_CHANNELS']
    );
  }

  async action(message: Message, args: string[]) {
    // get the guild id
    const guildId = message.guild?.id;

    // assert guildId
    if (!guildId) {
      return message.channel.send('`Error finding guild`');
    }

    // get guild record
    const guild = await guildServices.GetGuild(guildId);

    // if posture checks are running turn them off
    // and send message
    if (guild.runPostureCheck) {
      await guildServices.UpdateGuild({ guildId, runPostureCheck: false });
      return message.channel.send('`Stopping posture checks`');
    }

    // if posture checks are not running

    // check for arguments
    if (args.length < 2) {
      message.channel.send('`Must include frequency`');
      return;
    }

    // calculate posture frequency
    let postureCheckFrequency = Math.round(Number(args[1]) * 3.6e6);

    // assert valid posture frequency
    if (Number.isNaN(postureCheckFrequency)) {
      message.channel.send(`\`${args[1]} is not a valid number\``);
      return;
    }

    // update guild with new info
    guildServices.UpdateGuild({
      guildId,
      postureCheckChannelId: message.channel.id,
      runPostureCheck: true,
      postureCheckFrequency,
      postureCheckMessage: args[2],
    });

    // send message
    return message.channel.send(
      `\`Running posture checks in this channel every ${args[1]} hours\``
    );
  }
}
