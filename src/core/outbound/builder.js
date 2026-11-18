const MEDIA_TYPES = {
    image: 'image',
    video: 'video',
    audio: 'audio',
    document: 'document',
    sticker: 'sticker'
}

class MessageBuilder {
    #to

    #content

    #options = {}

    #caption

    #sent = false

    #ctx

    constructor(ctx, sendFn) {
        this.#ctx = ctx
        this.#sendFn = sendFn
    }

    #sendFn

    #assertMutable() {
        if (this.#sent) {
            throw new Error('MessageBuilder sudah dikirim dengan send(). Buat builder baru lewat ctx.message().')
        }
    }

    to(jid) {
        this.#assertMutable()
        if (typeof jid !== 'string' || !jid) throw new TypeError('to() butuh jid string')
        this.#to = jid
        return this
    }

    text(text) {
        this.#assertMutable()
        if (typeof text !== 'string') throw new TypeError('text() butuh string')
        this.#content = text
        return this
    }

    #media(kind, source, options = {}) {
        this.#assertMutable()
        if (source === undefined || source === null) {
            throw new TypeError(`${kind}() butuh source (Buffer/path/Readable)`)
        }
        this.#content = { type: MEDIA_TYPES[kind], media: source, ...options }
        return this
    }

    image(source, options) { return this.#media('image', source, options) }

    video(source, options) { return this.#media('video', source, options) }

    audio(source, options) { return this.#media('audio', source, options) }

    document(source, options) { return this.#media('document', source, options) }

    sticker(source, options) { return this.#media('sticker', source, options) }

    caption(caption) {
        this.#assertMutable()
        if (typeof caption !== 'string') throw new TypeError('caption() butuh string')
        this.#caption = caption
        return this
    }

    quote(ref) {
        this.#assertMutable()
        this.#options.quote = ref ?? this.#ctx?.m
        return this
    }

    mentions(jids) {
        this.#assertMutable()
        if (!Array.isArray(jids)) throw new TypeError('mentions() butuh array jid')
        this.#options.mentions = jids
        return this
    }

    options(options) {
        this.#assertMutable()
        Object.assign(this.#options, options)
        return this
    }

    async send() {
        this.#assertMutable()

        const to = this.#to || this.#ctx?.chat
        if (!to) throw new Error('Builder tidak tahu tujuan. Panggil .to(jid) atau buat lewat ctx.message().')

        let content = this.#content
        if (content === undefined) {
            content = ''
        }

        if (this.#caption !== undefined && content && typeof content === 'object') {
            content = { ...content, caption: this.#caption }
        }

        this.#sent = true
        return this.#sendFn(to, content, this.#options)
    }
}

export const createMessageBuilderFactory = (sendFn) => {
    return (ctx) => new MessageBuilder(ctx, sendFn)
}

export { MessageBuilder }
