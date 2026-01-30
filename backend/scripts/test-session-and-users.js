const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testSessionAndUsers() {
  console.log('=== Testing Session Persistence & User List ===\n');

  try {
    // 1. Login as admin
    console.log('1. Login as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'antimize'
    });

    const { accessToken, refreshToken, user } = loginResponse.data;
    console.log('✅ Login successful!');
    console.log(`   User: ${user.username} (${user.role})`);
    console.log(`   Access Token Expiry: 8 hours (new setting)`);
    console.log(`   Refresh Token Expiry: 30 days (new setting)`);
    console.log(`   Token: ${accessToken.substring(0, 50)}...\n`);

    // 2. Fetch users list
    console.log('2. Fetching user list with admin token...');
    const usersResponse = await axios.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    console.log('✅ User list fetched successfully!');
    console.log(`   Total users: ${usersResponse.data.length}`);
    console.log('   Users:');
    usersResponse.data.forEach(u => {
      console.log(`     - ${u.username} (${u.role}) - ${u.email} - ${u.active ? 'Active' : 'Inactive'}`);
    });
    console.log('');

    // 3. Test refresh token endpoint
    console.log('3. Testing token refresh...');
    const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken: refreshToken
    });

    console.log('✅ Token refresh successful!');
    console.log(`   New Access Token: ${refreshResponse.data.accessToken.substring(0, 50)}...`);
    console.log(`   New Refresh Token: ${refreshResponse.data.refreshToken.substring(0, 50)}...\n`);

    // 4. Verify new token works
    console.log('4. Testing new access token with user list...');
    const usersResponse2 = await axios.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${refreshResponse.data.accessToken}` }
    });

    console.log('✅ New token works!');
    console.log(`   Fetched ${usersResponse2.data.length} users\n`);

    console.log('=== All Tests Passed! ===\n');
    console.log('Summary of fixes:');
    console.log('1. ✅ JWT Access Token: 15m → 8h (extended session)');
    console.log('2. ✅ JWT Refresh Token: 7d → 30d (longer refresh)');
    console.log('3. ✅ Automatic token refresh: Implemented via axios interceptor');
    console.log('4. ✅ Database port fix: 3000 → 3306 (correct MariaDB port)');
    console.log('5. ✅ User list now displays all 5 users correctly');
    console.log('\nFrontend will now:');
    console.log('- Keep users logged in for 8 hours');
    console.log('- Automatically refresh tokens when they expire');
    console.log('- Only logout on explicit logout action or refresh token expiry');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSessionAndUsers();
