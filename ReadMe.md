# Steam Ico Fix
This fixes an issue where steam does not redownload the icon files after after reinstalling steam, causing desktop shortcuts to use the steam icon.

## Usage
First install the `imagemagick` package, [nodejs](https://nodejs.org/en) and the script dependencies
```
apt install imagemagick
git clone https://github.com/kodenamekrak/steam-ico-fix
cd steam-ico-fix
npm i
node .
```

If the script is unable to find your games directory and appinfo cache, they can be specified in command line arguments
```terminal
node . /path/to/games/folder /path/to/appinfo.vdf
```
