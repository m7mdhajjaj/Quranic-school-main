const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Section = require('../src/schema/DailyMark/Section');
const AiSchedulerService = require('../src/services/DailyMark/AiSchedulerService');
const connectDB = require('../src/config/db');

// Load env vars
dotenv.config();

// Test Configuration
const TEST_GROUP_ID_1 = new mongoose.Types.ObjectId(); // For Basic Test
const TEST_GROUP_ID_2 = new mongoose.Types.ObjectId(); // For Options Test
const TEACHER_ID = new mongoose.Types.ObjectId();
const SURAH_NUMBER = 2; // Al-Baqarah

const SLEEP = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function setup() {
    await connectDB();
    console.log('🧹 Cleaning up old test data...');
    await Section.deleteMany({ group: { $in: [TEST_GROUP_ID_1, TEST_GROUP_ID_2] } });
    console.log('✅ Cleanup complete.');
}

async function createSectionsSequence(groupId, count = 50) {
    console.log(`Creating ${count} sections for Group: ${groupId}...`);
    const sections = [];
    let currentAyah = 1;
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 100); // Start 100 days ago

    for (let i = 0; i < count; i++) {
        // 1. Advance Date (Randomly 1-3 days)
        currentDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 3) + 1);
        
        // 2. Occasionally Create a Gap BEFORE this section (20% chance) -> Skip 10-30 verses
        if (Math.random() < 0.2 && i > 0 && i < count - 1) {
            const gapSize = Math.floor(Math.random() * 20) + 10;
            console.log(`   🔸 Creating Gap at Index ${i}: Skipped verses ${currentAyah} to ${currentAyah + gapSize}`);
            currentAyah += gapSize;
        }

        // 3. Determine Segment Length (Randomly 5-15 verses)
        const length = Math.floor(Math.random() * 10) + 5;
        const ayahEnd = currentAyah + length;

        // 4. Create Section Object
        const section = {
            group: groupId,
            teacher: TEACHER_ID,
            date: new Date(currentDate),
            dateKey: currentDate.toISOString().split('T')[0],
            marksStatus: 'completed',
            memorizationSection: `سورة البقرة ${currentAyah}-${ayahEnd}`,
            memorizationMeta: [{
                surahNumber: SURAH_NUMBER,
                surahNameCanonical: "سورة البقرة",
                ayahStart: currentAyah,
                ayahEnd: ayahEnd,
                status: 'completed'
            }]
        };

        // 5. Occasionally create "Orphan Review" (10% chance) implies missing memorization happened
        // We simulate this by NOT adding memorizationMeta to a section, but adding reviewMeta that covers a future range?
        // Actually, Orphan Review in logic = Review exists, but Memorization NOT exists for that range.
        // Let's create an explicit orphan case:
        // We advance `currentAyah` but DON'T add memorization for it, instead we add a review for it.
        if (Math.random() < 0.1 && i > 5) {
             const orphanStart = currentAyah + 500; // Far ahead
             const orphanEnd = orphanStart + 20;
             console.log(`   🔹 Creating Orphan Review at Index ${i}: Range ${orphanStart}-${orphanEnd} (No Memo)`);
             
             section.reviewMeta = [{
                surahNumber: SURAH_NUMBER,
                ayahStart: orphanStart,
                ayahEnd: orphanEnd,
                status: 'completed'
             }];
             // Don't advance currentAyah for orphan, it's out of sequence usually or handled differently
             // But for the sake of the "Gap" logic, let's keep currentAyah sequential for main flow
        }
        
        sections.push(section);
        currentAyah = ayahEnd + 1;
    }

    await Section.insertMany(sections);
    console.log(`✅ ${count} Sections created.`);
}

async function runTestScenario() {
    await setup();

    // ========================================================================
    // SCENARIO 1: Basic Repair (No Options)
    // ========================================================================
    console.log('\n\n🧪 TEST 1: Basic Repair (Defaults)');
    await createSectionsSequence(TEST_GROUP_ID_1, 40); // 40 Records
    
    console.log('   Running Repair...');
    try {
        const result1 = await AiSchedulerService.repairSequence(TEST_GROUP_ID_1, SURAH_NUMBER, false);
        console.log('   📝 Result:', result1.message);
        console.log('   📊 Stats:', result1.stats);
        if (result1.actions.length > 0) {
            console.log('   🔧 Sample Actions:', result1.actions.slice(0, 3), '...');
        }
    } catch (err) {
        console.error('   ❌ Failed:', err.message);
    }

    // ========================================================================
    // SCENARIO 2: Advanced Repair (With Options)
    // ========================================================================
    console.log('\n\n🧪 TEST 2: Advanced Repair (With Options)');
    await createSectionsSequence(TEST_GROUP_ID_2, 60); // 60 Records
    
    // Prepare Options
    const suggestedDates = [];
    const today = new Date();
    // Add 5 random future days
    for(let i=0; i<5; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + (i * 2) + 1); // Every other day
        suggestedDates.push(d.toISOString().split('T')[0]);
    }

    const options = {
        maxVersesPerDay: 15, // Force splitting large gaps
        suggestedDates: suggestedDates // Provide dates
    };

    console.log('   ⚙️ Options:', JSON.stringify(options));
    console.log('   Running Repair...');
    
    try {
        const result2 = await AiSchedulerService.repairSequence(TEST_GROUP_ID_2, SURAH_NUMBER, false, options);
        console.log('   📝 Result:', result2.message);
        console.log('   📊 Stats:', result2.stats);
        if (result2.actions.length > 0) {
            console.log('   🔧 Actions (Check for Splits/Dates):');
            result2.actions.forEach(a => console.log('      - ' + a));
        }
    } catch (err) {
        console.error('   ❌ Failed:', err.message);
    }

    console.log('\n\n🏁 Tests Completed.');
    await mongoose.disconnect();
}

runTestScenario();
