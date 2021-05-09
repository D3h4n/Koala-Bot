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
      message.channel.send('Invalid time limit');
      return;
    }

    // check if timeLimit is too small
    if (timeLimit < 30000) {
      message.channel.send('Time limit cannot be less than 30 seconds');
      return;
    }

    // check if timeLimit is too large
    if (timeLimit > 600000) {
      message.channel.send('Timelimit cannot be more than 10 minutes');
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
    const sentMessage = await message.channel.send(
      this.generateMessage(query, displayName, displayAvatarURL, 0, 0)
    );

    // add reactions
    await sentMessage.react('👍');
    await sentMessage.react('👎');

    // initialize counts and userMap
    let yesCount = 0;
    let noCount = 0;
    const userMap = new Map<string, [boolean, boolean]>();

    // filter for reaction collections
    const filter = (reaction: MessageReaction, user: User) => {
      return (
        ['👍', '👎'].includes(reaction.emoji.name) && !reaction.me && !user.bot
      );
    };

    // create reaction collector
    const collector = sentMessage.createReactionCollector(filter, {
      time: timeLimit,
      dispose: true,
    });

    collector
      .on('collect', async (reaction: MessageReaction, user: User) => {
        // get userInfo from map
        const info = userMap.get(user.tag)!;

        // check if user has voted before
        if (!info) {
          const result = reaction.emoji.name === '👍'; // booleon of response

          userMap.set(user.tag, [result, false]); // add user record to map

          // update yes and no counts
          yesCount += Number(result);
          noCount += Number(!result);

          // edit message with new counts
          sentMessage.edit(
            this.generateMessage(
              query,
              displayName,
              displayAvatarURL,
              yesCount,
              noCount
            )
          );

          return;
        }

        // get the previous response
        const [prevRes] = info;

        // set the swap tag to true
        userMap.set(user.tag, [prevRes, true]);

        // update counts
        yesCount += Number(!prevRes);
        noCount += Number(prevRes);

        // remove previous reaction
        await sentMessage.reactions
          .resolve(prevRes ? '👍' : '👎')
          ?.users.remove(user.id);

        // edit message
        await sentMessage.edit(
          this.generateMessage(
            query,
            displayName,
            displayAvatarURL,
            yesCount,
            noCount
          )
        );
      })
      .on('remove', (_: MessageReaction, user: User) => {
        // get info on user
        const [prevRes, swap] = userMap.get(user.tag)!;

        // update counts
        yesCount -= Number(prevRes);
        noCount -= Number(!prevRes);

        // edit message with new count
        sentMessage.edit(
          this.generateMessage(
            query,
            displayName,
            displayAvatarURL,
            yesCount,
            noCount
          )
        );

        // update user info if swap else delete user
        if (swap) {
          userMap.set(user.tag, [!prevRes, false]);
        } else {
          userMap.delete(user.tag);
        }
      })
      .on('end', async () => {
        // remove all reactions
        await sentMessage.reactions.removeAll();

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
          displayAvatarURL,
          yesCount,
          noCount
        );

        response.setDescription([
          `**${query}**`,
          `Yes: ${yesCount}`,
          `No: ${noCount}`,
          `\nResult: ${result}`,
        ]);

        // update message
        sentMessage.edit(response);
      });
  }

  generateMessage(
    query: string,
    displayName: string,
    displayAvatarURL: string,
    yesCount: number,
    noCount: number
  ) {
    const response = new MessageEmbed();

    response
      .setTitle('Vote')
      .setAuthor(displayName, displayAvatarURL)
      .setColor(config.mainColor)
      .setDescription([`**${query}**`, `Yes: ${yesCount}`, `No: ${noCount}`]);

    return response;
  }
}
