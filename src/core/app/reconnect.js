import { createLogger } from '../../services/logger/logger.js'

const log = createLogger('reconnect')

export const createReconnectSupervisor = (options = {}) => {
    const connect = options.connect ?? (async () => { })
    const baseDelayMs = options.baseDelayMs ?? 1000
    const maxDelayMs = options.maxDelayMs ?? 60_000
    const jitterMs = options.jitterMs ?? 250

    let timer = null
    let attempts = 0
    let cancelled = false
    let inFlight = false

    const computeDelay = () => {
        const backoff = Math.min(maxDelayMs, baseDelayMs * 2 ** attempts)
        return backoff + (jitterMs > 0 ? Math.floor(Math.random() * jitterMs) : 0)
    }

    const attempt = async () => {
        if (cancelled) return
        inFlight = true
        let failed = false
        try {
            await connect()

        } catch (error) {
            failed = true
            log.error(`reconnect gagal: ${error?.message ?? error}`)
        } finally {
            //harus dilepas sebelum reschedule, kalo ngga retry nya putus
            inFlight = false
        }

        if (failed && !cancelled && !timer) {
            schedule()
        }
    }

    const schedule = () => {
        if (cancelled) return

        //timer cuma boleh satu, close berkali2 jangan numpuk
        if (timer) return

        //masih ada connect jalan, tunggu aja
        if (inFlight) return

        const delay = computeDelay()
        attempts++
        log.warn(`reconnect dalam ${Math.round(delay / 100) / 10}s (percobaan ${attempts})`)

        timer = setTimeout(() => {
            timer = null
            void attempt()
        }, delay)
    }

    const notifyOpen = () => {
        attempts = 0

        //udah nyambung tapi timer retry masih nunggu, batalin. kalo ngga nanti connect() kepanggil lagi padahal udah nyambung
        if (timer) {
            clearTimeout(timer)
            timer = null
        }
    }

    const cancel = () => {
        cancelled = true
        if (timer) {
            clearTimeout(timer)
            timer = null
        }
    }

    const snapshot = () => ({
        pendingTimer: timer !== null,
        connecting: inFlight,
        attempts,
        cancelled
    })

    return { schedule, notifyOpen, cancel, snapshot }
}
