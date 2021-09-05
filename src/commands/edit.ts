import { CommandInteraction } from 'discord.js';
import Joi from 'joi';

import { baseUrl, defaultEmbed, rest } from '../lib/discord';
import { commands, db } from '../lib/firestore';

interface Props {
  name?: string,
  new_name?: string,
  description?: string,
  content?: string,
  ephemeral?: boolean,
}

const payloadSchema = Joi.object({
  name: Joi.string().min(1).max(32).required(),
  new_name: Joi.string().min(1).max(32).required(),
  description: Joi.string().min(1).max(100).required(),
  content: Joi.string().min(1).max(2000).required(),
  ephemeral: Joi.boolean().optional(),
});
const fields = ['name', 'description', 'content', 'ephemeral', 'new_name'];

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

  try {
    const results = await commands
      .where('name', '==', payload.name?.toLowerCase())
      .get();
  
    if (results.size === 0) {
      return interaction.reply({ embeds: [defaultEmbed()
        .setColor('RED')
        .setDescription('Command does not exist. Use `/create` instead')] 
      });
    }

    payload.name = payload.name?.toLowerCase();
  
    const cmd = results.docs[0];

    const editPayload = {
      ...payload,
      name: payload.new_name?.toLowerCase(),
      ephemeral: payload.ephemeral || false,
    };
    delete editPayload.new_name;
  
    await rest.patch(
      `${baseUrl(interaction.guild?.id || '')}/${cmd.get('discord_slash_command_id')}` as `/${string}`,
      { 
        body: {
          name: editPayload.name,
          description: editPayload.description
        },
      },
    );
  
    await db.doc(`/commands/${cmd.id}`).update(editPayload);
  
    return interaction.reply({ embeds: [defaultEmbed()
      .setColor('GREEN')
      .setDescription('Command updated!')] 
    });
  } catch (e) {    
    interaction.reply({ embeds: [defaultEmbed()
      .setColor('RED')
      .setDescription('Oopss, something went wrong')] 
    });
  }
}