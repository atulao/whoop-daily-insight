// Test script to authenticate directly with WHOOP API
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Replace these with your actual values
const CLIENT_ID = process.env.VITE_WHOOP_CLIENT_ID || '';
const CLIENT_SECRET = process.env.VITE_WHOOP_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.VITE_WHOOP_REDIRECT_URI || 'http://localhost:8080/connect';
const CODE = ''; // Add your authorization code here
const CODE_VERIFIER = ''; // Add your code verifier here

// Choose whether to use direct connection or proxy
const USE_PROXY = false; // Set to true to test with the vite proxy
const DIRECT_TOKEN_URL = 'https://api.prod.whoop.com/oauth/token';
const PROXY_TOKEN_URL = 'http://localhost:8080/oauth-proxy/oauth/token';
const TOKEN_URL = USE_PROXY ? PROXY_TOKEN_URL : DIRECT_TOKEN_URL;

// Log configuration
console.log('\n==== WHOOP API Test Configuration ====');
console.log('CLIENT_ID:', CLIENT_ID);
console.log('CLIENT_SECRET provided:', !!CLIENT_SECRET);
console.log('REDIRECT_URI:', REDIRECT_URI);
console.log('CODE provided:', CODE ? 'Yes' : 'No');
console.log('CODE_VERIFIER provided:', CODE_VERIFIER ? 'Yes' : 'No');
console.log('Using:', USE_PROXY ? 'PROXY' : 'DIRECT CONNECTION');
console.log('Token URL:', TOKEN_URL);
console.log('=======================================\n');

async function testTokenRequest() {
  if (!CODE || !CODE_VERIFIER) {
    console.error('ERROR: You must provide both CODE and CODE_VERIFIER to test the token exchange');
    console.log('\nTo get these values:');
    console.log('1. Check localStorage after initiating auth flow - inspect "pkce_verifier"');
    console.log('2. The code comes from the callback URL in the "code" parameter');
    return;
  }

  if (!CLIENT_ID) {
    console.error('ERROR: No Client ID provided. Set the VITE_WHOOP_CLIENT_ID environment variable.');
    return;
  }

  if (!CLIENT_SECRET) {
    console.error('ERROR: No Client Secret provided. Set the VITE_WHOOP_CLIENT_SECRET environment variable.');
    return;
  }

  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('grant_type', 'authorization_code');
  params.append('code', CODE);
  params.append('redirect_uri', REDIRECT_URI);
  params.append('code_verifier', CODE_VERIFIER);

  console.log('\nSending token request with params:');
  // Don't log the full params with client_secret
  console.log(params.toString().replace(CLIENT_SECRET, '[REDACTED]'));

  try {
    const response = await axios.post(
      TOKEN_URL, 
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('\nSUCCESS!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('\nERROR:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.message.includes('ECONNREFUSED') && USE_PROXY) {
      console.error('\nProxy connection refused. Make sure your Vite dev server is running.');
    }
    
    console.error('Error message:', error.message);
  }
}

testTokenRequest(); 