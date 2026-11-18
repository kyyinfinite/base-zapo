import { cleanupTempDir } from '../../lib/media/image.js'
import { createLogger } from '../logger/logger.js'

const log = createLogger('temp')

export const initTempService = async () => {
    const { removed, kept } = await cleanupTempDir()
    if (removed || kept) {
        log.info(`startup cleanup .temp: ${removed} dihapus${kept ? `, ${kept} tertahan` : ''}`)
    }
}

export { withTempFile, cleanupTempDir } from '../../lib/media/image.js'
