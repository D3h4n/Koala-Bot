import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { client } from "../../index";
import { Command } from "../common.commands.config";
import commands from "../index.commands.setup";

export class helpCommand extends Command {
  commandList: Command[];
  pageLength: number;
  numPages: number;

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

      this.numPages = Math.ceil(this.commandList.length / this.pageLength);
    }

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
    response
      .setTitle("Help")
      .setDescription(description)
      .setFooter("\u2800".repeat(30) + `${pageNumber}/${this.numPages}`);

    return response;
  }

  changePage(
    message: Message,
    reaction: MessageReaction,
    user: User,
    pageNumber: number
  ) {
    if (reaction.emoji.name === "◀" && pageNumber > 1) {
      message.edit(this.listCommands(--pageNumber));
    } else if (reaction.emoji.name === "▶" && pageNumber < this.numPages) {
      message.edit(this.listCommands(++pageNumber));
    }

    reaction.users.remove(user.id);

    return pageNumber;
  }

  async action(message: Message, args: string[]) {
    let pageNumber = args.length < 2 ? 1 : parseInt(args[1]);

    if (!isNaN(pageNumber)) {
      let sentMsg = await message.channel.send(this.listCommands(pageNumber));

      sentMsg
        .react("◀")
        .then(() => sentMsg.react("▶"))
        .catch(console.error);

      const filter = (reaction: MessageReaction, user: User) => {
        return (
          ["◀", "▶"].includes(reaction.emoji.name) &&
          user.id !== client.user?.id
        );
      };

      const collector = sentMsg.createReactionCollector(filter, {
        time: 20000,
      });

      collector.on("collect", (reaction, user) => {
        pageNumber = this.changePage(sentMsg, reaction, user, pageNumber);
      });

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

    message.channel.send("`That command was not found`");
  }
}
