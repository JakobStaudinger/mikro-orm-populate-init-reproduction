import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

export class Database {
  private instance!: MongoMemoryServer;
  private connection!: MongoClient;
  private db!: Db;
  private uri!: string;

  public async setup() {
    this.instance = new MongoMemoryServer({
      instance: { dbName: 'Test', storageEngine: 'ephemeralForTest' }
    });
    await this.instance.ensureInstance();
    this.uri = this.instance.getUri();
    this.connection = await MongoClient.connect(this.uri, {
      useUnifiedTopology: true
    });
    this.db = this.connection.db('Test');
  }

  public getUri() {
    return this.uri;
  }

  public async stop() {
    await this.connection.close();
    await this.instance.stop();
  }

  public async clear() {
    const collections = await this.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }

  public async insertData(collectionData: { [collection: string]: any[] }) {
    const collections = Object.keys(collectionData);
    for (const collection of collections) {
      await this.db
        .collection(collection)
        .insertMany(collectionData[collection]);
    }
  }
}
