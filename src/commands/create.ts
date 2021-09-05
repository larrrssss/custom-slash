import { CommandInteraction } from 'discord.js';
import Joi from 'joi';

import { baseUrl, defaultEmbed, rest } from '../lib/discord';
import { commands } from '../lib/firestore';

interface Props {
  name?: string,
  description?: string,
  content?: string,
  ephemeral?: boolean,
}

const payloadSchema = Joi.object({
  name: Joi.string().min(1).max(32).required(),
  description: Joi.string().min(1).max(100).required(),
  content: Joi.string().min(1).max(2000).required(),
  ephemeral: Joi.boolean().optional(),
});
const fields = ['name', 'description', 'content', 'ephemeral'];

export default async function executor(interaction: CommandInteraction) {
  const payload: Props = fields
    .map((f) => ({ [f]: interaction.options.get(f)?.value }))
    .reduce((o, x) => Object.assign(o, x));

  if (payloadSchema.validate(payload).error) {
    return interaction.reply({ embeds: [defaultEmbed()
      .setColor('RED')
      .setDescription('Invalid Payload')] 
    });
  }

  payload.name = payload.name?.toLowerCase();

  try {
    const { size: commandExist } = await commands
      .where('name', '==', payload.name?.toLowerCase())
      .get();
  
    if (commandExist) {
      return interaction.reply({ embeds: [defaultEmbed()
        .setColor('RED')
        .setDescription('Command name already in use. Use `/edit` instead')] 
      });
    }  
  
    const discordSlashCommand = await rest.post(
      baseUrl(interaction.guild?.id || ''),
      { 
        body: {
          name: payload.name,
          description: payload.description
        },
      },
    );
  
    await commands.add({
      ...payload,
      ephemeral: payload.ephemeral || false,
      discord_slash_command_id: (discordSlashCommand as { [k: string]: string }).id,
    });
  
    return interaction.reply({ embeds: [defaultEmbed()
      .setColor('GREEN')
      .setDescription(`Command created! Use it with \`/${payload.name?.toLowerCase()}\``)] 
    });
  } catch (e) {
    interaction.reply({ embeds: [defaultEmbed()
      .setColor('RED')
      .setDescription('Oopss, something went wrong')] 
    });
  }
}