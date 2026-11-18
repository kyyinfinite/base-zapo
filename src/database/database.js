import { DatabaseSync } from "node:sqlite"
import { mkdir } from "node:fs/promises"

const DATA_DIR = './data'

export const createDatabase = (path) => {
    const db = new DatabaseSync(path, {})

    //dulu synchronous OFF, cepet tapi rawan rusak kalo mati listrik, makanya NORMAL
    db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA temp_store = MEMORY;
      PRAGMA cache_size = 10000;`)

    return db
}

let configDb = null

let cacheDb = null

export const initDatabases = async (options = {}) => {
    if (configDb && cacheDb) return

    if (options.configPath !== ':memory:' && options.cachePath !== ':memory:') {
        await mkdir(DATA_DIR, { recursive: true })
    }

    //config.db buat data penting, cache.db boleh dibuang kapan aja
    //dua2nya beda sama .auth/state.sqlite punya zapo, jangan dicampur
    configDb = createDatabase(options.configPath ?? `${DATA_DIR}/config.db`)
    configDb.exec(`
        CREATE TABLE IF NOT EXISTS prefix_list (
        id INTEGER PRIMARY KEY,
        prefix text UNIQUE NOT NULL,
        timestamp INTEGER NOT NULL DEFAULT (unixepoch('subsec') * 1000)
        )
    `)
    configDb.exec(`
        CREATE TABLE IF NOT EXISTS config (
        key text PRIMARY KEY,
        value text
        ) WITHOUT ROWID
    `)

    cacheDb = createDatabase(options.cachePath ?? `${DATA_DIR}/cache.db`)
    cacheDb.exec(`
      CREATE TABLE IF NOT EXISTS youtube_cache (
        idx INTEGER PRIMARY KEY,
        video_id TEXT UNIQUE,
        title TEXT,
        duration INTEGER,
        size INTEGER,
        timestamp INTEGER,
        proto_message BLOB
      )
    `)
}

export const getConfigDb = () => {
    if (!configDb) throw new Error('config database belum di-init. panggil initDatabases() dulu.')
    return configDb
}

export const getCacheDb = () => {
    if (!cacheDb) throw new Error('cache database belum di-init. panggil initDatabases() dulu.')
    return cacheDb
}

export const closeDatabases = () => {
    if (configDb) {
        configDb.close()
        configDb = null
    }
    if (cacheDb) {
        cacheDb.close()
        cacheDb = null
    }
}
