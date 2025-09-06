// Ingredient Analyzer for scaling, warnings, and interactions
class IngredientAnalyzer {
    constructor() {
        this.ingredientEffects = this.initializeIngredientEffects();
        this.ingredientInteractions = this.initializeIngredientInteractions();
        this.scalingRules = this.initializeScalingRules();
    }

    initializeIngredientEffects() {
        return {
            // Baking ingredients
            'sugar': {
                tooMuch: 'Too much sugar makes cookies flat and spread more, can make cakes dense and gummy',
                tooLittle: 'Too little sugar reduces browning, makes baked goods less tender and sweet',
                optimal: '1-2 cups per batch of cookies, 1/2-3/4 cup per cup of flour in cakes'
            },
            'salt': {
                tooMuch: 'Too much salt makes food inedible and masks other flavors',
                tooLittle: 'Too little salt makes food taste flat and bland, reduces flavor development',
                optimal: '1/4 to 1/2 teaspoon per cup of flour in baking, 1/2 to 1 teaspoon per pound of meat'
            },
            'baking powder': {
                tooMuch: 'Too much baking powder creates bitter metallic taste, causes excessive rise then collapse',
                tooLittle: 'Too little baking powder results in dense, heavy baked goods that don\'t rise properly',
                optimal: '1 teaspoon per cup of flour for most baked goods'
            },
            'baking soda': {
                tooMuch: 'Too much baking soda creates soapy, bitter taste and excessive browning',
                tooLittle: 'Too little baking soda results in poor rise and pale color in baked goods',
                optimal: '1/4 teaspoon per cup of flour when acidic ingredients are present'
            },
            'yeast': {
                tooMuch: 'Too much yeast causes over-fermentation, alcohol taste, and structural collapse',
                tooLittle: 'Too little yeast results in slow or no rise, dense bread texture',
                optimal: '1 packet (2.25 tsp) per 3-4 cups flour for most bread recipes'
            },
            'flour': {
                tooMuch: 'Too much flour makes baked goods tough, dry, and heavy',
                tooLittle: 'Too little flour creates weak structure, spreading in cookies, flat cakes',
                optimal: 'Measure by weight (125g per cup) for best results'
            },
            'butter': {
                tooMuch: 'Too much butter can cause cookies to spread excessively, cakes to be greasy',
                tooLittle: 'Too little butter results in tough, dry texture and poor flavor',
                optimal: 'Room temperature for creaming, cold for flaky pastries'
            },
            'eggs': {
                tooMuch: 'Too many eggs make baked goods rubbery and dense',
                tooLittle: 'Too few eggs create crumbly texture and poor binding',
                optimal: '1 large egg per cup of flour in most recipes'
            },
            // Cooking ingredients
            'garlic': {
                tooMuch: 'Too much garlic overpowers other flavors and can become bitter when overcooked',
                tooLittle: 'Too little garlic provides insufficient flavor depth and aroma',
                optimal: '1-2 cloves per serving, add at different stages for varying intensity'
            },
            'onion': {
                tooMuch: 'Too much onion can overpower delicate flavors and make dishes watery',
                tooLittle: 'Too little onion misses the foundational flavor base for many dishes',
                optimal: '1 medium onion per 1-2 pounds of meat or 4 servings'
            },
            'oil': {
                tooMuch: 'Too much oil makes food greasy and can mask other flavors',
                tooLittle: 'Too little oil in cooking can cause sticking and uneven cooking',
                optimal: '1-2 tablespoons for sautéing, 1/4 cup oil per cup flour in baking'
            },
            'lemon juice': {
                tooMuch: 'Too much lemon juice can make dishes overly acidic and mask other flavors',
                tooLittle: 'Too little acid misses the brightness and balance in many dishes',
                optimal: '1-2 tablespoons per dish, taste and adjust gradually'
            },
            'vanilla': {
                tooMuch: 'Too much vanilla creates an artificial, overpowering flavor',
                tooLittle: 'Too little vanilla misses the flavor enhancement in desserts',
                optimal: '1-2 teaspoons per recipe, use pure extract not imitation'
            }
        };
    }

