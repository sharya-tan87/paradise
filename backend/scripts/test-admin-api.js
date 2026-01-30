const axios = require('axios');

async function testAdminAPI() {
    try {
        console.log('=== Testing Admin API Flow ===\n');

        // Step 1: Login
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'admin',
            password: 'antimize'
        });

        console.log('✅ Login successful!');
        const { accessToken, user } = loginResponse.data;
        console.log('   User:', user.username, '/', user.role);
        console.log('   Token:', accessToken.substring(0, 50) + '...\n');

        // Step 2: Get admin users
        console.log('2. Fetching users with admin token...');
        const usersResponse = await axios.get('http://localhost:3001/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log('✅ Users fetched successfully!');
        console.log('   Status:', usersResponse.status);
        console.log('   Users count:', usersResponse.data.length);
        console.log('   Users:');
        usersResponse.data.forEach(u => {
            console.log(`     - ${u.username} (${u.role}) - ${u.email}`);
        });

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    }
}

testAdminAPI();
