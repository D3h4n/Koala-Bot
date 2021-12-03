import { CommandInteraction, GuildMember, Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import config from '../../utils/config';
import Command from '../../utils/common.commands.config';

export default class voteCommand extends Command {
  static yesEmote = '✔';
  static noEmote = '❌';
  
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
    interaction.reply("This command don't work " + '😔');
    return; //FIXME: Figure out what's wrong with reactions before letting this command run

    await interaction.deferReply();
    const timeLimit = interaction.options.getNumber('timelimit', true) * 60000; // time limit in milliseconds

    // check if timeLimit is a number
    if (Number.isNaN(timeLimit)) {
      interaction.editReply('`Invalid time limit`');
      return;
    }

    // check if timeLimit is too small
    if (timeLimit < 30000) {
      interaction.editReply('`Time limit cannot be less than 30 seconds`');
      return;
    }

    // check if timeLimit is too large
    if (timeLimit > 600000) {
      interaction.editReply('`Timelimit cannot be more than 10 minutes`');
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
    let sentMessage = await interaction.editReply(query) as Message;

    // add reactions
    await sentMessage.react(voteCommand.yesEmote);
    await sentMessage.react(voteCommand.noEmote);

    // initialize counts and userMap
    let yesCount = 0;
    let noCount = 0;

    // filter for reaction collections
    const filter = (reaction: MessageReaction, user: User) => (
      [voteCommand.yesEmote, voteCommand.noEmote].includes(reaction.emoji.name!) &&
      !reaction.me &&
      !user.bot
    )

    // create reaction collector
    const reactions = await sentMessage.awaitReactions({
      filter,
      time: timeLimit,
      dispose: true
    });

    reactions.each(reaction => {
      console.log(reaction);

      if (reaction.emoji.name === voteCommand.yesEmote) {
        yesCount = reaction.count;
      }
      else {
        noCount = reaction.count;
      }
    })

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
    interaction.editReply({
      content: " ", 
      embeds: [response]
    });

    // remove all reactions
    await sentMessage.reactions.removeAll();
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
