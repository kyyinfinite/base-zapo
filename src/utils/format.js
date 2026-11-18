export const nowSecond = () => {
    return Math.floor(Date.now() / 1000)
}

export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}
