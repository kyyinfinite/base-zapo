import { getContentType, toUserJid } from "zapo-js"
import { mDownload, qDownload } from "./download.js"

export const extractText = (message, content) =>
    message?.[content]?.text ??
    message?.conversation ??
    message?.[content]?.caption

function mReply(text) {
    return this.client.message.send(this.key.remoteJid, text, {
        quote: this
    })
}

function mReact(emoji) {
    return this.client.message.send(this.key.remoteJid, {
        type: "reaction",
        target: this,
        emoji
    })
}

function qReply(text) {
    return this.client.message.send(this.key.remoteJid, text, {
        quote: this
    })
}

function qReact(emoji) {
    return this.client.message.send(this.key.remoteJid, {
        type: "reaction",
        target: this.key,
        emoji
    })
}

export const mSerialize = (event, client) => {
    const m = {
        ...event,
        content: getContentType(event?.message),
        reply: mReply,
        download: mDownload,
        react: mReact
    }

    Object.defineProperty(m, "client", {
        enumerable: false,
        get() { return client }
    })

    m.text = extractText(event?.message, m.content)

    m.q = qSerialize(m)

    return m
}

export const qSerialize = (m) => {
    if (!m?.message?.[m.content]?.contextInfo?.quotedMessage) return undefined

    const message = m.message[m.content].contextInfo.quotedMessage

    const contextInfo = m.message[m.content].contextInfo

    const key = {
        remoteJid: m.key.remoteJid,
        participant: contextInfo.participant,
        id: contextInfo.stanzaId,
        fromMe: contextInfo.participant === toUserJid(m.client.auth?.getCurrentCredentials()?.meLid)
    }
    const content = getContentType(message)

    const q = {
        key,
        message,
        content,
        reply: qReply,
        react: qReact,
        download: qDownload
    }

    q.text = extractText(message, content)

    Object.defineProperty(q, "client", {
        enumerable: false,
        get() { return m.client }
    })

    return q
}
