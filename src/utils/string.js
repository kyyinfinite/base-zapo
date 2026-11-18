export const splitString = (input) => {
    if (typeof input !== "string" || !input) return { first: undefined, rest: undefined }

    const spaceIndex = input.indexOf(" ")
    const enterIndex = input.indexOf("\n")

    if (spaceIndex === -1 && enterIndex === -1) {
        return { first: input, rest: undefined }
    } else if (enterIndex === -1) {
        return { first: input.substring(0, spaceIndex), rest: input.substring(spaceIndex) }
    } else if (spaceIndex === -1) {
        return { first: input.substring(0, enterIndex), rest: input.substring(enterIndex) }
    } else {
        if (enterIndex < spaceIndex) {
            return { first: input.substring(0, enterIndex), rest: input.substring(enterIndex) }
        } else {
            return { first: input.substring(0, spaceIndex), rest: input.substring(spaceIndex) }
        }
    }
}
