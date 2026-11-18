const handler = async (m, ctx) => {
    const { q } = ctx
    const wam = q ?? m
    const result = await upload(await wam.download(), 'file.jpg')
    return await wam.reply(JSON.stringify(result, null, 2))
}

const upload = async (stream, filename = 'file') => {
    const boundary = `----NodeFormBoundary${crypto.randomUUID()}`

    const encoder = new TextEncoder()

    async function* multipart() {
        yield encoder.encode(
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
            `Content-Type: application/octet-stream\r\n` +
            `\r\n`
        )

        for await (const chunk of stream) {
            yield chunk
        }

        yield encoder.encode(`\r\n--${boundary}--\r\n`)
    }

    const response = await fetch(
        'https://api.onlyfiles.com/v1/upload',
        {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: multipart(),
            duplex: 'half'
        }
    )

    if (!response.ok) {
        throw new Error(
            `${response.status} ${response.statusText} ${await response.text()}`
        )
    }

    return response.json()
}

handler.command = ['upcm']
handler.description = 'tmp files'
handler.category = 'experimental'

export default handler
