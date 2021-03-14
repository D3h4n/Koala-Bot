import { Message, GuildMember } from 'discord.js';
import Command from '../common.commands.config';

export default class timeoutCommand extends Command {
  constructor() {
    super('timeout', [
      'Put a user in timeout',
      'Usage: $timeout @<user> <time>',
      'Max timeout 120 seconds (2 minutes)',
    ]);
  }

  action(message: Message, args: string[]) {
    if (!this.validatePermissions(message)) {
      message.channel.send("`You're not cool enough`");
      return;
    }

    let id = args[1].match(/\d+/)?.[0];

    if (!id) {
      message.channel.send("`I don't know who that is homie`");
      return;
    }

    let memberToTimeout = message.guild?.members.resolve(id);

    if (!memberToTimeout) {
      message.channel.send("`I don't know who that is homie`");
      return;
    }

    if (memberToTimeout.hasPermission('ADMINISTRATOR')) {
      message.channel.send('`That user is too stronk`');
      return;
    }

    let timeout = (Number(args[2]) || 10) * 1000;

    if (timeout < 1000) {
      message.channel.send('`That time is too short`');
      return;
    }

    if (timeout > 120000) {
      message.channel.send('`That time is too large`');
      return;
    }

    if (!this.addTimeout(memberToTimeout, timeout)) {
      message.channel.send('`Some kinda error or something`');
      return;
    }

    message.channel.send(
      `Timedout ${memberToTimeout.toString()} for ${timeout / 1000} seconds`
    );
  }

  private validatePermissions(message: Message): Boolean {
    return message.member?.hasPermission('MANAGE_ROLES')!;
  }

  private async addTimeout(member: GuildMember, timeout: number) {
    let roles = [...member.roles.cache.values()].map((role) => role.id);

    try {
      await member.roles.remove(roles, "You've been a bad boy");
      await member.roles.add('416009802112696320');
    } catch (error) {
      console.error(error);
      return false;
    }

    setTimeout(async () => {
      try {
        await member.roles.remove('416009802112696320');
        await member.roles.add(roles!);
      } catch (error) {
        console.error(error);
      }
    }, timeout);

    return true;
  }
}
