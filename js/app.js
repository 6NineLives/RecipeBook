// Main Application Controller
class RecipeBookApp {
    constructor() {
        this.currentSection = 'recipes';
        this.initialized = false;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        if (this.initialized) return;
        this.initialized = true;

        this.bindNavigationEvents();
        this.initializeServiceWorker();
        this.showWelcomeMessage();
        this.setupKeyboardShortcuts();
        
        console.log('RecipeBook App initialized successfully');
    }

    bindNavigationEvents() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const section = e.target.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const section = e.state?.section || 'recipes';
            this.showSection(section, false);
        });

        // Set initial state
        const urlParams = new URLSearchParams(window.location.search);
        const initialSection = urlParams.get('section') || 'recipes';
        this.showSection(initialSection, false);
    }

    showSection(sectionName, updateHistory = true) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(button => {
            button.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName);
        const targetNavButton = document.querySelector(`[data-section="${sectionName}"]`);

        if (targetSection && targetNavButton) {
            targetSection.classList.add('active');
            targetNavButton.classList.add('active');
            this.currentSection = sectionName;

            // Update browser history
            if (updateHistory) {
                const url = new URL(window.location);
                url.searchParams.set('section', sectionName);
                window.history.pushState({ section: sectionName }, '', url);
            }

            // Section-specific initialization
            this.initializeSection(sectionName);
        }
    }

    initializeSection(sectionName) {
        switch (sectionName) {
            case 'recipes':
                this.initializeRecipesSection();
                break;
            case 'experiments':
                this.initializeExperimentsSection();
                break;
            case 'health':
                this.initializeHealthSection();
                break;
            case 'calculator':
                this.initializeCalculatorSection();
                break;
        }
    }

    initializeRecipesSection() {
        // Recipes section is handled by RecipeManager
        if (window.recipeManager && window.recipeManager.loadRecipes) {
            window.recipeManager.loadRecipes();
        }
    }

    initializeExperimentsSection() {
        if (window.recipeManager) {
            window.recipeManager.loadExperiments();
            window.recipeManager.updateExperimentStats();
        }
        
        this.displayExperimentInsights();
    }

    initializeHealthSection() {
        this.analyzeRecipeHealth();
        this.displayHealthTips();
    }

    initializeCalculatorSection() {
        this.initializeRecipeScaling();
        this.displayIngredientInteractions();
    }

    displayExperimentInsights() {
        const stats = window.experimentTracker?.getExperimentStatistics();
        if (!stats) return;

        const patterns = window.experimentTracker.getTrendingPatterns();
        
        // Display trending patterns
        console.log('Experiment patterns:', patterns);
        
        // You could display these insights in the UI
        // This is a placeholder for now
    }

    analyzeRecipeHealth() {
        const recipes = window.storageManager?.getAllRecipes() || [];
        const preferences = window.storageManager?.getUserPreferences() || {};
        
        recipes.forEach(recipe => {
            if (window.healthAdvisor) {
                const healthScore = window.healthAdvisor.generateHealthScore(recipe, preferences);
                const allergenCheck = window.healthAdvisor.checkAllergens(recipe, preferences.knownAllergies || []);
                
                // Store health analysis (you could display this in the UI)
                recipe.healthAnalysis = {
                    score: healthScore,
                    allergens: allergenCheck
                };
            }
        });
    }

    displayHealthTips() {
        // Display general health tips based on user preferences
        const preferences = window.storageManager?.getUserPreferences() || {};
        const tips = this.generateHealthTips(preferences);
        
        // You could display these in the health section
        console.log('Health tips:', tips);
    }

    generateHealthTips(preferences) {
        const tips = [];
        
        if (preferences.dietaryRestrictions?.includes('diabetic')) {
            tips.push('Focus on complex carbohydrates and fiber-rich foods to help manage blood sugar levels.');
        }
        
        if (preferences.dietaryRestrictions?.includes('keto')) {
            tips.push('Track your macronutrients to maintain ketosis - aim for 70-80% fat, 15-25% protein, 5-10% carbs.');
        }
        
        if (preferences.dietaryRestrictions?.includes('vegan')) {
            tips.push('Ensure adequate B12, iron, and protein intake. Combine legumes with grains for complete proteins.');
        }
        
        // Add general tips
        tips.push('Experiment with herbs and spices to add flavor without extra calories or sodium.');
        tips.push('Try batch cooking to save time and ensure consistent healthy meals throughout the week.');
        
        return tips;
    }

    initializeRecipeScaling() {
        // Initialize the scaling calculator with default values
        const originalServings = document.getElementById('original-servings');
        const desiredServings = document.getElementById('desired-servings');
        
        if (originalServings && desiredServings) {
            originalServings.value = 4;
            desiredServings.value = 6;
            
            if (window.recipeManager) {
                window.recipeManager.updateScalingFactor();
            }
        }
    }

    displayIngredientInteractions() {
        const monitor = document.getElementById('effects-monitor');
        if (!monitor) return;

        // Show some general ingredient interaction tips
        const generalTips = `
            <div class="effect-warning">
                <h4>Ingredient Interaction Tips</h4>
                <p>• Salt inhibits yeast - add after yeast has activated</p>
                <p>• Acid can curdle dairy - add slowly while stirring</p>
                <p>• Coffee enhances chocolate flavor without making it taste like coffee</p>
                <p>• Fresh herbs should be added at the end to preserve their flavor</p>
            </div>
        `;
        
        monitor.innerHTML = generalTips;
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when no input is focused
            if (document.activeElement.tagName === 'INPUT' || 
                document.activeElement.tagName === 'TEXTAREA' ||
                document.activeElement.tagName === 'SELECT') {
                return;
            }

            switch (e.key) {
                case '1':
                    this.showSection('recipes');
                    break;
                case '2':
                    this.showSection('experiments');
                    break;
                case '3':
                    this.showSection('health');
                    break;
                case '4':
                    this.showSection('calculator');
                    break;
                case 'n':
                    if (this.currentSection === 'recipes') {
                        window.recipeManager?.openRecipeModal();
                    } else if (this.currentSection === 'experiments') {
                        window.recipeManager?.openExperimentModal();
                    }
                    break;
                case 'Escape':
                    window.recipeManager?.closeAllModals();
                    break;
            }
        });
    }

    showWelcomeMessage() {
        const recipes = window.storageManager?.getAllRecipes() || [];
        
        if (recipes.length === 0) {
            // Show welcome message for new users
            setTimeout(() => {
                window.recipeManager?.showToast(
                    'Welcome to RecipeBook! Start by adding your first recipe.',
                    'info'
                );
            }, 1000);
        } else {
            // Show stats for returning users
            const stats = window.experimentTracker?.getExperimentStatistics() || {};
            const message = `Welcome back! You have ${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} and ${stats.total || 0} experiment${stats.total !== 1 ? 's' : ''}.`;
            
            setTimeout(() => {
                window.recipeManager?.showToast(message, 'info');
            }, 500);
        }
    }

    // Progressive Web App features
    initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful');
                    })
                    .catch(error => {
                        console.log('ServiceWorker registration failed');
                    });
            });
        }
    }

    // Export/Import functionality
    exportData() {
        const data = window.storageManager?.exportData();
        if (!data) return;

        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `recipebook-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        window.recipeManager?.showToast('Data exported successfully!', 'success');
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const success = window.storageManager?.importData(e.target.result);
            if (success) {
                window.recipeManager?.showToast('Data imported successfully!', 'success');
                window.location.reload(); // Refresh to show imported data
            } else {
                window.recipeManager?.showToast('Error importing data. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Search functionality across all sections
    globalSearch(query) {
        const results = {
            recipes: window.storageManager?.searchRecipes(query) || [],
            experiments: [],
            tips: []
        };

        // Search experiments
        const experiments = window.storageManager?.getAllExperiments() || [];
        results.experiments = experiments.filter(exp => 
            exp.name.toLowerCase().includes(query.toLowerCase()) ||
            exp.changes.toLowerCase().includes(query.toLowerCase())
        );

        return results;
    }

    // Theme management
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('recipebook-theme', theme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('recipebook-theme') || 'light';
        this.setTheme(savedTheme);
    }

    // Backup reminder
    showBackupReminder() {
        const lastBackup = localStorage.getItem('recipebook-last-backup');
        const now = Date.now();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;

        if (!lastBackup || (now - parseInt(lastBackup)) > oneWeek) {
            setTimeout(() => {
                if (confirm('It\'s been a while since your last backup. Would you like to export your data?')) {
                    this.exportData();
                    localStorage.setItem('recipebook-last-backup', now.toString());
                }
            }, 2000);
        }
    }

    // Analytics and usage tracking (local only)
    trackUsage(action, details = {}) {
        const usage = JSON.parse(localStorage.getItem('recipebook-usage') || '[]');
        usage.push({
            action,
            details,
            timestamp: Date.now()
        });

        // Keep only last 100 entries
        if (usage.length > 100) {
            usage.splice(0, usage.length - 100);
        }

        localStorage.setItem('recipebook-usage', JSON.stringify(usage));
    }

    getUsageStats() {
        const usage = JSON.parse(localStorage.getItem('recipebook-usage') || '[]');
        const stats = {
            totalActions: usage.length,
            mostUsedFeatures: {},
            dailyActivity: {}
        };

        usage.forEach(entry => {
            // Count feature usage
            stats.mostUsedFeatures[entry.action] = 
                (stats.mostUsedFeatures[entry.action] || 0) + 1;

            // Count daily activity
            const date = new Date(entry.timestamp).toDateString();
            stats.dailyActivity[date] = 
                (stats.dailyActivity[date] || 0) + 1;
        });

        return stats;
    }
}

// Initialize app when script loads
const app = new RecipeBookApp();

// Make app available globally for debugging
window.recipeBookApp = app;

// Add some global utility functions
window.exportRecipeBookData = () => app.exportData();
window.showUsageStats = () => console.log(app.getUsageStats());