// Recipe Manager for CRUD operations and UI interactions
class RecipeManager {
    constructor() {
        this.currentRecipe = null;
        this.currentExperiment = null;
        this.initializeUI();
    }

    initializeUI() {
        // Add event listeners when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindEvents());
        } else {
            this.bindEvents();
        }
    }

    bindEvents() {
        // Recipe modal events
        const addRecipeBtn = document.getElementById('add-recipe-btn');
        const recipeModal = document.getElementById('recipe-modal');
        const modalClose = recipeModal.querySelector('.modal-close');
        const cancelRecipe = document.getElementById('cancel-recipe');
        const recipeForm = document.getElementById('recipe-form');

        addRecipeBtn?.addEventListener('click', () => this.openRecipeModal());
        modalClose?.addEventListener('click', () => this.closeRecipeModal());
        cancelRecipe?.addEventListener('click', () => this.closeRecipeModal());
        recipeForm?.addEventListener('submit', (e) => this.handleRecipeSubmit(e));

        // Ingredient management
        const addIngredientBtn = document.getElementById('add-ingredient');
        addIngredientBtn?.addEventListener('click', () => this.addIngredientRow());

        // Photo upload
        const recipePhoto = document.getElementById('recipe-photo');
        recipePhoto?.addEventListener('change', (e) => this.handlePhotoUpload(e));

        // Search and filter
        const recipeSearch = document.getElementById('recipe-search');
        const categoryFilter = document.getElementById('category-filter');
        recipeSearch?.addEventListener('input', () => this.filterRecipes());
        categoryFilter?.addEventListener('change', () => this.filterRecipes());

        // Experiment events
        const startExperimentBtn = document.getElementById('start-experiment-btn');
        const experimentModal = document.getElementById('experiment-modal');
        const experimentForm = document.getElementById('experiment-form');

        startExperimentBtn?.addEventListener('click', () => this.openExperimentModal());
        experimentModal?.querySelector('.modal-close')?.addEventListener('click', () => this.closeExperimentModal());
        experimentForm?.addEventListener('submit', (e) => this.handleExperimentSubmit(e));

        // Health section events
        const dietaryCheckboxes = document.querySelectorAll('#health input[type="checkbox"]');
        dietaryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateDietaryPreferences());
        });

        const findSubstitutionsBtn = document.getElementById('find-substitutions');
        findSubstitutionsBtn?.addEventListener('click', () => this.findIngredientSubstitutions());

        // Calculator events
        const originalServings = document.getElementById('original-servings');
        const desiredServings = document.getElementById('desired-servings');
        originalServings?.addEventListener('input', () => this.updateScalingFactor());
        desiredServings?.addEventListener('input', () => this.updateScalingFactor());

        // Modal backdrop clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Initialize data
        this.loadRecipes();
        this.loadExperiments();
        this.updateExperimentStats();
        this.loadUserPreferences();
    }

    // Recipe Modal Management
    openRecipeModal(recipeId = null) {
        const modal = document.getElementById('recipe-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('recipe-form');

        if (recipeId) {
            this.currentRecipe = window.storageManager.getRecipe(recipeId);
            modalTitle.textContent = 'Edit Recipe';
            this.populateRecipeForm(this.currentRecipe);
        } else {
            this.currentRecipe = null;
            modalTitle.textContent = 'Add Recipe';
            form.reset();
            this.resetIngredientsList();
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeRecipeModal() {
        const modal = document.getElementById('recipe-modal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.currentRecipe = null;
    }

    populateRecipeForm(recipe) {
        document.getElementById('recipe-name').value = recipe.name || '';
        document.getElementById('recipe-category').value = recipe.category || '';
        document.getElementById('recipe-servings').value = recipe.servings || 4;
        document.getElementById('recipe-prep-time').value = recipe.prepTime || '';
        document.getElementById('recipe-cook-time').value = recipe.cookTime || '';
        document.getElementById('recipe-instructions').value = recipe.instructions || '';
        document.getElementById('recipe-notes').value = recipe.notes || '';

        // Populate ingredients
        this.resetIngredientsList();
        if (recipe.ingredients && recipe.ingredients.length > 0) {
            recipe.ingredients.forEach((ingredient, index) => {
                if (index > 0) this.addIngredientRow();
                const rows = document.querySelectorAll('.ingredient-row');
                const row = rows[index];
                if (row) {
                    row.querySelector('.ingredient-amount').value = ingredient.amount || '';
                    row.querySelector('.ingredient-unit').value = ingredient.unit || '';
                    row.querySelector('.ingredient-name').value = ingredient.name || '';
                }
            });
        }

        // Show photo if exists
        if (recipe.photo) {
            this.displayPhotoPreview(recipe.photo);
        }
    }

    handleRecipeSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const recipeData = {
            name: document.getElementById('recipe-name').value,
            category: document.getElementById('recipe-category').value,
            servings: parseInt(document.getElementById('recipe-servings').value),
            prepTime: parseInt(document.getElementById('recipe-prep-time').value),
            cookTime: parseInt(document.getElementById('recipe-cook-time').value),
            instructions: document.getElementById('recipe-instructions').value,
            notes: document.getElementById('recipe-notes').value,
            ingredients: this.collectIngredients()
        };

        // Handle photo
        const photoFile = document.getElementById('recipe-photo').files[0];
        if (photoFile) {
            this.processPhotoUpload(photoFile).then(photoData => {
                recipeData.photo = photoData;
                this.saveRecipe(recipeData);
            });
        } else {
            if (this.currentRecipe && this.currentRecipe.photo) {
                recipeData.photo = this.currentRecipe.photo;
            }
            this.saveRecipe(recipeData);
        }
    }

    saveRecipe(recipeData) {
        try {
            let savedRecipe;
            if (this.currentRecipe) {
                savedRecipe = window.storageManager.updateRecipe(this.currentRecipe.id, recipeData);
                this.showToast('Recipe updated successfully!', 'success');
            } else {
                savedRecipe = window.storageManager.addRecipe(recipeData);
                this.showToast('Recipe added successfully!', 'success');
            }

            this.closeRecipeModal();
            this.loadRecipes();
            
        } catch (error) {
            console.error('Error saving recipe:', error);
            this.showToast('Error saving recipe. Please try again.', 'error');
        }
    }

    collectIngredients() {
        const ingredients = [];
        const rows = document.querySelectorAll('.ingredient-row');
        
        rows.forEach(row => {
            const amount = row.querySelector('.ingredient-amount').value.trim();
            const unit = row.querySelector('.ingredient-unit').value.trim();
            const name = row.querySelector('.ingredient-name').value.trim();
            
            if (name) {
                ingredients.push({ amount, unit, name });
            }
        });
        
        return ingredients;
    }

    addIngredientRow() {
        const ingredientsList = document.getElementById('ingredients-list');
        const newRow = document.createElement('div');
        newRow.className = 'ingredient-row';
        newRow.innerHTML = `
            <input type="text" placeholder="Amount" class="ingredient-amount">
            <input type="text" placeholder="Unit" class="ingredient-unit">
            <input type="text" placeholder="Ingredient" class="ingredient-name">
            <button type="button" class="remove-ingredient">-</button>
        `;
        
        const removeBtn = newRow.querySelector('.remove-ingredient');
        removeBtn.addEventListener('click', () => this.removeIngredientRow(newRow));
        
        ingredientsList.appendChild(newRow);
    }

    removeIngredientRow(row) {
        const ingredientsList = document.getElementById('ingredients-list');
        if (ingredientsList.children.length > 1) {
            row.remove();
        }
    }

    resetIngredientsList() {
        const ingredientsList = document.getElementById('ingredients-list');
        ingredientsList.innerHTML = `
            <div class="ingredient-row">
                <input type="text" placeholder="Amount" class="ingredient-amount">
                <input type="text" placeholder="Unit" class="ingredient-unit">
                <input type="text" placeholder="Ingredient" class="ingredient-name">
                <button type="button" class="remove-ingredient">-</button>
            </div>
        `;
        
        const removeBtn = ingredientsList.querySelector('.remove-ingredient');
        removeBtn.addEventListener('click', () => this.removeIngredientRow(removeBtn.parentElement));
    }

    // Photo handling
    handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (file) {
            this.processPhotoUpload(file).then(photoData => {
                this.displayPhotoPreview(photoData);
            });
        }
    }

    processPhotoUpload(file) {
        return new Promise((resolve, reject) => {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                this.showToast('Photo size must be less than 2MB', 'warning');
                reject(new Error('File too large'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
        });
    }

    displayPhotoPreview(photoData) {
        const preview = document.getElementById('photo-preview');
        preview.innerHTML = `<img src="${photoData}" alt="Recipe photo" style="max-width: 100%; height: auto; border-radius: 8px;">`;
    }

    // Recipe Display and Management
    loadRecipes() {
        const recipes = window.storageManager.getAllRecipes();
        this.displayRecipes(recipes);
    }

    displayRecipes(recipes) {
        const recipesGrid = document.getElementById('recipes-grid');
        if (!recipesGrid) return;

        if (recipes.length === 0) {
            recipesGrid.innerHTML = `
                <div class="no-recipes">
                    <h3>No recipes yet</h3>
                    <p>Start by adding your first recipe!</p>
                    <button class="btn btn-primary" onclick="recipeManager.openRecipeModal()">Add Recipe</button>
                </div>
            `;
            return;
        }

        recipesGrid.innerHTML = recipes.map(recipe => this.createRecipeCard(recipe)).join('');
    }

    createRecipeCard(recipe) {
        const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
        const photoHtml = recipe.photo ? 
            `<img src="${recipe.photo}" alt="${recipe.name}" class="recipe-image">` : 
            `<div class="recipe-image">🍽️</div>`;

        return `
            <div class="recipe-card" onclick="recipeManager.viewRecipe('${recipe.id}')">
                ${photoHtml}
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.name}</h3>
                    <div class="recipe-meta">
                        <span class="recipe-category">${recipe.category || 'Uncategorized'}</span>
                        <span>⏱️ ${totalTime} min</span>
                        <span>👥 ${recipe.servings} servings</span>
                    </div>
                    ${recipe.notes ? `<p class="recipe-notes">${recipe.notes.substring(0, 100)}${recipe.notes.length > 100 ? '...' : ''}</p>` : ''}
                    <div class="recipe-actions" onclick="event.stopPropagation()">
                        <button class="btn btn-secondary btn-sm" onclick="recipeManager.editRecipe('${recipe.id}')">Edit</button>
                        <button class="btn btn-primary btn-sm" onclick="recipeManager.startExperimentWithRecipe('${recipe.id}')">Experiment</button>
                        <button class="btn btn-danger btn-sm" onclick="recipeManager.deleteRecipe('${recipe.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }

    viewRecipe(recipeId) {
        const recipe = window.storageManager.getRecipe(recipeId);
        if (!recipe) return;

        // Create and show detailed recipe view
        this.showRecipeDetails(recipe);
    }

    showRecipeDetails(recipe) {
        // This would show a detailed view of the recipe
        // For now, we'll open the edit modal
        this.openRecipeModal(recipe.id);
    }

    editRecipe(recipeId) {
        this.openRecipeModal(recipeId);
    }

    deleteRecipe(recipeId) {
        if (confirm('Are you sure you want to delete this recipe?')) {
            window.storageManager.deleteRecipe(recipeId);
            this.loadRecipes();
            this.showToast('Recipe deleted successfully', 'success');
        }
    }

    filterRecipes() {
        const searchTerm = document.getElementById('recipe-search')?.value || '';
        const category = document.getElementById('category-filter')?.value || '';
        
        const filteredRecipes = window.storageManager.searchRecipes(searchTerm, category);
        this.displayRecipes(filteredRecipes);
    }

    // Experiment Management
    openExperimentModal() {
        const modal = document.getElementById('experiment-modal');
        const recipeSelect = document.getElementById('experiment-recipe');
        
        // Populate recipe dropdown
        const recipes = window.storageManager.getAllRecipes();
        recipeSelect.innerHTML = '<option value="">Select a recipe to experiment with</option>';
        recipes.forEach(recipe => {
            const option = document.createElement('option');
            option.value = recipe.id;
            option.textContent = recipe.name;
            recipeSelect.appendChild(option);
        });

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeExperimentModal() {
        const modal = document.getElementById('experiment-modal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    startExperimentWithRecipe(recipeId) {
        this.openExperimentModal();
        document.getElementById('experiment-recipe').value = recipeId;
    }

    handleExperimentSubmit(e) {
        e.preventDefault();
        
        const experimentData = {
            baseRecipeId: document.getElementById('experiment-recipe').value,
            name: document.getElementById('experiment-name').value,
            hypothesis: document.getElementById('experiment-hypothesis').value,
            changes: document.getElementById('experiment-changes').value,
            type: 'ingredient-substitution' // Default type
        };

        try {
            const experiment = window.experimentTracker.createExperiment(experimentData.baseRecipeId, experimentData);
            this.closeExperimentModal();
            this.loadExperiments();
            this.updateExperimentStats();
            this.showToast('Experiment started successfully!', 'success');
        } catch (error) {
            console.error('Error creating experiment:', error);
            this.showToast('Error creating experiment. Please try again.', 'error');
        }
    }

    loadExperiments() {
        const experiments = window.storageManager.getAllExperiments();
        this.displayExperiments(experiments);
    }

    displayExperiments(experiments) {
        const experimentsList = document.getElementById('experiments-list');
        if (!experimentsList) return;

        if (experiments.length === 0) {
            experimentsList.innerHTML = `
                <div class="no-experiments">
                    <h3>No experiments yet</h3>
                    <p>Start experimenting with your recipes!</p>
                </div>
            `;
            return;
        }

        experimentsList.innerHTML = experiments.map(experiment => this.createExperimentCard(experiment)).join('');
    }

    createExperimentCard(experiment) {
        const statusClass = `status-${experiment.status}`;
        const createdDate = new Date(experiment.createdAt).toLocaleDateString();
        
        return `
            <div class="experiment-card">
                <div class="experiment-header">
                    <h4 class="experiment-title">${experiment.name}</h4>
                    <span class="experiment-status ${statusClass}">${experiment.status}</span>
                </div>
                <div class="experiment-info">
                    <div>
                        <strong>Base Recipe:</strong> ${experiment.baseRecipeName}
                    </div>
                    <div>
                        <strong>Created:</strong> ${createdDate}
                    </div>
                </div>
                <div class="experiment-changes">
                    <strong>Changes:</strong> ${experiment.changes}
                </div>
                <div class="experiment-actions">
                    <button class="btn btn-secondary btn-sm" onclick="recipeManager.viewExperiment('${experiment.id}')">View</button>
                    <button class="btn btn-primary btn-sm" onclick="recipeManager.recordAttempt('${experiment.id}')">Record Attempt</button>
                    ${experiment.status === 'active' ? 
                        `<button class="btn btn-success btn-sm" onclick="recipeManager.completeExperiment('${experiment.id}', 'success')">Mark Success</button>
                         <button class="btn btn-danger btn-sm" onclick="recipeManager.completeExperiment('${experiment.id}', 'failed')">Mark Failed</button>` 
                        : ''}
                </div>
            </div>
        `;
    }

    updateExperimentStats() {
        const stats = window.experimentTracker.getExperimentStatistics();
        
        document.getElementById('total-experiments').textContent = stats.total;
        document.getElementById('success-rate').textContent = `${stats.successRate}%`;
        document.getElementById('active-experiments').textContent = stats.active;
    }

    completeExperiment(experimentId, result) {
        const notes = prompt(`Add notes about this ${result} experiment:`);
        window.storageManager.completeExperiment(experimentId, result, notes || '');
        this.loadExperiments();
        this.updateExperimentStats();
        this.showToast(`Experiment marked as ${result}!`, result === 'success' ? 'success' : 'error');
    }

    // Health and Substitutions
    updateDietaryPreferences() {
        const preferences = [];
        const checkboxes = document.querySelectorAll('#health input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => preferences.push(checkbox.id));
        
        window.storageManager.updateUserPreferences({ dietaryRestrictions: preferences });
        this.showToast('Dietary preferences updated', 'success');
    }

    loadUserPreferences() {
        const preferences = window.storageManager.getUserPreferences();
        if (preferences.dietaryRestrictions) {
            preferences.dietaryRestrictions.forEach(restriction => {
                const checkbox = document.getElementById(restriction);
                if (checkbox) checkbox.checked = true;
            });
        }
    }

    findIngredientSubstitutions() {
        const ingredient = document.getElementById('ingredient-input').value.trim();
        if (!ingredient) {
            this.showToast('Please enter an ingredient to find substitutions', 'warning');
            return;
        }

        const preferences = window.storageManager.getUserPreferences();
        const substitutions = window.ingredientAnalyzer.getIngredientSubstitutions(
            ingredient, 
            preferences.dietaryRestrictions || []
        );

        this.displaySubstitutions(substitutions, ingredient);
    }

    displaySubstitutions(substitutions, originalIngredient) {
        const resultsContainer = document.getElementById('substitution-results');
        
        if (substitutions.length === 0) {
            resultsContainer.innerHTML = `<p>No substitutions found for "${originalIngredient}" with your dietary preferences.</p>`;
            return;
        }

        const substitutionHtml = substitutions.map(sub => `
            <div class="substitution-item">
                <div class="substitution-name">${sub.name}</div>
                <div class="substitution-ratio">Ratio: ${sub.ratio}</div>
                <div class="substitution-notes">${sub.notes}</div>
            </div>
        `).join('');

        resultsContainer.innerHTML = `
            <h4>Substitutions for "${originalIngredient}":</h4>
            ${substitutionHtml}
        `;
    }

    // Recipe Scaling
    updateScalingFactor() {
        const original = parseFloat(document.getElementById('original-servings')?.value) || 1;
        const desired = parseFloat(document.getElementById('desired-servings')?.value) || 1;
        const factor = desired / original;
        
        document.getElementById('scaling-factor').textContent = `${factor.toFixed(1)}x`;
        
        // Show effects monitor if we have a recipe selected
        this.updateEffectsMonitor(factor);
    }

    updateEffectsMonitor(scalingFactor = 1) {
        const monitor = document.getElementById('effects-monitor');
        if (!monitor) return;

        if (scalingFactor === 1) {
            monitor.innerHTML = '<p>Select different serving sizes to see ingredient effect warnings.</p>';
            return;
        }

        const warnings = [];
        
        if (scalingFactor > 2) {
            warnings.push({
                title: 'Large Scale Increase',
                message: 'Scaling recipes up significantly may affect cooking times, texture, and flavor balance. Consider making multiple smaller batches instead.'
            });
        } else if (scalingFactor < 0.5) {
            warnings.push({
                title: 'Large Scale Decrease',
                message: 'Scaling down significantly may make measurement difficult and affect baking chemistry. Some ingredients may need different scaling ratios.'
            });
        }

        if (scalingFactor !== 1) {
            warnings.push({
                title: 'General Scaling Tips',
                message: 'Seasonings and spices often don\'t scale linearly. Taste and adjust. Baking times may need adjustment.'
            });
        }

        if (warnings.length === 0) {
            monitor.innerHTML = '<p>Scaling factor looks good! No major concerns detected.</p>';
        } else {
            monitor.innerHTML = warnings.map(warning => `
                <div class="effect-warning">
                    <h4>${warning.title}</h4>
                    <p>${warning.message}</p>
                </div>
            `).join('');
        }
    }

    // Utility functions
    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = 'auto';
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Create global recipe manager instance
window.recipeManager = new RecipeManager();