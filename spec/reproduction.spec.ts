import { Entity, EntityManager, ManyToOne, MikroORM, OnInit, PrimaryKey, ReflectMetadataProvider, SerializedPrimaryKey } from '@mikro-orm/core';
import { ObjectId } from 'mongodb';

import { Database } from '../helpers/database';

const initSpy = jest.fn();

@Entity({ collection: 'parents' })
export class ParentEntity {
  @PrimaryKey()
  public readonly _id!: ObjectId;

  @SerializedPrimaryKey()
  public readonly id!: string;

  @OnInit()
  public onInit() {
    initSpy();
  }
}

@Entity({ collection: 'children' })
export class ChildEntity {
  @PrimaryKey()
  public readonly _id!: ObjectId;

  @SerializedPrimaryKey()
  public readonly id!: string;

  @ManyToOne(() => ParentEntity, { eager: true })
  public parent!: ParentEntity;
}

describe('reproduction', () => {
  const database = new Database();
  let mikroOrm: MikroORM;
  let entityManager: EntityManager;

  const parent = { _id: new ObjectId() };
  const child = { _id: new ObjectId(), parent: parent._id };
  
  beforeAll(async () => {
    await database.setup();
    mikroOrm = await MikroORM.init({
      clientUrl: database.getUri(),
      type: 'mongo',
      dbName: 'Test',
      entities: [ParentEntity, ChildEntity],
      metadataProvider: ReflectMetadataProvider
    });
    
    entityManager = mikroOrm.em;
  });

  beforeEach(async () => {
    await database.clear();
    await database.insertData({ parents: [parent], children: [child] })
    
    entityManager.clear();
    initSpy.mockClear();
  });
  
  afterAll(async () => {
    await mikroOrm.close();
    await database.stop();
  });

  it('should call init only once', async () => {
    await entityManager.findOne(ChildEntity, child._id);
    expect(initSpy).toHaveBeenCalledTimes(1);
  });

  it ('passes if the entity is already loaded', async () => {
    await entityManager.findOne(ParentEntity, parent._id);
    await entityManager.findOne(ChildEntity, child._id);
    expect(initSpy).toHaveBeenCalledTimes(1);
  });
});
