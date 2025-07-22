// Drop the roles column to allow enum changes
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function dropRolesColumn() {
  console.log('🗑️  Dropping roles column...');
  
  try {
    // Drop the roles column
    await prisma.$executeRaw`ALTER TABLE users DROP COLUMN IF EXISTS roles`;
    console.log('✅ Roles column dropped successfully');

  } catch (error) {
    console.error('❌ Failed to drop roles column:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the operation
dropRolesColumn()
  .then(() => {
    console.log('\n✨ Ready for schema push!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });