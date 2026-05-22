class Map {
    constructor() {
        this.tileSize = CONFIG.TILE_SIZE;
        this.cols = CONFIG.CANVAS_WIDTH / this.tileSize;
        this.rows = CONFIG.CANVAS_HEIGHT / this.tileSize;
        
        // Basic map layout (W: Wall, .: Floor)
        this.grid = [
            "WWWWWWWWWWWWWWWWWWWW",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "WWWWWWWWWWWWWWWWWWWW"
        ];
    }

    draw(ctx) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const x = c * this.tileSize;
                const y = r * this.tileSize;
                const type = this.grid[r][c];

                if (type === 'W') {
                    this.drawWall(ctx, x, y);
                } else {
                    this.drawFloor(ctx, x, y);
                }
            }
        }
    }

    drawWall(ctx, x, y) {
        const s = this.tileSize;
        
        // Base
        ctx.fillStyle = CONFIG.COLORS.WALL;
        ctx.fillRect(x, y, s, s);

        // Highlight (Top/Left)
        ctx.strokeStyle = CONFIG.COLORS.WALL_LIGHT;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 1, y + s - 1);
        ctx.lineTo(x + 1, y + 1);
        ctx.lineTo(x + s - 1, y + 1);
        ctx.stroke();

        // Shadow (Bottom/Right)
        ctx.strokeStyle = CONFIG.COLORS.WALL_DARK;
        ctx.beginPath();
        ctx.moveTo(x + 1, y + s - 1);
        ctx.lineTo(x + s - 1, y + s - 1);
        ctx.lineTo(x + s - 1, y + 1);
        ctx.stroke();

        // Joint marks
        ctx.fillStyle = '#111';
        ctx.fillRect(x, y, 2, 2);
        ctx.fillRect(x + s - 2, y, 2, 2);
        ctx.fillRect(x, y + s - 2, 2, 2);
        ctx.fillRect(x + s - 2, y + s - 2, 2, 2);
    }

    drawFloor(ctx, x, y) {
        const s = this.tileSize;
        
        // Base
        ctx.fillStyle = CONFIG.COLORS.FLOOR;
        ctx.fillRect(x, y, s, s);

        // Stone tiles
        ctx.fillStyle = CONFIG.COLORS.FLOOR_STONE;
        const padding = 4;
        const stoneSize = (s - padding * 3) / 2;
        
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                ctx.fillRect(
                    x + padding + i * (stoneSize + padding),
                    y + padding + j * (stoneSize + padding),
                    stoneSize,
                    stoneSize
                );
            }
        }

        // Cracks (simplified)
        ctx.strokeStyle = CONFIG.COLORS.FLOOR_CRACK;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + s/2, y + padding);
        ctx.lineTo(x + s/2, y + s - padding);
        ctx.moveTo(x + padding, y + s/2);
        ctx.lineTo(x + s - padding, y + s/2);
        ctx.stroke();
    }

    isWall(x, y) {
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);
        
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return true;
        }
        
        return this.grid[row][col] === 'W';
    }
}
