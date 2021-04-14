import Discord from 'discord.js';
import Command from './common.commands.config';

// chat
import helloCommand from './chat/hello.config';
import insultCommand from './chat/insult.config';
import echoCommand from './chat/echo.config';

// misc
import coinFlipCommand from './misc/coinFlip.config';
import helpCommand from './misc/help.config';
import rngCommand from './misc/rng.config';

// search
import youtubeCommand from './search/youtube.config';

// music
import joinCommand from './music/join.config';
import leaveCommand from './music/leave.config';
import playCommand from './music/play.config';
import pauseCommand from './music/pause.config';
import skipCommand from './music/skip.config';
import queueCommand from './music/queue.config';
import stopCommand from './music/stop.config';
import volumeCommand from './music/volume.config';
import shuffleCommand from './music/shuffle.config';
import playSkipCommand from './music/playskip.config';
import PlayTopCommand from './music/playtop.config';
import repeatCommand from './music/repeat.config';
import loopCommand from './music/loop.config';
import timeoutCommand from './admin/timeout.config';
import chooseCommand from './misc/choose.config';
import teamsCommand from './misc/teams.config';

// create a map of commands
let commands = new Discord.Collection<string, Command>();

// add commands to map
// chat commands
commands
  .set('echo', new echoCommand())
  .set('hello', new helloCommand())
  .set('insult', new insultCommand())

  // misc commads
  .set('coinflip', new coinFlipCommand())
  .set('help', new helpCommand())
  .set('rng', new rngCommand())
  .set('choose', new chooseCommand())
  .set('teams', new teamsCommand())

  // music commands
  .set('join', new joinCommand())
  .set('leave', new leaveCommand())
  .set('pause', new pauseCommand())
  .set('play', new playCommand())
  .set('queue', new queueCommand())
  .set('shuffle', new shuffleCommand())
  .set('skip', new skipCommand())
  .set('stop', new stopCommand())
  .set('volume', new volumeCommand())
  .set('playskip', new playSkipCommand())
  .set('playtop', new PlayTopCommand())
  .set('repeat', new repeatCommand())
  .set('loop', new loopCommand())

  // search commands
  .set('youtube', new youtubeCommand())

  // admin
  .set('timeout', new timeoutCommand());
export default (() => commands)();
