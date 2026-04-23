
const apiKeyInput = document.getElementById('api-key');
apiKeyInput.value = localStorage.getItem('yt_key_val') || '';

function togglePass() {
    apiKeyInput.type = apiKeyInput.type === "password" ? "text" : "password";
}

async function mulaiPencarian() {
    const key = apiKeyInput.value;
    const query = document.getElementById('keyword').value;
    const lang = document.getElementById('lang').value;
    const dur = document.getElementById('dur').value;
    const display = document.getElementById('video-display');

    if(!key || !query) {
        alert("API Key dan Keyword wajib diisi ya!");
        return;
    }

    localStorage.setItem('yt_key_val', key);
    display.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Sabar ya, lagi cari video...</p>";

    try {
        // Step 1: Cari Video
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${query}&relevanceLanguage=${lang}&videoDuration=${dur}&type=video&key=${key}`;
        const response1 = await fetch(searchUrl);
        const data1 = await response1.json();
        
        if(data1.error) throw new Error(data1.error.message);

        const ids = data1.items.map(item => item.id.videoId).join(',');

        // Step 2: Ambil Statistik
        const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${ids}&key=${key}`;
        const response2 = await fetch(detailUrl);
        const data2 = await response2.json();

        display.innerHTML = ""; 

        // Step 3: Tampilkan Kartu
        data2.items.forEach(video => {
            const views = parseInt(video.statistics.viewCount || 0);
            const likes = parseInt(video.statistics.likeCount || 0);
            const comments = parseInt(video.statistics.commentCount || 0);
            const isHD = video.contentDetails.definition === "hd";
            
            const isRecommended = (views > 500 && isHD);
            const styleBadge = isRecommended ? 'color: #27ae60; border-color: #27ae60;' : 'color: #e74c3c; border-color: #e74c3c;';
            const textBadge = isRecommended ? '✅ LAYAK DITONTON' : '⚠️ KURANG DISARANKAN';

            display.innerHTML += `
                <div class="card" onclick="bukaVideo('${video.id}')">
                    <img src="${video.snippet.thumbnails.medium.url}" alt="Thumbnail">
                    <div class="card-content">
                        <div class="title">${video.snippet.title}</div>
                        <div class="stats">
                            👁 <b>${views.toLocaleString()}</b> views<br>
                            👍 <b>${likes.toLocaleString()}</b> likes<br>
                            💬 <b>${comments.toLocaleString()}</b> komentar<br>
                            📺 Resolusi: <b>${isHD ? 'Full HD' : 'SD'}</b>
                        </div>
                        <div class="verdict" style="${styleBadge}">${textBadge}</div>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        display.innerHTML = `<p style="color:red; grid-column: 1/-1;">Waduh, ada error: ${err.message}</p>`;
    }
}

function bukaVideo(id) {
    document.getElementById('modal').style.display = "block";
    const playerDiv = document.getElementById('player');
    playerDiv.innerHTML = `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" frameborder="0" allowfullscreen></iframe>`;
}

function tutupVideo() {
    document.getElementById('modal').style.display = "none";
    document.getElementById('player').innerHTML = "";
}