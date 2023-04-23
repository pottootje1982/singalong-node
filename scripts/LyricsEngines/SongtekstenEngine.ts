import { LyricsSearchEngine } from "./LyricsSearchEngine";

export class SongtekstenEngine extends LyricsSearchEngine {
  getHit(i: number) {
    return ".r>a";
  }

  constructor() {
    super("Songteksten", {
      domain: "https://www.songteksten.nl",
      searchQuery: "https://www.google.nl/search?q=songteksten.nl+",
      lyricsLocation: "p:first",
    });
  }

  protected getAttribute(hit) {
    return super.getQueryAttribute(hit);
  }
}
