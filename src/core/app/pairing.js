import { createLogger } from '../../services/logger/logger.js'

const log = createLogger('pairing')

export const createPairingRequester = ({ client, config, emit }) => {
    let boundClient = client ?? null
    let pairingRequested = false

    const bindClient = (nextClient) => {
        boundClient = nextClient
    }

    const prettyCode = (code) => code?.match(/.{1,4}/g)?.join('-') ?? code

    const handleAuthQr = async ({ qr }) => {
        emit?.('bot:qr', { qr })

        //kosong = mode QR, ga minta kode
        if (!config.PAIRING_CODE) {
            if (!pairingRequested) {
                pairingRequested = true
                log.info('mode QR-only (PAIRING_CODE kosong) — pindai QR untuk menautkan perangkat')
            }
            return
        }

        if (pairingRequested) return
        pairingRequested = true

        try {
            const code = await boundClient.auth.requestPairingCode(
                config.BOT_PN,
                true,
                config.PAIRING_CODE
            )

            console.log('Kode dikirim ke nomor ' + config.BOT_PN + '. Masukkan kode pairing berikut: ' + prettyCode(code) + '\n\n' +
                `[!] jika tidak ada notifikasi..
1. buka aplikasi whatsapp
2. perangkat tertaut
3. tautkan perangkat
4. tautkan dengan nomor telepon saja
5. masukkan kode ${prettyCode(code)}`)
        } catch (error) {
            pairingRequested = false
            log.error(`permintaan kode pairing gagal: ${error?.message ?? error}. Akan dicoba lagi pada refresh QR berikutnya.`)
        }
    }

    const isRequested = () => pairingRequested

    const reset = () => { pairingRequested = false }

    return { handleAuthQr, isRequested, reset, bindClient }
}
