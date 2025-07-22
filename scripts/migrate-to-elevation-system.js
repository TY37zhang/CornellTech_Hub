// Migration script to convert from roles array to single role + elevation flags
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateToElevationSystem() {
  console.log('🔄 Migrating to single role + elevation system...');
  
  try {
    // Get all users with their current role and roles array
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        roles: true,
      },
    });

    console.log(`📊 Found ${users.length} users to migrate`);

    let adminCount = 0;
    let modCount = 0;
    let migratedCount = 0;

    for (const user of users) {
      console.log(`\n👤 Processing ${user.email}`);
      console.log(`   Current role: ${user.role}`);
      console.log(`   Current roles array: [${user.roles?.join(', ') || 'none'}]`);

      // Determine primary role and elevation flags
      let primaryRole = user.role || 'student';
      let isAdmin = false;
      let isMod = false;

      // Check if user has admin or mod in roles array
      if (user.roles) {
        if (user.roles.includes('admin')) {
          isAdmin = true;
          adminCount++;
          console.log(`   🔑 Will be elevated to ADMIN`);
        }
        if (user.roles.includes('mod')) {
          isMod = true;
          modCount++;
          console.log(`   🛡️  Will be elevated to MODERATOR`);
        }
      }

      // Check if primary role is admin/mod and convert it
      if (primaryRole === 'admin') {
        isAdmin = true;
        primaryRole = 'student'; // Default fallback, we'll determine better below
        adminCount++;
        console.log(`   🔑 Converting admin role to ADMIN elevation`);
      }
      if (primaryRole === 'mod') {
        isMod = true;
        primaryRole = 'student'; // Default fallback
        modCount++;
        console.log(`   🛡️  Converting mod role to MODERATOR elevation`);
      }

      // Special handling for tz445@cornell.edu to ensure they remain admin
      if (user.email === 'tz445@cornell.edu') {
        isAdmin = true;
        console.log(`   ⭐ SPECIAL: Ensuring ${user.email} remains as ADMIN`);
      }

      // Determine the best primary role for admin/mod users
      if ((isAdmin || isMod) && (primaryRole === 'admin' || primaryRole === 'mod' || !primaryRole)) {
        // Check if they have other roles that could be primary
        if (user.roles) {
          if (user.roles.includes('faculty')) {
            primaryRole = 'faculty';
          } else if (user.roles.includes('staff')) {
            primaryRole = 'staff';
          } else {
            primaryRole = 'student'; // Default
          }
        } else {
          primaryRole = 'student'; // Default
        }
        console.log(`   📝 Setting primary role to: ${primaryRole}`);
      }

      // Ensure primary role is valid (student, faculty, or staff only)
      if (!['student', 'faculty', 'staff'].includes(primaryRole)) {
        console.log(`   ⚠️  Invalid primary role ${primaryRole}, defaulting to student`);
        primaryRole = 'student';
      }

      // Update the user
      await prisma.users.update({
        where: { id: user.id },
        data: {
          role: primaryRole,
          is_admin: isAdmin,
          is_mod: isMod,
        },
      });

      console.log(`   ✅ Updated: ${primaryRole}${isAdmin ? ' + ADMIN' : ''}${isMod ? ' + MOD' : ''}`);
      migratedCount++;
    }

    console.log('\n🎉 Migration completed!');
    console.log(`   ✅ Migrated: ${migratedCount} users`);
    console.log(`   🔑 Admin users: ${adminCount}`);
    console.log(`   🛡️  Moderator users: ${modCount}`);

    // Verify tz445@cornell.edu is admin
    const adminUser = await prisma.users.findUnique({
      where: { email: 'tz445@cornell.edu' },
      select: { email: true, role: true, is_admin: true, is_mod: true },
    });

    if (adminUser) {
      console.log(`\n⭐ VERIFICATION: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Is Admin: ${adminUser.is_admin}`);
      console.log(`   Is Mod: ${adminUser.is_mod}`);
      
      if (adminUser.is_admin) {
        console.log(`   ✅ SUCCESS: ${adminUser.email} has admin privileges!`);
      } else {
        console.log(`   ❌ ERROR: ${adminUser.email} does not have admin privileges!`);
      }
    } else {
      console.log(`\n❌ ERROR: Could not find tz445@cornell.edu in database!`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateToElevationSystem()
  .then(() => {
    console.log('\n✨ Ready to apply database schema changes!');
    console.log('Next: Run "npx prisma db push --accept-data-loss"');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });