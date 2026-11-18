import { Readable } from "node:stream"

export const streamFromUrl = async (url) => {
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}\n${await response.text()}`)
    }

    if (!response.body) {
        throw new Error("response body is empty")
    }

    return Readable.fromWeb(response.body)
}

export const streamToBuffer = async (stream) => {
    const chunks = []

    for await (const chunk of stream) {
        chunks.push(chunk)
    }

    return Buffer.concat(chunks)
}
