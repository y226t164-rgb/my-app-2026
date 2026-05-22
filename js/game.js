class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;

        this.map = new Map();
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
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
        // Store old position for collision resolution
        const oldX = this.player.x;
        const oldY = this.player.y;

        this.player.update(deltaTime);

        // Simple collision detection with walls
        // Check four points around the player circle
        const r = this.player.radius;
        const points = [
            {x: this.player.x - r, y: this.player.y},
            {x: this.player.x + r, y: this.player.y},
            {x: this.player.x, y: this.player.y - r},
            {x: this.player.x, y: this.player.y + r}
        ];

        for (let p of points) {
            if (this.map.isWall(p.x, p.y)) {
                this.player.x = oldX;
                this.player.y = oldY;
                break;
            }
        }
    }

    render() {
        // Clear background
        this.ctx.fillStyle = CONFIG.COLORS.BG;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Map
        this.map.draw(this.ctx);

        // 2. Draw Player
        this.player.draw(this.ctx);

        // 3. Apply Vision Mask (Fog of War)
        this.applyVisionMask();
    }

    applyVisionMask() {
        const ctx = this.ctx;
        ctx.save();
        
        const gradient = ctx.createRadialGradient(
            this.player.x, this.player.y, 0,
            this.player.x, this.player.y, CONFIG.VISION_RADIUS
        );
        
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.4)');
        gradient.addColorStop(1, CONFIG.COLORS.FOG);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.restore();
    }
}

window.onload = () => {
    new Game();
};
