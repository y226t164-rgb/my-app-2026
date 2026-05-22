class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;

        this.map = new Map();
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2);
        this.isRunning = false;
        this.loopCount = 0;
        
        this.init();
    }

    init() {
        const startButton = document.getElementById('start-button');
        const startScreen = document.getElementById('start-screen');
        const restartButton = document.getElementById('restart-button');
        const deathScreen = document.getElementById('death-screen');
        const hud = document.getElementById('hud');

        startButton.addEventListener('click', () => {
            startScreen.classList.add('hidden');
            hud.classList.remove('hidden');
            this.start();
        });

        restartButton.addEventListener('click', () => {
            deathScreen.classList.add('hidden');
            this.resetSession();
            this.start();
        });
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        Utils.Log.save(`探索 ${this.loopCount + 1} 回目...`);
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    resetSession() {
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        this.map.currentRoomIndex = 0; // Back to start of sequence
        this.loopCount++;
        document.getElementById('loop-count').textContent = `LOOP: ${this.loopCount}`;
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
        if (!this.isRunning) return;

        const oldX = this.player.x;
        const oldY = this.player.y;

        this.player.update(deltaTime);

        // Check for collision and traps
        const r = this.player.radius;
        const checkPoints = [
            {x: this.player.x, y: this.player.y}, // Center
            {x: this.player.x - r, y: this.player.y},
            {x: this.player.x + r, y: this.player.y},
            {x: this.player.x, y: this.player.y - r},
            {x: this.player.x, y: this.player.y + r}
        ];

        for (let p of checkPoints) {
            const tile = this.map.checkTile(p.x, p.y);
            
            if (tile === 'W') {
                this.player.x = oldX;
                this.player.y = oldY;
            } else if (tile === 'T') {
                this.handleDeath(p.x, p.y);
                return;
            } else if (tile === 'OUT') {
                this.handleRoomTransition(p.x, p.y);
                return;
            }
        }
    }

    handleDeath(x, y) {
        this.isRunning = false;
        const pos = this.map.getTilePos(x, y);
        this.map.revealTrap(pos.r, pos.c);
        
        Utils.Log.save("罠にかかって死亡した。場所を記憶した。");
        document.getElementById('death-screen').classList.remove('hidden');
    }

    handleRoomTransition(x, y) {
        // Simple loop: if you go out, you loop back or go to next room
        // For now, let's just loop the current room for simplicity
        if (x < 0) this.player.x = this.canvas.width;
        if (x > this.canvas.width) this.player.x = 0;
        if (y < 0) this.player.y = this.canvas.height;
        if (y > this.canvas.height) this.player.y = 0;

        Utils.Log.save("空間が歪んでいる... 同じ場所に戻ったようだ。");
    }

    render() {
        this.ctx.fillStyle = CONFIG.COLORS.BG;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.map.draw(this.ctx);
        this.player.draw(this.ctx);
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
