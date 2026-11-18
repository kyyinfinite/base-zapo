import { splitString } from '../../utils/string.js'

export const parseCommand = (input) => {
    const split = splitString(typeof input === 'string' ? input.trimStart() : input)
    if (!split.first) return undefined

    const command = split.first.toLowerCase()
    const rest = split.rest ?? ''

    return {
        command,
        text: rest.trim(),
        args: rest.split(/\s+/).filter(Boolean)
    }
}
