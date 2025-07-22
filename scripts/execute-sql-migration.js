// Execute SQL migration for elevation system
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function executeSqlMigration() {
  console.log('🔄 Executing SQL migration for elevation system...');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'prepare-elevation-migration.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split into individual statements (simple approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.toLowerCase().startsWith('select')) {
        console.log(`\n📊 Executing query ${i + 1}:`);
        const result = await prisma.$queryRawUnsafe(statement);
        console.table(result);
      } else {
        console.log(`⚙️  Executing statement ${i + 1}: ${statement.substring(0, 50)}...`);
        await prisma.$executeRawUnsafe(statement);
        console.log(`✅ Statement ${i + 1} completed`);
      }
    }

    console.log('\n🎉 SQL migration completed successfully!');

  } catch (error) {
    console.error('❌ SQL migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
executeSqlMigration()
  .then(() => {
    console.log('\n✨ Database is prepared for schema changes!');
    console.log('Next: Run "npx prisma db push --accept-data-loss"');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });