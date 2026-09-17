import { analyzeWaste } from '../services/aiService';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Helper to find the latest file matching a prefix in a directory
function findLatestFile(dir: string, prefix: string): string | null {
  try {
    const files = fs.readdirSync(dir)
      .filter(f => f.startsWith(prefix) && f.endsWith('.png'))
      .map(f => ({ name: f, time: fs.statSync(path.join(dir, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time); // newest first
    return files.length > 0 ? path.join(dir, files[0].name) : null;
  } catch (e) {
    return null;
  }
}

async function runTests() {
  const artifactsDir = path.resolve(__dirname, '../../../../../brain/a900263b-b218-4cec-b21c-e4f208cdaf1e');
  
  const testImages = [
    { prefix: 'plastic_water_bottle', expected: 'Plastic Bottle' },
    { prefix: 'aluminium_can', expected: 'Aluminium Can' },
    { prefix: 'glass_bottle', expected: 'Glass Bottle' },
    { prefix: 'cardboard_box', expected: 'Cardboard Box' },
    { prefix: 'paper_waste', expected: 'Paper Waste' },
    { prefix: 'plastic_cup', expected: 'Plastic Cup' },
    { prefix: 'food_waste', expected: 'Food Waste' },
    { prefix: 'used_battery', expected: 'Battery' },
  ];

  console.log('===========================================================');
  console.log(' ECO-MIND AI: VISION OBJECT DETECTION TEST');
  console.log('===========================================================\n');

  let successCount = 0;

  for (const test of testImages) {
    const imagePath = findLatestFile(artifactsDir, test.prefix);
    
    console.log(`Testing image: ${test.prefix}`);
    
    if (!imagePath) {
      console.log(`  ❌ Error: Image not found in artifacts directory.\n`);
      continue;
    }

    try {
      console.log(`  Analyzing with Vision AI...`);
      const result = await analyzeWaste(imagePath);
      
      console.log(`  ✅ Result Object: ${result.objectName}`);
      console.log(`  - Material: ${result.material}`);
      console.log(`  - Condition: ${result.condition}`);
      console.log(`  - Reusability: ${result.reusability}`);
      console.log(`  - Recycling Status: ${result.recyclingStatus}`);
      console.log(`  - Confidence: ${result.confidence}%`);
      console.log(`  - Mode: ${result.isDemo ? 'Demo Mode (No API Key)' : 'Real AI API'}\n`);
      
      successCount++;
    } catch (err: any) {
      console.log(`  ❌ Analysis Failed: ${err.message}\n`);
    }
  }
  
  console.log('===========================================================');
  console.log(` TEST COMPLETE. Successfully analyzed ${successCount}/${testImages.length} images.`);
  if (successCount > 0 && testImages.length > 0) {
    console.log(` If the mode was 'Demo Mode', please add GOOGLE_VISION_API_KEY or OPENAI_API_KEY to server/.env to test real Vision AI.`);
  }
}

runTests();
