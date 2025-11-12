// Global variables
let playersData = [];
let filteredData = [];
let comparisonPlayers = [];
let charts = {};
let pinnedPlayer = null;
let currentSort = { column: 'rank', direction: 'asc' };
let playerConfigs = {}; // Store YAML configs for each player

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initializeTheme();
    loadPinnedPlayer();
    setupEventListeners();
    sortData();
    renderLeaderboard();
    updateStatistics();
    createCharts();
    // Load configs in background (non-blocking)
    loadPlayerConfigs().catch(err => console.warn('Error loading player configs:', err));
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
    const savedTheme = localStorage.getItem('theme') || 'kaggle';
    const savedDark = localStorage.getItem('darkMode') === 'true';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-dark', savedDark);
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = savedTheme;
    }
    updateThemeIcon(savedDark);
}

// Setup event listeners
function setupEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Sort dropdown
    document.getElementById('sortSelect').addEventListener('change', handleSortSelect);
    
    // Column header sorting - use event delegation
    document.addEventListener('click', (e) => {
        if (e.target.closest('th.sortable')) {
            const th = e.target.closest('th.sortable');
            const column = th.getAttribute('data-sort');
            if (column) {
                handleColumnSort(column);
            }
        }
    });
    
    // Theme selector
    document.getElementById('themeSelect').addEventListener('change', handleThemeChange);
    
    // Dark mode toggle
    document.getElementById('themeToggle').addEventListener('click', toggleDarkMode);
    
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
    sortData();
    renderLeaderboard();
    updateCharts();
}

// Load player configs from YAML files
async function loadPlayerConfigs() {
    const playerNames = playersData.map(p => p.player);
    
    for (const playerName of playerNames) {
        try {
            // Try to find matching YAML file
            const yamlFile = await findPlayerYAMLFile(playerName);
            if (yamlFile) {
                const response = await fetch(`data/prompt_collection/${yamlFile}`);
                const yamlText = await response.text();
                const config = jsyaml.load(yamlText);
                playerConfigs[playerName] = config;
            }
        } catch (error) {
            console.warn(`Could not load config for ${playerName}:`, error);
        }
    }
}

