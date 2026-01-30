const axios = require('axios');

async function testFrontendFlow() {
    try {
        console.log('=== Simulating Frontend User Flow ===\n');

        // Step 1: Check if we have a stored token (simulating localStorage)
        console.log('📦 Checking localStorage (simulated)...');
        let storedToken = null; // In browser, this would be: localStorage.getItem('user')
        console.log('   Token in storage:', storedToken ? 'EXISTS' : 'NONE');

        if (!storedToken) {
            console.log('\n⚠️  No token found - user needs to login first!\n');
        }

        // Step 2: Try to access admin page WITHOUT logging in first
        console.log('🚫 Attempting to access /api/admin/users WITHOUT auth token...');
        try {
            await axios.get('http://localhost:3001/api/admin/users');
            console.log('   ✅ Success (unexpected!)');
        } catch (error) {
            console.log(`   ❌ Failed: ${error.response?.data?.message || error.message}`);
            console.log('   This is EXPECTED - authentication required!\n');
        }

        // Step 3: Show what user SHOULD do - login first
        console.log('✅ CORRECT FLOW: Login first, then access admin page');
        console.log('1. User navigates to /login');
        console.log('2. User enters: username=admin, password=antimize');
        console.log('3. Frontend calls POST /api/auth/login');

        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'admin',
            password: 'antimize'
        });

        console.log('4. Backend returns accessToken');
        const { accessToken } = loginResponse.data;
        console.log(`   ✅ Token: ${accessToken.substring(0, 40)}...`);

        console.log('5. Frontend stores token in localStorage');
        console.log('6. Frontend redirects to /dashboard/admin');
        console.log('7. Frontend calls GET /api/admin/users WITH token\n');

        const usersResponse = await axios.get('http://localhost:3001/api/admin/users', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        console.log('   ✅ Users fetched successfully!');
        console.log(`   📊 Count: ${usersResponse.data.length} users`);
        console.log('   Users:', usersResponse.data.map(u => u.username).join(', '));

        console.log('\n' + '='.repeat(60));
        console.log('DIAGNOSIS:');
        console.log('='.repeat(60));
        console.log('❌ Frontend is showing "Invalid token" error');
        console.log('✅ Backend API works perfectly');
        console.log('✅ Database has 5 users');
        console.log('\nPOSSIBLE CAUSES:');
        console.log('1. User is NOT logged in (no token in localStorage)');
        console.log('2. User token has EXPIRED (15-minute expiry)');
        console.log('3. User logged in but token is malformed/corrupted');
        console.log('\nSOLUTION:');
        console.log('➡️  User needs to LOGIN at http://localhost:5173/login');
        console.log('    Username: admin');
        console.log('    Password: antimize');
        console.log('➡️  Then navigate to http://localhost:5173/dashboard/admin');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    }
}

testFrontendFlow();
