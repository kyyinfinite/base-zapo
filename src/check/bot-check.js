import { BOT_PN, OWNER_PNS, PAIRING_CODE } from "../../config/config.js"

const botCheck = () => {
    const errorMessage = []

    const CONFIG_PATH = "./config/config.js"

    if (typeof BOT_PN !== "string" || BOT_PN.length === 0) {
        errorMessage.push(`Variabel BOT_PN kosong. Tolong buat file .env dan taruh di root isikan value BOT_PN=6285XXXXXX nomor mu`)
    }

    if (!Array.isArray(OWNER_PNS) || OWNER_PNS.length === 0) {
        errorMessage.push(`Variabel OWNER_PNS kosong Tolong edit di ${CONFIG_PATH} dan pastikan harus array of string`)
    }

    //PAIRING_CODE boleh kosong (mode QR), kalo diisi formatnya harus bener
    const pairingCodeProvided = typeof PAIRING_CODE === "string" && PAIRING_CODE.length > 0
    const pairingCodeStrip = pairingCodeProvided ? PAIRING_CODE.replaceAll("-", "") : ""
    const string = "123456789ABCDEFGHJKLMNPQRSTVWXYZ"
    const isValid = pairingCodeStrip.length === 8 && pairingCodeStrip.split("").every(c => string.indexOf(c) !== -1)
    if (pairingCodeProvided && !isValid) {
        errorMessage.push(`Format pairing code salah. Karakter harus dalam list ini ${string}. Format kode pairing XXXX-XXXX atau XXXXXXXX. Tolong edit .env (atau kosongkan untuk mode QR-only)`)
    }

    if (errorMessage.length) {
        const message = "Stop! kamu punya error\n" + errorMessage.map((v, i) => `${i + 1}. ${v}`).join('\n') + "\nbenerin dulu sana"
        return { error: message }
    } else {
        return { error: undefined }
    }
}

export { botCheck }
