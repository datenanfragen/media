# media.datenanfragen.de

> このリポジトリには、Datenanfragen.deWebサイトのソースコードが含まれています。

## 新しいビデオを追加する

**要件**：[video2hls]（https://github.com/vincentbernat/video2hls）スクリプトをダウンロードして、リポジトリのフォルダーに「video2hls」として配置する必要があります。 また、このサイトで使用しているExoscaleバケット用に構成された[s3cmd]（https://s3tools.org/s3cmd）も必要です。

1.ビデオファイルを `videos_input`ディレクトリに配置します。
2. `videos.json`で、次の形式の新しいオブジェクトを配列に追加します（` subtitles`プロパティはオプションです）。

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
3. `yarn update-site`を実行してビデオをトランスコードし（ビデオの長さによっては時間がかかります）、埋め込みページを生成してサイトをデプロイします。
