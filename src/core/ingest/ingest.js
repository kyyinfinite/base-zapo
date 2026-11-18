import { isNewsletterJid, isStatusBroadcastJid, isBroadcastJid } from 'zapo-js'

export const isDispatchable = (event) => {
    if (!event?.message) return false
    if (event.offline) return false

    const jid = event.key?.remoteJid
    if (!jid) return false
    if (isNewsletterJid(jid) || isStatusBroadcastJid(jid) || isBroadcastJid(jid)) return false

    return true
}

export const senderCandidates = (key) => {
    if (!key) return []
    const candidates = [
        key.participantAlt,
        key.participant,
        key.remoteJidAlt,
        key.remoteJid
    ]
    return [...new Set(candidates.filter(Boolean))]
}

export const resolveSender = (key) => {
    const candidates = senderCandidates(key)
    return candidates.find(jid => jid.includes('@s.whatsapp.net')) ?? candidates[0]
}
