# media.datenanfragen.de

> This repository contains the source code and scripts for media.datenanfragen.de, our site for hosting videos.

## Adding a new video

**Requirements**: You need to download the [video2hls](https://github.com/vincentbernat/video2hls) script and place it in the repository's folder as `video2hls`. You also need [s3cmd](https://s3tools.org/s3cmd), configured for the Exoscale bucket we are using for this site. 

1. Place the video file in the `videos_input` directory.
2. In `videos.json`, add a new object of the following format to the array (the `subtitles` property is optional):

   ```json
   {
       "id": "19700101-my-slug",
       "title": "The video's title",
       "in_file": "197001010-my-slug.mp4",
       "subtitles": [
           {
               "lang": "en",
               "label": "English",
               "src": "https://static.dacdn.de/talks/subtitles/19700101-myslug-en.vtt"
           }
       ]
   }
   ```
3. Run `yarn update-site` to transcode the video (this will take a while depending on the video length), generate its embed page and deploy the site.
