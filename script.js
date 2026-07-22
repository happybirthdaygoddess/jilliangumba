const letterBtn = document.getElementById("letterBtn");
const letterPopup = document.getElementById("letterPopup");
const closeLetterBtn = document.getElementById("closeLetterBtn");

const winScreen = document.getElementById("winScreen");
const closeWinBtn = document.getElementById("closeWinBtn");
const restartBtn = document.getElementById("restartBtn");

const memoryGrid = document.getElementById("memoryGrid");
const movesText = document.getElementById("moves");
const timerText = document.getElementById("timer");
const pairsText = document.getElementById("pairs");
const resetGameBtn = document.getElementById("resetGameBtn");

const finalMoves = document.getElementById("finalMoves");
const finalTime = document.getElementById("finalTime");
const confettiContainer = document.getElementById("confettiContainer");

const bgMusic = document.getElementById("bgMusic");
const albumArt = document.getElementById("albumArt");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");

const playPauseBtn = document.getElementById("playPauseBtn");
const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");

const progressSlider = document.getElementById("progressSlider");
const currentTimeText = document.getElementById("currentTime");
const durationText = document.getElementById("duration");

const muteBtn = document.getElementById("muteBtn");
const volumeSlider = document.getElementById("volumeSlider");

const playingIndicator = document.getElementById("playingIndicator");
const playlistSongs = document.querySelectorAll(".playlist-song");
const playlistCount = document.getElementById("playlistCount");

const memoryImages = [
    "images/jillian1.jpg",
    "images/jillian2.jpg",
    "images/jillian3.jpg",
    "images/jillian4.jpg",
    "images/jillian5.jpg",
    "images/jillian6.jpg",
    "images/jillian7.jpg",
    "images/jillian8.jpg"
];

const songs = Array.from(playlistSongs).map((songButton) => {
    return {
        src: songButton.dataset.src,
        title: songButton.dataset.title,
        artist: songButton.dataset.artist,
        cover: songButton.dataset.cover
    };
});

let cards = [];
let firstCard = null;
let secondCard = null;
let boardLocked = false;

let moves = 0;
let matchedPairs = 0;
let elapsedSeconds = 0;
let timerInterval = null;
let timerStarted = false;

let currentSongIndex = 0;
let previousVolume = 0.5;

function openPopup(popup) {
    popup.classList.add("show");
    document.body.classList.add("popup-open");
}

function closePopup(popup) {
    popup.classList.remove("show");

    const anyPopupOpen = document.querySelector(".popup-overlay.show");

    if (!anyPopupOpen) {
        document.body.classList.remove("popup-open");
    }
}

letterBtn.addEventListener("click", () => {
    openPopup(letterPopup);
});

closeLetterBtn.addEventListener("click", () => {
    closePopup(letterPopup);
});

closeWinBtn.addEventListener("click", () => {
    closePopup(winScreen);
});

letterPopup.addEventListener("click", (event) => {
    if (event.target === letterPopup) {
        closePopup(letterPopup);
    }
});

winScreen.addEventListener("click", (event) => {
    if (event.target === winScreen) {
        closePopup(winScreen);
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
        return;
    }

    if (letterPopup.classList.contains("show")) {
        closePopup(letterPopup);
    }

    if (winScreen.classList.contains("show")) {
        closePopup(winScreen);
    }
});

function shuffleArray(array) {
    const shuffledArray = [...array];

    for (let index = shuffledArray.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));

        [shuffledArray[index], shuffledArray[randomIndex]] = [
            shuffledArray[randomIndex],
            shuffledArray[index]
        ];
    }

    return shuffledArray;
}

function createGameCards() {
    const duplicatedImages = [...memoryImages, ...memoryImages];

    cards = shuffleArray(
        duplicatedImages.map((image, index) => {
            return {
                id: index,
                image
            };
        })
    );

    memoryGrid.innerHTML = "";

    cards.forEach((cardData) => {
        const card = document.createElement("button");

        card.className = "memory-card";
        card.type = "button";
        card.dataset.image = cardData.image;
        card.setAttribute("aria-label", "Hidden memory card");

        card.innerHTML = `
            <span class="memory-card-inner">
                <span class="memory-card-front"></span>

                <span class="memory-card-back">
                    <img
                        src="${cardData.image}"
                        alt="Memory photo"
                        draggable="false"
                    >
                </span>
            </span>
        `;

        card.addEventListener("click", () => {
            flipCard(card);
        });

        memoryGrid.appendChild(card);
    });
}

function flipCard(card) {
    if (boardLocked) {
        return;
    }

    if (card === firstCard) {
        return;
    }

    if (card.classList.contains("matched")) {
        return;
    }

    if (card.classList.contains("flipped")) {
        return;
    }

    startTimer();

    card.classList.add("flipped");
    card.setAttribute("aria-label", "Revealed memory card");

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    boardLocked = true;
    moves += 1;

    updateGameStats();
    checkCards();
}

