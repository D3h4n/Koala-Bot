import { CommandInteraction, GuildMember, TextChannel } from 'discord.js';
import Command from '../../utils/common.commands.config';
import { distube } from '../../index';

export default class PlayFromCommand extends Command {
   constructor() {
      super('playfrom', 'Play a song from a certain time');

      this.addStringOption((option) =>
         option
            .setName('song')
            .setDescription('The song you want to play')
            .setRequired(true)
      );

      this.addIntegerOption((option) =>
         option
            .setName('time')
            .setDescription('The time in minutes to set for the current track')
            .setRequired(true)
      );
   }

   async action(interaction: CommandInteraction): Promise<void> {
      await interaction.deferReply();

      const song = interaction.options.getString('song', true);
      const time = interaction.options.getInteger('time', true) * 60;

      if (!interaction.guildId) {
         interaction.reply('Error occurred performing this command');
         console.error('Error guild is falsy');
         return;
      }

      const voiceChannel = (interaction.member as GuildMember)?.voice.channel;

      if (!voiceChannel) {
         interaction.editReply('Join a voice channel.');
         return;
      }

      await distube
         .play(voiceChannel, song, {
            member: interaction.member as GuildMember,
            textChannel: interaction.channel as TextChannel,
         })
         .catch(console.error);

      distube.seek(interaction, time);

      interaction.deleteReply();
   }
}
