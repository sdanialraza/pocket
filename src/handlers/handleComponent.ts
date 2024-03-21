import {
  InteractionResponseType,
  MessageFlags,
  type API,
  type APIMessageComponentButtonInteraction,
  type APIMessageComponentInteraction,
} from "@discordjs/core/http-only";
import deleteBookmarkButton from "../buttons/delete-bookmark.js";
import { respond, type Env } from "../util/index.js";

export type HandleComponentOptions = {
  api: API;
  env: Env;
  interaction: APIMessageComponentInteraction;
};

export async function handleComponent({ api, env, interaction }: HandleComponentOptions): Promise<Response> {
  try {
    if (interaction.data.custom_id === deleteBookmarkButton.customId) {
      const buttonInteraction = interaction as APIMessageComponentButtonInteraction;

      return await deleteBookmarkButton.execute({ api, env, interaction: buttonInteraction });
    }

    return respond({
      data: { content: "Unknown component, this wasn't supposed to happen.", flags: MessageFlags.Ephemeral },
      type: InteractionResponseType.ChannelMessageWithSource,
    });
  } catch (error) {
    console.error(error);

    const message = ["An error occurred while handling component:", `\`\`\`${error}\`\`\``].join("\n");

    return respond({
      data: { content: message, flags: MessageFlags.Ephemeral },
      type: InteractionResponseType.ChannelMessageWithSource,
    });
  }
}
