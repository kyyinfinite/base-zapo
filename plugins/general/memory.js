import { formatBytes } from '../../src/utils/format.js'

const handler = async (m, ctx) => {
    const print = Object.entries(process.memoryUsage())
        .map(([name, bytes]) => `${name} : ${formatBytes(bytes)}`)
        .join('\n')
    return await m.reply(print)
}

handler.command = ['mem', 'rss']
handler.description = 'memory usage'
handler.category = 'general'

export default handler
