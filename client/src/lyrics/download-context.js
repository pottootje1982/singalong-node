import React, { useState, createContext, useContext, useEffect, useCallback } from 'react'
import PlaylistContext from '../playlist/playlist-context'
import ServerContext from '../server-context'
import { Track } from "../track"

const DownloadContext = createContext()
const sleepTime = 7000

export default DownloadContext

export function DownloadProvider(props) {
    const [sites, setSites] = useState(JSON.parse(window.localStorage.getItem('sites')) || [])
    const [isDownloading, setIsDownloading] = useState(false)
    const [tracksToDownload, setTracksToDownload] = useState([])
    const { server } = useContext(ServerContext)
    const [trackIdToDownload, setTrackIdToDownload] = useState()
    const { setTrack } = useContext(PlaylistContext)

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    function isCancelled() {
        if (!isDownloading) {
            setTrackIdToDownload(null)
        }
        return !isDownloading
    }

    const downloadTrack = useCallback((track, { save = true, sleepTime = 0, getCached = false } = {}) => {
        const activeSites = sites.filter(s => !s.disabled).map(s => s.key)
        return server()
            .post("api/lyrics/download", {
                track,
                getCached,
                sleepTime,
                save,
                sites: activeSites
            })
            .then(({ data: { lyrics } }) => {
                if (lyrics) {
                    setTrack(Track.copy({ ...track, lyrics }))
                    return lyrics
                }
            })
    }, [server, setTrack, sites])

    function popTrackAndDownload() {
        const toDownload = tracksToDownload[0]
        if (!toDownload) return
        setTrackIdToDownload(toDownload.id)
        console.log(`Waiting for ${sleepTime / 1000} seconds`)
        sleep(trackIdToDownload ? sleepTime : 0).then(() => {
            if (isCancelled()) return
            const tail = tracksToDownload.slice(1)
            downloadTrack(toDownload, { getCached: true }).then(() => {
                if (isCancelled()) return
                if (isDownloading && tail.length > 0) setTracksToDownload(tail)
                else setTrackIdToDownload(null)
            })
        })
    }

    function stopDownloading() {
        setIsDownloading(false)
        setTrackIdToDownload(null)
        setTracksToDownload([])
    }

    function downloadTracks(tracks) {
        setIsDownloading(true)
        setTracksToDownload(tracks.filter((track) => !track.lyrics))
    }

    useEffect(popTrackAndDownload, [tracksToDownload, downloadTrack])

    const mergeSites = (oldSites, sites) => sites.map(s => ({ ...s, disabled: oldSites.find(os => os.name === s.name)?.disabled }))

    useEffect(() => {
        server().get('api/lyrics/sites').then(({ data: { sites = [] } = {} }) => setSites(oldSites => mergeSites(oldSites, sites)))
    }, [server])

    useEffect(() => window.localStorage.setItem('sites', JSON.stringify(sites)), [sites])

    const values = {
        downloadTrack, downloadTracks, stopDownloading, isDownloading, sites, setSites, trackIdToDownload
    }

    return (
        <DownloadContext.Provider value={values}>
            {props.children}
        </DownloadContext.Provider>
    )
}
