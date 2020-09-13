const videos = require('./videos.json');
const dattel = require('dattel-client')({
    server_url: process.env.DATTEL_SERVER,
    auth_token: process.env.DATTEL_TOKEN,
});
const path = require('path');
const fs = require('fs-extra');
const child_process = require('child_process');

const VIDEOS_DIR = path.join(__dirname, 'videos');
const INPUT_VIDEOS_DIR = path.join(__dirname, 'videos_input');
const OUT_DIR = path.join(__dirname, 'public');
const BASE_URL = 'https://media.dacdn.de';

const TEMPLATE = (v) => `<!DOCTYPE html>
<html>
<head>
<title>${v.title} – media.datenanfragen.de</title>
<script src="https://static.dacdn.de/js/media/clappr.min.js"></script>
<script src="https://static.dacdn.de/js/media/clappr-stats.min.js"></script>
<script src="https://static.dacdn.de/js/media/clappr-nerd-stats.min.js"></script>
<script src="https://static.dacdn.de/js/media/clappr-playback-rate-plugin.min.js"></script>
<script src="https://static.dacdn.de/js/media/clappr-level-selector.min.js"></script>
<style>
* {
    margin: 0;
    padding: 0;
    border: 0;
}
#player {
    width: 100vw;
    height: 100vh;
}
.cc-controls[data-cc-controls] {
    display: block;
}
</style>
</head>
<body>
<div id="player"></div>
<script>
var player = new Clappr.Player({
    width: '100%',
    height: '100%',
    source: "${BASE_URL}/videos/${v.id}/index.m3u8",
    poster: '${BASE_URL}/videos/${v.id}/poster.jpg',
    playback: {
        crossOrigin: 'anonymous',
        ${v.subtitles ? 'externalTracks: ' + JSON.stringify(v.subtitles) + ',' : ''}
    },
    parentId: "#player",

    plugins: [
        PlaybackRatePlugin,
        ClapprNerdStats, ClapprStats,
        LevelSelector
    ],
    clapprStats: {
        onReport: function(){}
    },
    clapprNerdStats: {
        shortcut: ['command+shift+s', 'ctrl+shift+s'],
        iconPosition: 'none'
    },
    levelSelectorConfig: {
        labelCallback: function(playbackLevel, customLabel) {
            return playbackLevel.level.height + 'p';
        }
    },
    playbackRateConfig: {
        defaultValue: 1,
        options: [
            {value: 0.25, label: '0.25x'},
            {value: 0.5, label: '0.5x'},
            {value: 0.75, label: '0.75x'},
            {value: 1, label: '1x'},
            {value: 1.5, label: '1.5x'},
            {value: 1.75, label: '1.75x'},
            {value: 2, label: '2x'},
            {value: 2.5, label: '2.5x'},
        ],
    },
});
</script>
</body>
</html>`;

async function main() {
    fs.removeSync(OUT_DIR);
    fs.mkdirpSync(path.join(OUT_DIR, 'embed'));
    fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(OUT_DIR, 'index.html'));
    for (const v of videos) {
        const video_dir = path.join(VIDEOS_DIR, v.id);
        if (!fs.pathExistsSync(video_dir)) {
            console.log(`Transcoding and uploading new video ${v.id}…`);
            child_process.execFileSync(path.join(__dirname, 'video2hls'), [
                path.join(INPUT_VIDEOS_DIR, v.in_file),
                '--output',
                video_dir,
                '--hls-segment-prefix',
                `${BASE_URL}/videos/${v.id}/`,
                '--hls-playlist-prefix',
                `${BASE_URL}/videos/${v.id}/`,
            ]);
        }

        const content = TEMPLATE(v);
        fs.mkdirpSync(path.join(OUT_DIR, 'embed', v.id));
        fs.writeFileSync(path.join(OUT_DIR, 'embed', v.id, 'index.html'), content);

        child_process.execFileSync(path.join(__dirname, 'upload-video.sh'), [v.id], {
            cwd: video_dir,
        });
    }

    if (process.env.DATTEL_SERVER && process.env.DATTEL_TOKEN) {
        console.log('Deploying to dattel…');
        const site_id = 'dade-media';

        try {
            await dattel.cancelDeploy(site_id).catch((_) => {});
            const deploy_info = (await dattel.startDeploy(site_id)).data.deploy;
            await dattel.deployDirectory(site_id, deploy_info.id, deploy_info.files, path.join(__dirname, 'public'));
            await dattel.publishDeploy(site_id, deploy_info.id);
        } catch (err) {
            console.error(err);
        }
    } else {
        console.error('Environment variables DATTEL_SERVER and DATTEL_TOKEN are needed to deploy the site.');
    }
}

main();
