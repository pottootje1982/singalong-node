const router = require("./router")();

import { createApi, saveToken, SpotifyApi } from "../scripts/spotify";
const fs = require("fs");

router.get("/", async (req, res) => {
  const spotifyApi = new SpotifyApi(req.headers.origin);
  const url = spotifyApi.getAuthorizeUrl();
  console.log("url", url);
  res.json(url);
});

router.get("/token", async (req, res) => {
  const spotifyApi = new SpotifyApi(req.headers.origin);
  const tokens = await spotifyApi.getToken(req.query.code);
  if (!process.env.NODE_ENV) {
    saveToken(tokens.access_token);
  }
  res.json(tokens);
});

router.get("/refresh", async (req, res) => {
  const spotifyApi = createApi(req);
  const tokens = await spotifyApi.refresh();
  res.json(tokens.data);
});

router.get("/me", async (req, res) => {
  const spotifyApi = createApi(req);
  const me = await spotifyApi.api.getMe();
  res.json(me);
});

export default router.express();
