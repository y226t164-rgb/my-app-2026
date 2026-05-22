class Map {
    constructor() {
        this.tileSize = CONFIG.TILE_SIZE;
        this.cols = CONFIG.CANVAS_WIDTH / this.tileSize;
        this.rows = CONFIG.CANVAS_HEIGHT / this.tileSize;
        
        this.currentRoomIndex = 0;
        this.correctSequence = [0, 1, 0]; // Example: Room 0 -> Room 1 -> Room 0 (Success)
        this.playerProgress = 0;

        // Known traps persist across deaths
        this.knownTraps = new Set(); 

        // Room Definitions (W: Wall, .: Floor, T: Trap, S: Start, G: Goal)
        this.rooms = [
            // Room 0: Introduction with one trap
            [
                "WWWWWWWWWWWWWWWWWWWW",
                "W..................W",
                "W..................W",
                "W.........T........W",
                "W....S.............W",
                "W..................W",
                "W..................W",
                "W..................W",
                "WWWWWWWWWWWWWWWWWWWW"
            ],
            // Room 1: More traps
            [
                "WWWWWWWWWWWWWWWWWWWW",
                "W..T...............W",
                "W.......T..........W",
                "W..................W",
                "W.........S........W",
                "W..T...............W",
                "W............T.....W",
                "W..................W",
                "WWWWWWWWWWWWWWWWWWWW"
            ]
        ];
    }

    get grid() {
        return this.rooms[this.currentRoomIndex];
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
                    
                    // Render Trap if it's known
                    if (type === 'T' && this.isTrapKnown(r, c)) {
                        this.drawTrap(ctx, x, y);
                    }
                }
            }
        }
    }

    drawWall(ctx, x, y) {
        const s = this.tileSize;
        ctx.fillStyle = CONFIG.COLORS.WALL;
        ctx.fillRect(x, y, s, s);
        ctx.strokeStyle = CONFIG.COLORS.WALL_LIGHT;
        ctx.strokeRect(x+1, y+1, s-2, s-2);
    }

    drawFloor(ctx, x, y) {
        ctx.fillStyle = CONFIG.COLORS.FLOOR;
        ctx.fillRect(x, y, this.tileSize, this.tileSize);
    }

    drawTrap(ctx, x, y) {
        const s = this.tileSize;
        // Draw a "bloodstain" and a spike
        ctx.fillStyle = 'rgba(229, 57, 53, 0.6)';
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ff5252';
        ctx.beginPath();
        ctx.moveTo(x + s/2, y + s/4);
        ctx.lineTo(x + s/4, y + 3*s/4);
        ctx.lineTo(x + 3*s/4, y + 3*s/4);
        ctx.fill();
    }

    isTrapKnown(r, c) {
        return this.knownTraps.has(`${this.currentRoomIndex}-${r}-${c}`);
    }

    revealTrap(r, c) {
        this.knownTraps.add(`${this.currentRoomIndex}-${r}-${c}`);
    }

    checkTile(x, y) {
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);
        
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return 'OUT';
        return this.grid[row][col];
    }

    getTilePos(x, y) {
        return {
            r: Math.floor(y / this.tileSize),
            c: Math.floor(x / this.tileSize)
        };
    }
}
