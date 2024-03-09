import type { Command } from "../types/index.js";

export default {
  data: {
    name: "ping",
    description: "Replies with Pong!",
    dm_permission: false,
  },
  async execute(interaction) {
    await interaction.reply({ content: "Pong!", ephemeral: true });
  },
} as const satisfies Command;
