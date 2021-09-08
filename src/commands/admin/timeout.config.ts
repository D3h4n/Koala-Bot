import { Message, GuildMember } from 'discord.js';
import Command from '../common.commands.config';
import config from '../../utils/config';

export default class timeoutCommand extends Command {
  constructor() {
    super(
      'Timeout',
      'timeout',
      [
        'Put a user in timeout',
        'Usage: $timeout @<user> <minutes>',
        `Max timeout ${config.timeoutMaxLimit / 60000} minutes`,
      ],
      [],
      ['MANAGE_ROLES', 'KICK_MEMBERS']
    );
  }

  action(message: Message, args: string[]) {
    // get first mentioned member
    const memberToTimeout = message.mentions.members?.first();

    // check if the member exists
    if (!memberToTimeout) {
      return message.channel.send("`I don't know who that is homie`");
    }

    // check that the member can be timedout
    if (!memberToTimeout.manageable) {
      return message.channel.send('`That user is too stronk`');
    }

    // calculate timeout
    let timeout = (Number(args[2]) || 1) * 60000;

    // check if time is within range
    if (timeout < 1000) {
      return message.channel.send('`That time is too short`');
    }

    if (timeout > config.timeoutMaxLimit) {
      return message.channel.send('`That time is too large`');
    }

    // add timeout and handle errors
    if (!this.addTimeout(memberToTimeout, timeout)) {
      return message.channel.send('`Some kinda error or something`');
    }

    // send prompt after timeout
    return message.channel.send(
      `Timed out ${memberToTimeout.toString()} for ${timeout / 1000} seconds`
    );
  }

  private async addTimeout(member: GuildMember, timeout: number) {
    const timeoutID = '416009802112696320'; // ID for timeout role
    let roles = [...member.roles.cache.values()].map((role) => role.id); // get array of roles

    // remove roles and add timeout role
    try {
      await member.roles.remove(roles, "You've been a bad boy");
      await member.roles.add(timeoutID);

      // set timer to add roles and remove timeout role
      setTimeout(async () => {
        try {
          await member.roles.remove(timeoutID);
          await member.roles.add(roles);
        } catch (error) {
          console.error(error);
        }
      }, timeout);
    } catch (error) {
      console.error(error);
      return false;
    }

    return true;
  }
}
