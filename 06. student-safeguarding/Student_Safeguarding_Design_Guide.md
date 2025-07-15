# Student Safeguarding Page - Design Implementation Guide

## Project Overview
This design guide provides comprehensive specifications for implementing the Student Safeguarding page in Wix, focusing on creating a safe, accessible, and supportive environment for students to report concerns and access safety resources.

## Required Wix Elements

### Navigation Elements
- **Button**: `overviewButton` - Overview navigation
- **Button**: `reportButton` - Report incident navigation
- **Button**: `resourcesButton` - Safety resources navigation
- **Button**: `contactsButton` - Emergency contacts navigation
- **Button**: `policiesButton` - Safety policies navigation

### Emergency Features
- **Button**: `emergencyButton` - Primary emergency contact button
- **Button**: `emergencyCallButton` - Emergency call action
- **Button**: `emergencyTextButton` - Emergency text action
- **Container**: `emergencyModal` - Emergency contact options
- **Repeater**: `emergencyContactsRepeater` - Emergency contacts list

### Overview Section
- **Container**: `overviewContainer` - Main overview content
- **Text**: `pageTitle` - Page main title
- **Text**: `pageDescription` - Page description
- **Text**: `totalReportsText` - Total reports count
- **Text**: `activeContactsText` - Active contacts count
- **Text**: `availableResourcesText` - Available resources count
- **Text**: `urgentReportsText` - Urgent reports count
- **Repeater**: `recentActivityRepeater` - Recent activity feed

### Reporting System
- **Container**: `reportContainer` - Report form container
- **Container**: `reportFormContainer` - Form elements container
- **Text**: `loginRequiredMessage` - Login requirement notice
- **Dropdown**: `reportTypeDropdown` - Incident type selection
- **Dropdown**: `urgencyDropdown` - Urgency level selection
- **TextArea**: `reportDescription` - Incident description
- **Checkbox**: `anonymousToggle` - Anonymous reporting option
- **UploadButton**: `attachmentUpload` - File attachment upload
- **Text**: `attachmentList` - Uploaded files list
- **Text**: `reportGuidance` - Contextual guidance text
- **Text**: `anonymousInfo` - Anonymous reporting information
- **Text**: `urgencyWarning` - Urgency level warning
- **Text**: `charCount` - Character count display
- **Button**: `submitReportButton` - Submit report action
- **Button**: `clearFormButton` - Clear form action

### Resources Section
- **Container**: `resourcesContainer` - Resources content area
- **Repeater**: `resourcesRepeater` - Safety resources list
- **Text**: `resourcesCount` - Resources count display
- **Text**: `noResourcesMessage` - No resources message

### Contacts Section
- **Container**: `contactsContainer` - Contacts content area
- **Repeater**: `contactsRepeater` - Contact persons list
- **Text**: `contactsCount` - Contacts count display
- **Text**: `noContactsMessage` - No contacts message

### Policies Section
- **Container**: `policiesContainer` - Policies content area
- **Repeater**: `policiesRepeater` - Safety policies list
- **Text**: `policiesCount` - Policies count display
- **Text**: `noPoliciesMessage` - No policies message

### Search and Filter
- **Input**: `searchInput` - Search functionality
- **Dropdown**: `categoryFilter` - Category filtering
- **Dropdown**: `urgencyFilter` - Urgency filtering

### User Interface
- **Text**: `userWelcome` - User welcome message
- **Text**: `loginPrompt` - Login prompt message
- **Button**: `myReportsButton` - User's reports access
- **Button**: `reportHistoryButton` - Report history access
- **Button**: `refreshButton` - Data refresh action
- **Button**: `helpButton` - Help information
- **Button**: `feedbackButton` - Feedback submission

### Modals and Overlays
- **Container**: `loadingOverlay` - Loading state overlay
- **Container**: `resourceModal` - Resource detail modal
- **Text**: `resourceModalTitle` - Resource modal title
- **Text**: `resourceModalContent` - Resource modal content
- **Container**: `policyModal` - Policy detail modal
- **Text**: `policyModalTitle` - Policy modal title
- **Text**: `policyModalContent` - Policy modal content
- **Container**: `helpModal` - Help information modal
- **Container**: `feedbackModal` - Feedback submission modal

### Message System
- **Container**: `messageBar` - Message notification bar
- **Text**: `messageText` - Message content text

## Layout Structure

### Header Section
```
┌─────────────────────────────────────────────────────────┐
│                    Page Header                          │
│  [Logo] Student Safeguarding        [Emergency Button] │
│  Creating a safe learning environment                   │
└─────────────────────────────────────────────────────────┘
```

### Navigation Bar
```
┌─────────────────────────────────────────────────────────┐
│ [Overview] [Report] [Resources] [Contacts] [Policies]   │
└─────────────────────────────────────────────────────────┘
```