function checkCards() {
    const isMatch = firstCard.dataset.image === secondCard.dataset.image;

    if (isMatch) {
        handleMatch();
    } else {
        handleMismatch();
    }
}

function handleMatch() {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    firstCard.disabled = true;
    secondCard.disabled = true;

    matchedPairs += 1;
    updateGameStats();

    resetSelectedCards();

    if (matchedPairs === memoryImages.length) {
        setTimeout(() => {
            finishGame();
        }, 650);
    }
}

function handleMismatch() {
    setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");

        firstCard.setAttribute("aria-label", "Hidden memory card");
        secondCard.setAttribute("aria-label", "Hidden memory card");

        resetSelectedCards();
    }, 850);
}

function resetSelectedCards() {
    firstCard = null;
    secondCard = null;
    boardLocked = false;
}

function updateGameStats() {
    movesText.textContent = moves;
    pairsText.textContent = `${matchedPairs} / ${memoryImages.length}`;
}

function startTimer() {
    if (timerStarted) {
        return;
    }

    timerStarted = true;

    timerInterval = setInterval(() => {
        elapsedSeconds += 1;
        timerText.textContent = formatGameTime(elapsedSeconds);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerStarted = false;
}

function formatGameTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
}

function resetGame() {
    stopTimer();

    moves = 0;
    matchedPairs = 0;
    elapsedSeconds = 0;

    firstCard = null;
    secondCard = null;
    boardLocked = false;

    movesText.textContent = "0";
    timerText.textContent = "00:00";
    pairsText.textContent = `0 / ${memoryImages.length}`;

    closePopup(winScreen);
    createGameCards();
}

function finishGame() {
    stopTimer();

    finalMoves.textContent = moves;
    finalTime.textContent = formatGameTime(elapsedSeconds);

    openPopup(winScreen);
    createConfetti();
}

resetGameBtn.addEventListener("click", resetGame);
restartBtn.addEventListener("click", resetGame);

function createConfetti() {
    confettiContainer.innerHTML = "";

    const colors = [
        "#ff69a9",
        "#ffb8d5",
        "#ffd5e7",
        "#ffffff",
        "#e94d8e",
        "#ffc5dc"
    ];

    for (let index = 0; index < 90; index++) {
        const confettiPiece = document.createElement("span");

        confettiPiece.className = "confetti-piece";
        confettiPiece.style.left = `${Math.random() * 100}%`;
        confettiPiece.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];

        confettiPiece.style.width = `${6 + Math.random() * 7}px`;
        confettiPiece.style.height = `${9 + Math.random() * 12}px`;
        confettiPiece.style.animationDuration = `${2.8 + Math.random() * 2.4}s`;
        confettiPiece.style.animationDelay = `${Math.random() * 0.8}s`;
        confettiPiece.style.transform = `rotate(${Math.random() * 360}deg)`;

        confettiContainer.appendChild(confettiPiece);
    }

    setTimeout(() => {
        confettiContainer.innerHTML = "";
    }, 6500);
}

function loadSong(index, autoplay = false) {
    if (songs.length === 0) {
        return;
    }

    currentSongIndex = index;

    if (currentSongIndex < 0) {
        currentSongIndex = songs.length - 1;
    }

    if (currentSongIndex >= songs.length) {
        currentSongIndex = 0;
    }

    const selectedSong = songs[currentSongIndex];

    bgMusic.src = selectedSong.src;
    albumArt.src = selectedSong.cover;
    songTitle.textContent = selectedSong.title;
    songArtist.textContent = selectedSong.artist;

    currentTimeText.textContent = "0:00";
    durationText.textContent = "0:00";
    progressSlider.value = 0;
    updateSliderProgress(progressSlider);

    playlistSongs.forEach((songButton, indexValue) => {
        const icon = songButton.querySelector(".playlist-play-icon");

        songButton.classList.toggle(
            "active",
            indexValue === currentSongIndex
        );

        if (icon) {
            icon.textContent =
                indexValue === currentSongIndex &&
                !bgMusic.paused
                    ? "❚❚"
                    : "▶";
        }
    });

    bgMusic.load();

    if (autoplay) {
        playMusic();
    }
}

async function playMusic() {
    try {
        await bgMusic.play();

        playPauseBtn.textContent = "❚❚";
        playPauseBtn.setAttribute("aria-label", "Pause music");
        playingIndicator.classList.add("active");

        updatePlaylistIcons();
    } catch (error) {
        playPauseBtn.textContent = "▶";
        playPauseBtn.setAttribute("aria-label", "Play music");
        playingIndicator.classList.remove("active");

        console.error("Music could not play:", error);
    }
}

function pauseMusic() {
    bgMusic.pause();

    playPauseBtn.textContent = "▶";
    playPauseBtn.setAttribute("aria-label", "Play music");
    playingIndicator.classList.remove("active");

    updatePlaylistIcons();
}

