// Experiment Tracker for recipe experimentation and comparison
class ExperimentTracker {
    constructor() {
        this.experimentTypes = this.initializeExperimentTypes();
        this.comparisonMetrics = this.initializeComparisonMetrics();
    }

    initializeExperimentTypes() {
        return {
            'ingredient-substitution': {
                name: 'Ingredient Substitution',
                description: 'Testing alternative ingredients',
                trackingPoints: ['taste', 'texture', 'appearance', 'ease-of-preparation'],
                suggestedMetrics: ['flavor-intensity', 'sweetness', 'saltiness', 'moisture', 'density']
            },
            'technique-modification': {
                name: 'Technique Modification',
                description: 'Changing cooking methods or techniques',
                trackingPoints: ['cooking-time', 'texture', 'appearance', 'difficulty'],
                suggestedMetrics: ['tenderness', 'crispiness', 'color-development', 'time-efficiency']
            },
            'scaling-test': {
                name: 'Scaling Test',
                description: 'Testing recipe at different scales',
                trackingPoints: ['proportions', 'cooking-time', 'texture', 'yield-accuracy'],
                suggestedMetrics: ['scaling-success', 'time-adjustment', 'quality-consistency']
            },
            'flavor-enhancement': {
                name: 'Flavor Enhancement',
                description: 'Adding or modifying flavors and seasonings',
                trackingPoints: ['taste', 'aroma', 'balance', 'intensity'],
                suggestedMetrics: ['flavor-complexity', 'spice-level', 'aromatic-quality', 'overall-balance']
            },
            'health-modification': {
                name: 'Health Modification',
                description: 'Making recipes healthier or accommodating dietary needs',
                trackingPoints: ['taste', 'texture', 'nutritional-value', 'satisfaction'],
                suggestedMetrics: ['taste-retention', 'texture-similarity', 'health-improvement', 'dietary-compliance']
            },
            'time-optimization': {
                name: 'Time Optimization',
                description: 'Reducing preparation or cooking time',
                trackingPoints: ['time-saved', 'quality-maintained', 'ease', 'shortcuts-used'],
                suggestedMetrics: ['time-efficiency', 'quality-retention', 'complexity-reduction']
            }
        };
    }

    initializeComparisonMetrics() {
        return {
            'taste': {
                name: 'Taste',
                scale: 'rating-1-10',
                subMetrics: ['sweetness', 'saltiness', 'sourness', 'bitterness', 'umami', 'overall-flavor'],
                description: 'Overall taste quality and specific flavor components'
            },
            'texture': {
                name: 'Texture',
                scale: 'rating-1-10',
                subMetrics: ['moisture', 'tenderness', 'crispiness', 'chewiness', 'smoothness'],
                description: 'Mouthfeel and physical properties'
            },
            'appearance': {
                name: 'Appearance',
                scale: 'rating-1-10',
                subMetrics: ['color', 'presentation', 'shape-retention', 'visual-appeal'],
                description: 'Visual attractiveness and expected appearance'
            },
            'aroma': {
                name: 'Aroma',
                scale: 'rating-1-10',
                subMetrics: ['intensity', 'pleasantness', 'complexity', 'cooking-smell'],
                description: 'Smell before and during eating'
            },
            'difficulty': {
                name: 'Difficulty',
                scale: 'rating-1-5',
                subMetrics: ['preparation-complexity', 'skill-required', 'time-intensity', 'cleanup'],
                description: 'How challenging the recipe is to execute'
            },
            'time': {
                name: 'Time',
                scale: 'minutes',
                subMetrics: ['prep-time', 'cook-time', 'total-time', 'active-time'],
                description: 'Time requirements for recipe completion'
            },
            'cost': {
                name: 'Cost',
                scale: 'currency',
                subMetrics: ['ingredient-cost', 'cost-per-serving', 'value-rating'],
                description: 'Financial cost of preparing the recipe'
            },
            'satisfaction': {
                name: 'Satisfaction',
                scale: 'rating-1-10',
                subMetrics: ['would-make-again', 'would-serve-guests', 'craving-satisfaction', 'overall-enjoyment'],
                description: 'Overall satisfaction and likelihood to repeat'
            }
        };
    }

