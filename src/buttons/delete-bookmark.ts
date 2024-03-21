import {
  InteractionResponseType,
  MessageFlags,
  type API,
  type APIMessageComponentButtonInteraction,
} from "@discordjs/core/http-only";
import { extractCreatorIdFromBookmark, respond, type Env } from "../util/index.js";

type DeleteBookmarkButtonOptions = {
  api: API;
  env: Env;
  interaction: APIMessageComponentButtonInteraction;
};

export default {
  customId: "delete-bookmark",
  async execute({ api, env, interaction }: DeleteBookmarkButtonOptions) {
    try {
      const userId = interaction.user?.id ?? interaction.member!.user.id;

      if (userId !== extractCreatorIdFromBookmark(interaction.message)) {
        return respond({
          data: { content: "You can't delete a bookmark you didn't create.", flags: MessageFlags.Ephemeral },
          type: InteractionResponseType.ChannelMessageWithSource,
        });
      }

      await api.channels.deleteMessage(env.BOOKMARKS_CHANNEL_ID, interaction.message.id);

      return respond({
        data: { content: "Bookmark successfully deleted.", flags: MessageFlags.Ephemeral },
        type: InteractionResponseType.ChannelMessageWithSource,
      });
    } catch (error) {
      const message = ["An error occurred while deleting the bookmark:", `\`\`\`${error}\`\`\``].join("\n");

      return respond({
        data: { content: message, flags: MessageFlags.Ephemeral },
        type: InteractionResponseType.ChannelMessageWithSource,
      });
    }
  },
} as const;
