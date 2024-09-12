let currentSong = new Audio();
let currFolder;
let taps = 0;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// Updating currFolder properly when a new folder is clicked
async function getSong(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let responce = await a.text();
  let div = document.createElement("div");
  div.innerHTML = responce;
  let as = div.getElementsByTagName("a");

  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songUl = document.querySelector(".songList ul");
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML += `
      <li data-song="${song}">
        <svg class="invert music" width="60" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="6.5" cy="18.5" r="3.5" stroke="#141B34" stroke-width="1.5"/>
          <circle cx="18" cy="16" r="3" stroke="#141B34" stroke-width="1.5"/>
          <path d="M10 18.5L10 7C10 6.07655 10 5.61483 10.2635 5.32794C10.5269 5.04106 11.0175 4.9992 11.9986 4.91549C16.022 4.57222 18.909 3.26005 20.3553 2.40978C20.6508 2.236 20.7986 2.14912 20.8993 2.20672C21 2.26432 21 2.4315 21 2.76587V16" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 10C15.8667 10 19.7778 7.66667 21 7" stroke="#141B34" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="info">
          <div class="songname">${song
            .replaceAll("%20", " ")
            .replace("(PagalWorld.com.sb)", " ")
            .replace("%E2%80%93 ", " ")
            .replace("Djjohal.fm.mp3", " ")}</div>
          <div class="artist">Unknown</div>
        </div>
        <div class="playNow">
          <span>Play Now</span>
          <svg class="invert" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        </div>
      </li>`;
  }

  // Attach event listener to play a song
  Array.from(document.querySelectorAll(".songList li")).forEach((e) => {
    e.addEventListener("click", (element) => {
      let songFileName = e.getAttribute("data-song");
      playMusic(songFileName);
      play.src = "pause.svg";
    });
  });

  return songs;
}

// Adding event listener to cards for switching folders
const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;

  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track).replace(
    "(PagalWorld.com.sb)",
    " "
  );

  document.querySelector(".songtimer").innerHTML = "00:00/00:00";
};

// Updating currFolder and triggering song list loading when a card is clicked
Array.from(document.getElementsByClassName("cards")).forEach((e) => {
  e.addEventListener("click", async (item) => {
    let folder = `songs/${item.currentTarget.dataset.folder}`;
    let songs = await getSong(folder);

    if (songs.length > 0) {
      currFolder = folder;
      playMusic(songs[0], false);
    }
  });
});

// Display all the albumbs on the screen

async function displayAlbumbs() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let responce = await a.text();
  let div = document.createElement("div");
  div.innerHTML = responce;
  let anchers = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchers);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];

      //Get the meta data of the folder
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let responce = await a.json();

      cardContainer.innerHTML =
        cardContainer.innerHTML +
        ` <div data-folder="${folder}" class="cards">
              <div class="play">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="black"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 20V4L19 12L5 20Z"
                    stroke="#141B34"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <img
                src="/songs/${folder}/cover.jpeg"
                alt=""
              />
              <h2>${responce.title}</h2>
              <p class="font">
               ${responce.description}
              </p>
            </div>`;
    }
  }
  // adding eventlistner for loading the card song when ever the card is clicked
  Array.from(document.getElementsByClassName("cards")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      let songs = await getSong(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}

async function main() {
  let songs = await getSong("songs/");
  playMusic(songs[0], true);

  // Display all the albumbs on the screen

  displayAlbumbs();

  //Attach an event listner for play song using play button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtimer").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";

    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //Add an event listner to click on hamburger and left box opens

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  // Add an event listner for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Eventlistner for previous song
  previous.addEventListener("click", () => {
    currentSong.pause();

    let currentSongFilename = currentSong.src.split("/").pop();
    let index = songs.indexOf(currentSongFilename);
    if (index > 0) {
      playMusic(songs[index - 1]);
    } else {
      console.log("No previous song available.");
    }
  });

  // Event listener for the next song
  next.addEventListener("click", () => {
    currentSong.pause();

    let currentSongFilename = currentSong.src.split("/").pop();

    let index = songs.indexOf(currentSongFilename);

    if (index !== -1 && index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      console.log("No next song available.");
    }
  });

  // Adding eventlistner for changing volume

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  // Add an function for changing the volume mute button

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (((e.target.src = "volume.svg"), taps == 0)) {
      e.target.src = "mute.svg";
      currentSong.volume = "0";
      taps = 1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else if (taps == 1) {
      e.target.src = "volume.svg";
      currentSong.volume = 0.1;
      taps = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0.1;
    }
  });
}

main();
