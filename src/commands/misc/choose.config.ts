import { CommandInteraction, Message } from 'discord.js';
// import { CommandInteraction, Message, MessageReaction, User } from 'discord.js';
import Command from '../../utils/common.commands.config';

export default class chooseCommand extends Command {
  emotes = ['✔', '❌'];

  constructor() {
    super(
      'choose',
      'Let the bot decide your fate',
    );

    
    this.addStringOption(option =>(
      option.setName('option1').setDescription('The first option to choose from').setRequired(true)
      ));
      
    this.addStringOption(option => (
      option.setName('option2').setDescription('The second option to choose from').setRequired(true)
    ));
      
    this.addBooleanOption(option=>(
      option.setName('hidden').setDescription('Keep your secrets')
    ));

    for (let i = 3; i <= 9; i++) {
      this.addStringOption(option => (
        option.setName(`option${i}`).setDescription('An option to choose from').setRequired(false)
      ));
    }
  }

  async action(interaction: CommandInteraction) {
    await interaction.deferReply({
      ephemeral: interaction.options.getBoolean('hidden') || false
    });

    // generate random result
    let options = interaction.options.data.filter(a => a.type === "STRING").map(a => a.value) as string[];
    
    const result = options[Math.floor(Math.random() * options.length)];

    await interaction.editReply("`" + result + "`");

    return; //FIXME: wait til reactions work before remove this line
    let message = await interaction.followUp({
      content: 'See options?',
      ephemeral: interaction.options.getBoolean('hidden') || false
    }) as Message;

    this.emotes.forEach(async emote => {
      await message.react(emote);
    })


    const collector =  message.createReactionCollector({
      filter: () => true,
      // filter: (reaction: MessageReaction, user: User) => (
      //   this.emotes.includes(reaction.emoji.name!) &&
      //   user.id === interaction.user.id &&
      //   !reaction.me &&
      //   !user.bot
      // ),
      max: 1,
      time: 5000,
      dispose: true
    })

    collector.on('collect', async (reaction, user) => {
      if (reaction.emoji.name === this.emotes[0]) {
        await message.edit("Options: " + options.map(option => `"${option}"`).join(' '))
      }
      else {
        await message.delete();
      }

      collector.dispose(reaction, user);
    })

    collector.on('exit', () => {
      if (!message.deleted) {
        message.reactions.removeAll();
      }
    })
  }
}
