# Solution Implementation

## 🌐 **👉 [CLICK HERE TO VIEW THE WEBSITE](http://localhost:8000) 👈**

> **Note:** Make sure to start a local web server first (see "Running the Website" section below), then click the link above or navigate to `http://localhost:8000` in your browser.

---

A complete website has been implemented using HTML, CSS, and JavaScript with the following features:

## ✅ Minimum Requirements (All Implemented)
1. **Leaderboard Display** - Interactive table showing all players with rankings, ratings, and statistics
2. **Statistics Visualization** - Four interactive charts:
   - Win Rate Distribution (bar chart)
   - Rating Distribution (bar chart)
   - Game Statistics (doughnut chart showing wins, draws, losses)
   - Rating vs Win Rate (scatter plot)
3. **Player Details** - Click on any player to view detailed statistics in a modal
4. **Responsive Design** - Fully responsive layout that works on desktop, tablet, and mobile devices

## ✅ Optional Features (All Implemented)
- ✅ Interactive filtering and sorting (sort by rank, rating, win rate, wins, or games)
- ✅ Search functionality for players
- ✅ Comparison view between players (compare up to 3 players side-by-side)
- ✅ Export functionality (export filtered results to CSV)
- ✅ Dark/light theme toggle (with persistent theme preference)

## Additional Features
- Statistics overview cards showing total players, average rating, average win rate, and total games
- Visual rank badges (gold, silver, bronze for top 3)
- Win rate progress bars in the leaderboard
- Smooth animations and transitions
- Modern, clean UI design

## Getting Started

### Running the Website

Since the website uses `fetch()` to load the CSV data, you need to run it through a local web server (due to browser CORS restrictions). Here are several ways to do this:

#### Option 1: Python HTTP Server
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then open your browser and navigate to: `http://localhost:8000`

#### Option 2: Node.js HTTP Server
```bash
# Install http-server globally (if not already installed)
npm install -g http-server

# Run the server
http-server -p 8000
```
Then open your browser and navigate to: `http://localhost:8000`

#### Option 3: VS Code Live Server
If you're using VS Code, install the "Live Server" extension and click "Go Live" in the status bar.

#### Option 4: Any Other Web Server
You can use any web server (Apache, Nginx, etc.) to serve the files.

### File Structure
```
.
├── index.html          # Main HTML file
├── styles.css          # Styles and theme
├── script.js           # JavaScript functionality and charts
├── data/
│   ├── final_standings.csv
│   └── prompt_collection/
├── README.md
└── SOLUTION.md
```

### Usage
1. Start a local web server (see options above)
2. Open the website in your browser
3. Explore the leaderboard, charts, and player details
4. Use the search box to find specific players
5. Sort the leaderboard by different criteria
6. Click "View" to see detailed player statistics
7. Click "Compare" to compare up to 3 players
8. Toggle between dark and light themes
9. Export filtered results to CSV

## Technical Details

### Technologies Used
- **HTML5** - Structure and semantics
- **CSS3** - Styling with CSS variables for theming
- **JavaScript (ES6+)** - Interactivity and data manipulation
- **Chart.js 4.4.0** - Data visualization (loaded via CDN)

### Browser Compatibility
The website works on all modern browsers (Chrome, Firefox, Safari, Edge) that support:
- ES6 JavaScript features
- CSS Grid and Flexbox
- Fetch API
- LocalStorage API

### Data Loading
The website loads data from `data/final_standings.csv` using the Fetch API. The CSV is parsed client-side and converted to JavaScript objects for manipulation and display.

## Features Overview

### Leaderboard
- Displays all 36 players ranked by their final standings
- Shows rating (Mu and Sigma), wins, draws, losses, games played, and win rate
- Visual indicators for top 3 players (gold, silver, bronze badges)
- Win rate progress bars for quick visual comparison
- Click on player names or "View" button to see detailed statistics

### Charts and Visualizations
1. **Win Rate Distribution** - Bar chart showing how many players fall into different win rate ranges
2. **Rating Distribution** - Bar chart showing the distribution of player ratings
3. **Game Statistics** - Doughnut chart showing aggregate wins, draws, and losses across all players
4. **Rating vs Win Rate** - Scatter plot showing the relationship between rating and win rate

### Interactive Features
- **Search**: Type in the search box to filter players by name
- **Sort**: Sort the leaderboard by rank, rating, win rate, wins, or games played
- **Player Details**: Click "View" to see comprehensive player statistics in a modal
- **Comparison**: Add up to 3 players to compare their statistics side-by-side
- **Export**: Export the currently filtered/sorted data to CSV
- **Theme Toggle**: Switch between dark and light themes (preference is saved)

### Responsive Design
The website is fully responsive and adapts to different screen sizes:
- Desktop: Full layout with all features visible
- Tablet: Adjusted grid layouts and table scrolling
- Mobile: Stacked layouts, optimized touch targets, and simplified navigation

## Data Preview

The tournament includes multiple players with their game statistics. Each player has:
- A ranking position
- Rating metrics (Mu and Sigma)
- Win/Draw/Loss record
- Total games played
- Win rate percentage
