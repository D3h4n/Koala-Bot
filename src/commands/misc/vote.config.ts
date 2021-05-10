import { Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import config from '../../config';
import Command from '../common.commands.config';

export default class voteCommand extends Command {
  constructor() {
    super('vote', [
      'Put something up for vote',
      'Usage: $vote <timelimit [minutes]> <query>',
    ]);
  }

  async action(message: Message, args: string[]) {
    args.shift();

    const timeLimit = Number(args.shift()) * 60000; // time limit in milliseconds

    // check if timeLimit is a number
    if (Number.isNaN(timeLimit)) {
      message.channel.send('`Invalid time limit`');
      return;
    }

    // check if timeLimit is too small
    if (timeLimit < 30000) {
      message.channel.send('`Time limit cannot be less than 30 seconds`');
      return;
    }

    // check if timeLimit is too large
    if (timeLimit > 600000) {
      message.channel.send('`Timelimit cannot be more than 10 minutes`');
      return;
    }

    // check for remaining args
    if (!args.length) {
      message.channel.send('`No query`');
      return;
    }

    // generate query
    let query = args.reduce((prev, curr) => prev + ' ' + curr);

    // add question mark if there is none
    if (!query.endsWith('?')) {
      query += '?';
    }

    // get the displayName and AvatarURL of author
    const displayName = message.member?.displayName!;
    const displayAvatarURL = message.author.displayAvatarURL();

    // send initial message
    let sentMessage = await message.channel.send(
      this.generateMessage(query, displayName, displayAvatarURL)
    );

    // add reactions
    const yesReaction = await sentMessage.react('✔');
    const noReaction = await sentMessage.react('❌');

    // initialize counts and userMap
    let yesCount = 0;
    let noCount = 0;

    // filter for reaction collections
    const filter = (reaction: MessageReaction, user: User) =>
      ['✔', '❌'].includes(reaction.emoji.name) && !reaction.me && !user.bot;

    // create reaction collector
    const collector = sentMessage.createReactionCollector(filter, {
      time: timeLimit,
      dispose: true,
    });

    collector
      .on('collect', (reaction: MessageReaction, { id: userId }: User) => {
        const result = reaction.emoji.name === '✔';

        // remove user from opposite reaction if they reacted before
        (result ? noReaction : yesReaction).users.remove(userId);

        // update counts;
        yesCount += Number(result);
        noCount += Number(!result);
      })
      .on('remove', (reaction: MessageReaction) => {
        const result = reaction.emoji.name === '✔';

        // update counts
        yesCount = Math.max(0, yesCount - Number(result));
        noCount = Math.max(0, noCount - Number(!result));
      })
      .on('end', () => {
        // find final result
        let result = 'Tie';

        if (noCount < yesCount) {
          result = 'Yes';
        } else if (noCount > yesCount) {
          result = 'No';
        }

        // generate final message
        const response = this.generateMessage(
          query,
          displayName,
          displayAvatarURL
        );

        response.setDescription([
          `**${query}**`,
          `Yes: ${yesCount}`,
          `No: ${noCount}`,
          `\nResult: ${result}`,
        ]);

        // update message
        sentMessage.edit(response);

        // remove all reactions
        yesReaction.remove();
        noReaction.remove();
        sentMessage.reactions.removeAll();
      });
  }

  generateMessage(
    query: string,
    displayName: string,
    displayAvatarURL: string
  ) {
    const response = new MessageEmbed();

    response
      .setTitle('Vote')
      .setAuthor(displayName, displayAvatarURL)
      .setColor(config.mainColor)
      .setDescription(`**${query}**`);

    return response;
  }
}
