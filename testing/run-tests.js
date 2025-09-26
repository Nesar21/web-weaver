// Day 6.5 Enhanced Testing Suite with E-commerce & Recipe Support

console.log('Day 6.5 Enhanced Testing Suite starting...');

// 🔥 ITERATION LOG WRITER - FIXED FILE WRITING
class IterationLogger {
    constructor() {
        this.logData = [];
        this.csvHeaders = ['Site', 'Field', 'PromptVersion', 'OldAccuracy', 'NewAccuracy', 'Improvement', 'Status', 'Timestamp'];
    }

    logIteration(site, field, oldAccuracy, newAccuracy, nullReturned) {
        const improvement = newAccuracy - oldAccuracy;
        let status = 'MAINTAINED';
        if (improvement > 20) {
            status = 'BREAKTHROUGH';
        } else if (improvement > 5) {
            status = 'IMPROVED';
        } else if (improvement < -5) {
            status = 'REGRESSION';
        }

        const entry = {
            site: site,
            field: field,
            promptVersion: 'v4-enhanced',
            oldAccuracy: Math.round(oldAccuracy),
            newAccuracy: Math.round(newAccuracy),
            improvement: Math.round(improvement),
            status: status,
            timestamp: new Date().toISOString()
        };

        this.logData.push(entry);
        console.log(`[IterationLog] ${site} | ${field}: ${oldAccuracy}% → ${newAccuracy}% (${improvement > 0 ? '+' : ''}${improvement}%) ${status}`);
    }

    exportCSV() {
        let csv = this.csvHeaders.join(',') + '\n';
        this.logData.forEach(entry => {
            csv += `"${entry.site}","${entry.field}","${entry.promptVersion}",${entry.oldAccuracy},${entry.newAccuracy},${entry.improvement},"${entry.status}","${entry.timestamp}"\n`;
        });
        return csv;
    }

    async writeToFile() {
        try {
            const csvContent = this.exportCSV();
            console.log('\n📋 ITERATION LOG CSV (Copy and save to testing/logs/iteration_log.csv):');
            console.log('----------------------------------------');
            console.log(csvContent);
            console.log('----------------------------------------\n');

            if (typeof document !== 'undefined') {
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'iteration_log.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log('✅ iteration_log.csv download triggered');
            }

            return csvContent;
        } catch (error) {
            console.error('❌ Failed to write iteration log:', error);
            return null;
        }
    }

    getImprovements() {
        const improvements = {};
        this.logData.forEach(entry => {
            if (!improvements[entry.site]) improvements[entry.site] = {};
            improvements[entry.site][entry.field] = {
                improvement: entry.improvement,
                oldScore: entry.oldAccuracy,
                newScore: entry.newAccuracy,
                status: entry.status
            };
        });
        return improvements;
    }

    getSummaryStats() {
        const stats = {
            totalFields: this.logData.length,
            breakthroughs: this.logData.filter(e => e.status === 'BREAKTHROUGH').length,
            improvements: this.logData.filter(e => e.status === 'IMPROVED').length,
            maintained: this.logData.filter(e => e.status === 'MAINTAINED').length,
            regressions: this.logData.filter(e => e.status === 'REGRESSION').length,
            avgImprovement: this.logData.reduce((sum, e) => sum + e.improvement, 0) / this.logData.length
        };
        return stats;
    }
}

// Initialize iteration logger
const iterationLogger = new IterationLogger();

