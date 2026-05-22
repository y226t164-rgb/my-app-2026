const Utils = {
    // Generate a unique ID
    uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    },

    // Local Storage Log Management
    Log: {
        STORAGE_KEY: 'echoes_of_the_void_logs',
        MAX_LOGS: 100,

        save(message) {
            const logs = this.getAll();
            const newLog = {
                id: Utils.uuidv4(),
                timestamp: new Date().toISOString(),
                message: message,
                session: sessionStorage.getItem('game_session_id') || 'unknown'
            };

            logs.unshift(newLog); // Add to beginning

            // Keep only latest MAX_LOGS
            const trimmedLogs = logs.slice(0, this.MAX_LOGS);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedLogs));

            // Update UI if message log element exists
            const logElement = document.getElementById('message-log');
            if (logElement) {
                logElement.textContent = message;
                // Fade out effect could be added here
            }

            console.log(`[GAME LOG]: ${message}`);
            return newLog;
        },

        getAll() {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            try {
                return stored ? JSON.parse(stored) : [];
            } catch (e) {
                console.error("Failed to parse logs from localStorage", e);
                return [];
            }
        },

        clear() {
            localStorage.removeItem(this.STORAGE_KEY);
        }
    },

    // Persistent Game State (Traps, Stage)
    Save: {
        STORAGE_KEY: 'echoes_of_the_void_save',

        save(data) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        },

        load() {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            try {
                return stored ? JSON.parse(stored) : null;
            } catch (e) {
                console.error("Failed to load save data", e);
                return null;
            }
        },

        clear() {
            localStorage.removeItem(this.STORAGE_KEY);
        }
    }
};

// Initialize a session ID for tracking
if (!sessionStorage.getItem('game_session_id')) {
    sessionStorage.setItem('game_session_id', Utils.uuidv4());
}
