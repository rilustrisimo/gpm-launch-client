# Backend Server Adjustments for Turtle Send Progress

## Issues Identified from Frontend Logs

1. **Empty Recipients Array**: API returns `recipients: Array(0)` but computed stats show 5 sent emails
2. **Status Mismatch**: Campaign shows "processing" but progress is 100%
3. **Database Records Missing**: No actual campaign statistics records being returned

## Required Backend Changes

### 1. Campaign Status Management

**Issue**: Campaign status remains "processing" even when 100% complete

**Fix Needed**:
```javascript
// In your campaign stats endpoint
app.get('/campaigns/:id/stats', async (req, res) => {
  const { id } = req.params;
  
  // Get campaign and calculate progress
  const campaign = await Campaign.findById(id);
  const totalRecipients = await CampaignStat.count({ where: { campaignId: id } });
  const sentCount = await CampaignStat.count({ where: { campaignId: id, sent: true } });
  
  const progress = totalRecipients > 0 ? Math.round((sentCount / totalRecipients) * 100) : 0;
  
  // Update campaign status if complete
  if (progress >= 100 && campaign.status !== 'completed') {
    await campaign.update({ status: 'completed' });
    campaign.status = 'completed'; // Update local object
  }
  
  // Return response...
});
```

### 2. Recipients Array Population

**Issue**: `recipients: Array(0)` - not returning actual campaign statistics records