// Find YAML file for a player
async function findPlayerYAMLFile(playerName) {
    // Try exact match first
    const exactMatch = `${playerName}_*.yml`;
    const files = [
        `${playerName}_660111_25380863_config.yml`, // mutolovincent
        `${playerName}_722540_25372279_config-2.yml`, // aoorange
        `${playerName}_596718_25359060_config.yml`, // yujiehang
        `${playerName}_657484_25363213_config.yml`, // pengjinjun
        `${playerName}_737248_25349835_config-6.yml`, // yangganxiang
        `${playerName}_LATE_605475_25475845_yenaimeng_LATE_605475_25474277_config.yml`, // yenaimeng
        `${playerName}_733390_25385717_config.yml`, // shanzhihao
        `${playerName}_LATE_749142_25390122_config.yml`, // liuwenxuan
        `${playerName}_737988_25383356_config_v13.yml`, // agrawalom
        `${playerName}_742091_25384969_config.yml`, // schuettmaximilian
        `${playerName}_736563_25357709_config.yml`, // zhenggary
        `${playerName}_668422_25383613_config.yml`, // zhaoweiliang
        `${playerName}_736620_25345819_config.yml`, // wangarabella
        `${playerName}_602285_25348856_config.yml`, // enchristopher
        `${playerName}_732667_25376948_config.yml`, // zhutianlei
        `${playerName}_736533_25383342_config.yml`, // wangyuan
        `${playerName}_662534_25342365_config.yml`, // chenyufei
        `${playerName}_764261_25385794_config.yml`, // venkatanarayanannaveen
        `${playerName}_736587_25386131_config.yml`, // listeven
        `${playerName}_663610_25377311_congfig.yml`, // zhouevan
        `${playerName}_738330_25385663_config.yml`, // wangsherry
        `${playerName}_749038_25383022_config.yml`, // davidmatteo
        `${playerName}_733356_25370888_config.yml`, // sunclaire
        `${playerName}_LATE_736625_25402497_config.yml`, // fangyuan
        `${playerName}_749387_25381152_config.yml`, // niruichen
        `${playerName}_600639_25345415_config.yml`, // huangziyu
        `${playerName}_736540_25350835_config.yml`, // xiaoyue
        `${playerName}_666586_25359184_config.yml`, // zhangkarina
        `${playerName}_LATE_732701_25389500_config.yml`, // srivastavaaayush
        `${playerName}_412991_25379656_config.yml`, // zhangjingwen
        `${playerName}_736635_25292697_config.yml`, // wanganda
        `${playerName}_736383_25337304_config_1013.yml`, // zhuruby
        `${playerName}_806110_25385314_config.yml`, // singhsanjeevan
        `${playerName}_722218_25384298_config_JML.yml`, // lunamugicajose
        `${playerName}_LATE_721981_25391228_Config.yml`, // litvakron
        `${playerName}_742390_25311749_config.yml` // linjiayi
    ];
    
    // Create a mapping of player names to their YAML files
    const playerFileMap = {
        'mutolovincent': 'mutolovincent_660111_25380863_config.yml',
        'aoorange': 'aoorange_722540_25372279_config-2.yml',
        'yujiehang': 'yujiehang_596718_25359060_config.yml',
        'pengjinjun': 'pengjinjun_657484_25363213_config.yml',
        'yangganxiang': 'yangganxiang_737248_25349835_config-6.yml',
        'yenaimeng': 'yenaimeng_LATE_605475_25475845_yenaimeng_LATE_605475_25474277_config.yml',
        'shanzhihao': 'shanzhihao_733390_25385717_config.yml',
        'liuwenxuan': 'liuwenxuan_LATE_749142_25390122_config.yml',
        'agrawalom': 'agrawalom_737988_25383356_config_v13.yml',
        'schuettmaximilian': 'schuettmaximilian_742091_25384969_config.yml',
        'zhenggary': 'zhenggary_736563_25357709_config.yml',
        'zhaoweiliang': 'zhaoweiliang_668422_25383613_config.yml',
        'wangarabella': 'wangarabella_736620_25345819_config.yml',
        'enchristopher': 'enchristopher_602285_25348856_config.yml',
        'zhutianlei': 'zhutianlei_732667_25376948_config.yml',
        'wangyuan': 'wangyuan_736533_25383342_config.yml',
        'chenyufei': 'chenyufei_662534_25342365_config.yml',
        'venkatanarayanannaveen': 'venkatanarayanannaveen_764261_25385794_config.yml',
        'listeven': 'listeven_736587_25386131_config.yml',
        'zhouevan': 'zhouevan_663610_25377311_congfig.yml',
        'wangsherry': 'wangsherry_738330_25385663_config.yml',
        'davidmatteo': 'davidmatteo_749038_25383022_config.yml',
        'sunclaire': 'sunclaire_733356_25370888_config.yml',
        'fangyuan': 'fangyuan_LATE_736625_25402497_config.yml',
        'niruichen': 'niruichen_749387_25381152_config.yml',
        'huangziyu': 'huangziyu_600639_25345415_config.yml',
        'xiaoyue': 'xiaoyue_736540_25350835_config.yml',
        'zhangkarina': 'zhangkarina_666586_25359184_config.yml',
        'srivastavaaayush': 'srivastavaaayush_LATE_732701_25389500_config.yml',
        'zhangjingwen': 'zhangjingwen_412991_25379656_config.yml',
        'wanganda': 'wanganda_736635_25292697_config.yml',
        'zhuruby': 'zhuruby_736383_25337304_config_1013.yml',
        'singhsanjeevan': 'singhsanjeevan_806110_25385314_config.yml',
        'lunamugicajose': 'lunamugicajose_722218_25384298_config_JML.yml',
        'litvakron': 'litvakron_LATE_721981_25391228_Config.yml',
        'linjiayi': 'linjiayi_742390_25311749_config.yml'
    };
    
    return playerFileMap[playerName] || null;
}

// Pin/Unpin player
function togglePin(playerName) {
    if (pinnedPlayer === playerName) {
        pinnedPlayer = null;
    } else {
        pinnedPlayer = playerName;
    }
    savePinnedPlayer();
    sortData();
    renderLeaderboard();
}