    // Create new experiment
    createExperiment(baseRecipeId, experimentData) {
        const baseRecipe = window.storageManager.getRecipe(baseRecipeId);
        if (!baseRecipe) {
            throw new Error('Base recipe not found');
        }

        const experiment = {
            id: window.storageManager.generateId(),
            baseRecipeId: baseRecipeId,
            baseRecipeName: baseRecipe.name,
            name: experimentData.name,
            type: experimentData.type || 'ingredient-substitution',
            hypothesis: experimentData.hypothesis || '',
            changes: experimentData.changes || '',
            expectedOutcome: experimentData.expectedOutcome || '',
            status: 'active',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            attempts: [],
            variables: experimentData.variables || []
        };

        // Add experiment type specific fields
        const experimentType = this.experimentTypes[experiment.type];
        if (experimentType) {
            experiment.trackingPoints = experimentType.trackingPoints;
            experiment.suggestedMetrics = experimentType.suggestedMetrics;
        }

        return window.storageManager.addExperiment(experiment);
    }

    // Record experiment attempt
    recordAttempt(experimentId, attemptData) {
        const experiment = window.storageManager.data.experiments.find(exp => exp.id === experimentId);
        if (!experiment) {
            throw new Error('Experiment not found');
        }

        const attempt = {
            id: window.storageManager.generateId(),
            attemptNumber: experiment.attempts.length + 1,
            date: Date.now(),
            conditions: attemptData.conditions || {},
            measurements: attemptData.measurements || {},
            observations: attemptData.observations || '',
            photos: attemptData.photos || [],
            success: attemptData.success || null, // null, true, or false
            rating: attemptData.rating || null,
            notes: attemptData.notes || '',
            wouldRepeat: attemptData.wouldRepeat || null
        };

        experiment.attempts.push(attempt);
        experiment.updatedAt = Date.now();

        // Update experiment status if this attempt completes it
        if (attemptData.completed) {
            experiment.status = attemptData.success ? 'success' : 'failed';
            experiment.completedAt = Date.now();
            experiment.finalConclusion = attemptData.conclusion || '';
        }

        window.storageManager.saveData();
        return attempt;
    }

    // Compare recipe versions
    compareRecipeVersions(originalRecipeId, experimentId, attemptId = null) {
        const originalRecipe = window.storageManager.getRecipe(originalRecipeId);
        const experiment = window.storageManager.data.experiments.find(exp => exp.id === experimentId);

        if (!originalRecipe || !experiment) {
            throw new Error('Recipe or experiment not found');
        }

        let attemptData = null;
        if (attemptId) {
            attemptData = experiment.attempts.find(attempt => attempt.id === attemptId);
        } else if (experiment.attempts.length > 0) {
            attemptData = experiment.attempts[experiment.attempts.length - 1]; // Latest attempt
        }

        const comparison = {
            original: {
                name: originalRecipe.name,
                ingredients: originalRecipe.ingredients,
                instructions: originalRecipe.instructions,
                servings: originalRecipe.servings,
                prepTime: originalRecipe.prepTime,
                cookTime: originalRecipe.cookTime
            },
            experiment: {
                name: experiment.name,
                changes: experiment.changes,
                hypothesis: experiment.hypothesis,
                status: experiment.status
            },
            differences: this.analyzeRecipeDifferences(originalRecipe, experiment),
            attempt: attemptData,
            recommendations: []
        };

        // Add recommendations based on results
        if (attemptData) {
            comparison.recommendations = this.generateRecommendations(comparison);
        }

        return comparison;
    }

