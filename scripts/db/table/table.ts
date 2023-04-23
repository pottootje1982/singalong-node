import { Db } from "mongodb";

export default class Table {
  db: Db;
  tableName: string;

  constructor(db: Db, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  public table() {
    return this.db.collection(this.tableName);
  }

  remove(query) {
    return this.table().deleteOne(query);
  }

  find(query = null) {
    return this.table().find(query).toArray();
  }

  findOneAndUpdate(query, item, upsert = false) {
    return this.table().findOneAndUpdate(
      query,
      { $set: item },
      {
        upsert,
      }
    );
  }

  all() {
    return this.table().find().toArray();
  }
}
