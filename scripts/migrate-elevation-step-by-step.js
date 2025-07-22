// Step-by-step migration for elevation system
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateElevationStepByStep() {
  console.log('🔄 Migrating to elevation system step-by-step...');
  
  try {
    // Step 1: Add elevation columns
    console.log('\n📊 Step 1: Adding elevation columns...');
    await prisma.$executeRaw`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false`;
    await prisma.$executeRaw`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_mod BOOLEAN DEFAULT false`;
    console.log('✅ Elevation columns added');

    // Step 2: Migrate admin users
    console.log('\n🔑 Step 2: Migrating admin users...');
    const adminResult = await prisma.$executeRaw`
      UPDATE users 
      SET is_admin = true 
      WHERE role = 'admin' OR (roles @> ARRAY['admin']::user_role[])
    `;
    console.log(`✅ Updated ${adminResult} admin users`);

    // Step 3: Migrate mod users
    console.log('\n🛡️  Step 3: Migrating moderator users...');
    const modResult = await prisma.$executeRaw`
      UPDATE users 
      SET is_mod = true 
      WHERE role = 'mod' OR (roles @> ARRAY['mod']::user_role[])
    `;
    console.log(`✅ Updated ${modResult} moderator users`);

    // Step 4: Ensure tz445@cornell.edu is admin
    console.log('\n⭐ Step 4: Ensuring tz445@cornell.edu has admin privileges...');
    const specialAdminResult = await prisma.$executeRaw`
      UPDATE users 
      SET is_admin = true 
      WHERE email = 'tz445@cornell.edu'
    `;
    console.log(`✅ Ensured admin status for tz445@cornell.edu`);

    // Step 5: Convert admin/mod primary roles to appropriate base roles
    console.log('\n📝 Step 5: Converting admin/mod primary roles...');
    const roleConversionResult = await prisma.$executeRaw`
      UPDATE users 
      SET role = CASE 
          WHEN roles @> ARRAY['faculty']::user_role[] THEN 'faculty'::user_role
          WHEN roles @> ARRAY['staff']::user_role[] THEN 'staff'::user_role
          ELSE 'student'::user_role
      END
      WHERE role IN ('admin', 'mod')
    `;
    console.log(`✅ Converted ${roleConversionResult} users with admin/mod primary roles`);

    // Step 6: Show results
    console.log('\n📊 Step 6: Migration results:');
    const results = await prisma.$queryRaw`
      SELECT 
          email,
          role,
          is_admin,
          is_mod,
          CASE 
              WHEN is_admin THEN 'ADMIN'
              WHEN is_mod THEN 'MOD'
              ELSE 'USER'
          END as elevation_level
      FROM users 
      WHERE is_admin = true OR is_mod = true
      ORDER BY is_admin DESC, is_mod DESC, email
    `;
    
    console.table(results);

    console.log('\n🎉 Elevation migration completed successfully!');
    console.log(`   🔑 Admin users: ${results.filter(u => u.is_admin).length}`);
    console.log(`   🛡️  Moderator users: ${results.filter(u => u.is_mod).length}`);

    // Verify tz445@cornell.edu
    const adminUser = results.find(u => u.email === 'tz445@cornell.edu');
    if (adminUser && adminUser.is_admin) {
      console.log(`   ⭐ SUCCESS: tz445@cornell.edu has admin privileges!`);
    } else {
      console.log(`   ❌ WARNING: tz445@cornell.edu may not have admin privileges!`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateElevationStepByStep()
  .then(() => {
    console.log('\n✨ Ready for schema push!');
    console.log('Next: Run "npx prisma db push --accept-data-loss"');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });