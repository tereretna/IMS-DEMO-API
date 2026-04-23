
const API_KEY = "AIzaSyCkHJTlTBKj1UKti3KEeCTi9YVU9oOKrlg"; 

async function mulaiPencarian() {
    const query = document.getElementById('keyword').value;
    const lang = document.getElementById('lang').value;
    const dur = document.getElementById('dur').value;
    const display = document.getElementById('video-display');

    // Validasi input
    if(!query) {
        alert("Topik belajarnya diisi dulu ya!");
        return;
    }

    display.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Mencari video tutorial terbaik...</p>";

    try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${query}&relevanceLanguage=${lang}&videoDuration=${dur}&type=video&key=${API_KEY}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        if(searchData.error) throw new Error(searchData.error.message);

        // Ekstrak ID video untuk kebutuhan tahap berikutnya
        const videoIds = searchData.items.map(item => item.id.videoId).join(',');

        const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoIds}&key=${API_KEY}`;
        const detailResponse = await fetch(detailUrl);
        const detailData = await detailResponse.json();

        display.innerHTML = ""; // Bersihkan teks loading

        detailData.items.forEach(video => {
            const views = parseInt(video.statistics.viewCount || 0);
            const likes = parseInt(video.statistics.likeCount || 0);
            const comments = parseInt(video.statistics.commentCount || 0);
            const isHD = video.contentDetails.definition === "hd";
            
            // Aturan Kurasi: Views > 500 dan harus HD
            const isGood = (views > 500 && isHD);
            const badgeStyle = isGood ? 'color: #27ae60; border-color: #27ae60;' : 'color: #e67e22; border-color: #e67e22;';
            const badgeText = isGood ? '✅ LOLOS KURASI' : '⚠️ KURANG DISARANKAN';

            // Menyusun elemen kartu video
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
                        <div class="verdict" style="${badgeStyle}">${badgeText}</div>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        display.innerHTML = `<p style="color:red; grid-column: 1/-1;">Error: ${err.message}</p>`;
    }
}

// Fungsi untuk membuka modal pemutar video
function bukaVideo(id) {
    document.getElementById('modal').style.display = "block";
    const playerDiv = document.getElementById('player');
    playerDiv.innerHTML = `<iframe width="100%" height="450" src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1" frameborder="0" allowfullscreen></iframe>`;
}

// Fungsi untuk menutup modal
function tutupVideo() {
    document.getElementById('modal').style.display = "none";
    document.getElementById('player').innerHTML = "";
}