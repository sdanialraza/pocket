import { env } from "node:process";
import { URL } from "node:url";
import { REST, type RESTPutAPIApplicationCommandsJSONBody, Routes } from "discord.js";
import { loadCommands } from "./util/index.js";

const rest = new REST().setToken(env.DISCORD_TOKEN);

const commands = await loadCommands(new URL("commands", import.meta.url));

const commandData = commands.map(command => command.data);

const data = (await rest.put(Routes.applicationCommands(env.DISCORD_APPLICATION_ID), {
  body: commandData,
})) as RESTPutAPIApplicationCommandsJSONBody[];

console.info(`Successfully loaded ${data.length} command(s)!`);