    initializeIngredientInteractions() {
        return [
            {
                ingredients: ['baking soda', 'acidic ingredients'],
                effect: 'Baking soda needs acid to activate. Combine with buttermilk, yogurt, or vinegar for proper leavening.',
                type: 'beneficial'
            },
            {
                ingredients: ['salt', 'yeast'],
                effect: 'Salt inhibits yeast growth. Add salt after yeast has started working or keep them separate in mixing.',
                type: 'caution'
            },
            {
                ingredients: ['chocolate', 'coffee'],
                effect: 'Coffee enhances chocolate flavor without making it taste like coffee. Add 1-2 tsp instant coffee to chocolate desserts.',
                type: 'beneficial'
            },
            {
                ingredients: ['tomato', 'basil'],
                effect: 'Add fresh basil at the end of cooking to preserve its bright flavor and aroma.',
                type: 'beneficial'
            },
            {
                ingredients: ['garlic', 'ginger'],
                effect: 'Cook garlic and ginger at the same time for aromatic base. Garlic burns easier, so watch temperature.',
                type: 'caution'
            },
            {
                ingredients: ['dairy', 'acidic ingredients'],
                effect: 'Acid can curdle dairy products. Temper dairy or add acid slowly while stirring.',
                type: 'caution'
            },
            {
                ingredients: ['baking powder', 'buttermilk'],
                effect: 'Buttermilk is acidic and can react with baking powder. Reduce baking powder slightly when using buttermilk.',
                type: 'caution'
            }
        ];
    }

    initializeScalingRules() {
        return {
            // Linear scaling (scale directly with serving size)
            linear: ['salt', 'pepper', 'herbs', 'spices', 'vanilla', 'oil', 'butter', 'sugar', 'flour'],
            
            // Exponential scaling (doesn't scale linearly)
            exponential: {
                'garlic': { rule: 'Scale by 0.8x factor to avoid overpowering' },
                'hot sauce': { rule: 'Scale by 0.7x factor, heat compounds exponentially' },
                'alcohol': { rule: 'Scale by 0.9x factor, alcohol concentration affects differently' },
                'baking powder': { rule: 'Scale by 0.9x factor to prevent over-leavening' },
                'baking soda': { rule: 'Scale by 0.9x factor to prevent bitter taste' }
            },

            // Fixed amounts (don't scale much regardless of serving size)
            fixed: {
                'yeast': { rule: 'Yeast amount stays relatively constant, increase cooking time instead' },
                'gelatin': { rule: 'Gelatin ratio to liquid is critical, scale carefully' },
                'agar': { rule: 'Agar sets differently at different concentrations' }
            }
        };
    }

    // Scale recipe ingredients
    scaleRecipe(recipe, originalServings, desiredServings) {
        const scalingFactor = desiredServings / originalServings;
        const scaledIngredients = [];
        const warnings = [];

        recipe.ingredients.forEach(ingredient => {
            const ingredientName = ingredient.name.toLowerCase();
            let scaledAmount = ingredient.amount;
            let scalingUsed = scalingFactor;

            // Check for special scaling rules
            if (this.scalingRules.exponential[ingredientName]) {
                const rule = this.scalingRules.exponential[ingredientName];
                scalingUsed = Math.pow(scalingFactor, 0.8); // Reduce scaling factor
                warnings.push(`${ingredient.name}: ${rule.rule}`);
            } else if (this.scalingRules.fixed[ingredientName]) {
                const rule = this.scalingRules.fixed[ingredientName];
                scalingUsed = Math.min(scalingFactor, 1.5); // Limit scaling
                warnings.push(`${ingredient.name}: ${rule.rule}`);
            }

            // Apply scaling
            if (typeof scaledAmount === 'number') {
                scaledAmount = scaledAmount * scalingUsed;
            } else if (typeof scaledAmount === 'string') {
                // Try to parse and scale numeric amounts
                const numericMatch = scaledAmount.match(/(\d+(?:\.\d+)?)/);
                if (numericMatch) {
                    const originalNumber = parseFloat(numericMatch[1]);
                    const scaledNumber = originalNumber * scalingUsed;
                    scaledAmount = scaledAmount.replace(numericMatch[1], scaledNumber.toFixed(2));
                }
            }

            scaledIngredients.push({
                ...ingredient,
                originalAmount: ingredient.amount,
                amount: scaledAmount,
                scalingFactor: scalingUsed
            });
        });

        return {
            scaledIngredients,
            warnings,
            scalingFactor,
            originalServings,
            desiredServings
        };
    }