**Fix Needed**:
```javascript
// In your campaign stats endpoint
app.get('/campaigns/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get all campaign statistics records for this campaign
    const recipients = await CampaignStat.findAll({
      where: { campaignId: id },
      include: [
        {
          model: Contact,
          attributes: ['email', 'firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    // Calculate stats from actual records
    const stats = {
      totalRecipients: recipients.length,
      sent: recipients.filter(r => r.sent).length,
      delivered: recipients.filter(r => r.delivered).length,
      opened: recipients.filter(r => r.opened).length,
      clicked: recipients.filter(r => r.clicked).length,
      bounced: recipients.filter(r => r.bounced).length,
      openRate: recipients.length > 0 ? (recipients.filter(r => r.opened).length / recipients.length) * 100 : 0,
      clickRate: recipients.length > 0 ? (recipients.filter(r => r.clicked).length / recipients.length) * 100 : 0,
    };
    
    const progress = stats.totalRecipients > 0 ? Math.round((stats.sent / stats.totalRecipients) * 100) : 0;
    
    res.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        scheduledFor: campaign.scheduledFor,
        sentAt: campaign.sentAt
      },
      stats,
      progress,
      recipients: recipients.map(r => ({
        id: r.id,
        email: r.contact?.email,
        sent: r.sent,
        delivered: r.delivered,
        opened: r.opened,
        clicked: r.clicked,
        bounced: r.bounced,
        sentAt: r.sentAt,
        deliveredAt: r.deliveredAt,
        openedAt: r.openedAt,
        clickedAt: r.clickedAt,
        bouncedAt: r.bouncedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 3. Turtle Send Progress Tracking

**Issue**: Need to ensure campaign statistics records are created and updated properly

**Fix Needed**:
```javascript
// When starting a turtle send campaign
app.post('/campaigns/:id/send-now', async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);
    
    if (campaign.sendingMode === 'turtle') {
      // Create campaign statistics records for all contacts
      const contactList = await ContactList.findById(campaign.contactListId);
      const contacts = await Contact.findAll({ where: { contactListId: contactList.id } });
      
      // Create CampaignStat records for tracking
      const campaignStats = contacts.map(contact => ({
        campaignId: id,
        contactId: contact.id,
        sent: false,
        delivered: false,
        opened: false,
        clicked: false,
        bounced: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      await CampaignStat.bulkCreate(campaignStats);
      
      // Start turtle sending process
      startTurtleSending(campaign);
    }
    
    // Update campaign status
    await campaign.update({ status: 'sending', sentAt: new Date() });
    
    res.json({ success: true, campaign });
  } catch (error) {
    console.error('Error starting campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 4. Turtle Sending Process

**Issue**: Need proper turtle sending implementation that updates records

**Fix Needed**:
```javascript
// Turtle sending function
async function startTurtleSending(campaign) {
  const emailsPerMinute = campaign.emailsPerMinute || 30;
  const delayBetweenEmails = (60 * 1000) / emailsPerMinute; // Convert to milliseconds
  
  // Get pending recipients
  const pendingRecipients = await CampaignStat.findAll({
    where: { 
      campaignId: campaign.id, 
      sent: false 
    },
    include: [{ model: Contact }],
    order: [['createdAt', 'ASC']]
  });
  
  console.log(`Starting turtle send for campaign ${campaign.id}: ${pendingRecipients.length} emails at ${emailsPerMinute}/min`);
  
  for (const recipient of pendingRecipients) {
    // Check if campaign was stopped
    const currentCampaign = await Campaign.findById(campaign.id);
    if (currentCampaign.status === 'stopped') {
      console.log(`Campaign ${campaign.id} was stopped, halting turtle send`);
      break;
    }
    
    try {
      // Send email
      await sendEmail(recipient.contact, campaign);
      
      // Update record as sent
      await recipient.update({ 
        sent: true, 
        sentAt: new Date() 
      });
      
      console.log(`Sent email ${recipient.id} for campaign ${campaign.id}`);
      
      // Wait before sending next email
      await new Promise(resolve => setTimeout(resolve, delayBetweenEmails));
      
    } catch (error) {
      console.error(`Failed to send email ${recipient.id}:`, error);
      
      // Mark as bounced if send failed
      await recipient.update({ 
        bounced: true, 
        bouncedAt: new Date() 
      });
    }
  }
  
  // Check if campaign is complete
  const remainingCount = await CampaignStat.count({
    where: { campaignId: campaign.id, sent: false }
  });
  
  if (remainingCount === 0) {
    await campaign.update({ status: 'completed' });
    console.log(`Campaign ${campaign.id} completed`);
  }
}
```

### 5. Email Delivery Tracking

**Issue**: Need to track delivery, opens, and clicks

**Fix Needed**:
```javascript
// Email sending function with tracking
async function sendEmail(contact, campaign) {
  const template = await Template.findById(campaign.templateId);
  
  // Generate tracking pixel and click tracking URLs
  const trackingPixelUrl = `${process.env.APP_URL}/track/open/${campaign.id}/${contact.id}`;
  const clickTrackingBase = `${process.env.APP_URL}/track/click/${campaign.id}/${contact.id}`;
  
  // Process template with contact data and add tracking
  let emailContent = template.content
    .replace(/{{firstName}}/g, contact.firstName)
    .replace(/{{lastName}}/g, contact.lastName)
    .replace(/{{email}}/g, contact.email);
  
  // Add tracking pixel
  emailContent += `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;">`;
  
  // Replace links with click tracking
  emailContent = emailContent.replace(
    /<a\s+href="([^"]+)"/g, 
    `<a href="${clickTrackingBase}?url=$1"`
  );
  
  // Send email using your email service
  const result = await yourEmailService.send({
    to: contact.email,
    subject: campaign.subject,
    html: emailContent,
    from: process.env.FROM_EMAIL
  });
  
  // If email service confirms delivery, update record
  if (result.success) {
    await CampaignStat.update(
      { delivered: true, deliveredAt: new Date() },
      { where: { campaignId: campaign.id, contactId: contact.id } }
    );
  }
}

// Tracking endpoints
app.get('/track/open/:campaignId/:contactId', async (req, res) => {
  const { campaignId, contactId } = req.params;
  
  await CampaignStat.update(
    { opened: true, openedAt: new Date() },
    { where: { campaignId, contactId } }
  );
  
  // Return 1x1 transparent pixel
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.type('image/gif').send(pixel);
});

app.get('/track/click/:campaignId/:contactId', async (req, res) => {
  const { campaignId, contactId } = req.params;
  const { url } = req.query;
  
  await CampaignStat.update(
    { clicked: true, clickedAt: new Date() },
    { where: { campaignId, contactId } }
  );
  
  res.redirect(url);
});
```

### 6. Stop/Resume Campaign Functionality

**Issue**: Need proper stop/resume for turtle campaigns

**Fix Needed**:
```javascript
// Stop campaign
app.post('/campaigns/:id/stop', async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);
    
    await campaign.update({ status: 'stopped' });
    
    // The turtle sending loop will check this status and stop
    
    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Resume campaign  
app.post('/campaigns/:id/send-now', async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);
    
    if (campaign.status === 'stopped' && campaign.sendingMode === 'turtle') {
      // Resume turtle sending
      await campaign.update({ status: 'sending' });
      startTurtleSending(campaign); // Resume from where it left off
    }
    
    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Database Schema Requirements

Make sure your `CampaignStat` table has these columns:

```sql
CREATE TABLE campaign_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  contact_id UUID NOT NULL REFERENCES contacts(id),
  sent BOOLEAN DEFAULT FALSE,
  delivered BOOLEAN DEFAULT FALSE,
  opened BOOLEAN DEFAULT FALSE,
  clicked BOOLEAN DEFAULT FALSE,
  bounced BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  opened_at TIMESTAMP NULL,
  clicked_at TIMESTAMP NULL,
  bounced_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Testing Checklist

- [ ] `/campaigns/:id/stats` returns actual recipients array
- [ ] Campaign status updates to "completed" when progress reaches 100%
- [ ] Turtle sending creates and updates CampaignStat records
- [ ] Stop/resume functionality works correctly
- [ ] Email tracking (opens/clicks) updates records
- [ ] Progress calculation matches actual database records

## Environment Variables Needed

```env
APP_URL=http://localhost:3000
FROM_EMAIL=noreply@yourdomain.com
```

These backend changes should resolve the discrepancy between computed stats and database records, and provide proper turtle send functionality with accurate progress tracking.
