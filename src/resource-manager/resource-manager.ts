/* eslint-disable promise/avoid-new */
import { openIDB, Database } from '../db/database'

class ResourceManager {
  private db: Database | undefined

  private readonly cacheObject: Record<string, unknown> = {}

  public constructor(private readonly store?: string) {}

  private getCached(key: string): unknown {
    return this.cacheObject[key]
  }

  public cachedAtKey(key: string) {
    return this.getCached(key) !== undefined
  }

  public findCached(w: unknown) {
    for (const [k, v] of Object.entries(this.cacheObject)) {
      if (v === w) {
        return k
      }
    }
    return undefined
  }

  public removeItem(key: string, cache = false, persist = false) {
    if (cache) {
      this.cacheObject[key] = undefined
    }
    if (persist) {
      throw new Error('Not implemented!')
    }
  }

  public getAllCached(): string[] {
    return Object.keys(this.cacheObject)
  }

  public async getAllPersistent(): Promise<Readonly<string[]>> {
    return this.db !== undefined ? await this.db.getAllKeys() : []
  }

  public async saveItem(key: string, value: unknown, cache = false, persist = false) {
    if (cache) {
      this.cacheObject[key] = value
    }
    if (this.db !== undefined && persist) {
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
    if (this.store !== undefined) {
      const idb = await openIDB(this.store)
      this.db = new Database(idb)
    }
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
