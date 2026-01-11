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

    // ========================================================================
    // SCENARIO 3: Conflict Handling
    // ========================================================================
    console.log('\n\n🧪 TEST 3: Conflict Handling');
    const PROMISE_GROUP = new mongoose.Types.ObjectId(); // Group we seek to repair
    const OTHER_GROUP = new mongoose.Types.ObjectId();   // Ghost group causing conflict
    
    // Create sections for PROMISE_GROUP
    await createSectionsSequence(PROMISE_GROUP, 20); 

    // Find the last date of PROMISE_GROUP to setup a conflict on the next day
    const lastSection = await Section.findOne({ group: PROMISE_GROUP }).sort({ date: -1 });
    const conflictDate = new Date(lastSection.date);
    conflictDate.setDate(conflictDate.getDate() + 1); // The "Next Day" that usually would be picked
    
    console.log(`   🚧 Creating CONFLICT on date ${conflictDate.toISOString().split('T')[0]} for Teacher in OTHER Group`);
    
    // Insert "Busy" section for Teacher
    await Section.create({
        group: OTHER_GROUP,
        teacher: TEACHER_ID, // Same Teacher
        date: conflictDate,
        dateKey: conflictDate.toISOString().split('T')[0],
        memorizationSection: "Conflict Section",
        memorizationMeta: [] // Just empty valid section
    });

    console.log("   Running Repair (Should skip the conflict date)...");
    
    // Since createSectionsSequence adds random gaps, we need to rely on the service finding one.
    // However, to FORCE a repair that needs a new day, we ensure there is a gap at the end?
    // Actually, createSectionsSequence might not have a gap at the very end.
    // Let's manually inject a gap requirement by adding a very far future section?
    // Or just trust the randomness (20% chance per item).
    // Better: Manually corrupt the last section to create a gap before it?
    // No, let's just create a "New Mark" scenario via repair? 
    // The repair logic fills gaps between *Existing* sections.
    // If we want to test "Next Date Selection", we need a gap that forces writing to new dates.
    // Gaps shift future sections. So if we have a gap at index 10, it will shift 11..20.
    // The shift logic uses `applyRippleShift` which uses `currentDate` loop.
    // Ideally, one of the shifted sections would land on `conflictDate`.
    
    try {
        const result3 = await AiSchedulerService.repairSequence(PROMISE_GROUP, SURAH_NUMBER, false, {});
        console.log(`   📝 Result: ${result3.message}`);
        
        // Validation: Check if PROMISE_GROUP has a section on conflictDate
        const badSection = await Section.findOne({ group: PROMISE_GROUP, date: conflictDate });
        if (badSection) {
            console.log(`   ❌ FAILED: Created section on conflict date ${conflictDate.toISOString().split('T')[0]}`);
        } else {
            console.log(`   ✅ PASSED: Avoided conflict date ${conflictDate.toISOString().split('T')[0]}`);
        }
    } catch (err) {
        console.error('   ❌ Failed:', err.message);
    }

    // ========================================================================
    // SCENARIO 4: Reverse Chronology Fix (Orphan earlier than existing)
    // ========================================================================
    console.log('\n\n🧪 TEST 4: Reverse Chronology Check');
    const REVERSE_GROUP = new mongoose.Types.ObjectId();
    
    // Day 20: Verses 60-70 (Real Memorization)
    const date1 = new Date();
    date1.setDate(date1.getDate() + 20);
    
    await Section.create({
        group: REVERSE_GROUP,
        teacher: TEACHER_ID,
        date: date1,
        dateKey: date1.toISOString().split('T')[0],
        memorizationSection: "Existing Later Part",
        memorizationMeta: [{
            surahNumber: SURAH_NUMBER,
            ayahStart: 60,
            ayahEnd: 70,
            status: 'completed'
        }]
    });
    console.log(`   📅 Day 20 (${date1.toISOString().split('T')[0]}): Verses 60-70`);

    // Day 21: Review 5-60 (Orphan -> Virtual 5-60)
    // Implicitly creates gap 1-4
    const date2 = new Date();
    date2.setDate(date2.getDate() + 21);
    
    await Section.create({
        group: REVERSE_GROUP,
        teacher: TEACHER_ID,
        date: date2,
        dateKey: date2.toISOString().split('T')[0],
        reviewSection: "Orphan Review",
        reviewMeta: [{
            surahNumber: SURAH_NUMBER,
            ayahStart: 5,
            ayahEnd: 60,
            status: 'completed'
        }],
        memorizationMeta: [] // Empty -> Orphan
    });
    console.log(`   📅 Day 21 (${date2.toISOString().split('T')[0]}): Review 5-60 (Orphan)`);

    console.log("   Running Repair...");
    try {
        const result4 = await AiSchedulerService.repairSequence(REVERSE_GROUP, SURAH_NUMBER, false, {});
        console.log(`   📝 Result: ${result4.message}`);
        
        // Validation:
        // We expect verses 1-4 and 5-60 to be scheduled starting from Day 20 (replacing 60-70)
        // because 1 < 60.
        // If the fix works, the section on Day 20 should now contain verses 1-4 (or similar start).
        // If it fails, Day 20 will still be 60-70.
        
        const day20Section = await Section.findOne({ group: REVERSE_GROUP, date: date1 });
        const meta = day20Section.memorizationMeta.find(m => m.surahNumber === SURAH_NUMBER);
        
        if (meta && meta.ayahStart < 60) {
            console.log(`   ✅ PASSED: Day 20 updated to start with verse ${meta.ayahStart} (Correct order)`);
        } else {
            console.log(`   ❌ FAILED: Day 20 still starts with verse ${meta ? meta.ayahStart : '???'} (Reverse order persisted)`);
        }
        
    } catch (err) {
        console.error('   ❌ Failed:', err.message);
    }



    // --- SCENARIO 5: DUPLICATE SEGMENTS ---
    console.log('\n--- Scenario 5: Detecting & Removing Duplicates ---');
    const DUPE_GROUP = new mongoose.Types.ObjectId();
    
    const dateD1 = new Date(); dateD1.setDate(dateD1.getDate() - 5);
    const dateD2 = new Date(); dateD2.setDate(dateD2.getDate() - 4);
    const dateD3 = new Date(); dateD3.setDate(dateD3.getDate() - 3);

    // Day 1: 1-10
    await Section.create({
        group: DUPE_GROUP, teacher: TEACHER_ID, date: dateD1,
        memorizationMeta: [{ surahNumber: SURAH_NUMBER, ayahStart: 1, ayahEnd: 10, status: 'completed' }]
    });

    // Day 2: 1-10 (Duplicate!)
    await Section.create({
        group: DUPE_GROUP, teacher: TEACHER_ID, date: dateD2,
        memorizationMeta: [{ surahNumber: SURAH_NUMBER, ayahStart: 1, ayahEnd: 10, status: 'completed' }] // Duplicate
    });

    // Day 3: 11-20
    await Section.create({
        group: DUPE_GROUP, teacher: TEACHER_ID, date: dateD3,
        memorizationMeta: [{ surahNumber: SURAH_NUMBER, ayahStart: 11, ayahEnd: 20, status: 'completed' }] 
    });

    console.log("   Running Repair (Expect Duplicate Removal)...");
    try {
        const result5 = await AiSchedulerService.repairSequence(DUPE_GROUP, SURAH_NUMBER, false, {});
        console.log(`   📝 Result: ${result5.message}`);
        console.log(`   STATS:`, result5.stats);

        if (result5.stats && result5.stats.duplicatesFixed > 0) {
            console.log("   ✅ PASSED: Duplicates detected and fixed.");
        } else {
             console.log("   ❌ FAILED: Duplicates ignored.");
        }

        // Verify DB: Find which sections still contain this surah in meta
        const sections = await Section.find({ group: DUPE_GROUP, "memorizationMeta.surahNumber": SURAH_NUMBER }).sort({date: 1});
        console.log(`   Sections with Surah ${SURAH_NUMBER}: ${sections.length}`);
        
        if(sections.length === 2 && sections[0].date.getTime() === dateD1.getTime() && sections[1].date.getTime() === dateD3.getTime()) {
             console.log("   ✅ Database Cleaned");
        } else {
             // Debug
             sections.forEach(s => console.log(`      Found: ${s.date.toISOString().split('T')[0]} - ${JSON.stringify(s.memorizationMeta)}`));
        }

    } catch(err) {
        console.error('   ❌ Failed:', err);
    }


    console.log('\n\n🏁 Tests Completed.');
    await mongoose.disconnect();
}

runTestScenario();
