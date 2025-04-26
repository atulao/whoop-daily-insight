# WHOOP Integration Troubleshooting Guide

## Overview

This guide helps troubleshoot issues with the WHOOP API integration, especially in WSL environments.

## Setup Requirements

1. Client credentials in `.env` file:
   ```
   VITE_WHOOP_CLIENT_ID=your_client_id_here
   VITE_WHOOP_CLIENT_SECRET=your_client_secret_here
   ```

2. Properly configured host in `vite.config.ts` for WSL:
   ```js
   server: {
     host: "0.0.0.0", // Allow connections from Windows host
     port: 8080,
     // ...proxy config
   }
   ```

## Common Issues

### CORS Errors

If you encounter CORS errors:
1. Make sure the proxy is correctly set up in `vite.config.ts`
2. Check that you're accessing the site through the correct domain (e.g., `http://localhost:8080`)
3. Check browser console for specific CORS error messages
4. Verify that API requests use the proxied paths (`/oauth-proxy/developer/...`) instead of direct API URLs

### Authentication Failures

If authentication fails:
1. Check browser console for debug logs starting with `[DEBUG]`
2. Verify your Client ID and Client Secret are correct and active in the WHOOP developer portal
3. Make sure your redirect URI matches exactly what is registered in the WHOOP developer portal
4. Check for "invalid_client" errors, which typically indicate issues with your client credentials

### 401 Unauthorized Errors

If you see "401 Unauthorized" with "invalid_client" errors:
1. Ensure both client ID and client secret are added to your .env file
2. Verify that the client secret hasn't expired or been revoked
3. Check that your client is authorized for the requested scopes
4. Try regenerating your client secret in the WHOOP developer portal if needed

### API Request Issues

If token exchange works but API requests fail:
1. Check that all API requests are going through the proxy
2. The proper URLs should be:
   - For token requests: `/oauth-proxy/oauth/oauth2/token`
   - For API requests: `/oauth-proxy/developer/v1/...`
3. Verify the Authorization header is being correctly set with the access token
4. Look for console logs showing `[DEBUG] Making API request to:` to confirm the right URL is used

### 404 Not Found Errors

If you receive 404 errors when accessing API endpoints:
1. Double check the API endpoint paths - WHOOP API paths are:
   - User profile: `/developer/v1/user/profile/basic` (proxied as `/oauth-proxy/developer/v1/user/profile/basic`)
   - Recovery data: `/developer/v1/recovery` (proxied as `/oauth-proxy/developer/v1/recovery`)
   - Cycle/strain data: `/developer/v1/cycle` (proxied as `/oauth-proxy/developer/v1/cycle`)
   - Sleep data: `/developer/v1/activity/sleep` (proxied as `/oauth-proxy/developer/v1/activity/sleep`)
2. Check server logs for the exact rewritten URL path being requested
3. Ensure your scopes include the necessary permissions:
   - User profile requires `read:profile` scope
   - Recovery data requires `read:recovery` scope
   - Cycle data requires `read:cycles` scope
   - Sleep data requires `read:sleep` scope
4. Verify your WHOOP user has data available for the requested endpoints

## Debugging With Test Script

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try to log in using the UI, then:
   - Check localStorage for `pkce_verifier` value (in browser dev tools)
   - Get the authorization code from the URL after callback (`code` parameter)

3. Edit `test-token.js`:
   ```js
   const CODE = 'your_code_from_url';
   const CODE_VERIFIER = 'your_pkce_verifier_from_localStorage';
   ```

4. Run the test script (install dependencies first if needed):
   ```bash
   npm install axios dotenv
   node test-token.js
   ```

5. Analyze the output for any error responses from the WHOOP API

## Accessing From Windows Host

When running in WSL, access your app from Windows using:
- `http://localhost:8080` or 
- `http://[WSL-IP-ADDRESS]:8080`

## Network Inspection

To inspect network traffic between the app and WHOOP API:
1. Use browser Network tab to monitor requests
2. Check server logs for proxy debugging information
3. Look for messages beginning with:
   - `Sending Request:` 
   - `Received Response from:`
   - `proxy error`
   - `Rewriting path:`

## Support

For additional assistance:
- Consult the [WHOOP API documentation](https://developer.whoop.com/docs/)
- Check your app's error logs
- Review all debug messages with `[DEBUG]` prefix 