#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
let PROXIMITY_THRESHOLD = 3950; // Distance threshold for considering objects as potential duplicates
const DATA_FILE = 'data.json';

/**
 * Calculate 3D Euclidean distance between two points
 * @param {Object} point1 - {x, y, z}
 * @param {Object} point2 - {x, y, z}
 * @returns {number} Distance between the points
 */
function calculateDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = point1.z - point2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Get a descriptive identifier for an object
 * @param {Object} obj - Location or deposit object
 * @param {string} type - Type of object (location, deposit)
 * @param {string} zone - Zone name
 * @param {string} depositType - Deposit type (if applicable)
 * @returns {string} Descriptive identifier
 */
function getObjectIdentifier(obj, type, zone, depositType = null) {
    if (type === 'location') {
        return `${zone} - ${obj.name || 'Unnamed'} (${obj.id || 'No ID'}) [${obj.type || 'Unknown Type'}]`;
    } else {
        return `${zone} - ${depositType} Deposit (${obj.id || 'No ID'})`;
    }
}

/**
 * Check for duplicates within a collection of objects
 * @param {Array} objects - Array of objects with x, y, z coordinates
 * @param {string} collectionName - Name of the collection for reporting
 * @param {string} zone - Zone name
 * @param {string} depositType - Deposit type (if applicable)
 * @returns {Array} Array of potential duplicate pairs
 */
function checkDuplicatesInCollection(objects, collectionName, zone, depositType = null) {
    const duplicates = [];
    
    for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
            const obj1 = objects[i];
            const obj2 = objects[j];
            
            // Skip objects without coordinates
            if (!obj1.x || !obj1.y || !obj1.z || !obj2.x || !obj2.y || !obj2.z) {
                continue;
            }
            
            const distance = calculateDistance(obj1, obj2);
            
            if (distance < PROXIMITY_THRESHOLD) {
                duplicates.push({
                    collection: collectionName,
                    zone: zone,
                    distance: Math.round(distance),
                    object1: {
                        ...obj1,
                        identifier: getObjectIdentifier(obj1, collectionName === 'locations' ? 'location' : 'deposit', zone, depositType)
                    },
                    object2: {
                        ...obj2,
                        identifier: getObjectIdentifier(obj2, collectionName === 'locations' ? 'location' : 'deposit', zone, depositType)
                    }
                });
            }
        }
    }
    
    return duplicates;
}

/**
 * Main function to analyze the data
 */
