import { REST } from '@discordjs/rest';
import { MessageEmbed } from 'discord.js';

export const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN || '');

export const baseUrl = 
  (guild_id: string): `/${string}` => `/applications/${process.env.APPLICATION_ID}/guilds/${guild_id}/commands`;

export function defaultEmbed() {
  return new MessageEmbed()
    .setFooter('Made with ❤️ from Germany')
    .setColor('BLUE');
}
