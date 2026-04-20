# OpenMart - WhatsApp OTP Setup Guide

## Quick Start (Without Twilio - Simulation Mode)

The system currently runs in simulation mode. When you request OTP:
- Check the terminal running the API server
- You'll see: `📱 WhatsApp Simulation: OTP XXXXXX would be sent to +91XXXXXXXXXX`

## To Enable Real WhatsApp Messages

### Step 1: Create Twilio Account
1. Go to https://www.twilio.com (free trial available)
2. Sign up with your phone number
3. Get free $15 credit for testing

### Step 2: Enable WhatsApp Sandbox
1. Go to https://console.twilio.com
2. Search "WhatsApp" in the dashboard
3. Enable WhatsApp sandbox
4. Connect your phone number to the sandbox

### Step 3: Get Credentials
From Twilio Console, copy:
- Account SID
- Auth Token
- Phone Number (should show as whatsapp:+14155238871)

### Step 4: Update .env file
```bash
cd ~/ip/apps/api

# Edit .env file and add your Twilio credentials:
nano .env
```

Add these lines:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238871
```

### Step 5: Restart API Server
```bash
# Kill existing process
pkill -f "tsx"

# Restart
cd ~/ip/apps/api
node --import tsx src/index.ts
```

### Step 6: Test WhatsApp OTP
1. Go to http://localhost:5173/register
2. Enter your phone number (with +91 for India)
3. Click "Send OTP"
4. Check your WhatsApp for the message!

## Important Notes

- Twilio sandbox works with verified phone numbers only
- To test with any number, upgrade to paid Twilio account
- Sandbox messages come from: whatsapp:+14155238871

## Troubleshooting

**"Failed to send OTP" error:**
- Check that TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are correct
- Make sure WhatsApp sandbox is enabled
- Verify your phone is connected to the sandbox

**No messages received:**
- Check spam folder in WhatsApp
- Make sure phone number format is correct (+91xxxxxxxxxx)