### Main Content Area
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Quick Stats   │  │ Recent Activity │              │
│  │                 │  │                 │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │            Dynamic Content Area                 │   │
│  │        (Overview/Report/Resources/etc.)         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Report Form Layout
```
┌─────────────────────────────────────────────────────────┐
│                  Report an Incident                    │
│                                                         │
│  Report Type: [Dropdown ▼]                            │
│  Urgency:     [Dropdown ▼]                            │
│                                                         │
│  Description:                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │         [Text Area]                             │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                          [0/1000]      │
│                                                         │
│  ☐ Submit anonymously                                  │
│                                                         │
│  Attachments: [Upload Button] [File List]             │
│                                                         │
│  [Clear Form]                    [Submit Report]       │
└─────────────────────────────────────────────────────────┘
```

## Design Specifications

### Color Scheme
- **Primary Purple**: #663399 (Navigation, buttons)
- **Emergency Red**: #DC3545 (Emergency elements)
- **Success Green**: #28A745 (Success messages)
- **Warning Orange**: #FFC107 (Warning messages)
- **Info Blue**: #17A2B8 (Information messages)
- **Background**: #F8F9FA (Page background)
- **Card Background**: #FFFFFF (Content cards)
- **Text Primary**: #212529 (Main text)
- **Text Secondary**: #6C757D (Secondary text)
- **Border**: #DEE2E6 (Element borders)

### Typography
- **Page Title**: 32px, Bold, #212529
- **Section Headers**: 24px, Semi-bold, #212529
- **Card Titles**: 18px, Semi-bold, #212529
- **Body Text**: 16px, Regular, #212529
- **Secondary Text**: 14px, Regular, #6C757D
- **Button Text**: 16px, Medium, #FFFFFF
- **Emergency Text**: 18px, Bold, #FFFFFF

### Spacing and Layout
- **Page Margins**: 20px on mobile, 40px on desktop
- **Section Spacing**: 40px between major sections
- **Card Padding**: 20px internal padding
- **Button Padding**: 12px vertical, 24px horizontal
- **Input Padding**: 12px internal padding
- **Grid Gap**: 20px between grid items

### Component Specifications

#### Emergency Button
- **Size**: 120px width, 50px height
- **Background**: #DC3545 (Red)
- **Text**: "EMERGENCY" in white, 16px bold
- **Border Radius**: 8px
- **Position**: Fixed top-right corner
- **Shadow**: 0 4px 8px rgba(220, 53, 69, 0.3)

#### Navigation Buttons
- **Size**: Auto width, 44px height
- **Background**: #FFFFFF (inactive), #663399 (active)
- **Text**: 16px medium
- **Border**: 1px solid #DEE2E6
- **Border Radius**: 8px
- **Hover Effect**: Background #F8F9FA

#### Report Form Elements
- **Dropdowns**: Full width, 44px height
- **Text Area**: Full width, 120px height
- **Upload Button**: 200px width, 44px height
- **Submit Button**: 150px width, 44px height, #663399 background
- **Clear Button**: 120px width, 44px height, #6C757D background

#### Cards and Containers
- **Background**: #FFFFFF
- **Border**: 1px solid #DEE2E6
- **Border Radius**: 12px
- **Shadow**: 0 2px 4px rgba(0, 0, 0, 0.1)
- **Padding**: 20px

#### Statistics Cards
- **Size**: 200px width, 120px height
- **Number Display**: 36px bold, #663399
- **Label**: 14px regular, #6C757D
- **Icon**: 24px, positioned top-right

## Responsive Design Settings

### Desktop (1200px+)
- **Layout**: 4-column grid for statistics
- **Navigation**: Horizontal button row
- **Form**: 2-column layout where applicable
- **Cards**: 3-4 per row in repeaters

### Tablet (768px - 1199px)
- **Layout**: 2-column grid for statistics
- **Navigation**: Horizontal with smaller buttons
- **Form**: Single column layout
- **Cards**: 2 per row in repeaters

### Mobile (< 768px)
- **Layout**: Single column for all elements
- **Navigation**: Horizontal scrollable buttons
- **Form**: Full-width single column
- **Cards**: Single column in repeaters
- **Emergency Button**: Smaller size, repositioned

## Element Configuration

### Repeater Items Configuration

#### Resource Item
- **Container**: `resourceCard` - Main card container
- **Text**: `resourceTitle` - Resource title
- **Text**: `resourceDescription` - Resource description
- **Text**: `resourceCategory` - Resource category
- **Text**: `resourceType` - Resource type
- **Text**: `resourceIcon` - Resource type icon

#### Contact Item
- **Container**: `contactCard` - Main card container
- **Text**: `contactName` - Contact person name
- **Text**: `contactRole` - Contact role/position
- **Text**: `contactDepartment` - Department/organization
- **Text**: `contactPhone` - Phone number
- **Text**: `contactEmail` - Email address
- **Text**: `contactAvailability` - Availability hours
- **Container**: `emergencyBadge` - Emergency contact indicator
- **Button**: `callButton` - Call action button
- **Button**: `emailButton` - Email action button

