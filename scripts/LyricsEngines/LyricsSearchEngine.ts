﻿import request = require('request-promise')
import cheerio = require('cheerio')
var validUrl = require('valid-url')

export function getQueryVariable(query, variable): string {
  query = query.match(/^[^\?]+\?(.*)/i)
  if (query.length <= 1) return null
  query = query[1]
  var vars = query.split('&')
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=')
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1])
    }
  }
  return null
}

export abstract class LyricsSearchEngine {
  private lyricsLocation: string
  private searchQuery: string
  private domain: string
  name: string
  textReplacements: Array<Array<any>>

  constructor(
    name: string,
    domain: string,
    searchQuery: string,
    lyricsLocation: string,
    textReplacements?: Array<Array<any>>
  ) {
    this.name = name
    this.domain = domain
    this.lyricsLocation = lyricsLocation
    this.searchQuery = searchQuery
    this.textReplacements = textReplacements || []
  }

  protected request(url: string): Promise<string> {
    return request(url)
  }

  // Download a file form a url.
  protected async downloadUrl(url: string): Promise<string> {
    var res = await this.request(url)
    var $ = cheerio.load(res)
    var lyrics = this.replaceInLyrics($)
    if (lyrics == null) return null
    var result = lyrics.text().trim()
    if (result === '') return null
    this.textReplacements.forEach((replacement) => {
      result = result.replace(replacement[0], replacement[1])
    })
    return result
  }

  private encode(str) {
    return encodeURIComponent(str.replace('&', '').replace(',', ''))
  }

  protected async searchSite(
    searchQuery: string,
    artist: string,
    title: string
  ) {
    return this.request(
      searchQuery + this.encode(artist) + '+' + this.encode(title)
    )
  }

  protected getSearchQuery(): string {
    return this.searchQuery
  }

  protected getDomain(): string {
    return this.domain
  }

  public async searchLyrics(artist: string, title: string): Promise<string> {
    var res = await this.searchSite(this.searchQuery, artist, title)
    var $ = cheerio.load(res)

    var firstHit = ''
    let i: number = 1
    while (!validUrl.isUri(firstHit) && firstHit != undefined) {
      firstHit = this.getAttribute($(this.getHit(i)))
      if (firstHit != null && firstHit.indexOf('http') === -1) {
        firstHit = this.domain + firstHit
      }
    }
    if (!validUrl.isUri(firstHit)) return null
    return await this.downloadUrl(firstHit)
  }

  protected abstract getHit(i: number)

  protected replaceInLyrics($) {
    return $(this.lyricsLocation)
  }

  protected getQueryAttribute(hit) {
    let href = hit.attr('href')
    let url = href == null ? null : getQueryVariable(href, 'q')
    return url
  }

  protected getAttribute(hit) {
    return hit.attr('href')
  }
}
