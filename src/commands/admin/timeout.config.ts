import { Message, GuildMember } from 'discord.js';
import Command from '../common.commands.config';
import config from '../../config';

export default class timeoutCommand extends Command {
  constructor() {
    super('timeout', [
      'Put a user in timeout',
      'Usage: $timeout @<user> <minutes>',
      `Max timeout ${config.timeoutMaxLimit / 60000} minutes`,
    ]);
  }

  action(message: Message, args: string[]) {
    // check if user had valid roles
    if (!message.member?.hasPermission('MANAGE_ROLES')) {
      message.channel.send("`You're not cool enough`");
      return;
    }

    // get the user ID
    let id = args[1].match(/\d+/)?.[0];

    // check if the ID is in the message
    if (!id) {
      message.channel.send("`I don't know who that is homie`");
      return;
    }

    // get the member based on the ID
    const memberToTimeout = message.guild?.members.resolve(id);

    // check if the member exists
    if (!memberToTimeout) {
      message.channel.send("`I don't know who that is homie`");
      return;
    }

    // check that the member isn't an administrator
    if (memberToTimeout.hasPermission('ADMINISTRATOR')) {
      message.channel.send('`That user is too stronk`');
      return;
    }

    // calculate timeout
    let timeout = (Number(args[2]) || 1) * 60000;

    // check if time is within range
    if (timeout < 1000) {
      message.channel.send('`That time is too short`');
      return;
    }

    if (timeout > config.timeoutMaxLimit) {
      message.channel.send('`That time is too large`');
      return;
    }

    // add timeout and handle errors
    if (!this.addTimeout(memberToTimeout, timeout)) {
      message.channel.send('`Some kinda error or something`');
      return;
    }

    // send prompt after timeout
    message.channel.send(
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
    } catch (error) {
      console.error(error);
      return false;
    }

    // set timer to add roles and remove timeout role
    setTimeout(async () => {
      try {
        await member.roles.remove(timeoutID);
        await member.roles.add(roles!);
      } catch (error) {
        console.error(error);
      }
    }, timeout);

    return true;
  }
}