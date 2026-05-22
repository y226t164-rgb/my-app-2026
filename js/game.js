class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;

        this.isRunning = false;
        this.init();
    }

    init() {
        const startButton = document.getElementById('start-button');
        const startScreen = document.getElementById('start-screen');
        const hud = document.getElementById('hud');

        startButton.addEventListener('click', () => {
            startScreen.classList.add('hidden');
            hud.classList.remove('hidden');
            this.start();
        });
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        Utils.Log.save("探索が始まりました...");
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Update logic will go here
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = CONFIG.COLORS.FOG;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render steps:
        // 1. Render Floor & Walls
        // 2. Render Player
        // 3. Apply Vision Mask (Fog of War)
    }
}

// Start the game when the window loads
window.onload = () => {
    new Game();
};
