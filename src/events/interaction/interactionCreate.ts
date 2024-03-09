import { type CommandInteraction, Events } from "discord.js";
import type { Event } from "../../types/index.js";

/**
 * Handles the chat input command interaction.
 *
 * @param interaction - The interaction to handle.
 * @returns A promise that resolves when the interaction has been handled.
 */
async function handleCommandInteraction(interaction: CommandInteraction<"cached">): Promise<void> {
  const { client, commandName } = interaction;

  const command = client.commands.get(commandName);

  if (!command) {
    const message = `No command matching ${commandName} was found.`;

    console.error(message);

    await interaction.reply({
      content: message,
      ephemeral: true,
    });

    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    await interaction.reply({
      content: "⚠️ There was an error while executing this command.",
      ephemeral: true,
    });
  }
}

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isAutocomplete()) return;

    if (!interaction.inCachedGuild()) {
      await interaction.reply({
        content: "This command wasn't in a cached guild, this shouldn't happen.",
        ephemeral: true,
      });

      return;
    }

    if (interaction.isCommand()) {
      await handleCommandInteraction(interaction);
    }
  },
} satisfies Event<Events.InteractionCreate>;
