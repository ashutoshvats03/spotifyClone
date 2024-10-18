var selected = null;
let currentAudio = null;
let folders = [];
let songs = [];
let currentSongIndex = 0;

async function getFolder() {
    let a = await fetch("/");
    console.log(a);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.includes("album")) {
            folders.push(element.href);
        }
    }
    return folders;
}

async function getSongs(url) {
    let response = await fetch(`${url}/`);
    let htmlContent = await response.text();
    let div = document.createElement("div");
    div.innerHTML = htmlContent;

    let as = div.getElementsByTagName("a");
    let songList = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songList.push(element.href);
        }
    }

    console.log(songList);
    return songList;
}

async function main() {
    let folders = await getFolder();
    console.log(folders);

    for (const folder of folders) {
        const albumContainer = document.querySelector(".songList");
        console.log(folder);

        let response = await fetch(`${folder}/`);
        let htmlContent = await response.text();

        let div = document.createElement("div");
        div.innerHTML = htmlContent;

        let jsonURL = "";
        let data;
        let img;

        let as = div.getElementsByTagName("a");
        for (let i = 0; i < as.length; i++) {
            const element = as[i];
            if (element.href.endsWith(".json")) {
                jsonURL = element.href;
                let response = await fetch(jsonURL);
                data = await response.json();
            }
            if (element.href.endsWith(".jpg")) {
                img = element.href;
            }
        }

        let albumPhoto = document.createElement("img");
        albumPhoto.style.width = "120px";
        albumPhoto.style.height = "120px";
        albumPhoto.src = img;

        let albumName = document.createElement("div");
        albumName.className = "albumName";
        albumName.textContent = data.AlbumName;

        let albumDescription = document.createElement("div");
        albumDescription.className = "albumDescription";
        albumDescription.textContent = data.Description;

        let album = document.createElement("div");
        album.className = "album";
        album.appendChild(albumPhoto);
        album.appendChild(albumName);
        album.appendChild(albumDescription);

        albumContainer.appendChild(album);

        album.addEventListener("click", async () => {
            document.querySelectorAll(".album").forEach(e => e.style.backgroundColor = "#323232");
            album.style.backgroundColor = "rgb(21,21,21)";


            pause.firstChild.src = "pause.svg";

            selected = folder;
            if (!selected) {
                console.error("Selected folder is undefined:", selected);
                return;
            }

            songs = await getSongs(selected);
            currentSongIndex = 0;
            playMusic(songs[currentSongIndex], true);
            document.querySelector(".duration").innerHTML = '00:00';

            if (document.querySelector(".songs")) {
                document.querySelector(".songs").remove();
            }

            const songList = document.createElement("div");
            songList.className = "songs";

            for (const song of songs) {
                const songN = song.replaceAll("%20", " ").replace("/", "").split("-")[0].split("Telegram/")[1];
                const songA = song.replaceAll("%20", " ").replace("/", "").replace(".mp3", "").split("-")[1];


                

                const songBlock = document.createElement("div");
                songBlock.className = "song";

                const photoBlock = document.createElement("img");
                photoBlock.className = "photo";
                photoBlock.src = "song.svg";
                photoBlock.style.width = "48px";
                photoBlock.style.height = "48px";

                const infoBlock = document.createElement("div");
                infoBlock.className = "info";
                const songNameDiv = document.createElement("div");
                songNameDiv.textContent = songN;
                const songArtistDiv = document.createElement("div");
                songArtistDiv.textContent = songA;
                infoBlock.appendChild(songNameDiv);
                infoBlock.appendChild(songArtistDiv);

                songBlock.appendChild(photoBlock);
                songBlock.appendChild(infoBlock);

                songList.appendChild(songBlock);
                document.querySelector(".down").appendChild(songList);

                songBlock.addEventListener("click", () => {
                    document.querySelectorAll(".song").forEach(s => s.style.backgroundColor = "rgb(21,21,21)");
                    songBlock.style.backgroundColor = "#323232";

                    if (currentAudio) {
                        currentAudio.pause();
                        currentAudio.currentTime = 0;
                    }

                    currentSongIndex = songs.indexOf(song);
                    playMusic(song, true);
                    currentAudio.play();
                    pause.firstChild.src = "pause.svg";
                });
            }
        });
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function playMusic(song, flag = false) {
    if (!song) {
        console.error("Undefined song:", song);
        return;
    }
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    currentAudio = new Audio();
    currentAudio.src = song;

    if (flag === true) {
        currentAudio.play().catch(error => {
            console.error("Playback interrupted:", error);
        });
    }

    document.querySelector(".songName").lastElementChild.innerHTML = song.replaceAll("%20", " ").replace("/", "").replace(".mp3", "").split("-")[1];
    document.querySelector(".songName").firstElementChild.src = "song.svg";
    document.querySelector(".songName").firstElementChild.style.width = "45px";
    document.querySelector(".songName").firstElementChild.style.height = "45px";

    currentAudio.addEventListener("timeupdate", () => {
        document.querySelector(".duration").innerHTML = formatTime(currentAudio.currentTime) + "/" + formatTime(currentAudio.duration);
        document.querySelector(".ball").style.left = Math.floor((currentAudio.currentTime / currentAudio.duration) * 100) + "%";
    });
}

// Ensure event listeners for controls are added only once
function addControlEventListeners() {
    document.querySelector("#pause").addEventListener("click", () => {
        if (currentAudio.paused) {
            currentAudio.play().catch(error => {
                console.error("Playback interrupted:", error);
            });
            pause.firstChild.src = "pause.svg";
        } else {
            currentAudio.pause();
            pause.firstChild.src = "playbtn.svg";
        }
    });

    document.querySelector("#prev").addEventListener("click", () => {
        if (currentSongIndex > 0) {
            currentSongIndex--;
            console.log(songs)
            playMusic(songs[currentSongIndex], true);
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        if (currentSongIndex < songs.length - 1) {
            currentSongIndex++;
            playMusic(songs[currentSongIndex], true);
        }
    });

    document.querySelector("#hamburger").addEventListener("click", () => {
        document.querySelector('.left').style.left = '0%';
    });

    document.querySelector("#cross").addEventListener("click", () => {
        document.querySelector('.left').style.left = '-120%';
    });

    document.querySelector(".sliding").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".ball").style.left = percent + "%";
        currentAudio.currentTime = (percent * currentAudio.duration) / 100;
    });
}


addControlEventListeners();


main();