// Load pinned player from localStorage
function loadPinnedPlayer() {
    pinnedPlayer = localStorage.getItem('pinnedPlayer');
}

// Save pinned player to localStorage
function savePinnedPlayer() {
    if (pinnedPlayer) {
        localStorage.setItem('pinnedPlayer', pinnedPlayer);
    } else {
        localStorage.removeItem('pinnedPlayer');
    }
}

// Handle sort from dropdown
function handleSortSelect(e) {
    const sortBy = e.target.value;
    let column, direction;
    switch(sortBy) {
        case 'rank':
            column = 'rank';
            direction = 'asc';
            break;
        case 'rating':
            column = 'ratingMu';
            direction = 'desc';
            break;
        case 'winRate':
            column = 'winRate';
            direction = 'desc';
            break;
        case 'wins':
            column = 'wins';
            direction = 'desc';
            break;
        case 'games':
            column = 'games';
            direction = 'desc';
            break;
        default:
            column = 'rank';
            direction = 'asc';
    }
    currentSort = { column, direction };
    sortData();
    updateSortArrows();
    renderLeaderboard();
}

// Handle column header sort
function handleColumnSort(column) {
    if (currentSort.column === column) {
        // Toggle direction
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        // New column, default to desc for numbers, asc for strings
        currentSort.column = column;
        currentSort.direction = (column === 'player') ? 'asc' : 'desc';
    }
    sortData();
    updateSortArrows();
    updateSortSelect();
    renderLeaderboard();
}

// Sort data based on current sort settings
function sortData() {
    filteredData.sort((a, b) => {
        let aVal, bVal;
        if (currentSort.column === 'player') {
            aVal = a.player.toLowerCase();
            bVal = b.player.toLowerCase();
        } else {
            aVal = a[currentSort.column];
            bVal = b[currentSort.column];
        }
        
        if (aVal < bVal) return currentSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
}

// Update sort arrows in table headers
function updateSortArrows() {
    document.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
        if (th.getAttribute('data-sort') === currentSort.column) {
            th.classList.add(`sorted-${currentSort.direction}`);
        }
    });
}

// Update sort select to match current sort
function updateSortSelect() {
    const select = document.getElementById('sortSelect');
    let value;
    if (currentSort.column === 'rank' && currentSort.direction === 'asc') {
        value = 'rank';
    } else if (currentSort.column === 'ratingMu') {
        value = 'rating';
    } else if (currentSort.column === 'winRate') {
        value = 'winRate';
    } else if (currentSort.column === 'wins') {
        value = 'wins';
    } else if (currentSort.column === 'games') {
        value = 'games';
    } else {
        value = 'rank';
    }
    select.value = value;
}

// Render leaderboard
function renderLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    
    // Separate pinned player from others
    let dataToRender = [...filteredData];
    let pinnedPlayerData = null;
    
    if (pinnedPlayer) {
        const pinnedIndex = dataToRender.findIndex(p => p.player === pinnedPlayer);
        if (pinnedIndex !== -1) {
            pinnedPlayerData = dataToRender[pinnedIndex];
            dataToRender.splice(pinnedIndex, 1);
        }
    }
    
    // Render pinned player first if exists
    if (pinnedPlayerData) {
        const row = createPlayerRow(pinnedPlayerData, true);
        tbody.appendChild(row);
    }
    
    // Render other players
    dataToRender.forEach(player => {
        const row = createPlayerRow(player, false);
        tbody.appendChild(row);
    });
    
    updateSortArrows();
}

