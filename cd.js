/* ============================================================
   SHARED CD PLAYER — used on home.html, disc.html, games.html
   ------------------------------------------------------------
   - Home page CD click  -> plays everything (scope = "all")
   - Discography album click -> playScope(albumId) plays just
     that album's songs, and pops the CD to show it switched.
   - State (scope/queue/position/currentTime/isPlaying) is saved
     to localStorage so navigating between pages "resumes"
     instead of restarting from scratch.
   ------------------------------------------------------------
   DATABASE HOOK: fetchSongs() is the ONLY place that needs to
   change once MySQL is wired up. Replace its body with a real
   fetch() call, e.g.:

     async function fetchSongs(scope) {
       const res = await fetch(`/api/songs?scope=${scope}`);
       return res.json(); // [{ title, src }, ...]
     }

   Nothing else in this file has to change — every caller
   already awaits fetchSongs() as if it were a network call.
   ============================================================ */

const CD_STATIC_IMG = "assets/cd.png";
const CD_SPIN_IMG = "assets/cd.gif";
const STORAGE_KEY = "tubatu_player_state";

/* ---------------- mock "database" (swap out later) ---------------- */
const mockAlbums = [
    {
        id: "album-1",
        title: "Album One (placeholder)",
        songs: [
            { title: "Song 1", src: "assets/audio/placeholder-track-1.mp3" },
            { title: "Song 2", src: "assets/audio/placeholder-track-2.mp3" },
        ],
    },
    {
        id: "album-2",
        title: "Album Two (placeholder)",
        songs: [
            { title: "Song 3", src: "assets/audio/placeholder-track-3.mp3" },
            { title: "Song 4", src: "assets/audio/placeholder-track-4.mp3" },
        ],
    },
    {
        id: "album-3",
        title: "Album Three (placeholder)",
        songs: [
            { title: "Song 5", src: "assets/audio/placeholder-track-5.mp3" },
        ],
    },
];

async function fetchSongs(scope) {
    await new Promise((resolve) => setTimeout(resolve, 0)); // simulate async DB call
    if (scope === "all") {
        return mockAlbums.flatMap((album) => album.songs);
    }
    const album = mockAlbums.find((a) => a.id === scope);
    return album ? album.songs : [];
}

/* ---------------- shuffle ---------------- */
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/* ---------------- player state ---------------- */
let scope = "all";
let queue = [];
let position = 0;
let isPlaying = false;
let noteSpawnInterval = null;

const audio = new Audio();
audio.volume = 0.8;

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        scope,
        queue,
        position,
        currentTime: audio.currentTime,
        isPlaying,
    }));
}

function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function playCurrent() {
    if (!queue.length) return;
    audio.src = queue[position].src;
    audio.currentTime = 0;
    audio.play().catch((err) => console.warn("Playback was blocked:", err));
}

function playNext() {
    position++;
    if (position >= queue.length) {
        queue = shuffle(queue); // reshuffle once we loop back around
        position = 0;
    }
    playCurrent();
}

/** Switch what the CD is playing — "all" on the home page,
 *  or an album id (e.g. "album-1") from the discography page. */
async function playScope(newScope) {
    scope = newScope;
    const songs = await fetchSongs(scope);
    queue = shuffle(songs);
    position = 0;
    bounceCD();
    playCurrent();
}

function togglePlayback() {
    if (isPlaying) {
        audio.pause();
    } else if (queue.length) {
        audio.play().catch((err) => console.warn("Playback was blocked:", err));
    } else {
        playScope("all");
    }
}

function setSpinning(spinning) {
    const cdImg = document.getElementById("cd");
    if (!cdImg) return;
    cdImg.src = spinning ? CD_SPIN_IMG : CD_STATIC_IMG;
}

/* ---------------- "new album selected" pop animation ---------------- */
function bounceCD() {
    const cdImg = document.getElementById("cd");
    if (!cdImg) return;
    cdImg.classList.remove("cd-bounce");
    void cdImg.offsetWidth; // force reflow so the animation re-triggers on repeat clicks
    cdImg.classList.add("cd-bounce");
}

/* ---------------- floating musical notes ---------------- */
const NOTE_SYMBOLS = ["♪", "♫", "♩", "♬"];

function spawnNote() {
    const cdImg = document.getElementById("cd");
    if (!cdImg) return;

    const note = document.createElement("span");
    note.className = "cd-note";
    note.textContent = NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)];

    const rect = cdImg.getBoundingClientRect();
    note.style.left = `${rect.left + rect.width / 2 + (Math.random() * 40 - 20)}px`;
    note.style.top = `${rect.top + rect.height / 2}px`;
    note.style.setProperty("--drift", `${Math.random() * 60 - 30}px`);

    document.body.appendChild(note);
    note.addEventListener("animationend", () => note.remove());
}

function startNotes() {
    stopNotes();
    spawnNote();
    noteSpawnInterval = setInterval(spawnNote, 500);
}

function stopNotes() {
    if (noteSpawnInterval) {
        clearInterval(noteSpawnInterval);
        noteSpawnInterval = null;
    }
}

/* ---------------- audio events ---------------- */
audio.addEventListener("play", () => {
    isPlaying = true;
    setSpinning(true);
    startNotes();
    saveState();
});

audio.addEventListener("pause", () => {
    isPlaying = false;
    setSpinning(false);
    stopNotes();
    saveState();
});

audio.addEventListener("timeupdate", () => {
    // Save roughly every 2s instead of on every tick, to avoid hammering localStorage.
    if (Math.floor(audio.currentTime * 4) % 8 === 0) saveState();
});

audio.addEventListener("ended", playNext);

/* ---------------- runs on every page (home/disc/games) ---------------- */
document.addEventListener("DOMContentLoaded", () => {
    const cdImg = document.getElementById("cd");
    if (cdImg) {
        cdImg.addEventListener("click", () => {
            if (!queue.length) {
                playScope("all"); // first-ever click: nothing loaded yet
            } else {
                togglePlayback();
            }
        });
    }

    const saved = loadState();
    if (saved && saved.queue && saved.queue.length) {
        scope = saved.scope;
        queue = saved.queue;
        position = saved.position;
        audio.src = queue[position].src;
        audio.currentTime = saved.currentTime || 0;
        if (saved.isPlaying) {
            audio.play().catch(() => {
                // Browser blocked auto-resume on this page without a fresh click;
                // it'll just sit paused (CD static) until the user taps it again.
            });
        }
    }
});