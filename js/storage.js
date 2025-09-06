// Storage module for managing local data persistence
class StorageManager {
    constructor() {
        this.storageKey = 'recipeBook';
        this.data = this.loadData();
    }

    // Load data from localStorage
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
        }
        
        // Return default data structure
        return {
            recipes: [],
            experiments: [],
            userPreferences: {
                dietaryRestrictions: [],
                healthConditions: []
            },
            lastModified: Date.now()
        };
    }

    // Save data to localStorage
    saveData() {
        try {
            this.data.lastModified = Date.now();
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            return false;
        }
    }

    // Recipe management
    addRecipe(recipe) {
        recipe.id = this.generateId();
        recipe.createdAt = Date.now();
        recipe.updatedAt = Date.now();
        this.data.recipes.push(recipe);
        this.saveData();
        return recipe;
    }

    updateRecipe(id, updatedRecipe) {
        const index = this.data.recipes.findIndex(recipe => recipe.id === id);
        if (index !== -1) {
            this.data.recipes[index] = { ...this.data.recipes[index], ...updatedRecipe, updatedAt: Date.now() };
            this.saveData();
            return this.data.recipes[index];
        }
        return null;
    }

    deleteRecipe(id) {
        const index = this.data.recipes.findIndex(recipe => recipe.id === id);
        if (index !== -1) {
            const deleted = this.data.recipes.splice(index, 1)[0];
            this.saveData();
            return deleted;
        }
        return null;
    }

    getRecipe(id) {
        return this.data.recipes.find(recipe => recipe.id === id);
    }

    getAllRecipes() {
        return this.data.recipes;
    }

    searchRecipes(query, category = null) {
        let results = this.data.recipes;

        if (category) {
            results = results.filter(recipe => recipe.category === category);
        }

        if (query) {
            const lowercaseQuery = query.toLowerCase();
            results = results.filter(recipe =>
                recipe.name.toLowerCase().includes(lowercaseQuery) ||
                recipe.instructions.toLowerCase().includes(lowercaseQuery) ||
                recipe.notes?.toLowerCase().includes(lowercaseQuery) ||
                recipe.ingredients.some(ingredient => 
                    ingredient.name.toLowerCase().includes(lowercaseQuery)
                )
            );
        }

        return results;
    }

    // Experiment management
    addExperiment(experiment) {
        experiment.id = this.generateId();
        experiment.createdAt = Date.now();
        experiment.updatedAt = Date.now();
        experiment.status = 'active';
        this.data.experiments.push(experiment);
        this.saveData();
        return experiment;
    }

    updateExperiment(id, updatedExperiment) {
        const index = this.data.experiments.findIndex(exp => exp.id === id);
        if (index !== -1) {
            this.data.experiments[index] = { ...this.data.experiments[index], ...updatedExperiment, updatedAt: Date.now() };
            this.saveData();
            return this.data.experiments[index];
        }
        return null;
    }

    completeExperiment(id, result, notes = '') {
        const experiment = this.data.experiments.find(exp => exp.id === id);
        if (experiment) {
            experiment.status = result; // 'success' or 'failed'
            experiment.completedAt = Date.now();
            experiment.resultNotes = notes;
            experiment.updatedAt = Date.now();
            this.saveData();
            return experiment;
        }
        return null;
    }

    getAllExperiments() {
        return this.data.experiments;
    }

    getActiveExperiments() {
        return this.data.experiments.filter(exp => exp.status === 'active');
    }

    getExperimentStats() {
        const experiments = this.data.experiments;
        const total = experiments.length;
        const active = experiments.filter(exp => exp.status === 'active').length;
        const completed = experiments.filter(exp => exp.status !== 'active').length;
        const successful = experiments.filter(exp => exp.status === 'success').length;
        
        return {
            total,
            active,
            completed,
            successful,
            successRate: completed > 0 ? Math.round((successful / completed) * 100) : 0
        };
    }

    // User preferences
    updateUserPreferences(preferences) {
        this.data.userPreferences = { ...this.data.userPreferences, ...preferences };
        this.saveData();
        return this.data.userPreferences;
    }

    getUserPreferences() {
        return this.data.userPreferences;
    }

    // Utility methods
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    importData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            // Validate data structure
            if (importedData.recipes && importedData.experiments) {
                this.data = importedData;
                this.saveData();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Clear all data (with confirmation)
    clearAllData() {
        this.data = {
            recipes: [],
            experiments: [],
            userPreferences: {
                dietaryRestrictions: [],
                healthConditions: []
            },
            lastModified: Date.now()
        };
        this.saveData();
    }

    // Get storage usage information
    getStorageInfo() {
        const dataString = JSON.stringify(this.data);
        const sizeInBytes = new Blob([dataString]).size;
        const sizeInKB = Math.round(sizeInBytes / 1024);
        
        return {
            recipes: this.data.recipes.length,
            experiments: this.data.experiments.length,
            sizeInBytes,
            sizeInKB,
            lastModified: new Date(this.data.lastModified).toLocaleString()
        };
    }
}

// Create global storage instance
window.storageManager = new StorageManager();