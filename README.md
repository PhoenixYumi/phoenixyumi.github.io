<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RetroNebula's Manga Library Archive</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
    :root {
        --beige: #F5F5DC;
        --tan: #D2B48C;
        --oak: #8B4513;
        --deep-brown: #3E2723;
        --paper: #FDFBF7;
    }
    body {
        background-color: var(--paper);
        color: var(--deep-brown);
        font-family: 'Georgia', serif;
        margin: 0;
        padding: 0;
    }
    .library-card {
        background: #FFFFFF;
        border: 1px solid var(--tan);
        box-shadow: 0 2px 4px rgba(62, 39, 35, 0.05);
        border-radius: 0.5rem;
        transition: all 0.2s ease;
    }
    .library-card:hover {
        transform: translateY(-2px);
        border-color: var(--oak);
        box-shadow: 0 4px 8px rgba(62, 39, 35, 0.1);
    }
    .shelf-header {
        border-bottom: 3px solid var(--oak);
    }
    .status-pill {
        padding: 2px 8px;
        border-radius: 9999px;
        font-size: 0.7rem;
        font-weight: bold;
        text-transform: uppercase;
    }
    .ai-loading {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(139, 69, 19, 0.2);
        border-top-color: var(--oak);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    /* Scrollbar Styling for Library feel */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: var(--paper); }
    ::-webkit-scrollbar-thumb { background: var(--tan); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--oak); }
</style>
</head>
<body class="p-4">

<div class="max-w-5xl mx-auto">
    <!-- Header -->
    <header class="mb-6 pb-4 shelf-header flex justify-between items-end">
        <div>
            <h1 class="text-2xl md:text-3xl font-bold">RetroNebula's Archive</h1>
            <p class="text-xs italic text-gray-600">40 Titles Cataloged • ✨ AI Librarian Enabled</p>
        </div>
        <div class="hidden md:block text-right">
            <span class="text-[10px] uppercase tracking-widest opacity-50">Private Collection</span>
        </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        <!-- Left Column: Metrics & AI -->
        <aside class="md:col-span-4 space-y-6">
            <div class="bg-white p-4 rounded-lg border border-tan">
                <h2 class="text-sm font-bold mb-3 flex items-center">📊 Status Breakdown</h2>
                <div style="height: 180px;">
                    <canvas id="statusChart"></canvas>
                </div>
            </div>

            <div class="bg-[#F5F5DC] p-4 rounded-lg border border-tan">
                <h2 class="text-sm font-bold mb-2 flex items-center">✨ AI Librarian</h2>
                <div id="ai-chat-box" class="h-48 overflow-y-auto mb-3 text-xs space-y-2 p-2 bg-white/50 rounded border border-tan/30">
                    <div class="italic">Welcome back, RetroNebula. How can I assist with your archive today?</div>
                </div>
                <div class="flex gap-1">
                    <input type="text" id="aiInput" placeholder="Ask about your list..." class="flex-grow p-2 text-xs border border-tan rounded focus:outline-none">
                    <button onclick="sendToAI()" class="bg-[#8B4513] text-white px-3 py-1 rounded text-xs">✨</button>
                </div>
            </div>
        </aside>

        <!-- Right Column: The Catalog -->
        <main class="md:col-span-8">
            <div class="flex flex-wrap gap-2 mb-4">
                <input type="text" id="searchInput" placeholder="Filter titles..." class="flex-grow p-2 text-sm rounded border border-tan bg-white focus:outline-none">
                <select id="statusFilter" class="p-2 text-sm rounded border border-tan bg-white">
                    <option value="all">All</option>
                    <option value="reading">Reading</option>
                    <option value="read">Completed</option>
                    <option value="want to read">Plan</option>
                    <option value="stalled">On Hold</option>
                </select>
            </div>

            <div id="mangaGrid" class="grid grid-cols-1 sm:grid-cols-2 gap-3 h-[600px] overflow-y-auto pr-2">
                <!-- Cards injected here -->
            </div>
        </main>
    </div>