    // Analyze differences between original and experimental versions
    analyzeRecipeDifferences(originalRecipe, experiment) {
        const differences = {
            ingredients: [],
            techniques: [],
            timing: [],
            other: []
        };

        // Parse changes text to identify different types of modifications
        const changesText = experiment.changes.toLowerCase();

        // Common ingredient change patterns
        const ingredientPatterns = [
            /substitut\w+\s+(\w+)\s+(?:with|for)\s+(\w+)/g,
            /replac\w+\s+(\w+)\s+(?:with|for)\s+(\w+)/g,
            /us\w+\s+(\w+)\s+instead\s+of\s+(\w+)/g
        ];

        ingredientPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(changesText)) !== null) {
                differences.ingredients.push({
                    type: 'substitution',
                    from: match[2],
                    to: match[1],
                    description: match[0]
                });
            }
        });

        // Technique changes
        const techniqueKeywords = ['bake', 'fry', 'grill', 'steam', 'boil', 'sauté', 'roast'];
        techniqueKeywords.forEach(technique => {
            if (changesText.includes(technique)) {
                differences.techniques.push({
                    type: 'method-change',
                    technique: technique,
                    context: this.extractContext(changesText, technique)
                });
            }
        });

        return differences;
    }

    // Extract context around a keyword
    extractContext(text, keyword, contextLength = 30) {
        const index = text.indexOf(keyword);
        if (index === -1) return '';
        
        const start = Math.max(0, index - contextLength);
        const end = Math.min(text.length, index + keyword.length + contextLength);
        
        return text.substring(start, end);
    }

    // Generate recommendations based on experiment results
    generateRecommendations(comparison) {
        const recommendations = [];
        const attempt = comparison.attempt;

        if (!attempt) return recommendations;

        // Success/failure based recommendations
        if (attempt.success === true) {
            recommendations.push({
                type: 'success',
                message: 'Experiment was successful! Consider making this modification permanent.',
                action: 'Update original recipe with successful changes'
            });

            if (attempt.rating && attempt.rating >= 8) {
                recommendations.push({
                    type: 'excellent',
                    message: 'This modification received high ratings. Consider sharing with others.',
                    action: 'Share experiment results'
                });
            }
        } else if (attempt.success === false) {
            recommendations.push({
                type: 'failure',
                message: 'This experiment didn\'t work as expected. Analyze what went wrong.',
                action: 'Review variables and try different approach'
            });

            recommendations.push({
                type: 'learning',
                message: 'Failed experiments provide valuable learning. Document what didn\'t work.',
                action: 'Record detailed failure analysis'
            });
        }

        // Rating-based recommendations
        if (attempt.rating) {
            if (attempt.rating < 5) {
                recommendations.push({
                    type: 'improvement',
                    message: 'Low rating suggests significant issues. Consider major modifications.',
                    action: 'Try different variables or abandon this approach'
                });
            } else if (attempt.rating >= 7) {
                recommendations.push({
                    type: 'refinement',
                    message: 'Good results! Minor tweaks could make this even better.',
                    action: 'Run follow-up experiment with small adjustments'
                });
            }
        }

        // Measurement-based recommendations
        if (attempt.measurements) {
            Object.keys(attempt.measurements).forEach(metric => {
                const value = attempt.measurements[metric];
                if (typeof value === 'number') {
                    if (metric === 'taste' && value < 6) {
                        recommendations.push({
                            type: 'taste-improvement',
                            message: 'Taste scored low. Consider adjusting seasonings or core flavors.',
                            action: 'Focus next experiment on flavor enhancement'
                        });
                    }
                    if (metric === 'texture' && value < 6) {
                        recommendations.push({
                            type: 'texture-improvement',
                            message: 'Texture issues detected. Review ingredient ratios and techniques.',
                            action: 'Experiment with different preparation methods'
                        });
                    }
                }
            });
        }

        return recommendations;
    }

    // Get experiment statistics
    getExperimentStatistics(recipeId = null) {
        let experiments = window.storageManager.getAllExperiments();
        
        if (recipeId) {
            experiments = experiments.filter(exp => exp.baseRecipeId === recipeId);
        }

        const stats = {
            total: experiments.length,
            active: experiments.filter(exp => exp.status === 'active').length,
            successful: experiments.filter(exp => exp.status === 'success').length,
            failed: experiments.filter(exp => exp.status === 'failed').length,
            successRate: 0,
            averageAttempts: 0,
            mostExperimentedRecipe: null,
            popularExperimentTypes: {},
            totalAttempts: 0
        };

        if (stats.total > 0) {
            const completedExperiments = stats.successful + stats.failed;
            stats.successRate = completedExperiments > 0 ? Math.round((stats.successful / completedExperiments) * 100) : 0;
            
            stats.totalAttempts = experiments.reduce((total, exp) => total + exp.attempts.length, 0);
            stats.averageAttempts = stats.totalAttempts > 0 ? Math.round(stats.totalAttempts / stats.total * 10) / 10 : 0;

            // Find most experimented recipe
            const recipeExperimentCounts = {};
            experiments.forEach(exp => {
                recipeExperimentCounts[exp.baseRecipeId] = (recipeExperimentCounts[exp.baseRecipeId] || 0) + 1;
            });

            const mostExperimentedId = Object.keys(recipeExperimentCounts).reduce((a, b) => 
                recipeExperimentCounts[a] > recipeExperimentCounts[b] ? a : b, null
            );

            if (mostExperimentedId) {
                const recipe = window.storageManager.getRecipe(mostExperimentedId);
                stats.mostExperimentedRecipe = {
                    id: mostExperimentedId,
                    name: recipe ? recipe.name : 'Unknown Recipe',
                    experimentCount: recipeExperimentCounts[mostExperimentedId]
                };
            }

            // Popular experiment types
            experiments.forEach(exp => {
                stats.popularExperimentTypes[exp.type] = (stats.popularExperimentTypes[exp.type] || 0) + 1;
            });
        }

        return stats;
    }

    // Get trending experiment patterns
    getTrendingPatterns() {
        const experiments = window.storageManager.getAllExperiments();
        const patterns = {
            successfulSubstitutions: {},
            failedSubstitutions: {},
            timeOptimizations: [],
            healthImprovements: [],
            seasonalTrends: {}
        };

        experiments.forEach(experiment => {
            const isSuccessful = experiment.status === 'success';
            const changesText = experiment.changes.toLowerCase();

            // Track substitution success/failure
            if (experiment.type === 'ingredient-substitution') {
                const substitutionKey = experiment.name + ' - ' + experiment.changes;
                if (isSuccessful) {
                    patterns.successfulSubstitutions[substitutionKey] = 
                        (patterns.successfulSubstitutions[substitutionKey] || 0) + 1;
                } else if (experiment.status === 'failed') {
                    patterns.failedSubstitutions[substitutionKey] = 
                        (patterns.failedSubstitutions[substitutionKey] || 0) + 1;
                }
            }

            // Track time optimizations
            if (experiment.type === 'time-optimization' && isSuccessful) {
                patterns.timeOptimizations.push({
                    recipe: experiment.baseRecipeName,
                    optimization: experiment.changes,
                    success: isSuccessful
                });
            }

            // Track health improvements
            if (experiment.type === 'health-modification' && isSuccessful) {
                patterns.healthImprovements.push({
                    recipe: experiment.baseRecipeName,
                    modification: experiment.changes,
                    success: isSuccessful
                });
            }

            // Track seasonal trends (by month created)
            const month = new Date(experiment.createdAt).getMonth();
            patterns.seasonalTrends[month] = (patterns.seasonalTrends[month] || 0) + 1;
        });

        return patterns;
    }

    // Generate experiment report
    generateExperimentReport(experimentId) {
        const experiment = window.storageManager.data.experiments.find(exp => exp.id === experimentId);
        if (!experiment) {
            throw new Error('Experiment not found');
        }

        const baseRecipe = window.storageManager.getRecipe(experiment.baseRecipeId);
        const comparison = this.compareRecipeVersions(experiment.baseRecipeId, experimentId);

        const report = {
            experiment: experiment,
            baseRecipe: baseRecipe,
            summary: {
                totalAttempts: experiment.attempts.length,
                status: experiment.status,
                duration: experiment.completedAt ? 
                    Math.round((experiment.completedAt - experiment.createdAt) / (1000 * 60 * 60 * 24)) : 
                    Math.round((Date.now() - experiment.createdAt) / (1000 * 60 * 60 * 24)),
                averageRating: this.calculateAverageRating(experiment.attempts)
            },
            comparison: comparison,
            timeline: this.createExperimentTimeline(experiment),
            insights: this.generateExperimentInsights(experiment),
            nextSteps: this.suggestNextSteps(experiment)
        };

        return report;
    }

    // Calculate average rating from attempts
    calculateAverageRating(attempts) {
        const ratingsWithValues = attempts.filter(attempt => attempt.rating !== null && attempt.rating !== undefined);
        if (ratingsWithValues.length === 0) return null;
        
        const sum = ratingsWithValues.reduce((total, attempt) => total + attempt.rating, 0);
        return Math.round((sum / ratingsWithValues.length) * 10) / 10;
    }

    // Create experiment timeline
    createExperimentTimeline(experiment) {
        const timeline = [
            {
                date: experiment.createdAt,
                event: 'Experiment Started',
                description: experiment.hypothesis || 'Experiment began'
            }
        ];

        experiment.attempts.forEach((attempt, index) => {
            timeline.push({
                date: attempt.date,
                event: `Attempt ${index + 1}`,
                description: `${attempt.success === true ? 'Successful' : attempt.success === false ? 'Failed' : 'Completed'} attempt${attempt.rating ? ` - Rating: ${attempt.rating}/10` : ''}`,
                success: attempt.success,
                rating: attempt.rating
            });
        });

        if (experiment.completedAt) {
            timeline.push({
                date: experiment.completedAt,
                event: 'Experiment Completed',
                description: `Final status: ${experiment.status}`,
                status: experiment.status
            });
        }

        return timeline.sort((a, b) => a.date - b.date);
    }

    // Generate insights from experiment data
    generateExperimentInsights(experiment) {
        const insights = [];
        const attempts = experiment.attempts;

        if (attempts.length === 0) {
            insights.push('No attempts recorded yet');
            return insights;
        }

        // Rating trend analysis
        const ratings = attempts.filter(a => a.rating !== null).map(a => a.rating);
        if (ratings.length > 1) {
            const firstRating = ratings[0];
            const lastRating = ratings[ratings.length - 1];
            if (lastRating > firstRating) {
                insights.push('Ratings improved over time - good learning progression');
            } else if (lastRating < firstRating) {
                insights.push('Ratings declined over time - may need to reconsider approach');
            } else {
                insights.push('Consistent ratings across attempts');
            }
        }

        // Success pattern analysis
        const successfulAttempts = attempts.filter(a => a.success === true);
        const failedAttempts = attempts.filter(a => a.success === false);

        if (successfulAttempts.length > failedAttempts.length) {
            insights.push('More successful than failed attempts - promising direction');
        } else if (failedAttempts.length > successfulAttempts.length) {
            insights.push('More failed than successful attempts - consider alternative approaches');
        }

        // Time between attempts
        if (attempts.length > 1) {
            const intervals = [];
            for (let i = 1; i < attempts.length; i++) {
                intervals.push(attempts[i].date - attempts[i-1].date);
            }
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const avgDays = Math.round(avgInterval / (1000 * 60 * 60 * 24));
            
            if (avgDays < 1) {
                insights.push('Very frequent attempts - good experimental momentum');
            } else if (avgDays > 7) {
                insights.push('Long intervals between attempts - consider more frequent testing');
            }
        }

        return insights;
    }

    // Suggest next steps for experiment
    suggestNextSteps(experiment) {
        const suggestions = [];
        const attempts = experiment.attempts;

        if (experiment.status === 'active') {
            if (attempts.length === 0) {
                suggestions.push('Record your first attempt with detailed observations');
            } else if (attempts.length < 3) {
                suggestions.push('Try a few more attempts to establish patterns');
            } else {
                const recentRatings = attempts.slice(-3).filter(a => a.rating !== null);
                if (recentRatings.length > 0) {
                    const avgRecent = recentRatings.reduce((a, b) => a + b.rating, 0) / recentRatings.length;
                    if (avgRecent >= 7) {
                        suggestions.push('Recent attempts show good results - consider finalizing this experiment');
                    } else if (avgRecent < 5) {
                        suggestions.push('Recent attempts show poor results - consider changing approach');
                    }
                }
            }
        } else if (experiment.status === 'success') {
            suggestions.push('Update the original recipe with successful modifications');
            suggestions.push('Share your successful experiment with others');
            suggestions.push('Consider starting a related experiment to further improve');
        } else if (experiment.status === 'failed') {
            suggestions.push('Document what was learned from this failed experiment');
            suggestions.push('Consider trying a completely different approach');
            suggestions.push('Review successful experiments by others for inspiration');
        }

        return suggestions;
    }
}

// Create global experiment tracker instance
window.experimentTracker = new ExperimentTracker();