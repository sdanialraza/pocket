import type { APIEmbed } from "discord.js";

export function createEmbed(): APIEmbed {
  return { color: 0x2f3136, timestamp: new Date().toISOString() };
}
