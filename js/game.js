class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;

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
        this.player.update(deltaTime);
    }

    render() {
        // 1. Clear with background color (Floor)
        this.ctx.fillStyle = CONFIG.COLORS.FLOOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. Draw Game World Objects
        this.player.draw(this.ctx);

        // 3. Apply Vision Mask (Fog of War)
        this.applyVisionMask();
    }

    applyVisionMask() {
        const ctx = this.ctx;
        
        // Create a temporary canvas for the mask or just use composite operations
        ctx.save();
        
        // Fill the entire screen with darkness
        ctx.fillStyle = CONFIG.COLORS.FOG;
        
        // Use a radial gradient for the "light" effect
        const gradient = ctx.createRadialGradient(
            this.player.x, this.player.y, 0,
            this.player.x, this.player.y, CONFIG.VISION_RADIUS
        );
        
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); // Transparent in center
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.8)'); // Slight darkness
        gradient.addColorStop(1, CONFIG.COLORS.FOG); // Total darkness at edge

        // We want to fill everything EXCEPT the circle with black
        // One way is to fill the whole screen with the gradient
        // But the gradient only covers a circle. So we need to fill the rest too.
        
        // Better way: 
        // 1. Create an offscreen canvas for the mask
        // 2. Fill with black
        // 3. destination-out a radial gradient
        
        // For simplicity in a single canvas:
        ctx.globalCompositeOperation = 'source-over';
        
        // We'll use a path to clip or just draw a large rect with a hole
        // Actually, the radial gradient starting from transparent to black works well if we fill a large area
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.restore();
    }
}

// Start the game when the window loads
window.onload = () => {
    new Game();
};
