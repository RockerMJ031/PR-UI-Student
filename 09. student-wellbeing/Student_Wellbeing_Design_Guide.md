# Student Wellbeing Page - Design Implementation Guide

## Project Overview

This design guide provides comprehensive instructions for implementing the Student Wellbeing page in Wix, focusing on mental health support, mood tracking, assessments, meditation resources, counseling services, and community support features.

## Required Wix Elements

### Navigation Elements
- **Header Container**: `#headerContainer`
- **Navigation Menu**: `#navigationMenu`
- **Tab Buttons**: `#dashboardTab`, `#moodTrackingTab`, `#assessmentTab`, `#meditationTab`, `#counselingTab`, `#habitsTab`, `#communityTab`, `#resourcesTab`
- **User Profile**: `#userWelcome`, `#userAvatar`
- **Settings Button**: `#settingsButton`

### Dashboard Section
- **Dashboard Container**: `#dashboardContainer`
- **Welcome Section**: `#welcomeSection`
- **Statistics Cards**: `#averageMoodCard`, `#meditationTimeCard`, `#habitCompletionCard`, `#assessmentTrendCard`
- **Quick Actions**: `#quickActionsContainer`
- **Progress Charts**: `#moodChartContainer`, `#progressChartContainer`
- **Recent Activities**: `#recentActivitiesContainer`

### Mood Tracking Section
- **Mood Tracking Container**: `#moodTrackingContainer`
- **Add Mood Button**: `#addMoodButton`
- **Mood Entries Repeater**: `#moodEntriesRepeater`
- **Mood Chart**: `#moodChart`
- **Mood Calendar**: `#moodCalendar`
- **Mood Statistics**: `#moodStatsContainer`

### Assessment Section
- **Assessment Container**: `#assessmentContainer`
- **Assessment Type Dropdown**: `#assessmentTypeDropdown`
- **Start Assessment Button**: `#startAssessmentButton`
- **Assessment History Repeater**: `#assessmentHistoryRepeater`
- **Results Display**: `#resultsContainer`
- **Recommendations**: `#recommendationsContainer`

### Meditation Section
- **Meditation Container**: `#meditationContainer`
- **Meditation Timer**: `#meditationTimer`
- **Timer Controls**: `#startMeditationButton`, `#pauseMeditationButton`, `#stopMeditationButton`
- **Meditation Sessions Repeater**: `#meditationSessionsRepeater`
- **Guided Meditations**: `#guidedMeditationsContainer`
- **Background Sounds**: `#backgroundSoundsContainer`

### Counseling Section
- **Counseling Container**: `#counselingContainer`
- **Book Counseling Button**: `#bookCounselingButton`
- **Appointments Repeater**: `#appointmentsRepeater`
- **Counselors Repeater**: `#counselorsRepeater`
- **Available Times**: `#availableTimesContainer`
- **Appointment Calendar**: `#appointmentCalendar`

### Habits Section
- **Habits Container**: `#habitsContainer`
- **Add Habit Button**: `#addHabitButton`
- **Habits Repeater**: `#habitsRepeater`
- **Habit Progress**: `#habitProgressContainer`
- **Habit Calendar**: `#habitCalendar`
- **Habit Statistics**: `#habitStatsContainer`

### Community Section
- **Community Container**: `#communityContainer`
- **Create Post Button**: `#createPostButton`
- **Community Posts Repeater**: `#communityPostsRepeater`
- **Community Groups Repeater**: `#communityGroupsRepeater`
- **Community Events Repeater**: `#communityEventsRepeater`
- **Join Group Button**: `#joinGroupButton`

### Resources Section
- **Resources Container**: `#resourcesContainer`
- **Resources Repeater**: `#resourcesRepeater`
- **Resource Categories**: `#resourceCategoriesContainer`
- **Search Input**: `#searchInput`
- **Filter Dropdown**: `#filterDropdown`

