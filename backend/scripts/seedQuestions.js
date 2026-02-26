import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedQuestions() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seeding questions...');
    
    // Check if questions already exist
    const checkResult = await client.query('SELECT COUNT(*) FROM questions');
    const count = parseInt(checkResult.rows[0].count);
    
    if (count > 0) {
      console.log(`⚠️  Database already has ${count} questions. Skipping seed.`);
      console.log('💡 If you want to re-seed, truncate the questions table first.');
      return;
    }
    
    const seedPath = path.join(__dirname, '../database/seed.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    
    await client.query(seed);
    
    // Verify seeding
    const result = await client.query(`
      SELECT category, COUNT(*) as count 
      FROM questions 
      GROUP BY category 
      ORDER BY category
    `);
    
    console.log('✅ Questions seeded successfully!');
    console.log('\n📊 Question distribution:');
    result.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.count} questions`);
    });
    
    const totalResult = await client.query('SELECT COUNT(*) FROM questions');
    console.log(`   TOTAL: ${totalResult.rows[0].count} questions\n`);
    
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedQuestions();
