import { PermissionString, Message } from 'discord.js';

export default abstract class Command {
  commandTitle: string;
  commandName: string;
  help: string[];
  aliases: string[];
  permissions: PermissionString[];

  constructor(
    commandTitle: string,
    commandName: string,
    help: string[],
    aliases?: string[],
    permissions?: PermissionString[]
  ) {
    this.commandTitle = commandTitle;
    this.commandName = commandName;
    this.help = help;
    this.aliases = aliases ?? [];
    this.permissions = permissions ?? [];
  }

  callCommand(message: Message, args: string[]): any {
    if (!this.checkPermission(message))
      return message.channel.send('`You do not have the correct permissions`');

    this.action(message, args);
  }

  abstract action(message: Message, args: string[]): void;

  checkPermission(message: Message): boolean {
    if (!this.permissions?.length) return true;

    for (let perm of this.permissions) {
      if (
        !message.member?.hasPermission(perm, {
          checkAdmin: true,
          checkOwner: true,
        })
      )
        return false;
    }

    return true;
  }
}
