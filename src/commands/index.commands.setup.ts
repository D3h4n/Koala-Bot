import { Command } from "./common.commands.config";
import { helloCommand } from "./hello.config";
import { coinFlipCommand } from "./coinFlip.config";
import { insultCommand } from "./insult.config";
import { echoCommand } from "./echo.config";
import { helpCommand } from "./help.config";
import { youtubeCommand } from "./youtube.config";
import { joinCommand } from "./join.config";
import { leaveCommand } from "./leave.config";
import { playCommand } from "./play.config";

// create a map of commands
let commands = new Map<string, Command>();

// add commands to map
commands.set("coinflip", new coinFlipCommand("coinflip"));
commands.set("echo", new echoCommand("echo"));
commands.set("hello", new helloCommand("hello"));
commands.set("help", new helpCommand("help"));
commands.set("insult", new insultCommand("insult"));
commands.set("join", new joinCommand("join"));
commands.set("leave", new leaveCommand("leave"));
commands.set("play", new playCommand("play"));
commands.set("youtube", new youtubeCommand("youtube"));

export default () => commands;
