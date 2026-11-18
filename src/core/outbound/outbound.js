export const createOutbound = (client) => {
    const send = (to, content, options = {}) => {
        return client.message.send(to, content, options)
    }

    const reply = (to, content, quoted, options = {}) => {
        return send(to, content, { quote: quoted, ...options })
    }

    const react = (to, emoji, target) => {
        return send(to, { type: 'reaction', emoji, target })
    }

    return { send, reply, react }
}