</div>

<!-- Simple Modal for AI Insights -->
<div id="modal" class="fixed inset-0 bg-black/40 hidden items-center justify-center p-4 z-50">
    <div class="bg-white max-w-sm w-full rounded border-2 border-oak shadow-xl p-5">
        <h3 id="modalTitle" class="font-bold border-b border-tan pb-2 mb-3">AI Insight</h3>
        <p id="modalBody" class="text-sm italic leading-relaxed"></p>
        <button onclick="closeModal()" class="mt-4 w-full bg-oak text-white py-1 rounded text-sm">Close</button>
    </div>
</div>

<script>
const apiKey = "";
const mangaData = [
    {name: "A Former Gangster Boss’s Possession...", status: "read", rating: 0, ch: 133},
    {name: "Our Home", status: "reading", rating: 0, ch: 2},
    {name: "Love Jinx", status: "reading", rating: 0, ch: 76},
    {name: "Back to School", status: "read", rating: 0, ch: 45},
    {name: "Opposites Attract", status: "read", rating: 0, ch: 93},
    {name: "Steel Under Silk", status: "reading", rating: 0, ch: 110},
    {name: "Even in Your Death", status: "reading", rating: 4.5, ch: 24},
    {name: "Pearl Boy: Ignite the Dawn", status: "reading", rating: 5.0, ch: 38},
    {name: "To Each His Own", status: "stalled", rating: 5.0, ch: 24},
    {name: "Honey Bear", status: "reading", rating: 5.0, ch: 88},
    {name: "The Serpent's Den", status: "want to read", rating: 0, ch: 0},
    {name: "Love Gym", status: "want to read", rating: 0, ch: 0},
    {name: "Perfectly Broken Love", status: "read", rating: 0, ch: 30},
    {name: "Love, Unauthorized", status: "reading", rating: 4.0, ch: 4},
    {name: "Ashita wa Docchi da!", status: "reading", rating: 5.0, ch: 49},
    {name: "FlashLight", status: "reading", rating: 0, ch: 64},
    {name: "DEAR. DOOR", status: "reading", rating: 0, ch: 163},
    {name: "Dog and Bird - Part 2", status: "read", rating: 0, ch: 32},
    {name: "Can't Think Straight", status: "reading", rating: 0, ch: 114},
    {name: "My Father-in-Law is My Wife", status: "want to read", rating: 0, ch: 0},
    {name: "Unauthorized Access!", status: "want to read", rating: 0, ch: 0},
    {name: "Gossip", status: "stalled", rating: 0, ch: 36},
    {name: "Antidote", status: "reading", rating: 0, ch: 77},
    {name: "Scandalous Wedding", status: "want to read", rating: 0, ch: 0},
    {name: "The Rogue Prince Is Secretly an Omega", status: "reading", rating: 0, ch: 42},
    {name: "Into the Rose Garden", status: "reading", rating: 0, ch: 73},
    {name: "Pearl Boy", status: "read", rating: 5.0, ch: 112},
    {name: "Max Mojave Case Files", status: "read", rating: 0, ch: 81},
    {name: "Banana Scandal", status: "read", rating: 0, ch: 65},
    {name: "The Beast of Bahal Never Misses its Prey", status: "reading", rating: 0, ch: 39},
    {name: "Blossoms of the White Night", status: "reading", rating: 5.0, ch: 20},
    {name: "Lunacy (Kie)", status: "reading", rating: 3.0, ch: 48},
    {name: "Okaeri Sankaku", status: "want to read", rating: 0, ch: 0},
    {name: "The Art of Sculpture", status: "reading", rating: 0, ch: 9},
    {name: "Our Sunny Days", status: "reading", rating: 0, ch: 77},
    {name: "When Pear Blossoms Bloom", status: "want to read", rating: 0, ch: 0},
    {name: "Fall for Me! (Iro)", status: "want to read", rating: 0, ch: 0},
    {name: "Gig of the Day", status: "reading", rating: 0, ch: 36},
    {name: "Love Me Not", status: "read", rating: 2.5, ch: 113},
    {name: "Itsuki to Haru", status: "want to read", rating: 0, ch: 0}
];

