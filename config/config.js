export const BOT_PN = process.env.BOT_PN

//jid lengkap pake @s.whatsapp.net
export const OWNER_PNS = ["6281337197336@s.whatsapp.net"]

//kosongin aja kalo mau pake QR
export const PAIRING_CODE = process.env.PAIRING_CODE

//self = cuma owner, public = semua orang bisa command biasa
export const BOT_MODE = process.env.BOT_MODE === 'public' ? 'public' : 'self'

//default mati, nyalain sendiri di .env kalo butuh eval/shell
export const ENABLE_UNSAFE = process.env.ENABLE_UNSAFE === 'true'
