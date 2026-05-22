class Map {
    constructor() {
        this.tileSize = CONFIG.TILE_SIZE;
        this.cols = CONFIG.CANVAS_WIDTH / this.tileSize;
        this.rows = CONFIG.CANVAS_HEIGHT / this.tileSize;
        
        this.currentStage = 0;
        this.hasMedallion = false;
        this.isDoorUnlocked = false;

        // Known traps persist across deaths: "stage-row-col"
        this.knownTraps = new Set(); 

        // Room Definitions (W: Wall, .: Floor, T: Trap, S: Start, M: Medallion, D: Door)
        this.stages = [
            // Stage 1: Basic Introduction
            [
                "WWWWWWWWWWWWWWWWWWWW",
                "W..................W",
                "W..S...............W",
                "W.........T........W",
                "W..................W",
                "W......M...........W",
                "W..................W",
                "W...............D..W",
                "WWWWWWWWWWWWWWWWWWWW"
            ],
            // Stage 2: Tight corridors and more traps
            [
                "WWWWWWWWWWWWWWWWWWWW",
                "W S  W      T      W",
                "W    W  WWWWWWWW   W",
                "W T  W  W  M   W   W",
                "W    W  W      W   W",
                "W    W  W   WWWW   W",
                "W       W      T   W",
                "W   T   WWWWWW   D W",
                "WWWWWWWWWWWWWWWWWWWW"
            ],
            // Stage 3: The Gauntlet
            [
                "WWWWWWWWWWWWWWWWWWWW",
                "W   T     T     T  W",
                "W M WWWWW   WWWWW  W",
                "W   W   W T W   W  W",
                "W   W S W   W D W  W",
                "W   W   W   W   W  W",
                "W T WWWWW   WWWWW  W",
                "W   T     T     T  W",
                "WWWWWWWWWWWWWWWWWWWW"
            ]
        ];

        // Replace spaces with dots for consistency in Stage 2/3 definitions
        this.stages = this.stages.map(room => room.map(row => row.replace(/ /g, ".")));

        this.loadProgress();
    }

    get grid() {
        return this.stages[this.currentStage];
    }

    saveProgress() {
        const data = {
            currentStage: this.currentStage,
            knownTraps: Array.from(this.knownTraps)
        };
        Utils.Save.save(data);
    }

    loadProgress() {
        const data = Utils.Save.load();
        if (data) {
            this.currentStage = data.currentStage || 0;
            this.knownTraps = new Set(data.knownTraps || []);
        }
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
                    
                    if (type === 'T' && this.isTrapKnown(r, c)) {
                        this.drawTrap(ctx, x, y);
                    } else if (type === 'M' && !this.hasMedallion) {
                        this.drawMedallion(ctx, x, y);
                    } else if (type === 'D') {
                        this.drawDoor(ctx, x, y);
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
        
        ctx.fillStyle = CONFIG.COLORS.FLOOR_STONE;
        ctx.fillRect(x + 4, y + 4, 10, 10);
        ctx.fillRect(x + 18, y + 18, 10, 10);
    }

    drawTrap(ctx, x, y) {
        const s = this.tileSize;
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

    drawMedallion(ctx, x, y) {
        const s = this.tileSize;
        ctx.fillStyle = '#4fc3f7';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#4fc3f7';
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#fff';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('⧖', x + s/2, y + s/2 + 4);
    }

    drawDoor(ctx, x, y) {
        const s = this.tileSize;
        ctx.strokeStyle = this.hasMedallion ? '#4fc3f7' : '#4a3b32';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 4, y + 4, s - 8, s - 8);
        if (this.hasMedallion) {
            ctx.fillStyle = 'rgba(79, 195, 247, 0.2)';
            ctx.fillRect(x + 6, y + 6, s - 12, s - 12);
        }
    }

    isTrapKnown(r, c) {
        return this.knownTraps.has(`${this.currentStage}-${r}-${c}`);
    }

    revealTrap(r, c) {
        this.knownTraps.add(`${this.currentStage}-${r}-${c}`);
        this.saveProgress();
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

    getStartPosition() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] === 'S') {
                    return { x: c * this.tileSize + this.tileSize/2, y: r * this.tileSize + this.tileSize/2 };
                }
            }
        }
        return { x: CONFIG.CANVAS_WIDTH/2, y: CONFIG.CANVAS_HEIGHT/2 };
    }
}
