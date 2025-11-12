// Global variables
let playersData = [];
let filteredData = [];
let comparisonPlayers = [];
let charts = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initializeTheme();
    setupEventListeners();
    renderLeaderboard();
    updateStatistics();
    createCharts();
});

// Load CSV data
async function loadData() {
    try {
        const response = await fetch('data/final_standings.csv');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        
        playersData = lines.slice(1).map(line => {
            const values = line.split(',');
            return {
                rank: parseInt(values[0]),
                player: values[1],
                ratingMu: parseFloat(values[2]),
                ratingSigma: parseFloat(values[3]),
                wins: parseInt(values[4]),
                draws: parseInt(values[5]),
                losses: parseInt(values[6]),
                games: parseInt(values[7]),
                winRate: parseFloat(values[8])
            };
        }).filter(player => player.player);
        
        filteredData = [...playersData];
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading tournament data. Please ensure data/final_standings.csv exists.');
    }
}

// Initialize theme from localStorage
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

// Setup event listeners
function setupEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Sort
    document.getElementById('sortSelect').addEventListener('change', handleSort);
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Export
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    
    // Modal close
    const modal = document.getElementById('playerModal');
    const closeBtn = document.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Clear comparison
    document.getElementById('clearComparison').addEventListener('click', clearComparison);
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    filteredData = playersData.filter(player => 
        player.player.toLowerCase().includes(searchTerm)
    );
    renderLeaderboard();
    updateCharts();
}

// Handle sort
function handleSort(e) {
    const sortBy = e.target.value;
    filteredData.sort((a, b) => {
        switch(sortBy) {
            case 'rank':
                return a.rank - b.rank;
            case 'rating':
                return b.ratingMu - a.ratingMu;
            case 'winRate':
                return b.winRate - a.winRate;
            case 'wins':
                return b.wins - a.wins;
            case 'games':
                return b.games - a.games;
            default:
                return a.rank - b.rank;
        }
    });
    renderLeaderboard();
}

