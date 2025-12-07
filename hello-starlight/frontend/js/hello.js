/**
 * Hello Starlight - Example Addon Frontend
 * 
 * Demonstrates frontend addon development for Starlight. 
 */

const HelloStarlight = (function() {
    'use strict';
    
    let currentGreeting = '';
    let stats = {};
    
    /**
     * Initialize the addon
     * Called automatically when the addon is loaded
     */
    function init() {
        console.log('🌟 Hello Starlight addon initialized!');
    }
    
    /**
     * Load the main page content
     * Called when navigating to the addon's page
     */
    async function loadPage() {
        await Promise.all([
            fetchGreeting(),
            fetchStats()
        ]);
        renderPage();
    }
    
    /**
     * Fetch the current greeting from the backend
     */
    async function fetchGreeting() {
        try {
            const result = await window.API.apiCall('/addon/hello-starlight/greeting');
            if (result && result.status === 'success') {
                currentGreeting = result.greeting;
            }
        } catch (error) {
            console.error('Error fetching greeting:', error);
            currentGreeting = 'Error loading greeting';
        }
    }
    
    /**
     * Fetch addon statistics
     */
    async function fetchStats() {
        try {
            const result = await window.API.apiCall('/addon/hello-starlight/stats');
            if (result && result.status === 'success') {
                stats = result.stats;
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            stats = {};
        }
    }
    
    /**
     * Render the main page
     */
    function renderPage() {
        const container = document.getElementById('hello-starlight-content');
        if (! container) return;
        
        const lastViewed = stats. last_viewed 
            ? new Date(stats.last_viewed).toLocaleString() 
            : 'Never';
        const installedAt = stats. installed_at
            ? new Date(stats.installed_at). toLocaleString()
            : 'Unknown';
        
        container.innerHTML = `
            <div class="hello-starlight-container">
                <!-- Greeting Card -->
                <div class="card p-6 mb-6">
                    <div class="flex items-center mb-4">
                        <span class="text-4xl mr-4">⭐</span>
                        <div>
                            <h2 class="text-2xl font-bold" style="color: var(--text-primary);">
                                ${escapeHtml(currentGreeting)}
                            </h2>
                            <p class="text-sm" style="color: var(--text-tertiary);">
                                This is your customizable greeting message
                            </p>
                        </div>
                    </div>
                    
                    <div class="mt-4 p-4 rounded-lg" style="background-color: var(--bg-tertiary);">
                        <p style="color: var(--text-secondary);">
                            🎉 <strong>Congratulations!</strong> The addon system is working correctly. 
                            This example addon demonstrates sidebar hooks, custom pages, 
                            backend API routes, and persistent data storage.
                        </p>
                    </div>
                </div>
                
                <!-- Stats Card -->
                <div class="card p-6 mb-6">
                    <h3 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">
                        📊 Addon Statistics
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="text-center p-4 rounded-lg" style="background-color: var(--bg-tertiary);">
                            <div class="text-3xl font-bold text-indigo-600">${stats.view_count || 0}</div>
                            <div class="text-sm" style="color: var(--text-tertiary);">Page Views</div>
                        </div>
                        <div class="text-center p-4 rounded-lg" style="background-color: var(--bg-tertiary);">
                            <div class="text-3xl font-bold text-green-600">${stats.enabled_count || 0}</div>
                            <div class="text-sm" style="color: var(--text-tertiary);">Times Enabled</div>
                        </div>
                        <div class="text-center p-4 rounded-lg" style="background-color: var(--bg-tertiary);">
                            <div class="text-sm font-semibold" style="color: var(--text-primary);">${lastViewed}</div>
                            <div class="text-sm" style="color: var(--text-tertiary);">Last Viewed</div>
                        </div>
                        <div class="text-center p-4 rounded-lg" style="background-color: var(--bg-tertiary);">
                            <div class="text-sm font-semibold" style="color: var(--text-primary);">${installedAt}</div>
                            <div class="text-sm" style="color: var(--text-tertiary);">Installed</div>
                        </div>
                    </div>
                </div>
                
                <!-- Update Greeting Card -->
                <div class="card p-6">
                    <h3 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">
                        ✏️ Customize Greeting
                    </h3>
                    <div class="flex gap-4">
                        <input type="text" 
                               id="hello-greeting-input" 
                               value="${escapeHtml(currentGreeting)}"
                               placeholder="Enter your custom greeting..."
                               maxlength="200"
                               class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                               style="background-color: var(--bg-tertiary); color: var(--text-primary); border-color: var(--border-color);">
                        <button onclick="HelloStarlight.updateGreeting()" 
                                class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition">
                            Save
                        </button>
                    </div>
                    <p class="mt-2 text-sm" style="color: var(--text-tertiary);">
                        Enter a new greeting and click Save.  The greeting persists across restarts.
                    </p>
                </div>
                
                <!-- Developer Info Card -->
                <div class="card p-6 mt-6">
                    <h3 class="text-lg font-semibold mb-4" style="color: var(--text-primary);">
                        🛠️ Developer Information
                    </h3>
                    <div class="space-y-2 text-sm" style="color: var(--text-secondary);">
                        <p><strong>Addon ID:</strong> hello-starlight</p>
                        <p><strong>Version:</strong> 1.0.0</p>
                        <p><strong>Features Demonstrated:</strong></p>
                        <ul class="list-disc list-inside ml-4 space-y-1">
                            <li>Sidebar navigation hook</li>
                            <li>Custom page with HTML template</li>
                            <li>Backend API routes (GET and POST)</li>
                            <li>Persistent data storage</li>
                            <li>Lifecycle hooks (install, enable, disable, uninstall)</li>
                            <li>Frontend JavaScript module</li>
                            <li>Custom CSS styling</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Update the greeting message
     */
    async function updateGreeting() {
        const input = document.getElementById('hello-greeting-input');
        if (!input) return;
        
        const newGreeting = input. value.trim();
        if (!newGreeting) {
            window.UI.showStatus('Greeting cannot be empty', 'error');
            return;
        }
        
        try {
            const result = await window. API.apiCall('/addon/hello-starlight/greeting', 'POST', {
                greeting: newGreeting
            });
            
            if (result && result.status === 'success') {
                currentGreeting = newGreeting;
                window.UI.showStatus('Greeting updated successfully! ', 'success');
                renderPage();
            } else {
                window.UI.showStatus(result?. message || 'Failed to update greeting', 'error');
            }
        } catch (error) {
            console.error('Error updating greeting:', error);
            window. UI.showStatus('Error updating greeting', 'error');
        }
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Public API
    return {
        init: init,
        loadPage: loadPage,
        updateGreeting: updateGreeting
    };
})();

// Make available globally
window.HelloStarlight = HelloStarlight;