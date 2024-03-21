import {
  InteractionResponseType,
  MessageFlags,
  type API,
  type APIModalSubmitGuildInteraction,
  type APIModalSubmitInteraction,
} from "@discordjs/core/http-only";
import createBookmarkModal from "../modals/create-bookmark.js";
import { respond, type Env } from "../util/index.js";

export type HandleModalOptions = {
  api: API;
  env: Env;
  interaction: APIModalSubmitInteraction;
};

export async function handleModal({ api, env, interaction }: HandleModalOptions): Promise<Response> {
  try {
    if (interaction.data.custom_id === createBookmarkModal.customId) {
      const modalInteraction = interaction as APIModalSubmitGuildInteraction;

      return await createBookmarkModal.execute({ api, env, interaction: modalInteraction });
    }

    return respond({
      data: { content: "Unknown modal, this wasn't supposed to happen.", flags: MessageFlags.Ephemeral },
      type: InteractionResponseType.ChannelMessageWithSource,
    });
  } catch (error) {
    console.error(error);

    const message = ["An error occurred while handling modal:", `\`\`\`${error}\`\`\``].join("\n");

    return respond({
      data: { content: message, flags: MessageFlags.Ephemeral },
      type: InteractionResponseType.ChannelMessageWithSource,
    });
  }
}
