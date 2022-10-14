/* eslint-disable promise/avoid-new */
import { openIDB, Database } from '../db/database'

class ResourceManager {
  private db: Database | undefined

  private readonly cacheObject: Record<string, unknown> = {}

  public constructor(private readonly store = 'store') {}

  private getCached(key: string): unknown {
    return this.cacheObject[key]
  }

  public async saveItem(key: string, value: unknown) {
    this.cacheObject[key] = value
    if (this.db !== undefined) {
      await this.db.saveByPath(value, key)
    }
  }

  public async getItem(key: string) {
    const cached = this.getCached(key)
    if (cached === undefined && this.db === undefined) {
      throw new Error(`Couldn't find item ${key}!`)
    } else if (cached !== undefined) {
      return cached
    } else {
      const saved = await this.db?.loadByPath(key)
      if (saved === undefined) {
        throw new Error(`Couldn't find item ${key}!`)
      }
      return saved
    }
  }

  public async init() {
    const idb = await openIDB(this.store)
    this.db = new Database(idb)
  }

  private async open() {
    const load = async () => {
      const openp = new Promise<IDBDatabase>((resolve, reject) => {
        const orequest = window.indexedDB.open(this.store, 1)
        orequest.addEventListener('upgradeneeded', () => {
          const db = orequest.result
          db.createObjectStore('store')
        })
        orequest.addEventListener('blocked', () => {
          reject(new Error('Error creating Database!'))
        })
        orequest.addEventListener('error', () => {
          reject(new Error('Error creating Database!'))
        })
        orequest.addEventListener('success', () => {
          const db = orequest.result
          resolve(db)
        })
      })
      return await openp
    }
    return await load()
  }
}

export default ResourceManager
