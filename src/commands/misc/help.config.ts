import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import config from "../../config";
import { client } from "../../index";
import { Command } from "../common.commands.config";
import commands from "../index.commands.setup";

export class helpCommand extends Command {
  commandList: string[];
  pageLength: number;
  numPages: number;

  constructor() {
    super("help", [
      "Get information about a command",
      "Usage: $help or $help <command>",
    ]);
    this.commandList = [];
    this.pageLength = config.helpPageLength;
  }

  async action(message: Message, args: string[]) {
    // get page number if args else set page number to 1
    let pageNumber = args.length < 2 ? 1 : parseInt(args[1]);

    // check that args[1] is number
    if (!isNaN(pageNumber)) {
      // send list of commands for pageNumber and get back message object
      let sentMsg = await message.channel.send(this.listCommands(pageNumber));

      // add reactions to control the page
      sentMsg
        .react("◀")
        .then(() => sentMsg.react("▶"))
        .catch(console.error);

      // filter for reactions
      const filter = (reaction: MessageReaction, user: User) => {
        return (
          ["◀", "▶"].includes(reaction.emoji.name) &&
          user.id !== client.user?.id &&
          !user.bot
        );
      };

      // collector which gets reactions within filter
      const collector = sentMsg.createReactionCollector(filter, {
        time: config.helpTimeLimit,
      });

      collector
        .on("collect", (reaction, user) => {
          // change page number every time a valid reaction is ran
          pageNumber = this.changePage(sentMsg, reaction, user, pageNumber);
        })
        .on("end", () => {
          sentMsg.reactions.removeAll();
        });

      return; // exit function
    }

    // args[1] was not a number
    // check if it was a command
    if (commands.has(args[1])) {
      // create a message embed with the help message of the command
      let helpMsg = new MessageEmbed({
        title: args[1],
        description: commands
          .get(args[1])!
          .help.reduce((res, msg) => res + "\n" + msg),
      });

      // send message and return
      message.channel.send(helpMsg);
      return;
    }

    // args[1] was not a page number or command
    // tell user that command was not found
    message.channel.send("`That command was not found`");
  }

  listCommands(pageNumber: number) {
    // check if commandList was already generated
    if (!this.commandList.length) {
      // push each command to the command list
      commands.forEach((command) => {
        this.commandList.push(
          `**${command.commandName}**\n` +
            command.help.reduce((res, msg) => res + "\n" + msg) +
            "\n"
        );
      });

      // sort the list by the name of each command
      this.commandList.sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });

      // set numPages
      this.numPages = Math.ceil(this.commandList.length / this.pageLength);
    }

    // get the index of the first command in the page
    let startIndex = (pageNumber - 1) * this.pageLength;

    if (startIndex >= this.commandList.length) {
      // if the start index too big,
      // set it to 0 and display the first page
      startIndex = 0;
      pageNumber = 1;
    }

    let description = this.commandList
      // get the commands that are on the page
      .slice(
        startIndex,
        Math.min(startIndex + this.pageLength, this.commandList.length)
      );

    // create the help message
    let response = new MessageEmbed();
    response
      .setColor(config.mainColor)
      .setTitle("Help")
      .setDescription(description)
      .setFooter("\u2800".repeat(30) + `Page: ${pageNumber}/${this.numPages}`);

    return response;
  }

  changePage(
    message: Message,
    reaction: MessageReaction,
    user: User,
    pageNumber: number
  ) {
    if (reaction.emoji.name === "◀" && pageNumber > 1) {
      // if back arrow generate previous page if there is one
      message.edit(this.listCommands(--pageNumber));
    } else if (reaction.emoji.name === "▶" && pageNumber < this.numPages) {
      // if forward arrow generate next page if there is one
      message.edit(this.listCommands(++pageNumber));
    }

    // remove user reactions
    reaction.users.remove(user.id);

    // return new pageNumber
    return pageNumber;
  }
}
