import Command from '../../utils/common.commands.config';
import { Song, SearchResult } from 'distube';
import { CommandInteraction, GuildMember } from 'discord.js';
import { distube } from '../../index';

export default class PlayTopCommand extends Command {
  constructor() {
    super(
      'playtop',
      'Add song to the top of the queue'
    );

    this.addStringOption(option => (
      option.setName("query").setDescription("Song to add").setRequired(true)
    ))
  }

  async action(interaction: CommandInteraction) {
    interaction.deferReply();
    // get query
    let query = interaction.options.getString("query", true);

    // assert query is not a playlist
    if (query.includes('https://youtube.com/playlist')) {
      interaction.editReply('`Use the play command for playlists`');
      return;
    }

    // get queue
    let queue = distube.getQueue(interaction);

    // if there is no queue play song regularly
    if (!queue?.songs?.length) {
      let voiceChannel = (interaction.member as GuildMember)?.voice.channel;

      if (!voiceChannel) {
        interaction.editReply("Join a voice channel.");
      }

      distube.playVoiceChannel(voiceChannel!, query);
      interaction.deleteReply();
      return; 
    }

    // if there is a queue

    // generate a search result based on query
    let result: SearchResult | Song;

    try {
      [result] = await distube.search(query);
    } catch (error) {
      interaction.reply('`Could not find that song`');
      console.error(error);
      return;
    }

    let song = new Song(result, interaction.member as GuildMember);

    // add song to the beginning of the queue
    queue.addToQueue(song, 1);

    // emit add song event
    distube.emit('addSong', queue, song);
  }
}
