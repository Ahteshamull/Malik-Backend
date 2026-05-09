export const getNotFoundPage = () => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #6366f1;
            --secondary: #a855f7;
            --dark: #0f172a;
            --text: #f8fafc;
            --glass: rgba(255, 255, 255, 0.05);
            --border: rgba(255, 255, 255, 0.1);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Outfit', sans-serif;
            background: var(--dark);
            color: var(--text);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: radial-gradient(circle at center, #1e1b4b 0%, #0f172a 100%);
        }

        .container {
            text-align: center;
            padding: 3rem;
            background: var(--glass);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border);
            border-radius: 2rem;
            max-width: 600px;
            width: 90%;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: fadeIn 1s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .robot-container {
            position: relative;
            margin-bottom: 2rem;
        }

        .robot-svg {
            width: 200px;
            height: 200px;
            filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.5));
            animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
        }

        h1 {
            font-size: 8rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            line-height: 1;
            margin-bottom: 1rem;
            letter-spacing: -5px;
        }

        h2 {
            font-size: 1.5rem;
            color: #94a3b8;
            margin-bottom: 2rem;
            font-weight: 400;
        }

        .oops {
            position: absolute;
            top: -20px;
            right: 20px;
            background: var(--secondary);
            padding: 0.5rem 1.5rem;
            border-radius: 1rem;
            font-weight: 600;
            font-size: 0.9rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
            transform: rotate(10deg);
        }

        .btn {
            display: inline-block;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            text-decoration: none;
            padding: 1rem 2.5rem;
            border-radius: 1rem;
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: none;
            cursor: pointer;
            box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
        }

        .btn:hover {
            transform: scale(1.05) translateY(-2px);
            box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.5);
        }

        .particles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        }

        .particle {
            position: absolute;
            background: white;
            border-radius: 50%;
            opacity: 0.1;
            animation: move linear infinite;
        }

        @keyframes move {
            from { transform: translateY(0); }
            to { transform: translateY(-100vh); }
        }
    </style>
</head>
<body>
    <div class="particles" id="particles"></div>
    <div class="container">
        <div class="oops">OOPS...</div>
        <div class="robot-container">
            <svg class="robot-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                <circle cx="12" cy="5" r="2"></circle>
                <path d="M12 7v4"></path>
                <line x1="8" y1="16" x2="8" y2="16"></line>
                <line x1="16" y1="16" x2="16" y2="16"></line>
            </svg>
        </div>
        <h1>404</h1>
        <h2>No matching API route found for this request</h2>
        <a href="/" class="btn">Back to Safety</a>
    </div>

    <script>
        const particleContainer = document.getElementById('particles');
        for (let i = 0; i < 50; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const size = Math.random() * 4 + 'px';
            p.style.width = size;
            p.style.height = size;
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            p.style.animationDuration = (Math.random() * 10 + 5) + 's';
            p.style.animationDelay = (Math.random() * 5) + 's';
            particleContainer.appendChild(p);
        }
    </script>
</body>
</html>
  `;
};
