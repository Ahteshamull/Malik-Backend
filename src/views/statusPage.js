import { getSystemStats } from "../helper/systemStats.js";

export const getStatusPage = () => {
  const stats = getSystemStats();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Malik Server Status</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap');

        body {
          margin: 0;
          padding: 0;
          background-color: #050505;
          color: #00ffcc;
          font-family: 'JetBrains+Mono', monospace;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          overflow: hidden;
        }

        .container {
          text-align: center;
          width: 90%;
          max-width: 800px;
          animation: fadeIn 1s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        h1 {
          font-family: 'Orbitron', sans-serif;
          font-size: 2.5rem;
          text-transform: uppercase;
          letter-spacing: 5px;
          margin-bottom: 10px;
          text-shadow: 0 0 20px rgba(0, 255, 204, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .subtitle {
          font-size: 0.9rem;
          letter-spacing: 3px;
          color: #888;
          margin-bottom: 40px;
        }

        .status-card {
          background: rgba(0, 255, 204, 0.03);
          border: 2px solid #00ffcc;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 0 30px rgba(0, 255, 204, 0.1), inset 0 0 15px rgba(0, 255, 204, 0.05);
          position: relative;
        }

        .status-header {
          border: 1px solid #00ffcc;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 30px;
          font-weight: bold;
          letter-spacing: 2px;
          background: rgba(0, 255, 204, 0.1);
          box-shadow: 0 0 15px rgba(0, 255, 204, 0.2);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .stat-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(0, 255, 204, 0.3);
          border-radius: 8px;
          padding: 15px;
          text-align: left;
          transition: all 0.3s ease;
        }

        .stat-box:hover {
          background: rgba(0, 255, 204, 0.05);
          border-color: #00ffcc;
          transform: translateY(-3px);
        }

        .stat-label {
          font-size: 0.7rem;
          color: #888;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stat-value {
          font-size: 1.1rem;
          font-weight: bold;
          color: #fff;
        }

        @media (max-width: 600px) {
          h1 { font-size: 1.5rem; }
          .stats-grid { grid-template-columns: 1fr; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🐺 WELCOME TO MALIK SERVER 🐺</h1>
        <div class="subtitle">SYSTEM STATUS MONITOR :: ONLINE</div>
        
        <div class="status-card">
          <div class="status-header">
            SERVER STATUS: OPERATIONAL
          </div>
          
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-label">⏰ SYSTEM TIME</div>
              <div class="stat-value" id="system-time">${stats.systemTime}</div>
            </div>
            
            <div class="stat-box">
              <div class="stat-label">🆙 UPTIME</div>
              <div class="stat-value" id="uptime">${stats.uptime}</div>
            </div>
            
            <div class="stat-box">
              <div class="stat-label">🖥️ CPU LOAD</div>
              <div class="stat-value" id="cpu-load">${stats.cpuLoad}</div>
            </div>
            
            <div class="stat-box">
              <div class="stat-label">💾 MEMORY USAGE</div>
              <div class="stat-value" id="memory-usage">${stats.memory}</div>
            </div>
          </div>
        </div>
      </div>
      
      <script>
        async function updateStats() {
          try {
            const response = await fetch('/status-data');
            const data = await response.json();
            
            document.getElementById('system-time').innerText = data.systemTime;
            document.getElementById('uptime').innerText = data.uptime;
            document.getElementById('cpu-load').innerText = data.cpuLoad;
            document.getElementById('memory-usage').innerText = data.memory;
          } catch (error) {
            console.error('Error fetching stats:', error);
          }
        }

        // Update every 2 seconds
        setInterval(updateStats, 2000);
      </script>
    </body>
    </html>
  `;
};
