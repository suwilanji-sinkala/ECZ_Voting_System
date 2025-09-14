// Simple test script to verify management authentication endpoints
const BASE_URL = 'http://localhost:3000';

async function testManagementAuth() {
  console.log('Testing Management Authentication System...\n');

  try {
    // Test 1: Register a new user
    console.log('1. Testing Registration...');
    const registerResponse = await fetch(`${BASE_URL}/api/management/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeId: 'TEST001',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@ecz.gov.zm',
        password: 'test123',
        role: 'operator'
      }),
    });

    const registerData = await registerResponse.json();
    console.log('Registration Response:', registerData);
    console.log('Registration Status:', registerResponse.status);
    console.log('');

    // Test 2: Login with the registered user
    console.log('2. Testing Login...');
    const loginResponse = await fetch(`${BASE_URL}/api/management/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeId: 'TEST001',
        password: 'test123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);
    console.log('Login Status:', loginResponse.status);
    console.log('');

    // Test 3: Verify token (if login successful)
    if (loginResponse.ok) {
      console.log('3. Testing Token Verification...');
      const cookies = loginResponse.headers.get('set-cookie');
      
      const verifyResponse = await fetch(`${BASE_URL}/api/management/verify`, {
        method: 'GET',
        headers: {
          'Cookie': cookies || ''
        }
      });

      const verifyData = await verifyResponse.json();
      console.log('Verify Response:', verifyData);
      console.log('Verify Status:', verifyResponse.status);
      console.log('');

      // Test 4: Logout
      console.log('4. Testing Logout...');
      const logoutResponse = await fetch(`${BASE_URL}/api/management/logout`, {
        method: 'POST',
        headers: {
          'Cookie': cookies || ''
        }
      });

      const logoutData = await logoutResponse.json();
      console.log('Logout Response:', logoutData);
      console.log('Logout Status:', logoutResponse.status);
    }

    console.log('\nTest completed!');

  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  testManagementAuth();
}