function toggleMusic() {
    if (bgMusic.paused) {
        playMusic();
    } else {
        pauseMusic();
    }
}

function playPreviousSong() {
    loadSong(currentSongIndex - 1, true);
}

function playNextSong() {
    loadSong(currentSongIndex + 1, true);
}

function updatePlaylistIcons() {
    playlistSongs.forEach((songButton, index) => {
        const icon = songButton.querySelector(".playlist-play-icon");

        if (!icon) {
            return;
        }

        if (index === currentSongIndex && !bgMusic.paused) {
            icon.textContent = "❚❚";
        } else {
            icon.textContent = "▶";
        }
    });
}

function formatMusicTime(seconds) {
    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function updateSongProgress() {
    if (!Number.isFinite(bgMusic.duration) || bgMusic.duration <= 0) {
        return;
    }

    const progress = (bgMusic.currentTime / bgMusic.duration) * 100;

    progressSlider.value = progress;
    currentTimeText.textContent = formatMusicTime(bgMusic.currentTime);
    durationText.textContent = formatMusicTime(bgMusic.duration);

    updateSliderProgress(progressSlider);
}

function seekSong() {
    if (!Number.isFinite(bgMusic.duration) || bgMusic.duration <= 0) {
        return;
    }

    const selectedProgress = Number(progressSlider.value);
    bgMusic.currentTime = (selectedProgress / 100) * bgMusic.duration;

    updateSliderProgress(progressSlider);
}

function updateSliderProgress(slider) {
    const minimum = Number(slider.min) || 0;
    const maximum = Number(slider.max) || 100;
    const value = Number(slider.value);

    const percentage =
        ((value - minimum) / (maximum - minimum)) * 100;

    slider.style.setProperty(
        "--slider-progress",
        `${percentage}%`
    );
}

function updateVolume() {
    const selectedVolume = Number(volumeSlider.value);

    bgMusic.volume = selectedVolume;
    bgMusic.muted = selectedVolume === 0;

    if (selectedVolume > 0) {
        previousVolume = selectedVolume;
    }

    updateVolumeIcon();
    updateSliderProgress(volumeSlider);
}

function toggleMute() {
    if (bgMusic.muted || bgMusic.volume === 0) {
        bgMusic.muted = false;

        const restoredVolume =
            previousVolume > 0 ? previousVolume : 0.5;

        bgMusic.volume = restoredVolume;
        volumeSlider.value = restoredVolume;
    } else {
        previousVolume = bgMusic.volume;
        bgMusic.muted = true;
        volumeSlider.value = 0;
    }

    updateVolumeIcon();
    updateSliderProgress(volumeSlider);
}

function updateVolumeIcon() {
    if (bgMusic.muted || bgMusic.volume === 0) {
        muteBtn.textContent = "🔇";
        muteBtn.setAttribute("aria-label", "Unmute music");
        return;
    }

    if (bgMusic.volume < 0.5) {
        muteBtn.textContent = "🔉";
    } else {
        muteBtn.textContent = "🔊";
    }

    muteBtn.setAttribute("aria-label", "Mute music");
}

playPauseBtn.addEventListener("click", toggleMusic);
previousBtn.addEventListener("click", playPreviousSong);
nextBtn.addEventListener("click", playNextSong);

progressSlider.addEventListener("input", seekSong);
volumeSlider.addEventListener("input", updateVolume);
muteBtn.addEventListener("click", toggleMute);

playlistSongs.forEach((songButton, index) => {
    songButton.addEventListener("click", () => {
        if (currentSongIndex === index) {
            toggleMusic();
            return;
        }

        loadSong(index, true);
    });
});

bgMusic.addEventListener("loadedmetadata", () => {
    durationText.textContent = formatMusicTime(bgMusic.duration);
});

bgMusic.addEventListener("timeupdate", updateSongProgress);

bgMusic.addEventListener("play", () => {
    playPauseBtn.textContent = "❚❚";
    playingIndicator.classList.add("active");
    updatePlaylistIcons();
});

bgMusic.addEventListener("pause", () => {
    playPauseBtn.textContent = "▶";
    playingIndicator.classList.remove("active");
    updatePlaylistIcons();
});

bgMusic.addEventListener("ended", playNextSong);

bgMusic.addEventListener("error", () => {
    pauseMusic();
    currentTimeText.textContent = "0:00";
    durationText.textContent = "0:00";

    console.error(
        `Unable to load music file: ${songs[currentSongIndex]?.src}`
    );
});

albumArt.addEventListener("error", () => {
    albumArt.src = "images/profile.jpg";
});

document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("dragstart", (event) => {
        event.preventDefault();
    });
});

playlistCount.textContent = `${songs.length} ${
    songs.length === 1 ? "song" : "songs"
}`;

bgMusic.volume = Number(volumeSlider.value);

updateSliderProgress(progressSlider);
updateSliderProgress(volumeSlider);
updateVolumeIcon();
createGameCards();
loadSong(0, false);