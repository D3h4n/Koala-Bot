import { Message } from 'discord.js';
import config from '../../utils/config';
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

  action(message: Message, args: string[]) {
    if (!this.checkPermission(message)) {
      return message.channel.send('`You cannot use this command`');
    }

    if (config.runPostureChecks) {
      config.runPostureChecks = false;
      return message.channel.send('`Stopping posture checks`');
    }

    config.postureChannelId = message.channel.id;
    config.runPostureChecks = true;
    config.postureFrequency =
      Number(args[1]) * 3.6e5 || config.postureFrequency;
    return message.channel.send(
      `\`Running posture checks in this channel every ${args[1]} minutes\``
    );
  }
}
