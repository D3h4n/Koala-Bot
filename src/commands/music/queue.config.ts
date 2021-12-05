import { Queue, Song } from 'distube';
import config from '../../utils/config';
import Command from '../../utils/common.commands.config';
import { CommandInteraction, Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import { client, distube } from '../../index';

export default class queueCommand extends Command {
  constructor() {
    super('queue', 'Display the song queue');

    this.addNumberOption(option => (
      option.setName("page").setDescription("The page you want to start on")
    ))
  }

  async action(interaction: CommandInteraction) {
    await interaction.deferReply();
    let queue = distube.getQueue(interaction);

    if (!queue?.songs.length) {
      // check that the queue has songs
      interaction.editReply('`The queue is empty`');
      return;
    }

    try {
      let numPages = Math.ceil(queue.songs.length / config.queuePageLength);
      let pageNumber = interaction.options.getNumber("page") || 1// set pageNumber

      pageNumber =
        pageNumber < 1 ? 1 : pageNumber > numPages ? numPages : pageNumber;

      // add interative reactions
      let sentMsg = await interaction.editReply({
        embeds: [this.generateResponse(queue, pageNumber)]
      }) as Message;

      return; // FIXME: figure out reactions
      sentMsg.react('◀')
        .then(() => sentMsg.react('▶'))
        .catch(console.error);

      // add reaction collector for message
      let collector = sentMsg.createReactionCollector({
        // filter reactions to ignore bot reactions and other reactions
        filter: (reaction: MessageReaction, user: User) =>
          ['◀', '▶'].includes(reaction.emoji.name!) &&
          user.id !== client.user?.id &&
          !user.bot,
          // set the time limit
          time: config.queueTimeLimit,
        }
      );

      collector
        .on('collect', (reaction, user) => {
          // run changePage function for every valid reaction
          pageNumber = this.changePage(sentMsg, user, reaction,  queue!, pageNumber)
        })
        // remove all reactions when timer runs out
        .on('end', () => sentMsg.reactions.removeAll());
    } catch (error) {
      console.error(error);
    }
  }

  generateResponse(queue: Queue, pageNumber: number): MessageEmbed {
    let songs = queue.songs; // list of songs
    let numPages = Math.ceil(songs.length / config.queuePageLength); // number of pages

    let nowPlaying = songs[0]; // get the currently playing song

    // set the display for the currently playing song
    let description = [
      `__Now Playing:__`,
      `[${nowPlaying.name}](${nowPlaying.url}) - ${nowPlaying.formattedDuration} - \`${nowPlaying.member?.displayName}\`\n`,
    ];

    if (songs.length > 1) {
      let startIndex = (pageNumber - 1) * config.queuePageLength; // starting index of songs on page
      if (startIndex > songs.length) {
        // set startIndex to 0 if page number is too large
        startIndex = 0;
      }

      let endIndex = Math.min(
        startIndex + config.queuePageLength,
        songs.length
      ); // last index of songs on page

      /*
       * Add the display for all the songs on the page
       */
      description.push('__Up Next:__');
      songs
        // gets the up next songs on the page. If startIndex is 0 start at 1 instead
        .slice(startIndex || 1, endIndex)
        // generate display for each song
        .forEach((song, idx) =>
          description.push(
            this.generateSongDescription(song, (startIndex || 1) + idx)
          )
        );
    }

    // set up the embedded message
    let response = new MessageEmbed();

    response
      .setTitle('Queue')
      .setColor(config.mainColor)
      .setThumbnail(nowPlaying.thumbnail!)
      .setFooter(
        `Page: ${pageNumber}/${numPages}` +
          '\u2800'.repeat(20) +
          `${songs.length} songs in Queue | Total Length: ${queue.formattedDuration}`
      )
      .setDescription(description.join("\n"));

    return response;
  }

  generateSongDescription (song: Song, index: number) {
    return `${index}. [${song.name}](${song.url}) - ${song.formattedDuration} - \`${song.member?.displayName}\``;
  }

  changePage(
    message: Message,
    user: User,
    reaction: MessageReaction,
    queue: Queue,
    pageNumber: number
  ) {
    let numPages = Math.ceil(queue.songs.length / config.queuePageLength);

    if (reaction.emoji.name === '◀' && pageNumber > 1) {
      // if back arrow generate previous page if there is one
      message.edit({
        embeds: [this.generateResponse(queue, --pageNumber)]
      });
    } else if (reaction.emoji.name === '▶' && pageNumber < numPages) {
      // if forward arrow generate next page if there is one
      message.edit({
        embeds: [this.generateResponse(queue, ++pageNumber)]
      });
    }

    // remove user reactions
    reaction.users.remove(user.id);

    // return new pageNumber
    return pageNumber;
  }
}
