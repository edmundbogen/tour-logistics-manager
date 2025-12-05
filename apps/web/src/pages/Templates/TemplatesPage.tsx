import { useState } from 'react';
import { FileText, Copy, Check, AlertTriangle, Mail, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';

const emailTemplates = [
  {
    id: 'venue-initial',
    name: 'Initial Venue Contact',
    category: 'Venue',
    subject: 'Confirming Show Details - [ARTIST] at [VENUE] on [DATE]',
    body: `Hi [VENUE_CONTACT],

I hope this email finds you well. I'm reaching out on behalf of [ARTIST] to confirm the details for our upcoming show at [VENUE] on [DATE].

Could you please confirm the following:

1. Load-in time: [LOAD_IN_TIME]
2. Soundcheck time: [SOUNDCHECK_TIME]
3. Doors time: [DOORS_TIME]
4. Set time: [SET_TIME]
5. Day-of-show contact and phone number
6. Parking instructions for the tour vehicle
7. WiFi network and password

Additionally, please let us know:
- Green room location and amenities
- Catering arrangements
- Credentials/wristband pickup location

Please don't hesitate to reach out if you have any questions or need anything from our end.

Best regards,
[TOUR_MANAGER_NAME]
[PHONE]`
  },
  {
    id: 'venue-followup',
    name: 'Venue Follow-Up',
    category: 'Venue',
    subject: 'Following Up - [ARTIST] Show on [DATE]',
    body: `Hi [VENUE_CONTACT],

I wanted to follow up on my previous email regarding the [ARTIST] show at [VENUE] on [DATE].

We're getting close to the show date and want to make sure we have all the details confirmed. Could you please respond at your earliest convenience?

Key items we still need:
- Day-of-show contact phone number
- Parking instructions
- Credential pickup location

Thank you for your help!

Best regards,
[TOUR_MANAGER_NAME]
[PHONE]`
  },
  {
    id: 'venue-confirmation',
    name: 'Venue Confirmation',
    category: 'Venue',
    subject: 'Confirmed - [ARTIST] at [VENUE] on [DATE]',
    body: `Hi [VENUE_CONTACT],

Thank you for confirming all the details. I'm writing to confirm we have everything locked in for the [ARTIST] show at [VENUE] on [DATE].

CONFIRMED DETAILS:
- Load-in: [LOAD_IN_TIME]
- Soundcheck: [SOUNDCHECK_TIME]
- Doors: [DOORS_TIME]
- Set time: [SET_TIME]
- Day-of contact: [DAY_OF_CONTACT] - [DAY_OF_PHONE]

We'll see you on [DATE]!

Best regards,
[TOUR_MANAGER_NAME]
[PHONE]`
  },
  {
    id: 'flight-delay',
    name: 'Flight Delay Notification',
    category: 'Contingency',
    subject: 'URGENT: Flight Delay - [ARTIST] Show on [DATE]',
    body: `Hi [DAY_OF_CONTACT],

I wanted to give you a heads up that we're experiencing a flight delay.

CURRENT SITUATION:
- Original arrival: [ORIGINAL_ARRIVAL]
- New estimated arrival: [NEW_ARRIVAL]
- Reason: [REASON]

IMPACT:
- Soundcheck may be shortened/cancelled
- Load-in will be pushed to [NEW_LOAD_IN]

We are monitoring the situation and will update you immediately with any changes.

Artist will still make the set time of [SET_TIME].

Please call me if you have any concerns.

[TOUR_MANAGER_NAME]
[PHONE]`
  },
  {
    id: 'flight-cancel',
    name: 'Flight Cancellation',
    category: 'Contingency',
    subject: 'URGENT: Flight Cancelled - [ARTIST] Show on [DATE]',
    body: `Hi [DAY_OF_CONTACT],

Unfortunately, our flight has been cancelled.

CURRENT SITUATION:
- Original flight: [ORIGINAL_FLIGHT]
- Status: CANCELLED

WE ARE WORKING ON:
- Rebooking on backup flight: [BACKUP_FLIGHT]
- New estimated arrival: [NEW_ARRIVAL]

I will call you immediately once we have confirmation on our new travel plans.

[TOUR_MANAGER_NAME]
[PHONE]`
  }
];

const updateTemplates = [
  {
    id: 'daily-status',
    name: 'Daily Status Update',
    category: 'Team Updates',
    body: `DAILY STATUS UPDATE
[DATE]

TODAY'S SHOW:
[CITY] - [VENUE]
Set Time: [SET_TIME]

TRAVEL STATUS:
- Flight: [FLIGHT_STATUS]
- Hotel: [HOTEL_STATUS]
- Transport: [TRANSPORT_STATUS]

SCHEDULE:
[TIMELINE]

KEY CONTACTS:
- Day-of: [DAY_OF_CONTACT] - [PHONE]
- Venue: [VENUE_CONTACT] - [PHONE]

NOTES:
[NOTES]

Next update: [NEXT_UPDATE_TIME]`
  },
  {
    id: 'change-notification',
    name: 'Schedule Change',
    category: 'Team Updates',
    body: `SCHEDULE CHANGE NOTIFICATION
[DATE]

WHAT CHANGED:
[CHANGE_DESCRIPTION]

OLD:
[OLD_DETAILS]

NEW:
[NEW_DETAILS]

IMPACT:
[IMPACT_DESCRIPTION]

ACTION REQUIRED:
[ACTION_ITEMS]

Questions? Call [TOUR_MANAGER_PHONE]`
  },
  {
    id: 'weekly-summary',
    name: 'Weekly Summary',
    category: 'Team Updates',
    body: `WEEKLY TOUR SUMMARY
Week of [WEEK_START]

SHOWS THIS WEEK:
[SHOW_LIST]

HIGHLIGHTS:
[HIGHLIGHTS]

ISSUES RESOLVED:
[RESOLVED_ISSUES]

UPCOMING CONCERNS:
[CONCERNS]

NEXT WEEK PREVIEW:
[NEXT_WEEK_SHOWS]`
  }
];

export default function TemplatesPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'email' | 'updates'>('email');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const templates = activeTab === 'email' ? emailTemplates : updateTemplates;

  // Group by category
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <p className="text-gray-500 mt-1">Email templates and update messages for tour communication</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'email'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Mail className="h-4 w-4 mr-2" />
          Email Templates
        </button>
        <button
          onClick={() => setActiveTab('updates')}
          className={`flex items-center pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'updates'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Team Updates
        </button>
      </div>

      {/* Templates */}
      <div className="space-y-8">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <div key={category}>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              {category === 'Contingency' ? (
                <AlertTriangle className="h-5 w-5 mr-2 text-warning-500" />
              ) : (
                <FileText className="h-5 w-5 mr-2 text-primary-600" />
              )}
              {category}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {categoryTemplates.map(template => (
                <div key={template.id} className="card">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyToClipboard(
                        'subject' in template
                          ? `Subject: ${template.subject}\n\n${template.body}`
                          : template.body,
                        template.id
                      )}
                    >
                      {copiedId === template.id ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="p-5">
                    {'subject' in template && (
                      <div className="mb-3">
                        <label className="text-xs font-medium text-gray-500 uppercase">Subject</label>
                        <p className="text-sm text-gray-900 font-mono">{template.subject}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Body</label>
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded-lg mt-1 max-h-64 overflow-y-auto">
                        {template.body}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-2">Template Variables</h3>
        <p className="text-gray-600 text-sm mb-4">
          Replace these placeholders with actual values when using templates:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {[
            '[ARTIST]', '[VENUE]', '[DATE]', '[CITY]',
            '[VENUE_CONTACT]', '[DAY_OF_CONTACT]', '[TOUR_MANAGER_NAME]', '[PHONE]',
            '[LOAD_IN_TIME]', '[SOUNDCHECK_TIME]', '[SET_TIME]', '[DOORS_TIME]'
          ].map(variable => (
            <code key={variable} className="bg-gray-200 px-2 py-1 rounded text-gray-700">
              {variable}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
}