#### Policy Item
- **Container**: `policyCard` - Main card container
- **Text**: `policyTitle` - Policy title
- **Text**: `policyDescription` - Policy description
- **Text**: `policyCategory` - Policy category
- **Text**: `policyLastUpdated` - Last update date
- **Text**: `policyIcon` - Policy type icon
- **Button**: `downloadButton` - Download policy button

### Database Collections and Datasets

#### SafeguardingReports Collection
- **Dataset**: `SafeguardingReportsDataset`
- **Mode**: Read & Write
- **Permissions**: 
  - Students: Create own reports, read public reports
  - Staff: Read assigned reports
  - Admin: Full access

#### SafeguardingContacts Collection
- **Dataset**: `SafeguardingContactsDataset`
- **Mode**: Read Only
- **Permissions**: All authenticated users can read

#### SafeguardingResources Collection
- **Dataset**: `SafeguardingResourcesDataset`
- **Mode**: Read Only
- **Permissions**: All users can read published resources

#### SafeguardingPolicies Collection
- **Dataset**: `SafeguardingPoliciesDataset`
- **Mode**: Read Only
- **Permissions**: All users can read published policies

#### EmergencyEvents Collection
- **Dataset**: `EmergencyEventsDataset`
- **Mode**: Write Only
- **Permissions**: All users can log emergency events

### Lightbox Configuration

#### Emergency Contact Lightbox
- **Name**: `EmergencyContactLightbox`
- **Size**: 400px width, auto height
- **Background**: Semi-transparent overlay
- **Content**: Emergency contact options and information

#### Resource Detail Lightbox
- **Name**: `ResourceDetailLightbox`
- **Size**: 600px width, 500px height
- **Content**: Detailed resource information and content

#### Policy Detail Lightbox
- **Name**: `PolicyDetailLightbox`
- **Size**: 700px width, 600px height
- **Content**: Full policy text and download options

#### Help Information Lightbox
- **Name**: `HelpInformationLightbox`
- **Size**: 500px width, 400px height
- **Content**: User guidance and FAQ

## Accessibility Features

### WCAG Compliance
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Focus Indicators**: Visible focus states for all interactive elements
- **Alt Text**: Descriptive alt text for all images and icons
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader**: Proper ARIA labels and descriptions

### Emergency Accessibility
- **High Contrast**: Emergency elements use high contrast colors
- **Large Touch Targets**: Minimum 44px for touch elements
- **Clear Language**: Simple, direct language for emergency features
- **Multiple Contact Methods**: Phone, text, and email options

### Form Accessibility
- **Label Association**: Proper label-input relationships
- **Error Messages**: Clear, descriptive error messages
- **Required Fields**: Visual and programmatic indication
- **Progress Indication**: Form completion progress

## Security and Privacy Considerations

### Data Protection
- **Anonymous Reporting**: Option to submit reports without identification
- **Data Encryption**: Sensitive data encrypted in transit and at rest
- **Access Controls**: Role-based access to different information levels
- **Audit Trail**: Logging of access and modifications

### User Privacy
- **Minimal Data Collection**: Only collect necessary information
- **Consent Management**: Clear consent for data processing
- **Data Retention**: Appropriate retention periods for different data types
- **User Rights**: Access, correction, and deletion rights

## Final Design Checklist

### Visual Design
- [ ] Consistent color scheme applied throughout
- [ ] Typography hierarchy properly implemented
- [ ] Spacing and alignment consistent
- [ ] Emergency elements prominently displayed
- [ ] Professional and trustworthy appearance

### Functionality
- [ ] All navigation elements properly linked
- [ ] Form validation and submission working
- [ ] Emergency contact features functional
- [ ] Search and filtering operational
- [ ] Responsive design tested on all devices

### Content
- [ ] All text content reviewed for clarity and sensitivity
- [ ] Emergency contact information verified
- [ ] Safety resources current and relevant
- [ ] Policies up-to-date and accessible
- [ ] Help documentation comprehensive

### Accessibility
- [ ] WCAG 2.1 AA compliance verified
- [ ] Keyboard navigation tested
- [ ] Screen reader compatibility confirmed
- [ ] Color contrast ratios meet standards
- [ ] Emergency features accessible to all users

### Security
- [ ] Data protection measures implemented
- [ ] User privacy safeguards in place
- [ ] Anonymous reporting functionality secure
- [ ] Access controls properly configured
- [ ] Audit logging operational

This design guide ensures the Student Safeguarding page provides a safe, accessible, and supportive environment for students to report concerns and access safety resources while maintaining the highest standards of privacy and security.