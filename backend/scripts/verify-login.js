const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

// Database configuration
const sequelize = new Sequelize('paradisedental', 'antimize', '@Nt!mize09122025', {
  host: '127.0.0.1',
  port: 3306,
  dialect: 'mysql',
  logging: false
});

async function verifyLogin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Get admin user
    const [users] = await sequelize.query(
      'SELECT id, username, password_hash, role, email FROM Users WHERE username = ?',
      { replacements: ['admin'] }
    );

    if (users.length === 0) {
      console.log('❌ Admin user not found!');
      return;
    }

    const user = users[0];
    console.log('User found:', {
      username: user.username,
      role: user.role,
      email: user.email,
      password_hash_prefix: user.password_hash.substring(0, 20) + '...'
    });

    // Test password
    const testPassword = 'antimize';
    const isValid = await bcrypt.compare(testPassword, user.password_hash);

    console.log('\nPassword verification:');
    console.log('  Test password:', testPassword);
    console.log('  Hash valid:', isValid ? '✅ YES' : '❌ NO');

    // Also test with the old password
    const oldPassword = 'password123';
    const isOldValid = await bcrypt.compare(oldPassword, user.password_hash);
    console.log('  Old password (password123) valid:', isOldValid ? '✅ YES' : '❌ NO');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verifyLogin();
