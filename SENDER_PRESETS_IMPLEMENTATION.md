# Sender Presets Implementation

## Overview

This implementation adds a sender presets feature that allows users to quickly select pre-configured sender information when creating campaigns. Users can choose from:

1. **Gravity Point Media** - Default company sender
2. **Manito Manita** - New brand sender  
3. **Custom** - Set your own sender details

## Changes Made

### 1. Frontend - New Component: SenderPresets.tsx

**Location**: `/client/src/components/campaigns/SenderPresets.tsx`

This component provides:
- Pre-configured sender presets with name, email, and reply-to information
- Quick selection buttons for each preset
- Automatic detection when manual changes are made
- Helper functions for preset management

**Presets Configured**:

```typescript
{
  id: 'gravity-point',
  name: 'Gravity Point Media',
  fromName: 'Gravity Point Media',
  fromEmail: 'support@send.gravitypointmedia.com',
  replyToEmail: 'support@gravitypointmedia.com'
},
{
  id: 'manito-manita',
  name: 'Manito Manita',
  fromName: 'Manito Manita',
  fromEmail: 'info@manitomanita.com',
  replyToEmail: 'info@manitomanita.com'
},
{
  id: 'custom',
  name: 'Custom',
  fromName: '',
  fromEmail: '',
  replyToEmail: ''
}
```

### 2. Frontend - Updated: CreateCampaignModal.tsx

**Location**: `/client/src/components/campaigns/CreateCampaignModal.tsx`

**Changes**:
- Added `SenderPresets` component integration
- Added `selectedPreset` state to track current preset
- Added preset selection handler
- Added automatic preset detection on manual field changes
- Disabled manual editing of sender fields when a preset (not "Custom") is selected
- Updated helper text to guide users

**New Functions**:
```typescript
handlePresetSelect(preset: SenderPreset)  // Handles preset button clicks
handleFromNameChange(value: string)       // Detects preset on name change
handleFromEmailChange(value: string)      // Detects preset on email change
```

### 3. User Experience Flow

1. **User opens Create Campaign modal**
   - Default preset: "Gravity Point Media" is selected
   - Sender fields are pre-filled and disabled

2. **User clicks "Manito Manita" preset**
   - From Name changes to: "Manito Manita"
   - From Email changes to: "info@manitomanita.com"
   - Reply-To changes to: "info@manitomanita.com"
   - Fields remain disabled

3. **User clicks "Custom" preset**
   - Fields become editable
   - User can enter any values
   - System validates against verified SES emails

4. **Automatic Detection**
   - If user selects "Custom" and manually enters values that match a preset
   - System automatically switches to that preset
   - Prevents duplicate configuration

## AWS SES Email Verification

### Important: Verify `info@manitomanita.com`

Before the "Manito Manita" preset can be used in production, you need to verify the email address in AWS SES.

### How to Verify Email in AWS SES

#### Option 1: AWS Console (Recommended for beginners)

1. Log in to AWS Console
2. Navigate to **Amazon SES** service
3. Click on **Verified identities** in the left sidebar
4. Click **Create identity** button
5. Select **Email address**
6. Enter: `info@manitomanita.com`
7. Click **Create identity**
8. AWS will send a verification email to `info@manitomanita.com`
9. Open the email and click the verification link
10. Status will change to "Verified" (may take a few minutes)

#### Option 2: AWS CLI

```bash
# Verify the email address
aws ses verify-email-identity --email-address info@manitomanita.com --region us-east-1

# Check verification status
aws ses get-identity-verification-attributes --identities info@manitomanita.com --region us-east-1
```

#### Option 3: Programmatically (Node.js)

Add this script to verify via the backend:

```javascript
// File: server/src/scripts/verify-email.js
const AWS = require('aws-sdk');

const ses = new AWS.SES({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

async function verifyEmail(email) {
  try {
    const result = await ses.verifyEmailIdentity({ EmailAddress: email }).promise();
    console.log(`✅ Verification email sent to ${email}`);
    console.log('📧 Please check the inbox and click the verification link');
    return result;
  } catch (error) {
    console.error('❌ Error verifying email:', error);
    throw error;
  }
}

// Verify Manito Manita email
verifyEmail('info@manitomanita.com');
```

Run it:
```bash
cd server
node src/scripts/verify-email.js
```

### Verification Status

Once verified, the email will appear in the dropdown when users select "Custom" and will be available for the "Manito Manita" preset.

### SES Sandbox Mode

If your AWS SES is in **sandbox mode**:
- You can only send emails to verified addresses
- You need to verify both sender AND recipient emails
- To send to any email, request production access:
  1. Go to AWS SES Console
  2. Click "Account dashboard"
  3. Click "Request production access"
  4. Fill out the form explaining your use case
  5. Wait for AWS approval (usually 24-48 hours)

## Backend Compatibility

The backend already supports custom sender fields:
- ✅ Database columns exist (`fromName`, `fromEmail`, `replyToEmail`)
- ✅ API accepts these fields in campaign creation
- ✅ Validation is in place
- ✅ Email sending uses these fields

**No backend changes needed** - the implementation is 100% frontend!

## Testing

### Test the Presets

1. **Start the development server**:
   ```bash
   cd client
   npm run dev
   ```

2. **Test Gravity Point Media preset**:
   - Open Create Campaign modal
   - Verify "Gravity Point Media" is selected by default
   - Verify fields show correct values
   - Try to edit fields (should be disabled)

3. **Test Manito Manita preset**:
   - Click "Manito Manita" button
   - Verify all fields update correctly
   - Verify fields are still disabled

4. **Test Custom preset**:
   - Click "Custom" button
   - Verify fields become editable
   - Enter custom values
   - Verify validation works

5. **Test Auto-detection**:
   - Select "Custom"
   - Manually enter "Gravity Point Media" values
   - Verify preset auto-switches to "Gravity Point Media"

### Test Campaign Creation

1. Create a campaign with each preset
2. Verify the campaign saves with correct sender info
3. Check database to confirm values are stored
4. Send a test email and verify sender appears correctly

## Adding More Presets

To add additional presets, edit `SenderPresets.tsx`:

```typescript
export const SENDER_PRESETS: SenderPreset[] = [
  // ... existing presets ...
  {
    id: 'your-brand',
    name: 'Your Brand Name',
    fromName: 'Your Brand',
    fromEmail: 'hello@yourbrand.com',  // Must be verified in SES
    replyToEmail: 'support@yourbrand.com',
    description: 'Your brand sender'
  }
];
```

**Remember**: Always verify the email in AWS SES before using it!

## Files Modified

### Created
- `/client/src/components/campaigns/SenderPresets.tsx`

### Modified
- `/client/src/components/campaigns/CreateCampaignModal.tsx`

### Documentation
- `/client/SENDER_PRESETS_IMPLEMENTATION.md` (this file)

## Benefits

✅ **Faster Campaign Creation** - One click to set all sender fields  
✅ **Consistency** - Ensures brand compliance  
✅ **User-Friendly** - Clear visual selection  
✅ **Flexible** - Custom option still available  
✅ **Error Prevention** - Reduces typos in sender information  
✅ **Scalable** - Easy to add more presets

## Next Steps

1. ✅ Verify `info@manitomanita.com` in AWS SES
2. ✅ Test all presets thoroughly
3. ✅ Add more presets as needed
4. ✅ Request SES production access if in sandbox mode
5. ✅ Train users on the new feature
