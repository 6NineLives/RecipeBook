// Health Advisor for dietary restrictions, allergies, and medical conditions
class HealthAdvisor {
    constructor() {
        this.dietaryProfiles = this.initializeDietaryProfiles();
        this.allergenDatabase = this.initializeAllergenDatabase();
        this.medicalConditionGuidelines = this.initializeMedicalConditionGuidelines();
        this.nutritionDatabase = this.initializeNutritionDatabase();
    }

    initializeDietaryProfiles() {
        return {
            'gluten-free': {
                name: 'Gluten-Free',
                description: 'Eliminates wheat, barley, rye, and their derivatives',
                avoid: ['wheat flour', 'barley', 'rye', 'bulgur', 'wheat bread', 'pasta', 'beer', 'soy sauce'],
                alternatives: ['rice flour', 'almond flour', 'quinoa', 'rice', 'corn', 'tamari', 'gluten-free bread'],
                cautions: ['Cross-contamination in oats', 'Hidden gluten in processed foods', 'Malt flavoring contains gluten']
            },
            'dairy-free': {
                name: 'Dairy-Free',
                description: 'Eliminates all dairy products and lactose',
                avoid: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'ice cream', 'whey', 'casein'],
                alternatives: ['almond milk', 'oat milk', 'coconut milk', 'vegan cheese', 'coconut oil', 'cashew cream'],
                cautions: ['Hidden dairy in processed foods', 'Lactose in some medications', 'Cross-contamination']
            },
            'vegan': {
                name: 'Vegan',
                description: 'Eliminates all animal products',
                avoid: ['meat', 'poultry', 'fish', 'eggs', 'dairy', 'honey', 'gelatin', 'lard'],
                alternatives: ['tofu', 'tempeh', 'plant milk', 'flax eggs', 'chia eggs', 'maple syrup', 'agar'],
                cautions: ['B12 supplementation recommended', 'Protein combining', 'Iron absorption with vitamin C']
            },
            'keto': {
                name: 'Ketogenic',
                description: 'Very low carb, high fat, moderate protein',
                avoid: ['sugar', 'grains', 'fruits', 'starchy vegetables', 'legumes', 'high-carb foods'],
                alternatives: ['cauliflower rice', 'zucchini noodles', 'almond flour', 'coconut flour', 'stevia', 'erythritol'],
                cautions: ['Electrolyte balance', 'Adequate fiber intake', 'Gradual transition recommended'],
                macroTargets: { carbs: '5-10%', fat: '70-80%', protein: '15-25%' }
            },
            'paleo': {
                name: 'Paleo',
                description: 'Eliminates processed foods, grains, legumes, dairy',
                avoid: ['grains', 'legumes', 'dairy', 'processed foods', 'refined sugar', 'vegetable oils'],
                alternatives: ['sweet potatoes', 'coconut flour', 'almond flour', 'honey', 'maple syrup', 'avocado oil'],
                cautions: ['Nutrient density important', 'Adequate carbs for athletes', 'Social eating challenges']
            },
            'mediterranean': {
                name: 'Mediterranean',
                description: 'Emphasizes whole foods, olive oil, fish, vegetables',
                emphasize: ['olive oil', 'fish', 'vegetables', 'fruits', 'whole grains', 'legumes', 'nuts'],
                limit: ['red meat', 'processed foods', 'refined sugars', 'saturated fats'],
                benefits: ['Heart health', 'Brain health', 'Anti-inflammatory', 'Weight management']
            }
        };
    }

    initializeAllergenDatabase() {
        return {
            'nuts': {
                name: 'Tree Nuts',
                commonSources: ['almonds', 'walnuts', 'cashews', 'pecans', 'pistachios', 'hazelnuts', 'macadamia', 'brazil nuts'],
                hiddenSources: ['marzipan', 'nougat', 'pesto', 'praline', 'artificial flavoring'],
                alternatives: ['sunflower seeds', 'pumpkin seeds', 'soy nuts', 'roasted chickpeas'],
                crossReactivity: ['Other tree nuts', 'Peanuts (different family but common cross-reaction)'],
                severity: 'Can be severe to life-threatening'
            },
            'peanuts': {
                name: 'Peanuts',
                commonSources: ['peanut butter', 'peanut oil', 'peanuts', 'ground nuts'],
                hiddenSources: ['African, Asian, Mexican cuisine', 'chili', 'egg rolls', 'marzipan', 'nougat'],
                alternatives: ['sunflower seed butter', 'soy butter', 'tahini', 'almond butter'],
                crossReactivity: ['Tree nuts (some people)', 'Legumes (rare)'],
                severity: 'Often severe, can be life-threatening'
            },
            'shellfish': {
                name: 'Shellfish',
                commonSources: ['shrimp', 'lobster', 'crab', 'crawfish', 'mollusks', 'oysters', 'scallops'],
                hiddenSources: ['Caesar salad dressing', 'bouillabaisse', 'surimi', 'glucosamine supplements'],
                alternatives: ['fish (if not allergic)', 'plant-based seafood alternatives', 'mushrooms for umami'],
                severity: 'Often develops in adulthood, can be severe'
            },
            'fish': {
                name: 'Fish',
                commonSources: ['salmon', 'tuna', 'cod', 'halibut', 'anchovies', 'sardines'],
                hiddenSources: ['worcestershire sauce', 'caesar dressing', 'fish sauce', 'some vitamins'],
                alternatives: ['plant-based omega-3 (algae)', 'flax seeds', 'chia seeds', 'walnuts'],
                severity: 'Usually lifelong, varies in severity'
            },
            'eggs': {
                name: 'Eggs',
                commonSources: ['eggs', 'mayonnaise', 'meringue', 'custard', 'eggnog'],
                hiddenSources: ['pasta', 'baked goods', 'salad dressings', 'marshmallows', 'vaccines'],
                alternatives: ['flax eggs', 'chia eggs', 'applesauce', 'commercial egg replacer'],
                severity: 'More common in children, often outgrown'
            },
            'soy': {
                name: 'Soy',
                commonSources: ['soybeans', 'tofu', 'tempeh', 'soy sauce', 'miso', 'edamame'],
                hiddenSources: ['vegetable oil', 'lecithin', 'vitamin E', 'natural flavors'],
                alternatives: ['coconut aminos', 'tahini', 'sunflower lecithin'],
                severity: 'Usually mild, more common in infants'
            }
        };
    }

    initializeMedicalConditionGuidelines() {
        return {
            'diabetes': {
                name: 'Diabetes Management',
                type: 'metabolic',
                keyPrinciples: [
                    'Carbohydrate counting and timing',
                    'Consistent meal timing',
                    'Balance of carbs, protein, and fat',
                    'Portion control',
                    'Regular blood sugar monitoring'
                ],
                recommendations: {
                    carbohydrates: 'Complex carbs with fiber, limit simple sugars',
                    protein: 'Lean proteins to help stabilize blood sugar',
                    fats: 'Healthy fats in moderation',
                    fiber: 'High fiber foods to slow glucose absorption',
                    timing: 'Regular meal times to maintain stable blood sugar'
                },
                avoid: ['refined sugars', 'white bread', 'sugary drinks', 'processed foods'],
                encourage: ['whole grains', 'vegetables', 'lean proteins', 'healthy fats', 'nuts'],
                portionGuidance: 'Plate method: 1/2 vegetables, 1/4 lean protein, 1/4 complex carbs',
                monitoring: 'Check blood sugar before and 2 hours after meals'
            },
            'hypertension': {
                name: 'High Blood Pressure',
                type: 'cardiovascular',
                keyPrinciples: [
                    'Reduce sodium intake',
                    'Increase potassium-rich foods',
                    'Maintain healthy weight',
                    'Limit alcohol',
                    'DASH diet principles'
                ],
                recommendations: {
                    sodium: 'Less than 2300mg daily, ideally less than 1500mg',
                    potassium: 'Increase fruits and vegetables',
                    magnesium: 'Nuts, seeds, whole grains, leafy greens',
                    calcium: 'Low-fat dairy or fortified plant alternatives'
                },
                avoid: ['processed foods', 'canned soups', 'deli meats', 'pickled foods', 'excessive salt'],
                encourage: ['fresh fruits', 'vegetables', 'whole grains', 'lean proteins', 'low-fat dairy']
            },
            'kidney-disease': {
                name: 'Kidney Disease',
                type: 'renal',
                keyPrinciples: [
                    'Protein restriction (stage-dependent)',
                    'Phosphorus limitation',
                    'Potassium management',
                    'Sodium restriction',
                    'Fluid management'
                ],
                recommendations: {
                    protein: 'Moderate restriction, focus on high-quality proteins',
                    phosphorus: 'Limit dairy, processed foods, cola',
                    potassium: 'May need limitation depending on stage',
                    sodium: 'Restrict to reduce fluid retention'
                },
                avoid: ['processed meats', 'dairy (if phosphorus restricted)', 'nuts (if potassium restricted)'],
                monitoring: 'Regular lab work to adjust restrictions'
            },
            'heart-disease': {
                name: 'Heart Disease',
                type: 'cardiovascular',
                keyPrinciples: [
                    'Reduce saturated and trans fats',
                    'Increase omega-3 fatty acids',
                    'Emphasize plant foods',
                    'Limit cholesterol',
                    'Control portions'
                ],
                recommendations: {
                    fats: 'Monounsaturated and polyunsaturated fats',
                    omega3: 'Fatty fish twice weekly or plant sources',
                    fiber: 'Soluble fiber to lower cholesterol',
                    antioxidants: 'Colorful fruits and vegetables'
                },
                avoid: ['saturated fats', 'trans fats', 'excessive cholesterol', 'processed meats'],
                encourage: ['fatty fish', 'olive oil', 'nuts', 'whole grains', 'fruits', 'vegetables']
            },
            'celiac': {
                name: 'Celiac Disease',
                type: 'autoimmune',
                keyPrinciples: [
                    'Strict gluten avoidance',
                    'Prevent cross-contamination',
                    'Read all labels carefully',
                    'Be aware of hidden sources',
                    'Monitor for nutritional deficiencies'
                ],
                recommendations: {
                    grains: 'Certified gluten-free oats, rice, quinoa, corn',
                    crossContamination: 'Separate cooking areas and utensils',
                    eating out: 'Verify gluten-free preparation methods'
                },
                avoid: ['wheat', 'barley', 'rye', 'triticale', 'contaminated oats'],
                monitoring: 'Regular follow-up for nutritional status and healing'
            }
        };
    }

    initializeNutritionDatabase() {
        return {
            'sugar': { carbs: 4, calories: 16, glycemicIndex: 65 },
            'honey': { carbs: 17, calories: 64, glycemicIndex: 55 },
            'flour': { carbs: 76, protein: 10, calories: 364, fiber: 3 },
            'rice': { carbs: 23, protein: 2.7, calories: 130, glycemicIndex: 73 },
            'quinoa': { carbs: 22, protein: 4.4, calories: 120, fiber: 2.8, glycemicIndex: 53 },
            'oats': { carbs: 12, protein: 2.5, calories: 71, fiber: 1.9, glycemicIndex: 55 },
            'almonds': { carbs: 6, protein: 6, fat: 14, calories: 161, fiber: 3.5 },
            'salmon': { protein: 25, fat: 11, calories: 206, omega3: 1.8 },
            'chicken breast': { protein: 31, fat: 3.6, calories: 165 },
            'broccoli': { carbs: 7, protein: 3, calories: 25, fiber: 2.6, vitaminC: 89 },
            'spinach': { carbs: 1, protein: 0.9, calories: 7, iron: 0.8, folate: 58 }
        };
    }

    // Analyze recipe for dietary compatibility
    analyzeRecipeForDiet(recipe, dietaryRestrictions) {
        const analysis = {
            compatible: true,
            issues: [],
            suggestions: [],
            substitutions: []
        };

        dietaryRestrictions.forEach(restriction => {
            const profile = this.dietaryProfiles[restriction];
            if (!profile) return;

            const ingredientNames = recipe.ingredients.map(ing => ing.name.toLowerCase());

            // Check for incompatible ingredients
            if (profile.avoid) {
                profile.avoid.forEach(avoidIngredient => {
                    const problematicIngredients = ingredientNames.filter(name => 
                        name.includes(avoidIngredient) || avoidIngredient.includes(name)
                    );

                    if (problematicIngredients.length > 0) {
                        analysis.compatible = false;
                        analysis.issues.push({
                            type: 'dietary-restriction',
                            restriction: restriction,
                            ingredient: avoidIngredient,
                            message: `Contains ${avoidIngredient} which is not ${profile.name} compatible`
                        });

                        // Find substitutions
                        const substitutions = window.ingredientAnalyzer.getIngredientSubstitutions(
                            avoidIngredient, 
                            [restriction]
                        );

                        if (substitutions.length > 0) {
                            analysis.substitutions.push({
                                original: avoidIngredient,
                                alternatives: substitutions
                            });
                        }
                    }
                });
            }

            // Add positive suggestions if compatible
            if (analysis.compatible && profile.emphasize) {
                profile.emphasize.forEach(emphasizeIngredient => {
                    if (!ingredientNames.some(name => name.includes(emphasizeIngredient))) {
                        analysis.suggestions.push({
                            type: 'enhancement',
                            suggestion: `Consider adding ${emphasizeIngredient} to align with ${profile.name} principles`
                        });
                    }
                });
            }
        });

        return analysis;
    }

    // Check for allergens in recipe
    checkAllergens(recipe, knownAllergies = []) {
        const allergenAnalysis = {
            detected: [],
            warnings: [],
            safe: true
        };

        const ingredientNames = recipe.ingredients.map(ing => ing.name.toLowerCase());

        Object.keys(this.allergenDatabase).forEach(allergenKey => {
            const allergen = this.allergenDatabase[allergenKey];
            
            // Check common sources
            const foundCommon = allergen.commonSources.filter(source =>
                ingredientNames.some(name => name.includes(source.toLowerCase()))
            );

            // Check hidden sources
            const foundHidden = allergen.hiddenSources.filter(source =>
                ingredientNames.some(name => name.includes(source.toLowerCase()))
            );

            if (foundCommon.length > 0 || foundHidden.length > 0) {
                allergenAnalysis.detected.push({
                    allergen: allergen.name,
                    severity: allergen.severity,
                    found: [...foundCommon, ...foundHidden],
                    alternatives: allergen.alternatives
                });

                if (knownAllergies.includes(allergenKey)) {
                    allergenAnalysis.safe = false;
                    allergenAnalysis.warnings.push({
                        type: 'known-allergy',
                        allergen: allergen.name,
                        message: `Recipe contains ${allergen.name} which you are allergic to`,
                        severity: 'danger'
                    });
                }
            }
        });

        return allergenAnalysis;
    }

    // Get medical condition guidance for recipe
    getMedicalGuidance(recipe, conditions = []) {
        const guidance = {
            applicable: [],
            warnings: [],
            modifications: []
        };

        conditions.forEach(condition => {
            const conditionInfo = this.medicalConditionGuidelines[condition];
            if (!conditionInfo) return;

            guidance.applicable.push(conditionInfo);

            const ingredientNames = recipe.ingredients.map(ing => ing.name.toLowerCase());

            // Check for problematic ingredients
            if (conditionInfo.avoid) {
                conditionInfo.avoid.forEach(avoidIngredient => {
                    const found = ingredientNames.filter(name => 
                        name.includes(avoidIngredient) || avoidIngredient.includes(name)
                    );

                    if (found.length > 0) {
                        guidance.warnings.push({
                            condition: conditionInfo.name,
                            ingredient: avoidIngredient,
                            message: `${avoidIngredient} should be limited or avoided with ${conditionInfo.name}`,
                            severity: 'warning'
                        });
                    }
                });
            }

            // Suggest modifications
            if (conditionInfo.recommendations) {
                Object.keys(conditionInfo.recommendations).forEach(nutrient => {
                    guidance.modifications.push({
                        condition: conditionInfo.name,
                        nutrient: nutrient,
                        recommendation: conditionInfo.recommendations[nutrient]
                    });
                });
            }
        });

        return guidance;
    }

    // Calculate nutritional estimates
    estimateNutrition(recipe) {
        const nutrition = {
            calories: 0,
            carbs: 0,
            protein: 0,
            fat: 0,
            fiber: 0,
            warnings: []
        };

        recipe.ingredients.forEach(ingredient => {
            const ingredientName = ingredient.name.toLowerCase();
            const nutritionData = this.nutritionDatabase[ingredientName];

            if (nutritionData) {
                // Parse amount (simplified)
                let amount = 1;
                if (typeof ingredient.amount === 'number') {
                    amount = ingredient.amount;
                } else if (typeof ingredient.amount === 'string') {
                    const numMatch = ingredient.amount.match(/(\d+(?:\.\d+)?)/);
                    if (numMatch) amount = parseFloat(numMatch[1]);
                }

                // Add to totals (simplified calculation)
                nutrition.calories += (nutritionData.calories || 0) * amount * 0.1; // Rough estimation
                nutrition.carbs += (nutritionData.carbs || 0) * amount * 0.1;
                nutrition.protein += (nutritionData.protein || 0) * amount * 0.1;
                nutrition.fat += (nutritionData.fat || 0) * amount * 0.1;
                nutrition.fiber += (nutritionData.fiber || 0) * amount * 0.1;
            }
        });

        // Add per-serving calculation
        const servings = recipe.servings || 1;
        nutrition.perServing = {
            calories: Math.round(nutrition.calories / servings),
            carbs: Math.round(nutrition.carbs / servings * 10) / 10,
            protein: Math.round(nutrition.protein / servings * 10) / 10,
            fat: Math.round(nutrition.fat / servings * 10) / 10,
            fiber: Math.round(nutrition.fiber / servings * 10) / 10
        };

        nutrition.warnings.push({
            type: 'estimation',
            message: 'Nutritional values are estimates. Consult a nutritionist for precise calculations.'
        });

        return nutrition;
    }

    // Generate health score for recipe
    generateHealthScore(recipe, userProfile = {}) {
        let score = 50; // Base score
        const factors = [];

        const ingredientNames = recipe.ingredients.map(ing => ing.name.toLowerCase());

        // Positive factors
        const healthyIngredients = ['vegetables', 'fruits', 'whole grain', 'lean protein', 'olive oil', 'nuts'];
        healthyIngredients.forEach(healthy => {
            if (ingredientNames.some(name => name.includes(healthy))) {
                score += 10;
                factors.push(`+10: Contains ${healthy}`);
            }
        });

        // Negative factors
        const unhealthyIngredients = ['processed', 'fried', 'refined sugar', 'trans fat'];
        unhealthyIngredients.forEach(unhealthy => {
            if (ingredientNames.some(name => name.includes(unhealthy))) {
                score -= 15;
                factors.push(`-15: Contains ${unhealthy}`);
            }
        });

        // Cooking method bonus
        const healthyCookingMethods = ['steam', 'grill', 'bake', 'roast'];
        const instructions = recipe.instructions.toLowerCase();
        if (healthyCookingMethods.some(method => instructions.includes(method))) {
            score += 5;
            factors.push('+5: Healthy cooking method');
        }

        // Limit score range
        score = Math.max(0, Math.min(100, score));

        return {
            score,
            grade: this.getHealthGrade(score),
            factors,
            recommendations: this.getHealthRecommendations(score, recipe)
        };
    }

    getHealthGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'F';
    }

    getHealthRecommendations(score, recipe) {
        const recommendations = [];

        if (score < 70) {
            recommendations.push('Consider adding more vegetables to increase nutritional value');
            recommendations.push('Try using whole grain alternatives where possible');
            recommendations.push('Reduce processed ingredients and added sugars');
        }

        if (score < 50) {
            recommendations.push('This recipe could benefit from significant modifications');
            recommendations.push('Consider healthier cooking methods like baking instead of frying');
            recommendations.push('Add more nutrient-dense ingredients');
        }

        return recommendations;
    }
}

// Create global health advisor instance
window.healthAdvisor = new HealthAdvisor();