// Create a player row
function createPlayerRow(player, isPinned) {
    const row = document.createElement('tr');
    const rankClass = player.rank === 1 ? 'gold' : player.rank === 2 ? 'silver' : player.rank === 3 ? 'bronze' : '';
    
    // Add highlighting classes
    if (player.rank <= 3) {
        row.classList.add('highlight-top3');
    }
    if (player.winRate > 0.8) {
        row.classList.add('highlight-high-winrate');
    }
    if (isPinned) {
        row.classList.add('pinned');
    }
    
    const isCurrentlyPinned = pinnedPlayer === player.player;
    
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
            <button class="btn-small btn-pin ${isCurrentlyPinned ? 'pinned' : ''}" onclick="togglePin('${player.player}')" title="${isCurrentlyPinned ? 'Unpin' : 'Pin'}">
                📌
            </button>
        </td>
    `;
    return row;
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

// Get chart colors based on theme
function getChartColors(theme) {
    const isDark = document.documentElement.getAttribute('data-dark') === 'true';
    // Kaggle theme colors
    return {
        primary: isDark ? '#58a6ff' : '#20beff',
        primaryLight: isDark ? '#79c0ff' : '#0099cc',
        secondary: isDark ? '#3fb950' : '#00c853',
        accent: '#ff9800'
    };
}

// Get text colors based on theme
function getTextColors(theme) {
    const isDark = document.documentElement.getAttribute('data-dark') === 'true';
    return {
        primary: isDark ? '#a8a8a8' : '#8e8e8e',
        secondary: isDark ? '#808080' : '#737373',
        grid: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
    };
}

// Create charts
function createCharts() {
    // Small delay to ensure theme is applied
    setTimeout(() => {
        createWinRateChart();
        createRatingChart();
        createGameStatsChart();
        createRatingWinRateChart();
    }, 100);
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
    
    const theme = document.documentElement.getAttribute('data-theme') || 'kaggle';
    const chartColors = getChartColors(theme);
    
    charts.winRate = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bins.slice(0, -1).map((bin, i) => `${bin}-${bins[i + 1]}%`),
            datasets: [{
                label: 'Number of Players',
                data: binCounts,
                backgroundColor: chartColors.primary,
                borderColor: chartColors.primaryLight,
                borderWidth: 0,
                borderRadius: 8,
                borderSkipped: false
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
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: getComputedStyle(document.documentElement).getPropertyValue('--font-family').trim()
                        },
                        color: getTextColors(theme).primary
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: getTextColors(theme).grid,
                        drawBorder: false
                    },
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 12,
                            family: getComputedStyle(document.documentElement).getPropertyValue('--font-family').trim()
                        },
                        color: getTextColors(theme).primary
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
    
    const theme = document.documentElement.getAttribute('data-theme') || 'kaggle';
    const chartColors = getChartColors(theme);
    chartColors.primary = chartColors.secondary;
    const isDark = document.documentElement.getAttribute('data-dark') === 'true';
    chartColors.primaryLight = isDark ? '#56d364' : '#00e676';
    
    charts.rating = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bins.slice(0, -1).map((bin, i) => `${bin}-${bins[i + 1]}`),
            datasets: [{
                label: 'Number of Players',
                data: binCounts,
                backgroundColor: chartColors.primary,
                borderColor: chartColors.primaryLight,
                borderWidth: 0,
                borderRadius: 8,
                borderSkipped: false
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
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: getComputedStyle(document.documentElement).getPropertyValue('--font-family').trim()
                        },
                        color: getTextColors(theme).primary
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: getTextColors(theme).grid,
                        drawBorder: false
                    },
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 12,
                            family: getComputedStyle(document.documentElement).getPropertyValue('--font-family').trim()
                        },
                        color: getTextColors(theme).primary
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
    
    const theme = document.documentElement.getAttribute('data-theme') || 'kaggle';
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
    
    const isDark = document.documentElement.getAttribute('data-dark') === 'true';
    const colors = isDark ? ['#3fb950', '#d29922', '#f85149'] : ['#00c853', '#ff9800', '#f44336'];
    
    charts.gameStats = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Wins', 'Draws', 'Losses'],
            datasets: [{
                data: [totalWins, totalDraws, totalLosses],
                backgroundColor: colors,
                borderWidth: 0,
                spacing: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 13,
                            family: getComputedStyle(document.documentElement).getPropertyValue('--font-family').trim()
                        },
                        color: textColor,
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
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
    
    const theme = document.documentElement.getAttribute('data-theme') || 'kaggle';
    const chartColors = getChartColors(theme);
    
    charts.ratingWinRate = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Players',
                data: data,
                backgroundColor: chartColors.primary + '80',
                borderColor: chartColors.primary,
                borderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 10,
                pointHoverBorderWidth: 3
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
                        text: 'Rating (μ)',
                        font: {
                            size: 13,
                            family: getComputedStyle(document.documentElement).getPropertyValue('--font-family').trim(),
                            weight: 500
                        },
                        color: getTextColors(theme).primary,
                        padding: { top: 12, bottom: 0 }
                    },
                    grid: {
                        color: getTextColors(theme).grid,
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: getComputedStyle(document.documentElement).getPropertyValue('--font-family').trim()
                        },
                        color: getTextColors(theme).primary
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Win Rate (%)',
                        font: {
                            size: 13,
                            family: getComputedStyle(document.documentElement).getPropertyValue('--font-family').trim(),
                            weight: 500
                        },
                        color: getTextColors(theme).primary,
                        padding: { right: 12, left: 0 }
                    },
                    min: 0,
                    max: 100,
                    grid: {
                        color: getTextColors(theme).grid,
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: getComputedStyle(document.documentElement).getPropertyValue('--font-family').trim()
                        },
                        color: getTextColors(theme).primary
                    }
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
    
    const config = playerConfigs[playerName];
    let modelInfoHTML = '';
    let promptInfoHTML = '';
    
    if (config) {
        // Extract model information (try agent0 first, then agent1)
        const agent = config.agent0 || config.agent1;
        if (agent && agent.model) {
            modelInfoHTML = `
                <div class="model-info">
                    <h3>Model Configuration</h3>
                    <div class="model-detail">
                        <div class="model-detail-label">Provider</div>
                        <div class="model-detail-value">${agent.model.provider || 'N/A'}</div>
                    </div>
                    <div class="model-detail">
                        <div class="model-detail-label">Model Name</div>
                        <div class="model-detail-value">${agent.model.name || 'N/A'}</div>
                    </div>
                    ${agent.model.params ? `
                    <div class="model-detail">
                        <div class="model-detail-label">Parameters</div>
                        <div class="model-detail-value">
                            ${Object.entries(agent.model.params).map(([key, value]) => 
                                `<strong>${key}:</strong> ${value}`
                            ).join('<br>')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
        }
        
        // Extract prompt information
        if (agent && agent.prompts) {
            const systemPrompt = agent.prompts.system_prompt || '';
            const stepWisePrompt = agent.prompts.step_wise_prompt || '';
            
            if (systemPrompt || stepWisePrompt) {
                promptInfoHTML = `
                    <div class="model-info">
                        <h3>Prompts</h3>
                        ${systemPrompt ? `
                        <div class="prompt-section">
                            <h4>System Prompt</h4>
                            <div class="prompt-content">${escapeHtml(systemPrompt)}</div>
                        </div>
                        ` : ''}
                        ${stepWisePrompt ? `
                        <div class="prompt-section">
                            <h4>Step-wise Prompt</h4>
                            <div class="prompt-content">${escapeHtml(stepWisePrompt)}</div>
                        </div>
                        ` : ''}
                    </div>
                `;
            }
        }
    }
    
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
            ${modelInfoHTML}
            ${promptInfoHTML}
            <div style="margin-top: 1.5rem;">
                <button class="btn-small btn-compare" onclick="addToComparison('${player.player}'); document.getElementById('playerModal').style.display='none';">
                    Add to Comparison
                </button>
                <button class="btn-small btn-pin ${pinnedPlayer === player.player ? 'pinned' : ''}" onclick="togglePin('${player.player}'); document.getElementById('playerModal').style.display='none';">
                    ${pinnedPlayer === player.player ? 'Unpin' : 'Pin'} Player
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

// Handle theme change
function handleThemeChange(e) {
    const newTheme = e.target.value;
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateCharts(); // Update charts to reflect new theme colors
}

// Toggle dark mode
function toggleDarkMode() {
    const isDark = document.documentElement.getAttribute('data-dark') === 'true';
    const newDark = !isDark;
    document.documentElement.setAttribute('data-dark', newDark);
    localStorage.setItem('darkMode', newDark);
    updateThemeIcon(newDark);
    updateCharts(); // Update charts to reflect new theme colors
}

// Update theme icon
function updateThemeIcon(isDark) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = isDark ? '☀️' : '🌙';
    }
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
