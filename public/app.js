// =======================
// 1️⃣ المتغيرات الأساسية
// =======================
const video = document.getElementById('videoPlayer');
let allChannels = [];

// روابط البث السريع
const myLinks = {
    1: "http://185.226.172.11:8080/mo3ad/mo3ad1.m3u8",
    2: "http://185.226.172.11:8080/mo3ad/mo3ad2.m3u8",
    3: "http://185.226.172.11:8080/mo3ad/mo3ad3.m3u8",
    4: "http://185.226.172.11:8080/mo3ad/mo3ad4.m3u8"
};

// =======================
// 2️⃣ دوال تشغيل البث
// =======================
function playLink(id) {
    startStream(myLinks[id], "بث مباشر - قناة " + id);
}

function startStream(url, title) {
    document.getElementById('playingTitle').innerText = title;
    document.getElementById('playingUrl').innerText = url;

    if(Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(e => console.log("Auto-play blocked")));
    } else if(video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play();
    }

    if(window.innerWidth < 1024) window.scrollTo({top: 0, behavior: 'smooth'});
}

// =======================
// 3️⃣ دوال جلب وتحليل M3U
// =======================
async function fetchM3U(url) {
    if(!url) return;
    const loader = document.getElementById('loader');
    const listContainer = document.getElementById('channelsList');

    loader.style.display = 'block';
    listContainer.innerHTML = '';

    try {
        const response = await fetch(url);
        const data = await response.text();
        parseM3U(data);
    } catch(e) {
        alert("خطأ في جلب القنوات. قد يكون السبب قيود CORS.");
    } finally {
        loader.style.display = 'none';
    }
}

function parseM3U(content) {
    const lines = content.split('\n');
    allChannels = [];
    let currentChannel = {};

    lines.forEach(line => {
        line = line.trim();
        if(line.startsWith('#EXTINF:')) {
            const name = line.split(',')[1];
            const logoMatch = line.match(/tvg-logo="([^"]+)"/);
            currentChannel = {
                name: name || "قناة غير معروفة",
                logo: logoMatch ? logoMatch[1] : 'https://via.placeholder.com/50?text=TV'
            };
        } else if(line.startsWith('http')) {
            currentChannel.url = line;
            allChannels.push(currentChannel);
            currentChannel = {};
        }
    });

    displayChannels(allChannels);
}

function displayChannels(channels) {
    const listContainer = document.getElementById('channelsList');
    listContainer.innerHTML = channels.map(ch => `
        <div class="channel-item" onclick="startStream('${ch.url}', '${ch.name}')">
            <img src="${ch.logo}" onerror="this.src='https://via.placeholder.com/50?text=TV'">
            <div class="channel-name">${ch.name}</div>
        </div>
    `).join('');
}

function filterChannels() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    const filtered = allChannels.filter(ch => ch.name.toLowerCase().includes(query));
    displayChannels(filtered);
}

// =======================
// 4️⃣ دردشة محلية (Local Chat)
// =======================
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

chatInput.addEventListener('keypress', function(e){
    if(e.key === 'Enter' && chatInput.value.trim() !== '') {
        const msg = chatInput.value.trim();
        addMessage(msg, true);
        chatInput.value = '';
        // محاكاة رد تلقائي
        setTimeout(() => addMessage("🤖 مرحبا! هذه مجرد محاكاة للدردشة.", false), 500);
    }
});

function addMessage(msg, self = false) {
    const div = document.createElement('div');
    div.classList.add(self ? 'self' : 'bot');
    div.textContent = msg;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