// 🔥 DAY 6.5: ENHANCED VALIDATION RUNNER WITH NEW SITES
async function runDay65ValidationSuite() {
    console.log('\n🎯 Day 6.5 Enhanced Validation Suite Starting...');
    console.log('📅 Phase: E-commerce & Recipe Site Diversification');
    console.log('🎯 Target: ≥80% accuracy across 5 diverse site types\n');

    try {
        const response = await chrome.runtime.sendMessage({ action: "runValidation" });
        if (!response || !response.success) {
            throw new Error(`Validation failed: ${response?.error || 'Unknown error'}`);
        }

        const results = response.results;
        console.log(`\n✅ Day 6.5 Enhanced Validation Complete: ${results.overallScore}% accuracy`);

        // Enhanced baseline scores including new site types
        const day5Baseline = {
            'Bloomberg Business News': {
                title: 100, author: 0, publication_date: 0, description: 44,
                main_content_summary: 29, category: 100, links: 0, images: 0
            },
            'Wikipedia Article': {
                title: 100, author: 0, publication_date: 0, description: 51,
                main_content_summary: 28, category: 80, links: 0, images: 0
            },
            'Medium Blog Post': {
                title: 64, author: 0, publication_date: 0, description: 27,
                main_content_summary: 43, category: 0, links: 0, images: 0
            },
            'Amazon Product Page': {
                title: 0, author: 0, publication_date: 0, description: 0,
                main_content_summary: 0, category: 0, links: 0, images: 0,
                price: 0, reviews: 0, availability: 0, shipping: 0
            },
            'AllRecipes Recipe': {
                title: 0, author: 0, publication_date: 0, description: 0,
                main_content_summary: 0, category: 0, links: 0, images: 0,
                ingredients: 0, instructions: 0, prep_time: 0, cook_time: 0, servings: 0
            }
        };

        // Log iterations and calculate improvements
        results.results.forEach(siteResult => {
            const siteName = siteResult.site;
            const baseline = day5Baseline[siteName] || {};

            Object.keys(siteResult.fieldScores || {}).forEach(field => {
                const fieldScore = siteResult.fieldScores[field];
                const oldAccuracy = baseline[field] || 0;
                const newAccuracy = Math.round(fieldScore.raw || 0);
                const nullReturned = fieldScore.status === 'missed';

                iterationLogger.logIteration(siteName, field, oldAccuracy, newAccuracy, nullReturned);
            });
        });

        await iterationLogger.writeToFile();

        const improvements = iterationLogger.getImprovements();
        const stats = iterationLogger.getSummaryStats();

        console.log('\n📊 Day 6.5 Diversification Results:');
        console.log(`📈 Total Fields Tested: ${stats.totalFields}`);
        console.log(`🚀 Breakthroughs: ${stats.breakthroughs}`);
        console.log(`✅ Improvements: ${stats.improvements}`);
        console.log(`➖ Maintained: ${stats.maintained}`);
        console.log(`⬇️ Regressions: ${stats.regressions}`);
        console.log(`📊 Average Improvement: ${stats.avgImprovement.toFixed(1)}%`);

        Object.keys(improvements).forEach(site => {
            console.log(`\n${site}:`);
            Object.keys(improvements[site]).forEach(field => {
                const imp = improvements[site][field];
                const change = imp.improvement > 0 ? `+${imp.improvement}%` : `${imp.improvement}%`;
                const statusIcon = imp.status === 'BREAKTHROUGH' ? '🚀' :
                    imp.status === 'IMPROVED' ? '✅' :
                    imp.status === 'MAINTAINED' ? '➖' : '⬇️';
                console.log(`  ${field}: ${imp.oldScore}% → ${imp.newScore}% (${change}) ${statusIcon} ${imp.status}`);
            });
        });

        generateDay65Results(results, improvements, stats);
        return results;

    } catch (error) {
        console.error('❌ Day 6.5 Enhanced Validation failed:', error);
        throw error;
    }
}

// Rest of the functions remain the same...
// [Previous implementation continues]

// Auto-execute if in testing environment
if (typeof window === 'undefined' || window.location.href.includes('chrome-extension://')) {
    executeDay65Testing();
}

// Export for manual execution
if (typeof module !== 'undefined') {
    module.exports = { executeDay65Testing, runDay65ValidationSuite, IterationLogger };
}

console.log('📋 Day 6.5 Enhanced Testing Suite with E-commerce & Recipe Support loaded - Championship ready');
