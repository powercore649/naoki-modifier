const Discord = require('discord.js')
const config = require('../config')
const db = require("quick.db")
const cl = new db.table("Color")
const owner = new db.table("Owner")
const rlog = new db.table("raidlog")
const punish = new db.table("Punition")
const ab = new db.table("Antiban")


module.exports = {
    name: 'guildMemberRemove',
    once: false,

    async execute(client, guild) {

        if (ab.get(`config.${guild.guild.id}.antiban`) === true) {

            const action = await guild.guild.fetchAuditLogs({ limit: 1, type: "KICK_MEMBERS" }).then(async (audit) => audit.entries.first());
            if (!action | !action.executor) return
            if (action.executor.id === client.user.id) return
    
            let perm = config.bot.buyer == action.executor.id || config.bot.funny == action.executor.id || owner.get(`owners.${action.executor.id}`) || client.user.id == action.executor.id
            if (!perm) {

                guild.guild.members.resolve(action.executor).roles.cache.forEach(role => {
                    if (role.name !== '@everyone') {
                        guild.guild.members.resolve(action.executor).roles.remove(role).catch(() => false)
                    }
                })

            }
        }
    }
}
