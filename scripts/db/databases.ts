import LyricsTable from "./table/lyrics";
import CustomPlaylistTable from "./table/custom-playlists";
import PlaylistTable from "./table/playlists";
import LyricsDownloader from "../download";
import { MongoClient } from "mongodb";

export default async function createDb(client: MongoClient) {
  const db = client.db();
  const lyrics = new LyricsTable(db);
  const lyricsDownloader = new LyricsDownloader(lyrics);
  const customPlaylists = new CustomPlaylistTable(db);
  const playlists = new PlaylistTable(db);

  return { lyrics, lyricsDownloader, customPlaylists, playlists, client };
}
