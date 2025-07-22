// Data migration script to populate roles array from existing role column
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateRoles() {
  console.log('🚀 Starting role migration...');
  
  try {
    // Get all users with their current role
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        roles: true,
      },
    });

    console.log(`📊 Found ${users.length} users to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // Check if roles array is already populated
      if (user.roles && user.roles.length > 0) {
        console.log(`⏭️  Skipping ${user.email} - already has roles: [${user.roles.join(', ')}]`);
        skippedCount++;
        continue;
      }

      // Migrate single role to roles array
      const newRoles = user.role ? [user.role] : ['student'];
      
      await prisma.users.update({
        where: { id: user.id },
        data: { roles: newRoles },
      });

      console.log(`✅ Migrated ${user.email}: ${user.role || 'null'} → [${newRoles.join(', ')}]`);
      migratedCount++;
    }

    console.log('\n🎉 Migration completed!');
    console.log(`   ✅ Migrated: ${migratedCount} users`);
    console.log(`   ⏭️  Skipped: ${skippedCount} users (already had roles)`);
    console.log(`   📊 Total: ${users.length} users`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateRoles()
  .then(() => {
    console.log('\n✨ All done! Users can now have multiple roles.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });