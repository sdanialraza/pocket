import { URL } from "node:url";
import { Client, Collection, GatewayIntentBits, RESTEvents } from "discord.js";
import { loadCommands, loadEvents } from "./util/index.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.commands = new Collection();

const commands = await loadCommands(new URL("commands", import.meta.url));
const events = await loadEvents(new URL("events", import.meta.url));

for (const command of commands) {
  client.commands.set(command.data.name, command);
}

for (const event of events) {
  client[event.once ? "once" : "on"](event.name, async (...args) => event.execute(...args));
}

await client.login();

client.rest.on(RESTEvents.RateLimited, console.error);