// AI Handling
async function callGemini(prompt, system) {
    let retries = 0;
    while (retries < 5) {
        try {
            const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    systemInstruction: { parts: [{ text: system }] }
                })
            });
            const data = await resp.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
        } catch (e) {
            retries++;
            await new Promise(r => setTimeout(r, Math.pow(2, retries) * 1000));
        }
    }
    return "Connection error.";
}

async function sendToAI() {
    const input = document.getElementById('aiInput');
    const msg = input.value.trim();
    if (!msg) return;
    
    const box = document.getElementById('ai-chat-box');
    box.innerHTML += `<div class="font-bold text-[#8B4513]">You: ${msg}</div>`;
    input.value = '';
    
    const context = mangaData.map(m => m.name).join(", ");
    const response = await callGemini(msg, `You are a manga librarian. Here is the user's collection: ${context}. Answer questions or give suggestions.`);
    box.innerHTML += `<div class="bg-white p-2 rounded border border-tan shadow-sm">${response}</div>`;
    box.scrollTop = box.scrollHeight;
}

async function getInsight(name) {
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
    document.getElementById('modalTitle').innerText = name;
    document.getElementById('modalBody').innerHTML = '<div class="ai-loading mx-auto"></div>';
    
    const res = await callGemini(`Briefly describe the manga "${name}".`, "Summarize manga titles briefly and accurately.");
    document.getElementById('modalBody').innerText = res;
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }

// UI Rendering
function getStatusClass(s) {
    if (s === 'reading') return 'bg-blue-100 text-blue-800';
    if (s === 'read') return 'bg-green-100 text-green-800';
    if (s === 'stalled') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-600';
}

function render(data) {
    const grid = document.getElementById('mangaGrid');
    grid.innerHTML = '';
    data.forEach(m => {
        const card = document.createElement('div');
        card.className = 'library-card p-3 flex flex-col justify-between h-32';
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-1">
                    <span class="status-pill ${getStatusClass(m.status)}">${m.status}</span>
                    <button onclick="getInsight('${m.name.replace(/'/g, "\\'")}')" class="text-[10px] text-oak font-bold uppercase tracking-tighter">✨ Insight</button>
                </div>
                <h3 class="font-bold text-sm leading-tight text-deep-brown">${m.name}</h3>
            </div>
            <div class="flex justify-between items-end text-[10px] text-gray-500 italic border-t border-beige pt-1">
                <span>Ch: ${m.ch}</span>
                <span class="text-yellow-600 font-bold">${m.rating > 0 ? '★ ' + m.rating : ''}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Init Chart
function initChart() {
    const counts = mangaData.reduce((acc, m) => { acc[m.status] = (acc[m.status] || 0) + 1; return acc; }, {});
    new Chart(document.getElementById('statusChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Reading', 'Read', 'Plan', 'Stalled'],
            datasets: [{
                data: [counts.reading, counts.read, counts['want to read'], counts.stalled],
                backgroundColor: ['#AAD9BB', '#80BCBD', '#F9F7C9', '#D5F0C1'],
                borderColor: '#3E2723',
                borderWidth: 1
            }]
        },
        options: { 
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10, family: 'Georgia' } } } }
        }
    });
}

// Listeners
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const stat = document.getElementById('statusFilter').value;
    render(mangaData.filter(m => m.name.toLowerCase().includes(term) && (stat === 'all' || m.status === stat)));
});

document.getElementById('statusFilter').addEventListener('change', (e) => {
    const stat = e.target.value;
    const term = document.getElementById('searchInput').value.toLowerCase();
    render(mangaData.filter(m => m.name.toLowerCase().includes(term) && (stat === 'all' || m.status === stat)));
});

window.onload = () => { render(mangaData); initChart(); };
</script>
</body>
</html>
