// Recipe Book Application
class RecipeBook {
    constructor() {
        this.recipes = JSON.parse(localStorage.getItem('recipes')) || [];
        this.currentRecipe = null;
        this.editingRecipe = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadRecipes();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Recipe form
        document.getElementById('recipe-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRecipe();
        });

        // Add ingredient button
        document.getElementById('add-ingredient').addEventListener('click', () => {
            this.addIngredientField();
        });

        // Add instruction button
        document.getElementById('add-instruction').addEventListener('click', () => {
            this.addInstructionField();
        });

        // Photo upload
        document.getElementById('recipe-photo').addEventListener('change', (e) => {
            this.handlePhotoUpload(e);
        });

        // Search functionality
        document.getElementById('recipe-search').addEventListener('input', (e) => {
            this.searchRecipes(e.target.value);
        });

        // Cancel button
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.resetForm();
            this.switchTab('recipes');
        });

        // Monitor ingredient changes for effects
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('ingredient-name') || e.target.classList.contains('ingredient-amount')) {
                this.updateIngredientEffects();
                this.updateSubstitutions();
            }
        });

        // Modal edit button
        document.getElementById('edit-recipe-btn').addEventListener('click', () => {
            if (this.currentRecipe) {
                this.editRecipe(this.currentRecipe);
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        if (tabName === 'recipes') {
            this.loadRecipes();
        }
    }

    addIngredientField() {
        const ingredientsList = document.getElementById('ingredients-list');
        const newIngredient = document.createElement('div');
        newIngredient.className = 'ingredient-item';
        newIngredient.innerHTML = `
            <input type="text" placeholder="Amount" class="ingredient-amount">
            <input type="text" placeholder="Unit" class="ingredient-unit">
            <input type="text" placeholder="Ingredient name" class="ingredient-name">
            <button type="button" class="btn-remove" onclick="removeIngredient(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        ingredientsList.appendChild(newIngredient);
        
        // Add event listeners for new fields
        newIngredient.querySelector('.ingredient-name').addEventListener('input', () => {
            this.updateIngredientEffects();
            this.updateSubstitutions();
        });
        newIngredient.querySelector('.ingredient-amount').addEventListener('input', () => {
            this.updateIngredientEffects();
        });
    }

    addInstructionField() {
        const instructionsList = document.getElementById('instructions-list');
        const stepNumber = instructionsList.children.length + 1;
        const newInstruction = document.createElement('div');
        newInstruction.className = 'instruction-item';
        newInstruction.innerHTML = `
            <span class="step-number">${stepNumber}</span>
            <textarea placeholder="Describe this step..." rows="2"></textarea>
            <button type="button" class="btn-remove" onclick="removeInstruction(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        instructionsList.appendChild(newInstruction);
        this.updateStepNumbers();
    }

    updateStepNumbers() {
        const steps = document.querySelectorAll('#instructions-list .step-number');
        steps.forEach((step, index) => {
            step.textContent = index + 1;
        });
    }

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('photo-preview');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Recipe photo">
                    <span>Click to change photo</span>
                `;
            };
            reader.readAsDataURL(file);
        }
    }

    saveRecipe() {
        const formData = this.getFormData();
        
        if (!formData.name.trim()) {
            alert('Please enter a recipe name');
            return;
        }

        if (this.editingRecipe) {
            // Update existing recipe
            const index = this.recipes.findIndex(r => r.id === this.editingRecipe.id);
            if (index !== -1) {
                this.recipes[index] = { ...formData, id: this.editingRecipe.id };
            }
        } else {
            // Create new recipe
            formData.id = Date.now().toString();
            formData.createdAt = new Date().toISOString();
            this.recipes.push(formData);
        }

        this.saveToLocalStorage();
        this.resetForm();
        this.switchTab('recipes');
        this.showNotification(this.editingRecipe ? 'Recipe updated!' : 'Recipe saved!');
    }

    getFormData() {
        const ingredients = [];
        document.querySelectorAll('#ingredients-list .ingredient-item').forEach(item => {
            const amount = item.querySelector('.ingredient-amount').value.trim();
            const unit = item.querySelector('.ingredient-unit').value.trim();
            const name = item.querySelector('.ingredient-name').value.trim();
            
            if (name) {
                ingredients.push({ amount, unit, name });
            }
        });

        const instructions = [];
        document.querySelectorAll('#instructions-list textarea').forEach(textarea => {
            const instruction = textarea.value.trim();
            if (instruction) {
                instructions.push(instruction);
            }
        });

        const healthTags = [];
        document.querySelectorAll('.health-tags input[type="checkbox"]:checked').forEach(checkbox => {
            healthTags.push(checkbox.value);
        });

        const photoPreview = document.querySelector('#photo-preview img');
        const photo = photoPreview ? photoPreview.src : null;

        return {
            name: document.getElementById('recipe-name').value.trim(),
            description: document.getElementById('recipe-description').value.trim(),
            prepTime: parseInt(document.getElementById('prep-time').value) || 0,
            cookTime: parseInt(document.getElementById('cook-time').value) || 0,
            servings: parseInt(document.getElementById('servings').value) || 1,
            photo: photo,
            ingredients: ingredients,
            instructions: instructions,
            notes: document.getElementById('recipe-notes').value.trim(),
            healthTags: healthTags,
            updatedAt: new Date().toISOString()
        };
    }

    resetForm() {
        document.getElementById('recipe-form').reset();
        document.getElementById('form-title').textContent = 'Create New Recipe';
        document.getElementById('photo-preview').innerHTML = `
            <i class="fas fa-camera"></i>
            <span>Click to add photo</span>
        `;
        
        // Reset ingredients to one field
        const ingredientsList = document.getElementById('ingredients-list');
        ingredientsList.innerHTML = `
            <div class="ingredient-item">
                <input type="text" placeholder="Amount" class="ingredient-amount">
                <input type="text" placeholder="Unit" class="ingredient-unit">
                <input type="text" placeholder="Ingredient name" class="ingredient-name">
                <button type="button" class="btn-remove" onclick="removeIngredient(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Reset instructions to one field
        const instructionsList = document.getElementById('instructions-list');
        instructionsList.innerHTML = `
            <div class="instruction-item">
                <span class="step-number">1</span>
                <textarea placeholder="Describe this step..." rows="2"></textarea>
                <button type="button" class="btn-remove" onclick="removeInstruction(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Clear effects and substitutions
        document.getElementById('ingredient-effects').innerHTML = '';
        document.getElementById('ingredient-substitutions').innerHTML = '';

        this.editingRecipe = null;
    }

    loadRecipes() {
        const recipeList = document.getElementById('recipe-list');
        
        if (this.recipes.length === 0) {
            recipeList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <h3>No recipes yet</h3>
                    <p>Create your first recipe to get started!</p>
                    <button class="btn-primary" onclick="recipeBook.switchTab('create')">
                        <i class="fas fa-plus"></i> Create Recipe
                    </button>
                </div>
            `;
            return;
        }

        recipeList.innerHTML = this.recipes.map(recipe => `
            <div class="recipe-card" onclick="recipeBook.viewRecipe('${recipe.id}')">
                ${recipe.photo ? `<img src="${recipe.photo}" alt="${recipe.name}">` : ''}
                <div class="recipe-card-content">
                    <h3>${recipe.name}</h3>
                    <p>${recipe.description || 'No description available'}</p>
                    <div class="recipe-meta">
                        <span><i class="fas fa-clock"></i> ${recipe.prepTime + recipe.cookTime} min</span>
                        <span><i class="fas fa-users"></i> ${recipe.servings} servings</span>
                    </div>
                    <div class="recipe-tags">
                        ${recipe.healthTags.map(tag => `<span class="tag">${this.formatTag(tag)}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    viewRecipe(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        this.currentRecipe = recipe;
        this.showRecipeModal(recipe);
    }

    showRecipeModal(recipe) {
        document.getElementById('modal-recipe-name').textContent = recipe.name;
        
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            ${recipe.photo ? `<img src="${recipe.photo}" alt="${recipe.name}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">` : ''}
            
            <div class="recipe-detail-grid">
                <div class="recipe-detail-section">
                    <h4><i class="fas fa-info-circle"></i> Recipe Info</h4>
                    <p><strong>Description:</strong> ${recipe.description || 'No description'}</p>
                    <p><strong>Prep Time:</strong> ${recipe.prepTime} minutes</p>
                    <p><strong>Cook Time:</strong> ${recipe.cookTime} minutes</p>
                    <p><strong>Total Time:</strong> ${recipe.prepTime + recipe.cookTime} minutes</p>
                    
                    <div class="servings-adjuster">
                        <h4>Servings: <span id="current-servings">${recipe.servings}</span></h4>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="recipeBook.adjustServings(-1)">-</button>
                            <button class="quantity-btn" onclick="recipeBook.adjustServings(1)">+</button>
                            <span style="margin-left: 1rem;">Adjust quantities automatically</span>
                        </div>
                    </div>
                </div>
                
                <div class="recipe-detail-section">
                    <h4><i class="fas fa-heart"></i> Health Tags</h4>
                    <div class="recipe-tags">
                        ${recipe.healthTags.map(tag => `<span class="tag">${this.formatTag(tag)}</span>`).join('') || '<p>No health tags</p>'}
                    </div>
                </div>
            </div>
            
            <div class="recipe-detail-section">
                <h4><i class="fas fa-list-ul"></i> Ingredients</h4>
                <ul class="ingredient-list" id="modal-ingredients">
                    ${recipe.ingredients.map(ing => 
                        `<li data-original-amount="${ing.amount}">
                            <span class="ingredient-amount">${ing.amount}</span> ${ing.unit} ${ing.name}
                        </li>`
                    ).join('')}
                </ul>
            </div>
            
            <div class="recipe-detail-section">
                <h4><i class="fas fa-list-ol"></i> Instructions</h4>
                <ol class="instruction-list">
                    ${recipe.instructions.map((inst, index) => 
                        `<li>
                            <span class="instruction-number">${index + 1}</span>
                            <div>${inst}</div>
                        </li>`
                    ).join('')}
                </ol>
            </div>
            
            ${recipe.notes ? `
                <div class="recipe-detail-section">
                    <h4><i class="fas fa-sticky-note"></i> Notes & Experiments</h4>
                    <p style="white-space: pre-wrap;">${recipe.notes}</p>
                </div>
            ` : ''}
        `;
        
        document.getElementById('recipe-modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    adjustServings(change) {
        const currentServingsSpan = document.getElementById('current-servings');
        const currentServings = parseInt(currentServingsSpan.textContent);
        const originalServings = this.currentRecipe.servings;
        const newServings = Math.max(1, currentServings + change);
        
        currentServingsSpan.textContent = newServings;
        
        // Adjust ingredient amounts
        const ingredientItems = document.querySelectorAll('#modal-ingredients li');
        ingredientItems.forEach(item => {
            const originalAmount = parseFloat(item.dataset.originalAmount) || 0;
            const adjustedAmount = (originalAmount * newServings) / originalServings;
            const amountSpan = item.querySelector('.ingredient-amount');
            
            if (originalAmount > 0) {
                amountSpan.textContent = adjustedAmount % 1 === 0 ? 
                    adjustedAmount.toString() : 
                    adjustedAmount.toFixed(2);
            }
        });
    }

    editRecipe(recipe) {
        this.editingRecipe = recipe;
        this.populateForm(recipe);
        this.closeRecipeModal();
        this.switchTab('create');
        document.getElementById('form-title').textContent = 'Edit Recipe';
    }

    populateForm(recipe) {
        document.getElementById('recipe-name').value = recipe.name;
        document.getElementById('recipe-description').value = recipe.description || '';
        document.getElementById('prep-time').value = recipe.prepTime || '';
        document.getElementById('cook-time').value = recipe.cookTime || '';
        document.getElementById('servings').value = recipe.servings || 4;
        document.getElementById('recipe-notes').value = recipe.notes || '';

        // Populate photo
        if (recipe.photo) {
            document.getElementById('photo-preview').innerHTML = `
                <img src="${recipe.photo}" alt="Recipe photo">
                <span>Click to change photo</span>
            `;
        }

        // Populate ingredients
        const ingredientsList = document.getElementById('ingredients-list');
        ingredientsList.innerHTML = '';
        recipe.ingredients.forEach(ing => {
            const ingredientItem = document.createElement('div');
            ingredientItem.className = 'ingredient-item';
            ingredientItem.innerHTML = `
                <input type="text" placeholder="Amount" class="ingredient-amount" value="${ing.amount}">
                <input type="text" placeholder="Unit" class="ingredient-unit" value="${ing.unit}">
                <input type="text" placeholder="Ingredient name" class="ingredient-name" value="${ing.name}">
                <button type="button" class="btn-remove" onclick="removeIngredient(this)">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            ingredientsList.appendChild(ingredientItem);
        });

        // Populate instructions
        const instructionsList = document.getElementById('instructions-list');
        instructionsList.innerHTML = '';
        recipe.instructions.forEach((inst, index) => {
            const instructionItem = document.createElement('div');
            instructionItem.className = 'instruction-item';
            instructionItem.innerHTML = `
                <span class="step-number">${index + 1}</span>
                <textarea placeholder="Describe this step..." rows="2">${inst}</textarea>
                <button type="button" class="btn-remove" onclick="removeInstruction(this)">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            instructionsList.appendChild(instructionItem);
        });

        // Populate health tags
        recipe.healthTags.forEach(tag => {
            const checkbox = document.querySelector(`input[value="${tag}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }

    searchRecipes(query) {
        const filteredRecipes = this.recipes.filter(recipe => 
            recipe.name.toLowerCase().includes(query.toLowerCase()) ||
            recipe.description.toLowerCase().includes(query.toLowerCase()) ||
            recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query.toLowerCase())) ||
            recipe.healthTags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        const recipeList = document.getElementById('recipe-list');
        if (filteredRecipes.length === 0 && query.length > 0) {
            recipeList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No recipes found</h3>
                    <p>Try a different search term</p>
                </div>
            `;
        } else {
            this.displayFilteredRecipes(filteredRecipes);
        }
    }

    displayFilteredRecipes(recipes) {
        const recipeList = document.getElementById('recipe-list');
        recipeList.innerHTML = recipes.map(recipe => `
            <div class="recipe-card" onclick="recipeBook.viewRecipe('${recipe.id}')">
                ${recipe.photo ? `<img src="${recipe.photo}" alt="${recipe.name}">` : ''}
                <div class="recipe-card-content">
                    <h3>${recipe.name}</h3>
                    <p>${recipe.description || 'No description available'}</p>
                    <div class="recipe-meta">
                        <span><i class="fas fa-clock"></i> ${recipe.prepTime + recipe.cookTime} min</span>
                        <span><i class="fas fa-users"></i> ${recipe.servings} servings</span>
                    </div>
                    <div class="recipe-tags">
                        ${recipe.healthTags.map(tag => `<span class="tag">${this.formatTag(tag)}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateIngredientEffects() {
        const effects = [];
        const ingredients = this.getCurrentIngredients();
        
        ingredients.forEach(ing => {
            const name = ing.name.toLowerCase();
            const amount = parseFloat(ing.amount) || 0;
            
            // Sugar effects for baking
            if (name.includes('sugar') && amount > 0) {
                if (amount > 200) { // grams
                    effects.push({
                        type: 'warning',
                        message: `High sugar content (${amount}g) may make cookies flat and overly sweet. Consider reducing by 25%.`
                    });
                } else if (amount > 150) {
                    effects.push({
                        type: 'tip',
                        message: `Moderate sugar level. Good for chewy cookies. Add 1 tsp vanilla for balance.`
                    });
                }
            }
            
            // Salt effects
            if (name.includes('salt') && amount > 0) {
                if (amount > 2) { // teaspoons
                    effects.push({
                        type: 'warning',
                        message: `High salt content may overpower other flavors. Consider reducing to 1-1.5 tsp.`
                    });
                }
            }
            
            // Flour effects
            if (name.includes('flour') && amount > 0) {
                if (amount < 200) { // grams
                    effects.push({
                        type: 'tip',
                        message: `Low flour amount - great for fudgy brownies or dense cakes.`
                    });
                } else if (amount > 500) {
                    effects.push({
                        type: 'tip',
                        message: `High flour amount - perfect for bread or large batch baking.`
                    });
                }
            }
            
            // Butter/Oil effects
            if ((name.includes('butter') || name.includes('oil')) && amount > 0) {
                if (amount > 250) { // grams
                    effects.push({
                        type: 'warning',
                        message: `High fat content may make baked goods greasy. Consider reducing by 20%.`
                    });
                }
            }
            
            // Egg effects
            if (name.includes('egg') && amount > 6) {
                effects.push({
                    type: 'tip',
                    message: `Many eggs will create a custard-like texture. Great for quiches!`
                });
            }
        });

        this.displayEffects(effects);
    }

    displayEffects(effects) {
        const effectsContainer = document.getElementById('ingredient-effects');
        
        if (effects.length === 0) {
            effectsContainer.innerHTML = '<p>Add ingredients to see cooking tips and warnings.</p>';
            return;
        }
        
        effectsContainer.innerHTML = effects.map(effect => `
            <div class="effect-item effect-${effect.type}">
                <i class="fas fa-${effect.type === 'warning' ? 'exclamation-triangle' : 'lightbulb'}"></i>
                ${effect.message}
            </div>
        `).join('');
    }

    updateSubstitutions() {
        const substitutions = [];
        const ingredients = this.getCurrentIngredients();
        
        ingredients.forEach(ing => {
            const name = ing.name.toLowerCase();
            
            if (name.includes('sugar')) {
                substitutions.push({
                    original: ing.name,
                    alternatives: [
                        'Honey (use 3/4 amount) - adds moisture',
                        'Stevia (use 1/4 amount) - diabetic-friendly',
                        'Applesauce (use 1/2 amount) - reduces calories',
                        'Dates (blended) - natural sweetener'
                    ]
                });
            }
            
            if (name.includes('butter')) {
                substitutions.push({
                    original: ing.name,
                    alternatives: [
                        'Coconut oil - dairy-free option',
                        'Avocado - heart-healthy, reduces calories',
                        'Greek yogurt (use 1/2 amount) - protein boost',
                        'Margarine - vegan option'
                    ]
                });
            }
            
            if (name.includes('flour')) {
                substitutions.push({
                    original: ing.name,
                    alternatives: [
                        'Almond flour (use 1:1) - gluten-free, protein',
                        'Oat flour - heart-healthy, gluten-free',
                        'Coconut flour (use 1/4 amount) - low-carb',
                        'Rice flour - gluten-free, neutral taste'
                    ]
                });
            }
            
            if (name.includes('milk')) {
                substitutions.push({
                    original: ing.name,
                    alternatives: [
                        'Almond milk - dairy-free, low calorie',
                        'Coconut milk - rich, dairy-free',
                        'Oat milk - creamy, sustainable',
                        'Soy milk - protein-rich, dairy-free'
                    ]
                });
            }
            
            if (name.includes('egg')) {
                substitutions.push({
                    original: ing.name,
                    alternatives: [
                        'Flax egg (1 tbsp ground + 3 tbsp water) - vegan',
                        'Chia egg (1 tbsp + 3 tbsp water) - omega-3',
                        'Applesauce (1/4 cup per egg) - reduces calories',
                        'Mashed banana (1/4 cup per egg) - natural sweetness'
                    ]
                });
            }
        });

        this.displaySubstitutions(substitutions);
    }

    displaySubstitutions(substitutions) {
        const substitutionsContainer = document.getElementById('ingredient-substitutions');
        
        if (substitutions.length === 0) {
            substitutionsContainer.innerHTML = '<p>Add ingredients to see healthy substitution suggestions.</p>';
            return;
        }
        
        substitutionsContainer.innerHTML = substitutions.map(sub => `
            <div class="substitution-item">
                <strong>${sub.original} alternatives:</strong>
                <ul style="margin-top: 0.5rem; padding-left: 1rem;">
                    ${sub.alternatives.map(alt => `<li>${alt}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    }

    getCurrentIngredients() {
        const ingredients = [];
        document.querySelectorAll('#ingredients-list .ingredient-item').forEach(item => {
            const amount = item.querySelector('.ingredient-amount').value.trim();
            const unit = item.querySelector('.ingredient-unit').value.trim();
            const name = item.querySelector('.ingredient-name').value.trim();
            
            if (name) {
                ingredients.push({ amount, unit, name });
            }
        });
        return ingredients;
    }

    closeRecipeModal() {
        document.getElementById('recipe-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentRecipe = null;
    }

    formatTag(tag) {
        return tag.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    saveToLocalStorage() {
        localStorage.setItem('recipes', JSON.stringify(this.recipes));
    }

    showNotification(message) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1001;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global functions for inline event handlers
function removeIngredient(button) {
    const item = button.parentElement;
    const list = item.parentElement;
    
    if (list.children.length > 1) {
        item.remove();
        recipeBook.updateIngredientEffects();
        recipeBook.updateSubstitutions();
    }
}

function removeInstruction(button) {
    const item = button.parentElement;
    const list = item.parentElement;
    
    if (list.children.length > 1) {
        item.remove();
        recipeBook.updateStepNumbers();
    }
}

function closeRecipeModal() {
    recipeBook.closeRecipeModal();
}

// Initialize the application
let recipeBook;
document.addEventListener('DOMContentLoaded', () => {
    recipeBook = new RecipeBook();
});

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);