import { BOT_PN, OWNER_PNS, PAIRING_CODE, BOT_MODE, ENABLE_UNSAFE } from "./config/config.js"
import { botCheck } from "./src/check/bot-check.js"
import { createApp } from "./src/core/app/application.js"

const app = createApp({
    config: { BOT_PN, OWNER_PNS, PAIRING_CODE, BOT_MODE, ENABLE_UNSAFE },
    botCheck
})

await app.start()
