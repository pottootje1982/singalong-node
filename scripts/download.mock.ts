import {
  MusixMatchEngine,
  GeniusEngine,
  MetroLyricsEngine,
  AzLyricsEngine,
  LyricsFreakEngine,
} from './LyricsEngines'
const fs = require('fs')
const request = require('request-promise')

const writeTestData = false

async function doRequest(url: string) {
  const fn = `${url.match(/[^\/]+$/)}.html`
  const fullFile = `./scripts/LyricsEngines/testdata/${fn}`
  if (writeTestData) {
    const result = await request(url)
    fs.writeFileSync(fullFile, result)
    return result
  } else return fs.readFileSync(fullFile, 'utf8')
}

export class MusixMatchEngineMock extends MusixMatchEngine {
  protected request(url: string): Promise<string> {
    return doRequest(url)
  }
}

export class GeniusEngineMock extends GeniusEngine {
  protected request(url: string): Promise<string> {
    return doRequest(url)
  }
}

export class MetroLyricsEngineMock extends MetroLyricsEngine {
  protected request(url: string): Promise<string> {
    return doRequest(url)
  }
}

export class AzLyricsEngineMock extends AzLyricsEngine {
  protected request(url: string): Promise<string> {
    return doRequest(url)
  }
}

export class LyricsFreakEngineMock extends LyricsFreakEngine {
  protected request(url: string): Promise<string> {
    return doRequest(url)
  }
}
