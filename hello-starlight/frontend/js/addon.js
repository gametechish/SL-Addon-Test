/**
 * Starlight Test Addon - Frontend JavaScript
 * 
 * This module handles the frontend functionality for the test addon,
 * including initialization, API calls, and UI updates.
 */

const StarlightTestAddon = {
    // Store for addon state
    state: {
        initialized: false,
        status: null,
        lastPing: null
    },

    /**
     * Initialize the addon.
     * Called automatically by Starlight when the addon loads.
     */
    async init() {
        console.log('[Test Addon] Initializing Starlight Test Addon...');

        try {
            // Call fetchStatus via the object so it works even when init is invoked unbound
            await StarlightTestAddon.fetchStatus();
            StarlightTestAddon.state.initialized = true;
            console.log('[Test Addon] Initialization complete');
        } catch (error) {
            console.error('[Test Addon] Initialization failed:', error);
        }
    },

    /**
     * Fetch the addon status from the backend.
     */
    async fetchStatus() {
        try {
            const response = await fetch('/api/addon/hello-starlight/status');
            const data = await response.json();

            if (data.status === 'success') {
                this.state.status = data.data;
                this.updateStatusDisplay();
                console.log('[Test Addon] Status fetched:', data.data);
            } else {
                console.error('[Test Addon] Failed to fetch status:', data.message);
            }
        } catch (error) {
            console.error('[Test Addon] Error fetching status:', error);
        }
    },

    /**
     * Send a ping request to the backend.
     */
    async ping() {
        const button = document.getElementById('test-addon-ping-btn');
        const resultEl = document.getElementById('test-addon-ping-result');
        
        if (button) {
            button.disabled = true;
            button.textContent = 'Pinging...';
        }
        
        try {
            const startTime = Date.now();
            const response = await fetch('/api/addon/starlight-test-addon/ping');
            const endTime = Date.now();
            const data = await response.json();
            
            const latency = endTime - startTime;
            this.state.lastPing = {
                latency: latency,
                timestamp: data.data.timestamp
            };
            
            if (resultEl) {
                resultEl.innerHTML = `
                    <span class="test-addon-success">✓ Pong received! </span>
                    <span class="test-addon-latency">Latency: ${latency}ms</span>
                `;
                resultEl.classList.add('visible');
            }
            
            console.log('[Test Addon] Ping successful:', latency, 'ms');
        } catch (error) {
            if (resultEl) {
                resultEl.innerHTML = `
                    <span class="test-addon-error">✗ Ping failed: ${error.message}</span>
                `;
                resultEl.classList.add('visible');
            }
            console.error('[Test Addon] Ping failed:', error);
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = 'Ping Backend';
            }
        }
    },

    /**
     * Send an echo request with custom data.
     */
    async sendEcho() {
        const input = document.getElementById('test-addon-echo-input');
        const resultEl = document.getElementById('test-addon-echo-result');
        const button = document.getElementById('test-addon-echo-btn');
        
        const message = input ?  input.value.trim() : 'Hello, Starlight! ';
        
        if (button) {
            button.disabled = true;
            button.textContent = 'Sending...';
        }
        
        try {
            const response = await fetch('/api/addon/starlight-test-addon/echo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message, timestamp: new Date().toISOString() })
            });
            
            const data = await response.json();
            
            if (resultEl) {
                if (data.status === 'success') {
                    resultEl.innerHTML = `
                        <span class="test-addon-success">✓ Echo received!</span>
                        <pre class="test-addon-json">${JSON.stringify(data.data.echoed, null, 2)}</pre>
                    `;
                } else {
                    resultEl.innerHTML = `
                        <span class="test-addon-error">✗ Echo failed: ${data.message}</span>
                    `;
                }
                resultEl.classList.add('visible');
            }
            
            console.log('[Test Addon] Echo successful:', data);
        } catch (error) {
            if (resultEl) {
                resultEl.innerHTML = `
                    <span class="test-addon-error">✗ Echo failed: ${error.message}</span>
                `;
                resultEl.classList.add('visible');
            }
            console.error('[Test Addon] Echo failed:', error);
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = 'Send Echo';
            }
        }
    },

    /**
     * Update the status display on the page.
     */
    updateStatusDisplay() {
        const statusEl = document.getElementById('test-addon-status');
        if (! statusEl || !this.state.status) return;
        
        const status = this.state.status;
        const healthClass = status.healthy ?  'healthy' : 'unhealthy';
        
        statusEl.innerHTML = `
            <div class="test-addon-status-item">
                <span class="label">Status:</span>
                <span class="value ${healthClass}">${status.healthy ? 'Healthy' : 'Unhealthy'}</span>
            </div>
            <div class="test-addon-status-item">
                <span class="label">Version:</span>
                <span class="value">${status.version}</span>
            </div>
            <div class="test-addon-status-item">
                <span class="label">Message:</span>
                <span class="value">${status.message}</span>
            </div>
            <div class="test-addon-status-item">
                <span class="label">Enable Count:</span>
                <span class="value">${status.statistics?.enable_count || 0}</span>
            </div>
            <div class="test-addon-status-item">
                <span class="label">Disable Count:</span>
                <span class="value">${status.statistics?.disable_count || 0}</span>
            </div>
        `;
    },

    /**
     * Refresh all data from the backend.
     */
    async refresh() {
        const button = document.getElementById('test-addon-refresh-btn');
        
        if (button) {
            button.disabled = true;
            button.textContent = 'Refreshing...';
        }
        
        try {
            await this.fetchStatus();
            console.log('[Test Addon] Data refreshed');
        } catch (error) {
            console.error('[Test Addon] Refresh failed:', error);
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = 'Refresh Status';
            }
        }
    }
};

// Export for Starlight to call
window.StarlightTestAddon = StarlightTestAddon;