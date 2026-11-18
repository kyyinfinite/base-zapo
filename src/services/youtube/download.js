//proxy pihak ketiga, kalo down fitur play ikut mati
const BASE_URL = "https://fancy-sea-5d3d.holy-breeze-fec5.workers.dev/?m=i";

const HEADERS = {
    "accept": "*/*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "origin": "https://y2mate.gs",
    "priority": "u=1, i",
    "referer": "https://y2mate.gs/",
    "sec-ch-ua": '"Not=A?Brand";v="99", "Google Chrome";v="151", "Chromium";v="151"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
};

const LABELS = ["checking", "extracting", "converting", "completed"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function apiGet(url) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.status === 429) throw new Error("Rate limit (429)");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error > 0) throw new Error(`Error: ${data.error}`);
    return data;
}

async function pollProgress(progressURL, downloadURL, videoID, format, timeout = 60000) {
    const start = Date.now();
    let last = null;

    while (Date.now() - start < timeout) {
        const data = await apiGet(`${progressURL}&_=${Date.now()}`);
        if (data.progress !== last) {
            last = data.progress;
        }
        if (data.progress >= 3) {
            return { downloadURL, videoID, format, title: data.title };
        }
        await sleep(3000);
    }

    throw new Error("Polling timeout");
}

async function fetchConvert(videoID, format = 'mp3') {
    const url = `${BASE_URL}&v=${videoID}&f=${format}&_=${Date.now()}`;

    const data = await apiGet(url);

    if (data.status === "download") {
        return { downloadURL: data.downloadURL, videoID, format, title: data.title };
    }

    if (data.status === "progress") {
        return pollProgress(data.progressURL, data.downloadURL, videoID, format);
    }

    throw new Error(`Unknown status: ${data.status}`);
}

export { fetchConvert }