### Emergency Support
- **Emergency Button**: `#emergencyButton`
- **Crisis Hotline Button**: `#crisisHotlineButton`
- **Emergency Contact Button**: `#emergencyContactButton`
- **Emergency Contacts Repeater**: `#emergencyContactsRepeater`

### Lightboxes and Modals
- **Mood Entry Lightbox**: `#moodEntryLightbox`
- **Assessment Lightbox**: `#assessmentLightbox`
- **Appointment Booking Lightbox**: `#appointmentBookingLightbox`
- **Habit Creation Lightbox**: `#habitCreationLightbox`
- **Post Creation Lightbox**: `#postCreationLightbox`
- **Settings Lightbox**: `#settingsLightbox`
- **Emergency Support Lightbox**: `#emergencySupportLightbox`

### Form Elements
- **Mood Slider**: `#moodSlider`
- **Mood Notes**: `#moodNotes`
- **Mood Tags**: `#moodTags`
- **Mood Date**: `#moodDate`
- **Assessment Questions**: `#assessmentQuestionsContainer`
- **Appointment Date**: `#appointmentDate`
- **Appointment Time**: `#appointmentTime`
- **Counselor Selection**: `#counselorSelection`

### Utility Elements
- **Loading Overlay**: `#loadingOverlay`
- **Message Container**: `#messageContainer`
- **Date Selector**: `#dateSelector`
- **Export Data Button**: `#exportDataButton`
- **Print Report Button**: `#printReportButton`

## Layout Structure

### Header Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Student Wellbeing    [User Avatar] [Settings] [Menu] │
└─────────────────────────────────────────────────────────────┘
```

### Navigation Tabs
```
┌─────────────────────────────────────────────────────────────┐
│ [Dashboard] [Mood] [Assessment] [Meditation] [Counseling]   │
│ [Habits] [Community] [Resources] [Emergency]                │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Welcome Section                                             │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│ │ Avg     │ │ Meditation│ │ Habit   │ │ Assessment│         │
│ │ Mood    │ │ Time     │ │ Progress│ │ Trend    │           │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐                   │
│ │ Mood Chart      │ │ Progress Chart  │                   │
│ │                 │ │                 │                   │
│ └─────────────────┘ └─────────────────┘                   │
├─────────────────────────────────────────────────────────────┤
│ Recent Activities                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Activity 1] [Activity 2] [Activity 3]                 │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Mood Tracking Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Add Mood Entry] [View Calendar] [Export Data]             │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐                   │
│ │ Mood Chart      │ │ Mood Statistics │                   │
│ │                 │ │                 │                   │
│ └─────────────────┘ └─────────────────┘                   │
├─────────────────────────────────────────────────────────────┤
│ Recent Mood Entries                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Entry 1] [Entry 2] [Entry 3] [Entry 4]               │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Design Specifications

### Color Scheme

#### Primary Colors
- **Primary Blue**: `#2E86AB` - Main navigation, primary buttons
- **Secondary Blue**: `#A23B72` - Secondary actions, highlights
- **Accent Green**: `#F18F01` - Success states, positive indicators
- **Warning Orange**: `#C73E1D` - Alerts, emergency features

#### Mood Colors
- **Very Happy**: `#4CAF50` (Green)
- **Happy**: `#8BC34A` (Light Green)
- **Neutral**: `#FFC107` (Amber)
- **Sad**: `#FF9800` (Orange)
- **Very Sad**: `#F44336` (Red)

#### Background Colors
- **Primary Background**: `#FFFFFF`
- **Secondary Background**: `#F8F9FA`
- **Card Background**: `#FFFFFF`
- **Section Background**: `#F1F3F4`

#### Text Colors
- **Primary Text**: `#212529`
- **Secondary Text**: `#6C757D`
- **Muted Text**: `#ADB5BD`
- **Link Text**: `#2E86AB`

### Typography

#### Font Families
- **Primary Font**: 'Inter', sans-serif
- **Secondary Font**: 'Roboto', sans-serif
- **Monospace Font**: 'Fira Code', monospace

