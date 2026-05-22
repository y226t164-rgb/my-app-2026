class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.speed = CONFIG.PLAYER_SPEED;
        
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        this.initInput();
    }

    initInput() {
        window.addEventListener('keydown', (e) => {
            this.handleKey(e.code, true);
        });

        window.addEventListener('keyup', (e) => {
            this.handleKey(e.code, false);
        });
    }

    handleKey(code, isPressed) {
        switch (code) {
            case 'ArrowUp':
            case 'KeyW':
                this.keys.up = isPressed;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.keys.down = isPressed;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = isPressed;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = isPressed;
                break;
        }
    }

    update(deltaTime) {
        let dx = 0;
        let dy = 0;

        if (this.keys.up) dy -= this.speed;
        if (this.keys.down) dy += this.speed;
        if (this.keys.left) dx -= this.speed;
        if (this.keys.right) dx += this.speed;

        // Diagonal movement normalization (optional but recommended)
        if (dx !== 0 && dy !== 0) {
            const factor = 1 / Math.sqrt(2);
            dx *= factor;
            dy *= factor;
        }

        this.x += dx;
        this.y += dy;

        // Keep player within canvas bounds (for now, until map collision is added)
        this.x = Math.max(this.radius, Math.min(CONFIG.CANVAS_WIDTH - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(CONFIG.CANVAS_HEIGHT - this.radius, this.y));
    }

    draw(ctx) {
        ctx.fillStyle = CONFIG.COLORS.PLAYER;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
