const { readAppInfo } = require("binary-vdf-2");
const { homedir, tmpdir } = require("os");
const fs = require ('fs');
const path = require("path");
const { spawn } = require('child_process');

(() => main())()

// allows passing games folder and appinfo.vdf file if steam is installed elsewhere
function getSteamPaths() {
    if(process.argv.length >= 4){
        return [process.argv[2], process.argv[3]];
    }
    
    const home = homedir();
    var paths = [".steam", ".steam/steam", ".steam/root", ".local/share/Steam"];
    const steamRoot = paths.map(p => path.join(home, p)).find(p => fs.existsSync(p));
    
    if(!steamRoot)
        return [null, null];
    
    return [path.join(steamRoot, "steam/steam/games"), path.join(steamRoot, "debian-installation/appcache/appinfo.vdf")];
}

async function main() {
    const [gamesDir, appInfo] = getSteamPaths();
    if(!gamesDir || !appInfo) {
        console.error("Failed to find steam path");
        return;
    }

    const data = await fs.createReadStream(appInfo);
    const vdf = await readAppInfo(data);

    for(var app of vdf) {
        const appId = app.entries.appid;
        const icon = app.entries?.common?.icon;
        const isLinux = app.entries?.common?.linuxclienticon != undefined;
        const iconHash = isLinux ? app.entries?.common?.linuxclienticon : app.entries?.common?.clienticon;
        const name = app.entries?.common?.name;
        if(!iconHash  || !icon || !name || !appId)
            continue;

        console.log(`Downloading icon for app ${name} - ${appId} - ${iconHash}`);

        let url = `http://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${icon}`;
        url += isLinux ? ".zip" : ".jpg";
        
        const imageRequest = await fetch(url);
        const imageData = imageRequest.body;
        const outputFile = path.join(isLinux ? gamesDir : tmpdir(), iconHash + ".ico")

        const filestream = fs.createWriteStream(outputFile);
        imageData.pipeTo(new WritableStream({
            write: (chunk) => filestream.write(chunk),
            close: () => {
                if(!isLinux)
                    spawn('convert', [outputFile, path.join(gamesDir, iconHash + ".ico")]);
            }
        }));
    }
}