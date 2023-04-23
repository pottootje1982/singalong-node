import Table from "./table";
import { Db } from "mongodb";

export default class PlaylistTable extends Table {
  constructor(db: Db, tableName?: string) {
    super(db, tableName || "playlists");
  }

  async hydrate(playlists): Promise<any> {
    const meta = await this.all();
    return playlists.map((p) => {
      const found = meta.find((m) => m.uri === p.uri) || {};
      return { ...p, ...found };
    });
  }

  async update(uri: string, playlist): Promise<any> {
    await this.findOneAndUpdate({ uri }, playlist, true);
    return playlist;
  }
}
