import {
  MusixMatchEngine,
  GeniusEngine,
  MetroLyricsEngine,
  AzLyricsEngine,
  LyricsFreakEngine,
  ChartLyricsEngine,
} from "./LyricsEngines";
const fs = require("fs");
const request = require("request-promise");

const writeTestData = false;

async function doRequest(url: string) {
  let fn = `${url.match(/[^\/]+$/)}`;
  fn = fn.replace(/[/\\?*:|"<>]/g, "_");
  let fullFile = `./scripts/LyricsEngines/testdata/${fn}`;
  fullFile = fs.existsSync(`${fullFile}.json`)
    ? `${fullFile}.json`
    : `${fullFile}.html`;
  if (writeTestData) {
    const result = await request(url);
    fs.writeFileSync(fullFile, result);
    return result;
  } else return fs.readFileSync(fullFile, "utf8");
}

export class MusixMatchEngineMock extends MusixMatchEngine {
  protected request(url: string): Promise<string> {
    return doRequest(url);
  }
}

export class GeniusEngineMock extends GeniusEngine {
  protected request(url: string): Promise<string> {
    return doRequest(url);
  }
}

export class MetroLyricsEngineMock extends MetroLyricsEngine {
  protected request(url: string): Promise<string> {
    return doRequest(url);
  }
}

export class AzLyricsEngineMock extends AzLyricsEngine {
  protected request(url: string): Promise<string> {
    return doRequest(url);
  }
}

export class LyricsFreakEngineMock extends LyricsFreakEngine {
  protected request(url: string): Promise<string> {
    return doRequest(url);
  }
}

export class ChartLyricsEngineMock extends ChartLyricsEngine {
  protected request(url: string): Promise<string> {
    return doRequest(url);
  }
}