#### Font Sizes
- **H1 (Page Title)**: 32px, Bold
- **H2 (Section Title)**: 24px, Semi-Bold
- **H3 (Subsection)**: 20px, Semi-Bold
- **H4 (Card Title)**: 18px, Medium
- **Body Text**: 16px, Regular
- **Small Text**: 14px, Regular
- **Caption**: 12px, Regular

#### Line Heights
- **Headings**: 1.2
- **Body Text**: 1.5
- **Small Text**: 1.4

### Spacing System

#### Margins and Padding
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px
- **XXL**: 48px

#### Grid System
- **Container Max Width**: 1200px
- **Column Gap**: 24px
- **Row Gap**: 32px

### Component Specifications

#### Buttons
- **Primary Button**: Background `#2E86AB`, Text `#FFFFFF`, Padding `12px 24px`, Border Radius `8px`
- **Secondary Button**: Background `#FFFFFF`, Text `#2E86AB`, Border `2px solid #2E86AB`, Padding `12px 24px`, Border Radius `8px`
- **Emergency Button**: Background `#C73E1D`, Text `#FFFFFF`, Padding `16px 32px`, Border Radius `8px`
- **Icon Button**: Size `40px`, Border Radius `50%`

#### Cards
- **Background**: `#FFFFFF`
- **Border**: `1px solid #E9ECEF`
- **Border Radius**: `12px`
- **Padding**: `24px`
- **Shadow**: `0 2px 8px rgba(0,0,0,0.1)`

#### Form Elements
- **Input Fields**: Border `1px solid #CED4DA`, Border Radius `6px`, Padding `12px 16px`
- **Focus State**: Border `2px solid #2E86AB`, Outline `none`
- **Error State**: Border `2px solid #C73E1D`
- **Success State**: Border `2px solid #4CAF50`

#### Charts and Graphs
- **Line Color**: `#2E86AB`
- **Fill Color**: `rgba(46, 134, 171, 0.1)`
- **Grid Color**: `#E9ECEF`
- **Axis Color**: `#6C757D`

## Responsive Design Settings

### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px and above

### Mobile Layout Adjustments
- Stack cards vertically
- Reduce padding and margins
- Simplify navigation to hamburger menu
- Optimize touch targets (minimum 44px)
- Single column layout for content

### Tablet Layout Adjustments
- Two-column layout for cards
- Maintain horizontal navigation
- Adjust chart sizes
- Optimize for touch interaction

## Element Configuration

### Navigation Menu Configuration
```javascript
// Tab styling
.tab-button {
  background: transparent;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.tab-button.active {
  background: #2E86AB;
  color: #FFFFFF;
}

.tab-button:hover {
  background: #E3F2FD;
}
```

### Statistics Cards Configuration
```javascript
// Card styling
.stat-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #2E86AB;
}

.stat-label {
  font-size: 14px;
  color: #6C757D;
  margin-top: 8px;
}
```

### Mood Slider Configuration
```javascript
// Mood slider styling
.mood-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(to right, #F44336, #FF9800, #FFC107, #8BC34A, #4CAF50);
}

.mood-slider::-webkit-slider-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 3px solid #2E86AB;
}
```

### Chart Configuration
```javascript
// Chart container styling
.chart-container {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 16px;
}
```

## Database Collections and Datasets

### Required Collections
1. **WellbeingData** - Main wellbeing records
2. **MoodEntries** - Mood tracking entries
3. **AssessmentResults** - Assessment test results
4. **AssessmentTypes** - Available assessment types
5. **AssessmentQuestions** - Assessment questions
6. **MeditationSessions** - Meditation session records
7. **CounselingAppointments** - Counseling appointments
8. **Counselors** - Counselor information
9. **HabitTracking** - Habit tracking records
10. **CommunityPosts** - Community forum posts
11. **CommunityGroups** - Support groups
12. **CommunityEvents** - Community events
13. **SupportResources** - Mental health resources
14. **EmergencyContacts** - Emergency contact information
15. **UserPreferences** - User settings and preferences

