import { CommandInteraction, GuildMember, Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import config from '../../utils/config';
import Command from '../../utils/common.commands.config';

export default class voteCommand extends Command {
  static yesEmote = '✅';
  static noEmote = '❌';
  
  constructor() {
    super(
      'vote',
      'Put something up for vote',
    );

    this.addNumberOption(option=>(
      option.setName('timelimit').setDescription('Time limit of voting in minutes').setRequired(true)
    ));
      
      this.addStringOption(option=>
        option.setName('query').setDescription('The thing to vote on').setRequired(true)
    );
  }
      
  async action(interaction: CommandInteraction) {
    await interaction.deferReply();
    const timeLimit = interaction.options.getNumber('timelimit', true) * 60000; // time limit in milliseconds


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

    // get the displayName and AvatarURL of author
    const displayName = (interaction.member as GuildMember)?.displayName!;
    const displayAvatarURL = interaction.user.displayAvatarURL();


    // send initial message
    let sentMessage = await interaction.editReply({
      embeds: [
        new MessageEmbed({
          title: query,
          footer: {
            text: "✅ - yes   ❌- no"
          }
        })
      ]
    }) as Message;

    // add reactions
    await sentMessage.react(voteCommand.yesEmote);
    await sentMessage.react(voteCommand.noEmote);

    // create reaction collector
    sentMessage.awaitReactions({
      filter: (reaction: MessageReaction, user: User) => (
        [voteCommand.yesEmote, voteCommand.noEmote].includes(reaction.emoji.name!) &&
        !user.bot
      ),
      time: timeLimit,
      dispose: true
    })
    .then(reactions => {
      // initialize counts and userMap
      let yesCount = 0;
      let noCount = 0;
      
      reactions.forEach(reaction => {
        switch(reaction.emoji.name) {
          case voteCommand.yesEmote:
            yesCount++;
            break;
          
          case voteCommand.noEmote:
            noCount++;
            break;
        }
      })
      
      // generate final message
      const response = this.generateMessage( 
        query, displayName,
        displayAvatarURL,
        yesCount, noCount
      );

      // update message
      interaction.editReply({
        content: " ", 
        embeds: [response]
      });
    })
    .catch(() => interaction.editReply("`Whoops! Some kinda error happened.`"))
    .finally(() => sentMessage.reactions.removeAll())

  }

  generateMessage(
    query: string,
    displayName: string,
    displayAvatarURL: string,
    yesCount: number,
    noCount: number
  ) {
    const response = new MessageEmbed();

    let result: string;

    if (yesCount === noCount) {
      result = ":shrug_tone3:";
    }
    else if (yesCount > noCount) {
      result = voteCommand.yesEmote;
    }
    else {
      result = voteCommand.noEmote;
    }

    response
      .setTitle(query)
      .setAuthor(displayName, displayAvatarURL)
      .setColor(config.mainColor)
      .setDescription(`Yes: ${yesCount}\nNo: ${noCount}\n\nResult: ${result}`);

    return response;
  }
}
