const REDACTED_KEYS = [
    'pairingcode', 'pairing_code', 'code', 'advsecretkey', 'noisekeypair',
    'signedprekey', 'serverstatickey', 'companionencstatic', 'credentials',
    'mediakey', 'mediasecret'
]

export const redact = (data) => {
    if (!data || typeof data !== 'object') return data
    const out = Array.isArray(data) ? [] : {}
    for (const [key, value] of Object.entries(data)) {
        if (REDACTED_KEYS.includes(key.toLowerCase())) {
            out[key] = '[REDACTED]'
        } else if (value && typeof value === 'object') {
            out[key] = redact(value)
        } else {
            out[key] = value
        }
    }
    return out
}

const line = (level, scope, message, data) => {
    const prefix = `[${level}][${scope}]`

    //error/warn ke stderr, sisanya stdout
    const sink = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
    if (data !== undefined) {
        sink(prefix, message, redact(data))
    } else {
        sink(prefix, message)
    }
}

export const createLogger = (scope) => ({
    info: (message, data) => line('log', scope, message, data),
    warn: (message, data) => line('warn', scope, message, data),
    error: (message, data) => line('error', scope, message, data),
    debug: (message, data) => {
        if (process.env.DEBUG) line('debug', scope, message, data)
    },
})

export const log = createLogger('app')