    // Analyze ingredient effects
    analyzeIngredientEffects(ingredients, scalingFactor = 1) {
        const effects = [];
        
        ingredients.forEach(ingredient => {
            const ingredientName = ingredient.name.toLowerCase();
            const effectData = this.ingredientEffects[ingredientName];
            
            if (effectData) {
                let effect = {
                    ingredient: ingredient.name,
                    amount: ingredient.amount,
                    warnings: []
                };

                // Check for scaling effects
                if (scalingFactor > 1.5) {
                    effect.warnings.push({
                        type: 'scaling',
                        message: `Scaled up ${scalingFactor.toFixed(1)}x: ${effectData.tooMuch}`,
                        severity: 'warning'
                    });
                } else if (scalingFactor < 0.7) {
                    effect.warnings.push({
                        type: 'scaling',
                        message: `Scaled down ${scalingFactor.toFixed(1)}x: ${effectData.tooLittle}`,
                        severity: 'warning'
                    });
                }

                // Add optimal usage tips
                effect.tip = effectData.optimal;

                if (effect.warnings.length > 0 || effect.tip) {
                    effects.push(effect);
                }
            }
        });

        return effects;
    }

    // Check ingredient interactions
    checkIngredientInteractions(ingredients) {
        const interactions = [];
        const ingredientNames = ingredients.map(ing => ing.name.toLowerCase());

        this.ingredientInteractions.forEach(interaction => {
            const hasInteraction = interaction.ingredients.every(requiredIngredient => {
                if (requiredIngredient === 'acidic ingredients') {
                    return ingredientNames.some(name => 
                        ['lemon juice', 'vinegar', 'buttermilk', 'yogurt', 'sour cream', 'tomato'].includes(name)
                    );
                }
                return ingredientNames.includes(requiredIngredient);
            });

            if (hasInteraction) {
                interactions.push(interaction);
            }
        });

        return interactions;
    }

