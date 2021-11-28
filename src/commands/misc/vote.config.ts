import { CommandInteraction, GuildMember, MessageEmbed, MessageReaction, TextChannel, User } from 'discord.js';
import config from '../../utils/config';
import Command from '../../common.commands.config';

export default class voteCommand extends Command {
  constructor() {
    super(
      'vote',
      'Put something up for vote',
    );

    this.addNumberOption(option=>(
      option.setName('timelimit').setDescription('Time limit of voting').setRequired(true)
    ));

    this.addStringOption(option=>
      option.setName('query').setDescription('The thing to vote on').setRequired(true)
    );
  }

  async action(interaction: CommandInteraction) {
    const yesEmote = '✔';
    const noEmote = '❌';

    const timeLimit = interaction.options.getNumber('timelimit', true) * 60000; // time limit in milliseconds

    // check if timeLimit is a number
    if (Number.isNaN(timeLimit)) {
      interaction.reply('`Invalid time limit`');
      return;
    }

    // check if timeLimit is too small
    if (timeLimit < 30000) {
      interaction.reply('`Time limit cannot be less than 30 seconds`');
      return;
    }

    // check if timeLimit is too large
    if (timeLimit > 600000) {
      interaction.reply('`Timelimit cannot be more than 10 minutes`');
      return;
    }

    // generate query
    let query = interaction.options.getString('query', true);

    // add question mark if there is none
    if (!query.endsWith('?')) {
      query += '?';
    }

    // get the displayName and AvatarURL of author
    const displayName = (interaction.member as GuildMember)?.displayName!;
    const displayAvatarURL = interaction.user.displayAvatarURL();

    // send initial message
    let sentMessage = await (interaction.channel as TextChannel).send(query);
    //   this.generateMessage(query, displayName, displayAvatarURL)
    // );

    // add reactions
    const yesReaction = await sentMessage.react(yesEmote);
    const noReaction = await sentMessage.react(noEmote);

    // initialize counts and userMap
    let yesCount = 0;
    let noCount = 0;

    // filter for reaction collections
    const filter = (reaction: MessageReaction, user: User) =>
      [yesEmote, noEmote].includes(reaction.emoji.name!) &&
      !reaction.me &&
      !user.bot;

    // create reaction collector
    const collector = sentMessage.createReactionCollector({
      filter,
      time: config.queueTimeLimit,
      dispose: true
    });

    collector
      .on('collect', (reaction: MessageReaction, { id }: User) => {
        const result = reaction.emoji.name === yesEmote;

        // remove user from opposite reaction if they reacted before
        const reactionUsers = (result ? noReaction : yesReaction).users;

        if (reactionUsers.cache.has(id)) {
          reactionUsers.remove(id);
        }

        // update counts;
        yesCount += Number(result);
        noCount += Number(!result);
      })
      .on('remove', (reaction: MessageReaction) => {
        const result = reaction.emoji.name === yesEmote;

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
        ].join('\n'));

        // update message
        //TODO: sentMessage.edit(response);

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
