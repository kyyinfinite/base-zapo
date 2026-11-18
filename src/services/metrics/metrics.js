export const createMetrics = (names = []) => {
    const counters = new Map()
    for (const name of names) counters.set(name, 0)

    const gauges = new Map()

    const metrics = {
        inc(name, by = 1) {
            counters.set(name, (counters.get(name) ?? 0) + by)
        },

        set(name, value) {
            gauges.set(name, value)
        },

        get(name) {
            return counters.get(name) ?? gauges.get(name)
        },

        snapshot() {
            const out = {}
            for (const [key, value] of [...counters.entries()].sort(([a], [b]) => a.localeCompare(b))) {
                out[key] = value
            }
            for (const [key, value] of [...gauges.entries()].sort(([a], [b]) => a.localeCompare(b))) {
                if (!(key in out)) out[key] = value
            }
            return out
        },

        reset() {
            counters.clear()
            gauges.clear()
            for (const name of names) counters.set(name, 0)
        }
    }

    return metrics
}
