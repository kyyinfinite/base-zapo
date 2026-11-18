import { EventEmitter } from 'node:events'

class ZapokEvents extends EventEmitter {}

export const events = new ZapokEvents()
events.setMaxListeners(50)
