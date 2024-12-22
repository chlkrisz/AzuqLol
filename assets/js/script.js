//----- Overlay ------//
const xd = document.querySelector('.xd');
xd.addEventListener('click', () => {
    xd.style.opacity = '0';
    audioBtn.click();
    setTimeout(() => {
    xd.style.display = 'none';
    }, 500);
});

//----- Lanyard -----//
(async () => {
    const lanyard = await fetch('https://api.lanyard.rest/v1/users/619220119805100033')
    .then((res) => res.json())
    .catch(() => null);

    if (!lanyard || !lanyard.data) return;
    
    const profilePic = `https://cdn.discordapp.com/avatars/${lanyard.data.discord_user.id}/${lanyard.data.discord_user.avatar}.webp?size=512`;
    document.querySelector('.profile img').src = profilePic;

    const status = lanyard.data.discord_status;
    document.querySelector('.status').classList.add(status);

    const username = lanyard.data.discord_user.username;
    document.querySelector('.username').textContent = username;

    let subtext = '';
    
    const customStatus = lanyard.data.activities.find(activity => activity.type === 4);
    if(customStatus) subtext = (customStatus.emoji ? customStatus.emoji.name + ' ' : '') + customStatus.state + "<br>";

    if (lanyard.data.listening_to_spotify) {
      subtext = 'Listening to <b>Spotify</b>';
    } 
    else {
      const playingActivity = lanyard.data.activities.find(activity => activity.type === 0);

      if (playingActivity) {
        subtext += `Playing <b>${playingActivity.name}</b>`;
      } else if(!customStatus) {
        subtext += status === 'dnd' ? 'Do Not Disturb' : status === 'idle' ? 'Idle' : status === 'online' ? 'Online' : 'Offline';
      }
    }

    document.querySelector('#subtext').innerHTML = subtext;
    twemoji.parse(document.body);
})();

//----- Window drag -----//
const dWin = document.querySelector('.window');
const header = dWin.querySelector('.window-header');
let dx = 0;
let dy = 0;
let mouseDown = false;

header.addEventListener('mousedown', (e) => {
    mouseDown = true;
    dx = e.clientX - dWin.offsetLeft;
    dy = e.clientY - dWin.offsetTop;
});

document.addEventListener('mouseup', () => {
    mouseDown = false;
});

document.addEventListener('mousemove', (e) => {
    if (!mouseDown) return;
    dWin.style.left = e.clientX - dx + 'px';
    dWin.style.top = e.clientY - dy + 'px';
});

//----- Confetti -----//
const confettiBtn = document.getElementById('confetti-btn');
confettiBtn.addEventListener('click', () => {
    confetti({
    particleCount: 200,
    spread: 300,
    origin: { y: 0.5 }
    });
});

//----- Audio + Visualizer -----//
const audio = document.querySelector('.audio');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 512;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

const source = audioCtx.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioCtx.destination);

const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function draw() {
    requestAnimationFrame(draw);
    
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];
    ctx.fillStyle = `rgba(255, 150, 255, .25)`;
    ctx.fillRect(x, canvas.height - barHeight * 3, barWidth, (i%2?barHeight * 3:0));
    x += barWidth;
    }
}
draw();

function resumeAudioContext() {
    if (audioCtx.state === 'suspended') {
    audioCtx.resume();
    }
}
document.addEventListener('click', resumeAudioContext, { once: true });

//--- Play/pause btn ---//
const audioBtn = document.getElementById('audio-btn');

audioBtn.addEventListener('click', () => {
    if (audio.paused) {
    audio.volume = 0.5; // nem akarok megsüketülni
    audio.play();
    audioBtn.innerHTML = "<i class='bx bx-pause'></i>";
    audioBtn.title = "Pause";
    } else {
    audio.pause();
    audioBtn.innerHTML = "<i class='bx bx-play'></i>";
    audioBtn.title = "Play";
    }
});