function analyzeDuplicates() {
    try {
        // Read and parse the data file
        const dataPath = path.join(__dirname, DATA_FILE);
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(rawData);
        
        console.log('🔍 AstroMetricaMap Duplicate Checker (Within Zone Only)');
        console.log('======================================================');
        console.log(`📏 Proximity threshold: ${PROXIMITY_THRESHOLD} units`);
        console.log('');
        
        let allDuplicates = [];
        let totalObjects = 0;
        
        // Analyze each zone
        data.zones.forEach(zone => {
            console.log(`🌌 Analyzing Zone: ${zone.name} (ID: ${zone.id})`);
            console.log('─'.repeat(50));
            
            let zoneDuplicates = [];
            let zoneObjects = 0;
            
            // Check locations within the zone
            if (zone.locations && zone.locations.length > 0) {
                const validLocations = zone.locations.filter(loc => loc.x && loc.y && loc.z);
                zoneObjects += validLocations.length;
                
                const locationDuplicates = checkDuplicatesInCollection(
                    validLocations, 
                    'locations', 
                    zone.name
                );
                zoneDuplicates.push(...locationDuplicates);
            }
            
            // Check deposits within the zone
            if (zone.deposits) {
                Object.entries(zone.deposits).forEach(([depositType, deposits]) => {
                    const validDeposits = deposits.filter(dep => dep.x && dep.y && dep.z);
                    zoneObjects += validDeposits.length;
                    
                    const depositDuplicates = checkDuplicatesInCollection(
                        validDeposits, 
                        'deposits', 
                        zone.name, 
                        depositType
                    );
                    zoneDuplicates.push(...depositDuplicates);
                });
            }
            
            totalObjects += zoneObjects;
            
            // Report zone results
            if (zoneDuplicates.length > 0) {
                console.log(`⚠️  Found ${zoneDuplicates.length} potential duplicate(s) in this zone:`);
                zoneDuplicates.forEach((dup, index) => {
                    console.log(`  ${index + 1}. Distance: ${dup.distance} units`);
                    console.log(`     • ${dup.object1.identifier}`);
                    console.log(`       📍 (${dup.object1.x}, ${dup.object1.y}, ${dup.object1.z})`);
                    console.log(`     • ${dup.object2.identifier}`);
                    console.log(`       📍 (${dup.object2.x}, ${dup.object2.y}, ${dup.object2.z})`);
                    console.log('');
                });
            } else {
                console.log('✅ No potential duplicates found in this zone');
            }
            
            console.log(`📊 Zone objects analyzed: ${zoneObjects}`);
            allDuplicates.push(...zoneDuplicates);
            console.log('');
        });
        
        // Summary
        console.log('📊 Final Summary');
        console.log('─'.repeat(50));
        console.log(`Total objects analyzed: ${totalObjects}`);
        console.log(`Total zones analyzed: ${data.zones.length}`);
        console.log(`Total potential duplicates found: ${allDuplicates.length}`);
        console.log(`Proximity threshold used: ${PROXIMITY_THRESHOLD} units`);
        
        if (allDuplicates.length > 0) {
            console.log('');
            // console.log('💡 Recommendations:');
            // console.log('• Review objects with very small distances (< 1000 units)');
            // console.log('• Check if objects with similar names are intentional variations');
            // console.log('• Verify coordinates for objects that appear to be in the same location');
            // console.log('• Consider merging or removing true duplicates');
            
            // Show most concerning duplicates
            const veryClose = allDuplicates.filter(dup => dup.distance < 1000);
            if (veryClose.length > 0) {
                console.log('');
                console.log('🚨 High Priority - Very Close Objects (< 1000 units):');
                veryClose.forEach((dup, index) => {
                    console.log(`  ${index + 1}. ${dup.object1.identifier} & ${dup.object2.identifier} (${dup.distance} units)`);
                });
            }
        }
        
        // Save detailed report to file
        const reportPath = path.join(__dirname, 'duplicate-report.json');
        const report = {
            timestamp: new Date().toISOString(),
            proximityThreshold: PROXIMITY_THRESHOLD,
            totalObjectsAnalyzed: totalObjects,
            totalZonesAnalyzed: data.zones.length,
            totalDuplicatesFound: allDuplicates.length,
            duplicates: allDuplicates,
            analysisType: 'within-zone-only'
        };
        
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
        
    } catch (error) {
        console.error('❌ Error analyzing data:', error.message);
        if (error.code === 'ENOENT') {
            console.error(`Make sure ${DATA_FILE} exists in the same directory as this script.`);
        }
        process.exit(1);
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log('AstroMetricaMap Duplicate Checker (Within Zone Only)');
    console.log('Usage: node duplicate-checker.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h    Show this help message');
    console.log('  --threshold <number>  Set custom proximity threshold (default: 10000)');
    console.log('');
    console.log('Examples:');
    console.log('  node duplicate-checker.js');
    console.log('  node duplicate-checker.js --threshold 5000');
    console.log('');
    console.log('Note: This script only checks for duplicates within the same zone.');
    process.exit(0);
}

// Handle threshold argument
const thresholdIndex = args.findIndex(arg => arg === '--threshold');
if (thresholdIndex !== -1 && args[thresholdIndex + 1]) {
    const customThreshold = parseInt(args[thresholdIndex + 1]);
    if (!isNaN(customThreshold)) {
        PROXIMITY_THRESHOLD = customThreshold;
    }
}

// Run the analysis
analyzeDuplicates();
