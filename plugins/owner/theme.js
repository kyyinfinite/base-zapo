import { splitString } from '../../src/utils/string.js'
import { streamFromUrl } from '../../src/utils/stream.js'

const help = `subcommand tersedia
- url
- title
- description
- thumbnail`

const handler = async (m, ctx) => {
    const { text, prefix, command, themeManager, conn, chat, event, q } = ctx

    const split1 = splitString(text)

    const subcommand1 = split1.first

    if (subcommand1 === "url") {
        const split2 = splitString(split1.rest?.trimStart())
        const option = split2.first
        const param = split2.rest
        if (option === "get") {
            const config = themeManager.getConfig()
            const print = `${prefix ?? ''}${command} url set ${config.theme_url}`
            return await conn.message.send(chat, {
                interactiveMessage: {
                    body: {
                        text: config.theme_url
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'copy url',
                                    copy_code: config.theme_url,
                                })
                            },
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'copy command',
                                    copy_code: print,
                                })
                            }
                        ]
                    }
                }
            })
        }
        else if (option === "set") {
            const r = themeManager.updateUrl(param)
            if (r.error) return await m.reply(r.error)
            return await m.react('✅')
        }
        else {
            return await m.reply(`set <url>\nget`)
        }
    }

    else if (subcommand1 === "title") {
        const split2 = splitString(split1.rest?.trimStart())
        const option = split2.first
        const param = split2.rest?.substring(1, split2.rest.length)
        if (option === "get") {
            const config = themeManager.getConfig()
            if (config.theme_title.length === 0) return await m.reply(`title kosong... update title dengan command :\n\`${prefix ?? ''}${command} title set <kata kata>\``)
            const print = `${prefix ?? ''}${command} title set ${config.theme_title}`
            return await conn.message.send(chat, {
                interactiveMessage: {
                    body: {
                        text: config.theme_title
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'copy title',
                                    copy_code: config.theme_title,
                                })
                            },
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'copy command',
                                    copy_code: print,
                                })
                            }
                        ]
                    }
                }
            }, { quote: event })
        }

        else if (option === "set") {
            const r = themeManager.updateTitle(param)
            if (r.error) return await m.reply(r.error)
            return await m.react('✅')
        }

        else if (option === "clear") {
            const r = themeManager.updateTitle('')
            if (r.error) return await m.reply(r.error)
            return await m.react('✅')
        }
        else {
            return await m.reply(`set <kata kata>\nget\nclear`)
        }
    }

    else if (subcommand1 === "description" || subcommand1 === "desc") {
        const split2 = splitString(split1.rest?.trimStart())
        const option = split2.first
        const param = split2.rest?.substring(1, split2.rest.length)
        if (option === "get") {
            const config = themeManager.getConfig()
            if (config.theme_description.length === 0) return await m.reply(`description kosong... update description dengan command :\n\`${prefix ?? ''}${command} description set <kata kata>\``)
            const print = `${prefix ?? ''}${command} description set ${config.theme_description}`
            return await conn.message.send(chat, {
                interactiveMessage: {
                    body: {
                        text: config.theme_description
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'copy description',
                                    copy_code: config.theme_description,
                                })
                            },
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'copy command',
                                    copy_code: print,
                                })
                            }
                        ]
                    }
                }
            }, { quote: event })
        }

        else if (option === "set") {
            const r = themeManager.updateDescription(param)
            if (r.error) return await m.reply(r.error)
            return await m.react('✅')
        }

        else if (option === "clear") {
            const r = themeManager.updateDescription('')
            if (r.error) return await m.reply(r.error)
            return await m.react('✅')
        }
        else {
            return await m.reply(`set <kata kata>\nget\nclear`)
        }
    }

    else if (subcommand1 === "commandrows" || subcommand1 === "cmdrows") {
        const split2 = splitString(split1.rest?.trimStart())
        const option = split2.first
        const param = split2.rest?.substring(1, split2.rest.length)
        if (option === "get") {
            const config = themeManager.getConfig()
            const print = `${prefix ?? ''}${command} commandrows set ${config.theme_commandRows}`
            return await conn.message.send(chat, {
                interactiveMessage: {
                    body: {
                        text: config.theme_commandRows
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'copy value',
                                    copy_code: config.theme_commandRows,
                                })
                            },
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'copy command',
                                    copy_code: print,
                                })
                            }
                        ]
                    }
                }
            }, { quote: event })
        }

        else if (option === "set") {
            const r = themeManager.updateCommandRows(param)
            if (r.error) return await m.reply(r.error)
            return await m.react('✅')
        }

        else {
            return await m.reply(`set <kata kata>\nget`)
        }
    }

    else if (subcommand1 === "categoryrows" || subcommand1 === "catrows") {
        const split2 = splitString(split1.rest?.trimStart())
        const option = split2.first
        const param = split2.rest?.substring(1, split2.rest.length)
        if (option === "get") {
            const config = themeManager.getConfig()
            const print = `${prefix ?? ''}${command} categoryrows set ${config.theme_categoryRows}`
            return await conn.message.send(chat, {
                interactiveMessage: {
                    body: {
                        text: config.theme_categoryRows
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'copy value',
                                    copy_code: config.theme_categoryRows,
                                })
                            },
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: 'copy command',
                                    copy_code: print,
                                })
                            }
                        ]
                    }
                }
            }, { quote: event })
        }

        else if (option === "set") {
            const r = themeManager.updateCategoryRows(param)
            if (r.error) return await m.reply(r.error)
            return await m.react('✅')
        }

        else {
            return await m.reply(`set <kata kata>\nget`)
        }
    }

    else if (subcommand1 === "thumbnail" || subcommand1 === "thumb") {
        const split2 = splitString(split1.rest?.trimStart())
        const option = split2.first
        const param = split2.rest
        if (option === "get") {
            return await m.reply(`masih di bikin`)
        }
        else if (option === "set") {
            const url = param?.trim()
            const mUrl = /^https?:\/\//.test(url)
            const wam = q ?? m

            let stream
            if (mUrl) {
                stream = await streamFromUrl(url)
            } else {
                stream = await wam.download()
            }

            const r = await themeManager.updateThumbnail(conn, stream)
            if (r.error) return await m.reply(r.error)
            return await m.react(`✅`)
        }
        else if (option === "default") {
            const r = await themeManager.useDefaultThumbnail()
            if (r.error) return await m.reply(r.error)
            return await m.react(`✅`)
        }
        else {
            return await m.reply(`get\nset <url>\ndefault`)
        }
    }

    else if (subcommand1 === "favicon" || subcommand1 === "fav") {
        const split2 = splitString(split1.rest?.trimStart())
        const option = split2.first
        const param = split2.rest
        if (option === "get") {
            return await m.reply(`masih di bikin`)
        }
        else if (option === "set") {
            const url = param?.trim()
            const mUrl = /^https?:\/\//.test(url)
            const wam = q ?? m

            let stream
            if (mUrl) {
                stream = await streamFromUrl(url)
            } else {
                stream = await wam.download()
            }

            const r = await themeManager.updateFavicon(conn, stream)
            if (r.error) return await m.reply(r.error)
            return await m.react(`✅`)
        }
        else if (option === "delete") {
            const r = await themeManager.deleteFavicon()
            if (r.error) return await m.reply(r.error)
            return await m.react(`✅`)
        }
        else {
            return await m.reply(`get\nset <url>\ndefault`)
        }
    }

    else {
        await m.reply(`invalid command${subcommand1 ? ` \`${subcommand1}\`` : ``}, ${help}`)
    }
}

handler.command = ['theme']
handler.description = 'theme manager'
handler.category = 'owner'
handler.owner = true

export default handler
