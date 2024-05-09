import { Buffer } from "node:buffer";
import type { Request } from "@cloudflare/workers-types/experimental";
import type { API, APIEmbed, APIInteractionResponse, APIMessage, APIUser, Snowflake } from "@discordjs/core/http-only";
import { calculateUserDefaultAvatarIndex, type ImageURLOptions, type REST } from "@discordjs/rest";
import { sign } from "tweetnacl";
import type { Env } from "./index.js";

export function createEmbed(): APIEmbed {
  return { color: 0x2f3136, timestamp: new Date().toISOString() };
}

type CreateBookmarkEmbedOptions = {
  api: API;
  creator: APIUser;
  description: string;
  links: string;
  message: APIMessage;
  name: string;
};

export async function createBookmarkEmbed(options: CreateBookmarkEmbedOptions): Promise<APIEmbed> {
  const { api, creator, description, links, message, name } = options;

  const embed = { fields: [], ...(await messageToEmbed(message, api)) };

  if (description) {
    embed.fields.push({ name: "Description", value: description });
  }

  if (links) {
    embed.fields.push({ name: "Links", value: links.split(" ").join("\n") });
  }

  embed.fields.push({ name: "Creator", value: `<@${creator.id}> (${creator.id})` });

  if (name) {
    embed.title = name;
  }

  return embed;
}

export function displayAvatarURL(user: APIUser, rest: REST, options?: ImageURLOptions): string {
  const index = user.discriminator === "0" ? calculateUserDefaultAvatarIndex(user.id) : Number(user.discriminator) % 5;

  const defaultAvatarURL = rest.cdn.defaultAvatar(index);

  const avatarURL = user.avatar && rest.cdn.avatar(user.id, user.avatar, options);

  return avatarURL ?? defaultAvatarURL;
}

export function extractCreatorIdFromBookmark(message: APIMessage): Snowflake | null {
  const fieldValue = message.embeds[0].fields?.at(-1)?.value;

  if (!fieldValue) return null;

  const match = /\(.+\)/.exec(fieldValue);

  return match?.[0].slice(1, -1) ?? null;
}

export function messageLink(channelId: Snowflake, messageId: Snowflake, guildId?: Snowflake): string {
  if (guildId) {
    return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
  }

  return `https://discord.com/channels/@me/${channelId}/${messageId}`;
}

export async function messageToEmbed(message: APIMessage, api: API): Promise<APIEmbed> {
  const channel = await api.channels.get(message.channel_id);

  const embed = {
    ...createEmbed(),
    author: {
      name: `${message.author.global_name ?? message.author.username} (${message.author.id})`,
      icon_url: displayAvatarURL(message.author, api.rest),
    },
    description: message.content,
    footer: {
      text: `#${channel.name}`,
    },
    timestamp: new Date(message.timestamp).toISOString(),
  };

  const attachment = message.attachments.find(attachment => attachment.content_type?.startsWith("image"));

  return attachment ? { ...embed, image: { url: attachment.url } } : embed;
}

export function respond(response: APIInteractionResponse): Response {
  return new Response(JSON.stringify(response), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function verify(request: Request, env: Env) {
  const body = await request.clone().text();
  const signature = request.headers.get("X-Signature-Ed25519");
  const timestamp = request.headers.get("X-Signature-Timestamp");

  if (!body || !signature || !timestamp) return false;

  return sign.detached.verify(
    Buffer.from(timestamp.concat(body)),
    Buffer.from(signature, "hex"),
    Buffer.from(env.DISCORD_PUBLIC_KEY, "hex"),
  );
}
