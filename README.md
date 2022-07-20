# ncmpcpp-lyrics

Add lyrics to your music library. Compatible with ncmpcpp music player, an mpd client.

## Installation

Use [npm](https://www.npmjs.com/) to install ncmpcpp-lyrics.

```bash
npm install -g ncmpcpp-lyrics
```

## Documentation

Run `ncmpcpp-lyrics --help` to see the [help](https://github.com/thewebmasterp/ncmpcpp-lyrics/blob/main/help.txt) menu that will provide you with all you need to know in order to use or modify this little CLI tool.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Below I've listed an example possible roadmap for further development of ncmpcpp-lyrics if there's any demand.

### TODO:
1. Implement a capability to read title and author from mp3's ID3 tags, rather than only from the filename. 
2. Implement a more configurable way of guessing author and title from the filename.
3. Add support for other music players (which if implemented, may change the name of the package). My guess is that to do so, lyrics, rather than being saved in txt files on an external folder, can be embedded via UNSYNCEDLYRICS or another appropriate for the music player ID3 tag of the mp3 file.

## License
[MIT](https://choosealicense.com/licenses/mit/)
