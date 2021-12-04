import Command from '../../utils/common.commands.config';
import { CommandInteraction, GuildMember } from 'discord.js';
import { distube } from '../../index';
import { Song } from 'distube';

export default class playSkipCommand extends Command {
  constructor() {
    super(
      'playskip',
      'Immediately play a song'
    );

    this.addStringOption(option => (
      option.setName("query").setDescription("That song you want to play").setRequired(true)
    ))
  }

  async action(interaction: CommandInteraction) {
    interaction.deferReply();
    // get query
    let query = interaction.options.getString("query", true);

    // playskip query
    let queue = distube.getQueue(interaction);
    
    // check if there is a queue
    if (!queue) {
      let voiceChannel = (interaction.member as GuildMember)?.voice.channel;

      if (!voiceChannel) {
        interaction.editReply("Join a voice channel.");
      }

      distube.playVoiceChannel(voiceChannel!, query);
      interaction.deleteReply();
      return;
    }

    let song = new Song((await distube.search(query, { type: "video", limit: 1, safeSearch: true}))[0]);

    queue.addToQueue(song, 1).skip();
    interaction.deleteReply();
  }
}
