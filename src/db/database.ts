/* eslint-disable promise/avoid-new */
/* eslint-disable prefer-promise-reject-errors */
class Database {
  private readonly store = 'store'

  public constructor(private readonly db: IDBDatabase) {}

  private async getItem(
    transaction: IDBTransaction,
    name: string,
    key: IDBValidKey
  ): Promise<unknown> {
    const promise = new Promise<unknown>((resolve, reject) => {
      const objectStore = transaction.objectStore(name)
      const request = objectStore.get(key)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.addEventListener('error', () => {
        reject(Error('Transaction error!'))
      })
    })
    return await promise
  }

  private async addItem(
    transaction: IDBTransaction,
    name: string,
    value: unknown,
    key: IDBValidKey
  ) {
    const promise = new Promise<boolean>((resolve, reject) => {
      const objectStore = transaction.objectStore(name)
      const request = objectStore.put(value, key)

      request.onsuccess = () => {
        resolve(true)
      }

      request.addEventListener('error', () => {
        reject(Error('Transaction error!'))
      })
    })
    return await promise
  }

  public async loadByPath(key: IDBValidKey): Promise<unknown> {
    const transaction = this.db.transaction(this.store, 'readonly')
    return await this.getItem(transaction, this.store, key)
  }

  public async saveByPath(v: unknown, key: IDBValidKey) {
    const transaction = this.db.transaction(this.store)
    return await this.addItem(transaction, this.store, v, key)
  }

  public async open() {
    const load = async () => {
      const openp = new Promise((resolve, reject) => {
        const orequest = window.indexedDB.open(this.store, 1)
        orequest.addEventListener('upgradeneeded', () => {
          const db = orequest.result
          db.createObjectStore('store')
        })
        orequest.addEventListener('blocked', () => {
          reject('Error creating Database!')
        })
        orequest.addEventListener('error', () => {
          reject('Error creating Database!')
        })
        orequest.addEventListener('success', () => {
          resolve(true)
        })
      })
      await openp
    }
    await load()
  }
}

export default Database
