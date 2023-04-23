const router = require("./router")();

import { SpotifyApi, createApi } from "../scripts/spotify";
import { Track } from "../client/src/track";

router.get("/", async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req);
  let { limit, offset } = req.query;
  limit = limit && parseInt(limit);
  offset = offset && parseInt(offset);
  const { playlists, hasMore } = await spotifyApi.getUserPlaylists({
    limit,
    offset,
  });
  const { playlists: table } = await res.locals.createDb();
  const result = await table.hydrate(playlists);
  res.json({ playlists: result, hasMore });
});

router.post("/custom", async (req, res) => {
  const spotifyApi = createApi(req);
  const owner = await spotifyApi.owner();
  const { tracksString, name } = req.body;
  const { customPlaylists } = await res.locals.createDb();
  const playlist = await customPlaylists.insert(owner, tracksString, name);
  res.json({ playlist });
});

router.put("/custom", async (req, res) => {
  const { tracksString, name, id } = req.body;
  const { customPlaylists } = await res.locals.createDb();
  const playlist = await customPlaylists.update(id, tracksString, name);
  res.json({ playlist });
});

router.get("/custom", async (req, res) => {
  const spotifyApi = createApi(req);
  const owner = await spotifyApi.owner();
  const { customPlaylists } = await res.locals.createDb();
  const playlists = await customPlaylists.get(owner);
  res.json({ playlists });
});

router.get("/:id/custom", async (req, res) => {
  const spotifyApi = createApi(req);
  const { customPlaylists, lyrics } = await res.locals.createDb();
  const owner = await spotifyApi.owner();
  const playlists = (await customPlaylists.get(owner, req.params.id)) || [];
  let { tracks } = playlists[0] || {};
  tracks = await lyrics.queryPlaylist((tracks || []).map(Track.copy));
  res.json({ tracks });
});

router.delete("/:id/custom", async (req, res) => {
  const { customPlaylists } = await res.locals.createDb();
  const found = await customPlaylists.remove(req.params.id);
  res.sendStatus(found.deletedCount > 1 ? 204 : 404);
});

router.get("/currently-playing", async (req, res) => {
  var spotifyApi: SpotifyApi = createApi(req);
  const playing = await spotifyApi.api.getMyCurrentPlayingTrack();
  let context = playing && playing.body.context;
  let uri =
    context && context.uri && !context.uri.includes("undefined") && context.uri;
  const track = playing.body && playing.body.item && playing.body.item.uri;
  uri = uri || track;
  res.json({
    uri: context ? context.uri : track,
    name: "Currently playing",
  });
});

router.get("/:uri", async (req, res) => {
  const { lyrics } = await res.locals.createDb();
  var spotifyApi: SpotifyApi = createApi(req);
  const { uri } = req.params;
  let { offset } = req.query;
  offset = offset && parseInt(offset);
  let { tracks, hasMore } = await spotifyApi.getPlaylistFromUri(uri, {
    offset,
  });
  tracks = await lyrics.queryPlaylist(tracks);
  res.json({ tracks, hasMore });
});

router.post("/:uri", async (req, res) => {
  const { playlists } = await res.locals.createDb();
  const { uri } = req.params;
  await playlists.update(uri, req.body);
  res.json({});
});

export default router.express();
