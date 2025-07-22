// Script to add faculty role to a user for testing
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addFacultyRole() {
  console.log('🎓 Adding faculty role to a user for testing...');
  
  try {
    // Get the first user to test with
    const user = await prisma.users.findFirst({
      select: {
        id: true,
        email: true,
        roles: true,
      },
    });

    if (!user) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`👤 Found user: ${user.email}`);
    console.log(`📋 Current roles: [${user.roles.join(', ')}]`);

    // Add faculty role if not already present
    const currentRoles = user.roles || ['student'];
    if (!currentRoles.includes('faculty')) {
      const newRoles = [...currentRoles, 'faculty'];
      
      await prisma.users.update({
        where: { id: user.id },
        data: { roles: newRoles },
      });

      console.log(`✅ Updated ${user.email}`);
      console.log(`📋 New roles: [${newRoles.join(', ')}]`);
      console.log('\n🎉 This user can now:');
      console.log('   📝 Create course reviews (student role)');
      console.log('   💬 Reply to course reviews (faculty role)');
    } else {
      console.log(`⚠️  User already has faculty role`);
    }

  } catch (error) {
    console.error('❌ Failed to add faculty role:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addFacultyRole()
  .then(() => {
    console.log('\n✨ Faculty role addition completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });