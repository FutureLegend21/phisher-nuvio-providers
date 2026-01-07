// HiAnime Scraper for Nuvio Local Scrapers

const cheerio = require('cheerio-without-node-native');

const HIANIME_APIS = [
    "https://hianimez.is",
    "https://hianimez.to",
    "https://hianime.nz",
    "https://hianime.bz",
    "https://hianime.pe"
];

const AJAX_HEADERS = {
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': 'https://hianime.to/',
    'User-Agent': 'Mozilla/5.0'
};

// ================= Megacloud Extractor =================

function extractMegacloud(embedUrl, effectiveType) {
    const mainUrl = 'https://megacloud.blog';

    const headers = {
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': mainUrl,
        'User-Agent': 'Mozilla/5.0'
    };

    return fetch(embedUrl, { headers })
        .then(r => r.ok ? r.text() : null)
        .then(page => {
            if (!page) return [];

            let nonce =
                page.match(/\b[a-zA-Z0-9]{48}\b/)?.[0] ??
                (() => {
                    const m = page.match(
                        /\b([a-zA-Z0-9]{16})\b.*?\b([a-zA-Z0-9]{16})\b.*?\b([a-zA-Z0-9]{16})\b/
                    );
                    return m ? m[1] + m[2] + m[3] : null;
                })();

            if (!nonce) return [];

            const id = embedUrl.split('/').pop().split('?')[0];
            const apiUrl = `${mainUrl}/embed-2/v3/e-1/getSources?id=${id}&_k=${nonce}`;

            return fetch(apiUrl, { headers })
                .then(r => r.ok ? r.json() : null)
                .then(json => {
                    if (!json?.sources?.length) return [];

                    const encoded = json.sources[0].file;

                    const buildResult = m3u8 => [{
                        url: m3u8,
                        type: effectiveType,
                        subtitles: (json.tracks || [])
                            .filter(t => t.kind === 'captions' || t.kind === 'subtitles')
                            .map(t => ({ label: t.label, url: t.file }))
                    }];

                    if (encoded.includes('.m3u8')) {
                        return buildResult(encoded);
                    }

                    return fetch(
                        'https://raw.githubusercontent.com/yogesh-hacker/MegacloudKeys/refs/heads/main/keys.json'
                    )
                        .then(r => r.ok ? r.json() : null)
                        .then(keys => {
                            const secret = keys?.mega;
                            if (!secret) return [];

                            const decodeUrl =
                                'https://script.google.com/macros/s/AKfycbxHbYHbrGMXYD2-bC-C43D3njIbU-wGiYQuJL61H4vyy6YVXkybMNNEPJNPPuZrD1gRVA/exec';

                            const fullUrl =
                                `${decodeUrl}?encrypted_data=${encodeURIComponent(encoded)}` +
                                `&nonce=${encodeURIComponent(nonce)}` +
                                `&secret=${encodeURIComponent(secret)}`;

                            return fetch(fullUrl)
                                .then(r => r.ok ? r.text() : null)
                                .then(txt => {
                                    const m3u8 = txt?.match(/"file":"(.*?)"/)?.[1];
                                    return m3u8 ? buildResult(m3u8) : [];
                                });
                        });
                });
        })
        .catch(() => []);
}

// ================= TMDB CONFIG =================

const TMDB_API_KEY = '439c478a771f35c05022f9feabcca01c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// ================= HELPERS =================

function fetchJsonWithTimeout(url, headers, timeoutMs = 10000) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    return fetch(url, { headers, signal: controller.signal })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
        .finally(() => clearTimeout(t));
}

function tmdbFetch(path) {
    const url = `${TMDB_BASE_URL}${path}?api_key=${TMDB_API_KEY}`;
    return fetch(url, {
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0'
        }
    }).then(r => {
        if (!r.ok) throw new Error(`TMDB ${r.status}`);
        return r.json();
    });
}

function getTMDBDetails(tmdbId, mediaType) {
    if (mediaType === 'movie') {
        return tmdbFetch(`/movie/${tmdbId}`).then(d => ({
            title: d.title,
            releaseDate: d.release_date ?? null,
            firstAirDate: null,
            year: d.release_date ? Number(d.release_date.split('-')[0]) : null
        }));
    }

    return tmdbFetch(`/tv/${tmdbId}`).then(d => ({
        title: d.name,
        releaseDate: d.first_air_date ?? null,
        firstAirDate: d.first_air_date ?? null,
        year: d.first_air_date ? Number(d.first_air_date.split('-')[0]) : null
    }));
}

function getTMDBSeasonAirDate(tmdbId, seasonNumber) {
    return tmdbFetch(`/tv/${tmdbId}/season/${seasonNumber}`)
        .then(d => d.air_date ?? null)
        .catch(() => null);
}

// ================= ANILIST / MAL =================

const ANILIST_API = 'https://graphql.anilist.co';

function getHiAnimeIdFromMalSync(malId) {
    return fetch(`https://api.malsync.moe/mal/anime/${malId}`)
        .then(r => r.ok ? r.json() : null)
        .then(json => {
            const zoro = json?.Sites?.Zoro;
            if (!zoro) return null;
            const entry = Object.values(zoro)[0];
            return entry?.identifier ?? null;
        })
        .catch(() => null);
}

// ================= ANILIST LOOKUP =================

