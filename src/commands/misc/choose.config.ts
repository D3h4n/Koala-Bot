import {
   CommandInteraction,
   GuildMember,
   Message,
   MessageActionRow,
   MessageButton,
   MessageEmbed,
} from 'discord.js';
import config from '../../utils/config';
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

      // followup message with buttons
      let message = (await interaction.followUp({
         content: 'See options?',
         components: [
            new MessageActionRow().addComponents(
               new MessageButton()
                  .setCustomId('yes')
                  .setEmoji('✅')
                  .setStyle('SUCCESS'),
               new MessageButton()
                  .setCustomId('no')
                  .setEmoji('❌')
                  .setStyle('DANGER')
            ),
         ],
      })) as Message;

      let response: boolean = false;

      // create collector
      message
         .createMessageComponentCollector({
            filter: ({ user, customId }) =>
               ['yes', 'no'].includes(customId) &&
               user === interaction.user &&
               !user.bot,
            time: 5000,
            dispose: true,
         })
         .on('collect', ({ customId }) => {
            switch (customId) {
               case 'yes':
                  response = true;
                  message
                     .edit({
                        content: null,
                        embeds: [
                           new MessageEmbed({
                              title: 'Options',
                              color: config.mainColor,
                              author: {
                                 name: (interaction.member as GuildMember)
                                    ?.displayName,
                                 iconURL: interaction.user.displayAvatarURL(),
                              },
                              description: options.join('\n'),
                           }),
                        ],
                     })
                     .then((message) => message.edit({ components: [] }))
                     .catch(() => message.delete().catch(console.error));
                  break;

               case 'no':
                  response = true;
                  message.delete().catch(console.error);
                  break;

               default:
                  process.stderr.write(`Unhandled Case`);
                  process.exit(1);
            }
         })
         .on('end', () => {
            if (!response) {
               message.delete().catch(console.error);
            }
         });
   }
}
