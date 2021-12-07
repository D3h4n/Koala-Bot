import {
  CommandInteraction,
  GuildMember,
  Message,
  MessageEmbed,
  MessageReaction,
  User,
} from 'discord.js';
import Command from '../../utils/common.commands.config';

export default class chooseCommand extends Command {
  constructor() {
    super('choose', 'Let the bot decide your fate');

    this.addStringOption((option) =>
      option
        .setName('option1')
        .setDescription('The first option to choose from')
        .setRequired(true)
    );

    this.addStringOption((option) =>
      option
        .setName('option2')
        .setDescription('The second option to choose from')
        .setRequired(true)
    );

    this.addBooleanOption((option) =>
      option.setName('hidden').setDescription('Keep your secrets')
    );

    for (let i = 3; i <= 9; i++) {
      this.addStringOption((option) =>
        option
          .setName(`option${i}`)
          .setDescription('An option to choose from')
          .setRequired(false)
      );
    }
  }

  async action(interaction: CommandInteraction) {
    let hidden = interaction.options.getBoolean('hidden') || false;

    await interaction.deferReply({
      ephemeral: hidden,
    });

    // generate random result
    let options = interaction.options.data
      .filter((a) => a.type === 'STRING')
      .map((a) => a.value) as string[];

    const result = options[Math.floor(Math.random() * options.length)];

    await interaction.editReply('`' + result + '`');

    if (hidden) return;

    // TODO: Convert reactions to buttons
    let message = (await interaction.channel?.send('See options?')) as Message;

    try {
      await message.react('✅');
      await message.react('❌');
    } catch (error) {
      console.error(error);
    }

    message
      .awaitReactions({
        filter: (reaction: MessageReaction, user: User) =>
          ['✅', '❌'].includes(reaction.emoji.name!) &&
          user === interaction.user &&
          !user.bot,
        max: 1,
        time: 5000,
        dispose: true,
        errors: ['time'],
      })
      .then((reactions) => {
        let reaction = reactions.first()!;

        if (reaction.emoji.name !== '✅') throw 0; // throw anything to cause messsage deletion

        return message.edit({
          content: null,
          embeds: [
            new MessageEmbed({
              title: 'Options',
              author: {
                name: (interaction.member as GuildMember)?.displayName,
                iconURL: interaction.user.displayAvatarURL(),
              },
              description: options.join('\n'),
            }),
          ],
        });
      })
      .then((message) => message.reactions.removeAll())
      .catch(() => message.delete());
  }
}