    // Get ingredient substitutions based on dietary restrictions
    getIngredientSubstitutions(ingredientName, dietaryRestrictions = []) {
        const substitutions = {
            'butter': [
                { name: 'Coconut oil', ratio: '1:1', notes: 'Solid at room temp, adds slight coconut flavor', vegan: true },
                { name: 'Vegetable oil', ratio: '3/4:1', notes: 'Use 3/4 amount, different texture', vegan: true },
                { name: 'Applesauce', ratio: '1/2:1', notes: 'For baking only, reduces fat content', vegan: true }
            ],
            'eggs': [
                { name: 'Flax eggs', ratio: '1 tbsp ground flax + 3 tbsp water per egg', notes: 'Let sit 5 minutes, works well in baking', vegan: true },
                { name: 'Chia eggs', ratio: '1 tbsp chia seeds + 3 tbsp water per egg', notes: 'Let sit 15 minutes', vegan: true },
                { name: 'Applesauce', ratio: '1/4 cup per egg', notes: 'For baking, adds moisture', vegan: true },
                { name: 'Commercial egg replacer', ratio: 'Follow package instructions', notes: 'Consistent results', vegan: true }
            ],
            'milk': [
                { name: 'Almond milk', ratio: '1:1', notes: 'Light flavor, lower protein', dairyFree: true, vegan: true },
                { name: 'Oat milk', ratio: '1:1', notes: 'Creamy texture, slight oat flavor', dairyFree: true, vegan: true },
                { name: 'Coconut milk', ratio: '1:1', notes: 'Rich, adds coconut flavor', dairyFree: true, vegan: true },
                { name: 'Soy milk', ratio: '1:1', notes: 'Highest protein content', dairyFree: true, vegan: true }
            ],
            'sugar': [
                { name: 'Stevia', ratio: '1 tsp per 1 cup sugar', notes: 'Very sweet, may affect texture', diabetic: true, lowCarb: true },
                { name: 'Erythritol', ratio: '1:1', notes: 'Similar sweetness, may have cooling effect', diabetic: true, lowCarb: true },
                { name: 'Monk fruit sweetener', ratio: '1/3 to 1/2 cup per 1 cup sugar', notes: 'Very sweet, natural', diabetic: true },
                { name: 'Coconut sugar', ratio: '1:1', notes: 'Lower glycemic index, slight coconut taste', naturalSweetener: true }
            ],
            'flour': [
                { name: 'Almond flour', ratio: '1:1 (reduce liquid by 1/4)', notes: 'Higher fat, denser texture', glutenFree: true, lowCarb: true },
                { name: 'Rice flour', ratio: '1:1', notes: 'Light texture, combine with other flours', glutenFree: true },
                { name: 'Coconut flour', ratio: '1/4 to 1/3 cup per 1 cup flour', notes: 'Very absorbent, increase eggs/liquid', glutenFree: true, lowCarb: true },
                { name: 'Gluten-free flour blend', ratio: '1:1', notes: 'Pre-mixed blend for best results', glutenFree: true }
            ],
            'soy sauce': [
                { name: 'Tamari', ratio: '1:1', notes: 'Wheat-free soy sauce', glutenFree: true },
                { name: 'Coconut aminos', ratio: '1:1', notes: 'Soy-free, slightly sweet', glutenFree: true, soyFree: true },
                { name: 'Liquid aminos', ratio: '1:1', notes: 'Less sodium, different flavor profile', lowSodium: true }
            ]
        };

        const ingredient = substitutions[ingredientName.toLowerCase()];
        if (!ingredient) return [];

        // Filter substitutions based on dietary restrictions
        return ingredient.filter(sub => {
            if (dietaryRestrictions.includes('vegan') && !sub.vegan) return false;
            if (dietaryRestrictions.includes('gluten-free') && !sub.glutenFree) return false;
            if (dietaryRestrictions.includes('dairy-free') && !sub.dairyFree) return false;
            if (dietaryRestrictions.includes('low-carb') && !sub.lowCarb) return false;
            if (dietaryRestrictions.includes('diabetic') && !sub.diabetic) return false;
            if (dietaryRestrictions.includes('soy-free') && !sub.soyFree) return false;
            if (dietaryRestrictions.includes('low-sodium') && !sub.lowSodium) return false;
            return true;
        });
    }

    // Convert measurements
    convertMeasurement(amount, fromUnit, toUnit) {
        const conversions = {
            // Volume conversions (to ml)
            'tsp': 4.92892,
            'tbsp': 14.7868,
            'cup': 236.588,
            'fl oz': 29.5735,
            'pint': 473.176,
            'quart': 946.353,
            'gallon': 3785.41,
            'ml': 1,
            'l': 1000,

            // Weight conversions (to grams)
            'oz': 28.3495,
            'lb': 453.592,
            'g': 1,
            'kg': 1000,

            // Baking specific
            'stick butter': { ml: 118.294, g: 113.4 } // 1 stick = 8 tbsp = 1/2 cup
        };

        // Simple conversion for common units
        if (conversions[fromUnit] && conversions[toUnit]) {
            const baseAmount = amount * conversions[fromUnit];
            return baseAmount / conversions[toUnit];
        }

        return amount; // Return original if no conversion available
    }
}

// Create global ingredient analyzer instance
window.ingredientAnalyzer = new IngredientAnalyzer();