import { Command } from "./common.commands.config";
import { helloCommand } from "./chat/hello.config";
import { coinFlipCommand } from "./misc/coinFlip.config";
import { insultCommand } from "./chat/insult.config";
import { echoCommand } from "./chat/echo.config";
import { helpCommand } from "./chat/help.config";
import { youtubeCommand } from "./search/youtube.config";
import { joinCommand } from "./music/join.config";
import { leaveCommand } from "./music/leave.config";
import { playCommand } from "./music/play.config";
import { pauseCommand } from "./music/pause.config";

// create a map of commands
let commands = new Map<string, Command>();

// add commands to map
// chat commands
commands.set("echo", new echoCommand("echo"));
commands.set("hello", new helloCommand("hello"));
commands.set("help", new helpCommand("help"));
commands.set("insult", new insultCommand("insult"));

// search commands
commands.set("youtube", new youtubeCommand("youtube"));

// music commands
commands.set("join", new joinCommand("join"));
commands.set("leave", new leaveCommand("leave"));
commands.set("pause", new pauseCommand("pause"));
commands.set("play", new playCommand("play"));

// misc commads
commands.set("coinflip", new coinFlipCommand("coinflip"));

export default () => commands;
