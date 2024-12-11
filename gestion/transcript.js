const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const config = require('../config');
const db = require('quick.db');
const moment = require('moment');
const owner = new db.table("Owner");

module.exports = {
    name: 'transcript',
    usage: 'transcript',
    category: "owner",
    description: `Commande transcript.`,
    version: '1.2.3 Bêta 2',  // Version de la commande mise à jour
    company: 'Inter-Dev',  // Nom de la compagnie qui a créé la commande
    async execute(client, message, args) {

        if (owner.get(`owners.${message.author.id}`) || config.bot.buyer.includes(message.author.id) || config.bot.funny.includes(message.author.id) === true) {

            const msgd = await message.channel.send({
                content: `⚠️ Récupération des messages, cela peut prendre un certain temps <a:Animated_Loading_3:1316045250564853821>`,
            });

            const fetchAll = require('discord-fetch-all');

            // Inclure tous les messages (bots + utilisateurs)
            const allMessages = await fetchAll.messages(message.channel, {
                reverseArray: true,
                userOnly: false, // Inclure les messages des utilisateurs ET des bots
                botOnly: false,
                pinnedOnly: false,
            });

            // Fonction pour déterminer le rôle de l'utilisateur
            function getUserRole(member) {
                if (member.permissions.has('ADMINISTRATOR')) {
                    return 'ADMIN';
                } else if (owner.get(`owners.${member.id}`)) {
                    return 'OWNER';
                } else {
                    return 'MEMBRE';
                }
            }

            // Format des messages avec l'ordre demandé : nom de l'utilisateur, emoji, message, date, ID de l'utilisateur et rôle
            var results = allMessages.map(msg => {
                const emoji = msg.author.bot ? '🤖' : '👤';  // Emoji pour bot ou utilisateur
                const authorType = msg.author.bot ? 'BOT' : 'HUMAIN';  // Type d'auteur en majuscules
                const member = message.guild.members.cache.get(msg.author.id);
                const userRole = member ? getUserRole(member) : 'MEMBRE'; // Récupère le rôle de l'utilisateur

                const roleColor = userRole === 'OWNER' ? '🟩' : (userRole === 'ADMIN' ? '🟦' : '🟨');  // Couleur par rôle

                return `**${msg.author.username}** (${msg.author.id}) ${emoji} (${authorType}) ${roleColor} (${userRole}) : \n**Message**: ${msg.content} \n**Date**: ${moment(msg.createdTimestamp).format("DD/MM/YYYY - hh:mm:ss a").replace("pm", "PM").replace("am", "AM")}\n\n`;
            }).join('');

            const hastebin = require("hastebin-gen");

            hastebin(
                `📝 **Version de la commande : ${module.exports.version}**\n👨‍💻 **Créée par : ${module.exports.company}**\n\n🗒️ **Transcript des logs**\n\nSalon : **${message.channel.name}** (*ID : ${message.channel.id}*)\nServeur : **${message.guild.name}**\nDemandé par : **${message.author.username}**\n\n---\n\n` + results,
                {
                    extension: "txt",
                    url: 'https://haste.chaun14.fr/'
                }
            ).then(haste => {
                msgd.edit({
                    content: `✅ Le **transcript** a été généré avec succès et le lien a été envoyé en message privé.`,
                });

                message.author.send({
                    content: `Voici le lien vers le **transcript** du salon que vous avez demandé : ${haste}`,
                }).catch(() => {
                    message.reply({
                        content: `❌ Je n'ai pas pu vous envoyer le lien en message privé. Vérifiez que vos MP sont activés.`,
                        ephemeral: true
                    });
                });

            }).catch(err => {
                msgd.edit({ content: `❌ Une erreur est survenue lors de la génération du transcript.` });
                console.error(err);
            });
        }
    }
};

