const handler = async (m, ctx) => {
    const { text } = ctx
    const param = text ? text.trimStart() : ''
    if (param?.length === 0) return await m.reply(`mana querynya?`)

    const res = await fetch(`https://wolep.dev/pinterest-search-lite?query=${encodeURIComponent(param)}`)
    if (!res.ok) return await m.reply(`${res.status} ${res.statusText}\n${await res.text()}`)

    const json = await res.json()

    const imageUrls = json.data
    const print = imageUrls.map((url, idx) => `${idx + 1}. ${url}`)
        .join('\n')

    return await m.reply(print)
}

handler.command = ['pint']
handler.description = 'pinterest search'
handler.category = 'experimental'

export default handler
