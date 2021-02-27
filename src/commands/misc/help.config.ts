import { Message, MessageEmbed } from "discord.js";
import { Command } from "../common.commands.config";
import commands from "../index.commands.setup";

export class helpCommand extends Command {
  commandList: Command[];
  pageLength: number;

  constructor(commandName: string, help: string[], pageLength: number) {
    super(commandName, help);

    this.pageLength = pageLength;
  }

  listCommands(pageNumber: number) {
    let description: string[];

    if (!this.commandList?.length) {
      this.commandList = [];

      commands.forEach((command) => {
        this.commandList.push(command);
      });

      this.commandList.sort((a, b) => {
        if (a.commandName < b.commandName) return -1;
        if (a.commandName > b.commandName) return 1;
        return 0;
      });
    }

    let numPages = Math.ceil(this.commandList.length / this.pageLength);
    let startIndex = (pageNumber - 1) * this.pageLength;

    if (startIndex > this.commandList.length) {
      startIndex = 0;
      pageNumber = 1;
    }

    description = this.commandList
      .map(
        (command) =>
          `**${command.commandName}**\n` +
          command.help.reduce((res, msg) => res + "\n" + msg) +
          "\n"
      )
      .slice(
        startIndex,
        Math.min(startIndex + this.pageLength, this.commandList.length)
      );

    let response = new MessageEmbed();
    response.title = `Commands`;
    response.setDescription(description);
    response.setFooter(
      `${pageNumber}/${numPages}` +
        (pageNumber < numPages
          ? `\t\t\t\t\t\t\t\tnext page $help ${pageNumber + 1}`
          : "")
    );

    return response;
  }

  action(message: Message, args: string[]) {
    let pageNumber = parseInt(args[1]);

    if (!isNaN(pageNumber) || args.length === 1) {
      message.channel.send(this.listCommands(pageNumber || 1));
      return;
    }

    if (commands.has(args[1])) {
      let helpMsg = new MessageEmbed({
        title: args[1],
        description: commands
          .get(args[1])!
          .help.reduce((res, msg) => res + "\n" + msg),
      });

      message.channel.send(helpMsg);
      return;
    }

    message.channel.send("That command was not found");
  }
}