function tmdbToAnimeId(title, year) {
    if (!title || !year) return Promise.resolve({ id: null, idMal: null });

    const query = `
        query ($search: String, $seasonYear: Int) {
          Page(perPage: 5) {
            media(
              search: $search
              seasonYear: $seasonYear
              type: ANIME
              format_in: [TV, ONA, MOVIE]
            ) {
              id
              idMal
            }
          }
        }
    `;

    return fetch(ANILIST_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query,
            variables: { search: title, seasonYear: year }
        })
    })
        .then(r => r.ok ? r.json() : null)
        .then(j => {
            const m = j?.data?.Page?.media?.[0];
            return { id: m?.id ?? null, idMal: m?.idMal ?? null };
        })
        .catch(() => ({ id: null, idMal: null }));
}

function convertTmdbToAnimeId(title, date, airedDate) {
    const primaryYear = date ? Number(date.split('-')[0]) : null;
    const airedYear = airedDate ? Number(airedDate.split('-')[0]) : null;

    return tmdbToAnimeId(title, primaryYear).then(ids => {
        if (!ids.id && airedYear && airedYear !== primaryYear) {
            return tmdbToAnimeId(title, airedYear);
        }
        return ids;
    });
}

// ================= Main Logic =================

function getStreams(tmdbId, mediaType = 'movie', season = null, episode = null) {
    return getTMDBDetails(tmdbId, mediaType)
        .then(mediaInfo => {
            const seasonPromise =
                mediaType === 'tv' && season && season > 1
                    ? getTMDBSeasonAirDate(tmdbId, season)
                    : Promise.resolve(mediaInfo.firstAirDate);

            return seasonPromise.then(airedDate => ({ mediaInfo, airedDate }));
        })
        .then(({ mediaInfo, airedDate }) => {
            const title =
                mediaType === 'tv' && season
                    ? `${mediaInfo.title} Season ${season}`
                    : mediaInfo.title;

            return convertTmdbToAnimeId(
                title,
                mediaType === 'tv' ? airedDate : mediaInfo.releaseDate,
                airedDate
            ).then(ids => ({ mediaInfo, airedDate, ids }));
        })
        .then(({ mediaInfo, airedDate, ids }) => {
            if (!ids.idMal) return [];

            return getHiAnimeIdFromMalSync(ids.idMal).then(hiAnimeId => {
                if (!hiAnimeId) return [];

                const episodeNumber = String(episode ?? 1);
                const apis = [...HIANIME_APIS].sort(() => Math.random() - 0.5);

                let chain = Promise.resolve([]);

                apis.forEach(api => {
                    chain = chain.then(result => {
                        if (result.length) return result;

                        return fetchJsonWithTimeout(
                            `${api}/ajax/v2/episode/list/${hiAnimeId}`,
                            AJAX_HEADERS
                        )
                            .then(listRes => {
                                if (!listRes?.html) return [];

                                const $ = cheerio.load(listRes.html);
                                const episodeId = $('div.ss-list a')
                                    .filter((_, el) => $(el).attr('data-number') === episodeNumber)
                                    .first()
                                    .attr('data-id');

                                if (!episodeId) return [];

                                return fetchJsonWithTimeout(
                                    `${api}/ajax/v2/episode/servers?episodeId=${episodeId}`,
                                    AJAX_HEADERS
                                ).then(serversRes => {
                                    if (!serversRes?.html) return [];

                                    const $$ = cheerio.load(serversRes.html);
                                    const servers = $$('div.item.server-item').map((_, el) => ({
                                        label: $$(el).text().trim(),
                                        serverId: $$(el).attr('data-id'),
                                        effectiveType:
                                            $$(el).attr('data-type') === 'raw'
                                                ? 'SUB'
                                                : $$(el).attr('data-type')?.toUpperCase()
                                    })).get();

                                    let streams = [];
                                    let serverChain = Promise.resolve();

                                    servers.forEach(server => {
                                        serverChain = serverChain.then(() => {
                                            if (!server.serverId) return;

                                            return fetchJsonWithTimeout(
                                                `${api}/ajax/v2/episode/sources?id=${server.serverId}`,
                                                AJAX_HEADERS
                                            ).then(src => {
                                                const embedUrl = src?.link;
                                                if (!embedUrl || !embedUrl.includes('megacloud')) return;

                                                return extractMegacloud(embedUrl, server.effectiveType)
                                                    .then(extracted => {
                                                        extracted.forEach(s => {
                                                            streams.push({
                                                                name: `⌜ HiAnime ⌟ | ${server.label.toUpperCase()} | ${s.type}`,
                                                                title:
                                                                    mediaType === 'tv'
                                                                        ? `${mediaInfo.title} S${String(season).padStart(2, '0')}E${String(episodeNumber).padStart(2, '0')}`
                                                                        : mediaInfo.title,
                                                                url: s.url,
                                                                quality: '1080p',
                                                                provider: 'HiAnime',
                                                                malId: ids.idMal,
                                                                type: s.type,
                                                                subtitles: s.subtitles
                                                            });
                                                        });
                                                    });
                                            });
                                        });
                                    });

                                    return serverChain.then(() => streams);
                                });
                            });
                    });
                });

                return chain;
            });
        })
        .catch(() => []);
}

// ================= EXPORT =================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getStreams };
} else {
    global.getStreams = { getStreams };
}