### Dataset Configuration
```javascript
// Main datasets
$w('#wellbeingDataset').setFilter(wixData.filter().eq('studentId', currentUser.id));
$w('#moodEntriesDataset').setFilter(wixData.filter().eq('studentId', currentUser.id));
$w('#assessmentResultsDataset').setFilter(wixData.filter().eq('studentId', currentUser.id));
$w('#appointmentsDataset').setFilter(wixData.filter().eq('studentId', currentUser.id));
```

## Lightbox Configuration

### Mood Entry Lightbox
- **Size**: Medium (600px width)
- **Background**: Semi-transparent overlay
- **Content**: Mood slider, notes field, tags, date picker
- **Actions**: Save, Cancel

### Assessment Lightbox
- **Size**: Large (800px width)
- **Background**: Semi-transparent overlay
- **Content**: Question display, answer options, progress indicator
- **Actions**: Next, Previous, Submit

### Appointment Booking Lightbox
- **Size**: Medium (700px width)
- **Background**: Semi-transparent overlay
- **Content**: Calendar, time slots, counselor selection
- **Actions**: Book, Cancel

## Accessibility Features

### ARIA Labels
```javascript
// Navigation
$w('#navigationMenu').setAttribute('aria-label', 'Main navigation');
$w('#dashboardTab').setAttribute('aria-label', 'Dashboard section');

// Form elements
$w('#moodSlider').setAttribute('aria-label', 'Mood rating from 1 to 10');
$w('#searchInput').setAttribute('aria-label', 'Search resources');

// Buttons
$w('#emergencyButton').setAttribute('aria-label', 'Emergency support - immediate help');
```

### Keyboard Navigation
- Tab order follows logical flow
- All interactive elements are keyboard accessible
- Focus indicators are clearly visible
- Skip links for main content areas

### Screen Reader Support
- Descriptive alt text for images
- Proper heading hierarchy
- Form labels and descriptions
- Status announcements for dynamic content

## Performance Optimization

### Image Optimization
- Use WebP format when possible
- Implement lazy loading for images
- Optimize image sizes for different devices
- Use SVG for icons and simple graphics

### Code Optimization
- Minimize database queries
- Implement caching for frequently accessed data
- Use efficient data structures
- Optimize repeater performance

### Loading Strategies
- Show loading states for async operations
- Implement progressive loading
- Cache user preferences locally
- Optimize chart rendering

## Security and Privacy

### Data Protection
- Encrypt sensitive mental health data
- Implement proper access controls
- Regular security audits
- Compliance with healthcare privacy regulations

### User Privacy
- Anonymous posting options
- Data visibility controls
- Secure data transmission
- Clear privacy policies

## Testing Considerations

### Functionality Testing
- Mood tracking accuracy
- Assessment scoring
- Appointment booking flow
- Emergency support features

### Usability Testing
- Navigation intuitiveness
- Form completion ease
- Mobile responsiveness
- Accessibility compliance

### Performance Testing
- Page load times
- Chart rendering speed
- Database query performance
- Mobile performance

## Final Design Checklist

### Visual Design
- [ ] Consistent color scheme applied
- [ ] Typography hierarchy implemented
- [ ] Proper spacing and alignment
- [ ] Responsive design tested
- [ ] Accessibility features implemented

### Functionality
- [ ] All navigation working
- [ ] Forms submitting correctly
- [ ] Charts displaying data
- [ ] Emergency features accessible
- [ ] User preferences saving

### Content
- [ ] All text content added
- [ ] Images optimized and added
- [ ] Icons properly sized
- [ ] Loading states implemented
- [ ] Error messages defined

### Performance
- [ ] Page load time optimized
- [ ] Database queries efficient
- [ ] Images compressed
- [ ] Caching implemented
- [ ] Mobile performance tested

### Security
- [ ] Data encryption enabled
- [ ] Access controls implemented
- [ ] Privacy settings configured
- [ ] Security testing completed
- [ ] Compliance verified

This design guide ensures a comprehensive, user-friendly, and secure student wellbeing platform that supports mental health and promotes student wellness through various interactive features and resources.