// Render leaderboard
function renderLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    
    filteredData.forEach(player => {
        const row = document.createElement('tr');
        const rankClass = player.rank === 1 ? 'gold' : player.rank === 2 ? 'silver' : player.rank === 3 ? 'bronze' : '';
        
        row.innerHTML = `
            <td><span class="rank-badge ${rankClass}">${player.rank}</span></td>
            <td><span class="player-name" onclick="showPlayerDetail('${player.player}')">${player.player}</span></td>
            <td>${player.ratingMu.toFixed(2)}</td>
            <td>${player.ratingSigma.toFixed(2)}</td>
            <td>${player.wins}</td>
            <td>${player.draws}</td>
            <td>${player.losses}</td>
            <td>${player.games}</td>
            <td>
                <div class="win-rate-bar">
                    <div class="win-rate-fill" style="width: ${player.winRate * 100}%"></div>
                </div>
                ${(player.winRate * 100).toFixed(1)}%
            </td>
            <td>
                <button class="btn-small btn-view" onclick="showPlayerDetail('${player.player}')">View</button>
                <button class="btn-small btn-compare" onclick="addToComparison('${player.player}')">Compare</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update statistics
function updateStatistics() {
    const totalPlayers = playersData.length;
    const avgRating = playersData.reduce((sum, p) => sum + p.ratingMu, 0) / totalPlayers;
    const avgWinRate = playersData.reduce((sum, p) => sum + p.winRate, 0) / totalPlayers;
    const totalGames = playersData.reduce((sum, p) => sum + p.games, 0);
    
    document.getElementById('totalPlayers').textContent = totalPlayers;
    document.getElementById('avgRating').textContent = avgRating.toFixed(2);
    document.getElementById('avgWinRate').textContent = (avgWinRate * 100).toFixed(1) + '%';
    document.getElementById('totalGames').textContent = totalGames;
}

// Create charts
function createCharts() {
    createWinRateChart();
    createRatingChart();
    createGameStatsChart();
    createRatingWinRateChart();
}

// Win Rate Distribution Chart
function createWinRateChart() {
    const ctx = document.getElementById('winRateChart').getContext('2d');
    const winRates = filteredData.map(p => p.winRate * 100);
    const bins = [0, 20, 40, 60, 80, 100];
    const binCounts = new Array(bins.length - 1).fill(0);
    
    winRates.forEach(rate => {
        for (let i = 0; i < bins.length - 1; i++) {
            if (rate >= bins[i] && (i === bins.length - 2 ? rate <= bins[i + 1] : rate < bins[i + 1])) {
                binCounts[i]++;
                break;
            }
        }
    });
    
    if (charts.winRate) charts.winRate.destroy();
    
    charts.winRate = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bins.slice(0, -1).map((bin, i) => `${bin}-${bins[i + 1]}%`),
            datasets: [{
                label: 'Number of Players',
                data: binCounts,
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3b82f6',
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-hover').trim() || '#2563eb',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Rating Distribution Chart
function createRatingChart() {
    const ctx = document.getElementById('ratingChart').getContext('2d');
    const ratings = filteredData.map(p => p.ratingMu);
    const bins = [0, 10, 15, 20, 25, 30, 35, 40, 50];
    const binCounts = new Array(bins.length - 1).fill(0);
    
    ratings.forEach(rating => {
        for (let i = 0; i < bins.length - 1; i++) {
            if (rating >= bins[i] && (i === bins.length - 2 ? rating <= bins[i + 1] : rating < bins[i + 1])) {
                binCounts[i]++;
                break;
            }
        }
    });
    
    if (charts.rating) charts.rating.destroy();
    
    charts.rating = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bins.slice(0, -1).map((bin, i) => `${bin}-${bins[i + 1]}`),
            datasets: [{
                label: 'Number of Players',
                data: binCounts,
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--success').trim() || '#10b981',
                borderColor: '#059669',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Game Statistics Chart
function createGameStatsChart() {
    const ctx = document.getElementById('gameStatsChart').getContext('2d');
    const totalWins = filteredData.reduce((sum, p) => sum + p.wins, 0);
    const totalDraws = filteredData.reduce((sum, p) => sum + p.draws, 0);
    const totalLosses = filteredData.reduce((sum, p) => sum + p.losses, 0);
    
    if (charts.gameStats) charts.gameStats.destroy();
    
    charts.gameStats = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Wins', 'Draws', 'Losses'],
            datasets: [{
                data: [totalWins, totalDraws, totalLosses],
                backgroundColor: [
                    getComputedStyle(document.documentElement).getPropertyValue('--success').trim() || '#10b981',
                    getComputedStyle(document.documentElement).getPropertyValue('--warning').trim() || '#f59e0b',
                    getComputedStyle(document.documentElement).getPropertyValue('--danger').trim() || '#ef4444'
                ],
                borderWidth: 2,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim() || '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Rating vs Win Rate Chart
function createRatingWinRateChart() {
    const ctx = document.getElementById('ratingWinRateChart').getContext('2d');
    const data = filteredData.map(p => ({
        x: p.ratingMu,
        y: p.winRate * 100
    }));
    
    if (charts.ratingWinRate) charts.ratingWinRate.destroy();
    
    charts.ratingWinRate = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Players',
                data: data,
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3b82f6',
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-hover').trim() || '#2563eb',
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const player = filteredData[context.dataIndex];
                            return `${player.player}: Rating ${player.ratingMu.toFixed(2)}, Win Rate ${(player.winRate * 100).toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Rating (μ)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Win Rate (%)'
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

// Update charts when data changes
function updateCharts() {
    createCharts();
}

// Show player detail modal
function showPlayerDetail(playerName) {
    const player = playersData.find(p => p.player === playerName);
    if (!player) return;
    
    const modal = document.getElementById('playerModal');
    const content = document.getElementById('playerDetailContent');
    
    content.innerHTML = `
        <div class="player-detail">
            <h2>${player.player}</h2>
            <div class="detail-stat">
                <span class="detail-stat-label">Rank:</span>
                <span class="detail-stat-value">#${player.rank}</span>
            </div>
            <div class="detail-stat">
                <span class="detail-stat-label">Rating (μ):</span>
                <span class="detail-stat-value">${player.ratingMu.toFixed(2)}</span>
            </div>
            <div class="detail-stat">
                <span class="detail-stat-label">Rating (σ):</span>
                <span class="detail-stat-value">${player.ratingSigma.toFixed(2)}</span>
            </div>
            <div class="detail-stat">
                <span class="detail-stat-label">Wins:</span>
                <span class="detail-stat-value">${player.wins}</span>
            </div>
            <div class="detail-stat">
                <span class="detail-stat-label">Draws:</span>
                <span class="detail-stat-value">${player.draws}</span>
            </div>
            <div class="detail-stat">
                <span class="detail-stat-label">Losses:</span>
                <span class="detail-stat-value">${player.losses}</span>
            </div>
            <div class="detail-stat">
                <span class="detail-stat-label">Total Games:</span>
                <span class="detail-stat-value">${player.games}</span>
            </div>
            <div class="detail-stat">
                <span class="detail-stat-label">Win Rate:</span>
                <span class="detail-stat-value">${(player.winRate * 100).toFixed(1)}%</span>
            </div>
            <div style="margin-top: 1.5rem;">
                <button class="btn-small btn-compare" onclick="addToComparison('${player.player}'); document.getElementById('playerModal').style.display='none';">
                    Add to Comparison
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Add player to comparison
function addToComparison(playerName) {
    const player = playersData.find(p => p.player === playerName);
    if (!player) return;
    
    if (comparisonPlayers.find(p => p.player === playerName)) {
        alert('Player already in comparison');
        return;
    }
    
    if (comparisonPlayers.length >= 3) {
        alert('Maximum 3 players can be compared at once');
        return;
    }
    
    comparisonPlayers.push(player);
    renderComparison();
}

// Render comparison
function renderComparison() {
    const section = document.getElementById('comparisonSection');
    const content = document.getElementById('comparisonContent');
    
    if (comparisonPlayers.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    
    let html = '<div class="comparison-grid">';
    comparisonPlayers.forEach(player => {
        html += `
            <div class="comparison-card">
                <h3>${player.player}</h3>
                <div class="comparison-stat">
                    <span>Rank:</span>
                    <span>#${player.rank}</span>
                </div>
                <div class="comparison-stat">
                    <span>Rating (μ):</span>
                    <span>${player.ratingMu.toFixed(2)}</span>
                </div>
                <div class="comparison-stat">
                    <span>Rating (σ):</span>
                    <span>${player.ratingSigma.toFixed(2)}</span>
                </div>
                <div class="comparison-stat">
                    <span>Wins:</span>
                    <span>${player.wins}</span>
                </div>
                <div class="comparison-stat">
                    <span>Draws:</span>
                    <span>${player.draws}</span>
                </div>
                <div class="comparison-stat">
                    <span>Losses:</span>
                    <span>${player.losses}</span>
                </div>
                <div class="comparison-stat">
                    <span>Games:</span>
                    <span>${player.games}</span>
                </div>
                <div class="comparison-stat">
                    <span>Win Rate:</span>
                    <span>${(player.winRate * 100).toFixed(1)}%</span>
                </div>
                <button class="btn-small" style="margin-top: 1rem; background: var(--danger); color: white;" onclick="removeFromComparison('${player.player}')">
                    Remove
                </button>
            </div>
        `;
    });
    html += '</div>';
    content.innerHTML = html;
}

// Remove player from comparison
function removeFromComparison(playerName) {
    comparisonPlayers = comparisonPlayers.filter(p => p.player !== playerName);
    renderComparison();
}

// Clear comparison
function clearComparison() {
    comparisonPlayers = [];
    renderComparison();
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    updateCharts(); // Update charts to reflect new theme colors
}

// Update theme icon
function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Export to CSV
function exportToCSV() {
    const headers = ['Rank', 'Player', 'Rating_Mu', 'Rating_Sigma', 'Wins', 'Draws', 'Losses', 'Games', 'Win_Rate'];
    const rows = filteredData.map(p => [
        p.rank,
        p.player,
        p.ratingMu.toFixed(2),
        p.ratingSigma.toFixed(2),
        p.wins,
        p.draws,
        p.losses,
        p.games,
        p.winRate.toFixed(3)
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tournament_results.csv';
    a.click();
    URL.revokeObjectURL(url);
}
