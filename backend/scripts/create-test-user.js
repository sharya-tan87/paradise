const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { Sequelize } = require('sequelize');

// Database configuration from .env
const sequelize = new Sequelize('paradisedental', 'antimize', '@Nt!mize09122025', {
  host: '127.0.0.1',
  port: 3306, // Correct MySQL port
  dialect: 'mysql',
  logging: false
});

async function createTestUser() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Check if user already exists
    const [existingUsers] = await sequelize.query(
      'SELECT username FROM Users WHERE username = ?',
      { replacements: ['admin'] }
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  User "admin" already exists. Updating password...');

      // Hash new password
      const password_hash = await bcrypt.hash('antimize', 10);

      // Update existing user
      await sequelize.query(
        'UPDATE Users SET password_hash = ?, updated_at = NOW() WHERE username = ?',
        { replacements: [password_hash, 'admin'] }
      );

      console.log('✅ Admin user password updated successfully!');
      console.log('');
      console.log('Test Credentials:');
      console.log('  Username: admin');
      console.log('  Password: antimize');
      console.log('  Role: admin');

    } else {
      console.log('Creating new admin user...');

      // Hash password
      const password_hash = await bcrypt.hash('antimize', 10);
      const userId = uuidv4();

      // Insert new user
      await sequelize.query(
        `INSERT INTO Users (id, username, password_hash, role, email, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            userId,
            'admin',
            password_hash,
            'admin',
            'admin@test.paradisedental.com',
            1
          ]
        }
      );

      console.log('✅ New admin user created successfully!');
      console.log('');
      console.log('Test Credentials:');
      console.log('  Username: admin');
      console.log('  Password: antimize');
      console.log('  Role: admin');
      console.log('  Email: admin@test.paradisedental.com');
      console.log('  ID:', userId);
    }

    // Show all users
    console.log('');
    console.log('All users in database:');
    const [users] = await sequelize.query('SELECT username, role, email FROM Users');
    console.table(users);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

createTestUser();
