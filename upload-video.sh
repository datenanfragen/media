#!/bin/bash

# Adapted after: https://www.exoscale.com/syslog/self-hosted-videos/
# Run this inside the directory with the generated video files and pass the video ID as the only argument.
while read extension mime; do
  s3cmd --no-preserve -F -P --skip-existing \
        --mime-type=${mime} \
        --encoding=UTF-8 \
        --exclude=* --include=*.${extension} \
    sync . s3://datenanfragen-media/videos/$1/
done <<EOF
m3u8  application/vnd.apple.mpegurl
jpg   image/jpeg
mp4   video/mp4
ts    video/mp2t
EOF
