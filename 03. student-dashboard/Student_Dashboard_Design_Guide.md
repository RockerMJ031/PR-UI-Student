# Student Dashboard - Wix Design Implementation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Page Layout Structure](#page-layout-structure)
3. [Required Wix Elements](#required-wix-elements)
4. [Design Specifications](#design-specifications)
5. [Color Scheme & Typography](#color-scheme--typography)
6. [Responsive Design Settings](#responsive-design-settings)
7. [Element Configuration](#element-configuration)
8. [Database Collections Setup](#database-collections-setup)
9. [Lightbox Configuration](#lightbox-configuration)
10. [Final Design Checklist](#final-design-checklist)

## Project Overview

### Page Purpose
The Student Dashboard serves as the central hub for students to:
- View their academic progress and statistics
- Access quick actions for common tasks
- See upcoming courses and lessons
- Receive important notifications
- Navigate to other sections of the platform

### Design Goals
- Clean, modern interface with intuitive navigation
- Mobile-responsive design for all devices
- Clear visual hierarchy and information organization
- Accessible design following WCAG guidelines
- Consistent branding with Purple Ruler Academy theme

### Target Users
- Students aged 13-18
- Primary device usage: Mobile (60%), Desktop (40%)
- Varying technical proficiency levels

## Page Layout Structure

### Overall Layout
```
┌─────────────────────────────────────────────────────────┐
│ Header Section (Welcome + Notifications)               │
├─────────────────────────────────────────────────────────┤
│ Alert Banner (Conditional)                             │
├─────────────────────────────────────────────────────────┤
│ Quick Actions Grid (2x2 on desktop, 1x4 on mobile)   │
├─────────────────────────────────────────────────────────┤
│ Statistics Cards (3 cards horizontal)                  │
├─────────────────────────────────────────────────────────┤
│ Content Grid:                                          │
│ ┌─────────────────────┬─────────────────────────────┐   │
│ │ Upcoming Courses    │ Notifications & Updates     │   │
│ │ (Left Column)       │ (Right Column)              │   │
│ └─────────────────────┴─────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Sidebar Navigation (Fixed Left)
```
┌─────────────────┐
│ Logo Area       │
├─────────────────┤
│ Navigation Menu │
│ • Dashboard     │
│ • My Courses    │
│ • Schedule      │
│ • Progress      │
│ • Resources     │
│ • Wellbeing     │
│ • Safeguarding  │
│ • Get Support   │
├─────────────────┤
│ User Profile    │
└─────────────────┘
```

## Required Wix Elements

### Navigation Elements
| Element Type | Element ID | Purpose |
|--------------|------------|----------|
| Container | `#sidebarContainer` | Main sidebar wrapper |
| Text | `#logoText` | Academy logo/name |
| Repeater | `#navRepeater` | Navigation menu items |
| Button | `#mobileMenuBtn` | Mobile menu toggle |
| Container | `#userProfileContainer` | User profile section |
| Text | `#userNameText` | Display user name |
| Image | `#userAvatar` | User profile picture |

### Header Elements
| Element Type | Element ID | Purpose |
|--------------|------------|----------|
| Container | `#headerContainer` | Main header wrapper |
| Text | `#welcomeText` | Welcome message |
| Text | `#studentIdText` | Student ID display |
| Button | `#notificationIcon` | Notification bell icon |
| Text | `#notificationBadge` | Unread count badge |
| Button | `#emergencyBtn` | Emergency contact button |

### Alert Banner
| Element Type | Element ID | Purpose |
|--------------|------------|----------|
| Container | `#alertBanner` | Alert message container |
| Text | `#alertText` | Alert message content |
| Button | `#alertCloseBtn` | Close alert button |

### Quick Actions Grid
| Element Type | Element ID | Purpose |
|--------------|------------|----------|
| Container | `#quickActionsContainer` | Grid wrapper |
| Container | `#assignmentCard` | Submit assignment card |
| Container | `#resourcesCard` | Resources access card |
| Container | `#wellbeingCard` | Wellbeing check card |
| Container | `#safeguardingCard` | Safeguarding report card |
| Button | `#submitAssignmentBtn` | Assignment submission |
| Button | `#resourcesBtn` | Resources access |
| Button | `#wellbeingBtn` | Wellbeing check |
| Button | `#safeguardingBtn` | Safeguarding report |
| Text | Various | Card titles and descriptions |
| Image | Various | Card icons |

### Statistics Cards
| Element Type | Element ID | Purpose |
|--------------|------------|----------|
| Container | `#statsContainer` | Statistics grid wrapper |
| Container | `#activeCoursesCard` | Active courses stat |
| Container | `#pendingTasksCard` | Pending tasks stat |
| Container | `#attendanceCard` | Attendance rate stat |
| Text | `#activeCoursesValue` | Courses count |
| Text | `#pendingTasksValue` | Tasks count |
| Text | `#attendanceRateValue` | Attendance percentage |
| Text | Various | Stat labels |

### Content Grid
| Element Type | Element ID | Purpose |
|--------------|------------|----------|
| Container | `#contentGrid` | Main content wrapper |
| Container | `#coursesContainer` | Courses section |
| Container | `#notificationsContainer` | Notifications section |
| Repeater | `#coursesRepeater` | Course items list |
| Repeater | `#notificationsRepeater` | Notification items |
| Text | `#emptyCoursesMessage` | No courses message |
| Container | `#notificationPanel` | Notification dropdown |

### Loading & Feedback Elements
| Element Type | Element ID | Purpose |
|--------------|------------|----------|
| Container | `#loadingOverlay` | Loading screen overlay |
| Image | `#loadingSpinner` | Loading animation |
| Container | `#messageBar` | Success/error messages |
| Button | `#refreshBtn` | Manual refresh button |
| Button | `#feedbackBtn` | Feedback form button |

## Design Specifications

### Sidebar Navigation
**Container Settings:**
- Width: 250px (desktop), 100% (mobile)
- Height: 100vh
- Position: Fixed (desktop), Relative (mobile)
- Background: Linear gradient (135deg, #663399 0%, #4a2570 100%)
- Z-index: 1000
- Box-shadow: 2px 0 10px rgba(0,0,0,0.1)

**Logo Section:**
- Text: "Purple Ruler Academy"
- Font: Montserrat, Bold, 24px
- Color: #ffffff
- Padding: 20px
- Text-align: Center

**Navigation Menu:**
- Item height: 50px
- Padding: 15px 20px
- Font: Open Sans, Regular, 16px
- Color: #ffffff (normal), #f0f0f0 (hover)
- Background: Transparent (normal), rgba(255,255,255,0.1) (hover)
- Border-left: 4px solid transparent (normal), #ff6b35 (active)

**User Profile Section:**
- Position: Bottom of sidebar
- Padding: 20px
- Background: rgba(255,255,255,0.1)
- Border-top: 1px solid rgba(255,255,255,0.2)

### Header Section
**Container Settings:**
- Height: 80px
- Background: #ffffff
- Border-bottom: 1px solid #e0e0e0
- Box-shadow: 0 2px 4px rgba(0,0,0,0.1)
- Padding: 0 30px
- Display: Flex
- Align-items: Center
- Justify-content: Space-between

**Welcome Text:**
- Font: Montserrat, Semi-bold, 28px
- Color: #333333
- Margin-bottom: 5px

**Student ID:**
- Font: Open Sans, Regular, 14px
- Color: #666666

**Notification Icon:**
- Size: 24px
- Color: #663399
- Position: Relative
- Cursor: Pointer

**Emergency Button:**
- Background: #f44336
- Color: #ffffff
- Padding: 10px 20px
- Border-radius: 25px
- Font: Open Sans, Bold, 14px
- Box-shadow: 0 2px 4px rgba(244,67,54,0.3)

### Quick Actions Grid
**Container Settings:**
- Display: Grid
- Grid-template-columns: repeat(2, 1fr) (desktop), 1fr (mobile)
- Gap: 20px
- Padding: 30px
- Background: #f8f9fa

**Action Cards:**
- Background: #ffffff
- Border-radius: 12px
- Padding: 25px
- Box-shadow: 0 4px 6px rgba(0,0,0,0.1)
- Transition: transform 0.2s, box-shadow 0.2s
- Hover: transform translateY(-2px), box-shadow 0 6px 12px rgba(0,0,0,0.15)

**Card Icons:**
- Size: 48px
- Margin-bottom: 15px
- Color: #663399

**Card Titles:**
- Font: Montserrat, Semi-bold, 18px
- Color: #333333
- Margin-bottom: 10px

**Card Descriptions:**
- Font: Open Sans, Regular, 14px
- Color: #666666
- Line-height: 1.5

**Action Buttons:**
- Width: 100%
- Height: 45px
- Background: #663399
- Color: #ffffff
- Border: None
- Border-radius: 8px
- Font: Open Sans, Semi-bold, 16px
- Margin-top: 15px
- Cursor: Pointer
- Transition: background-color 0.2s
- Hover: background-color #4a2570

### Statistics Cards
**Container Settings:**
- Display: Grid
- Grid-template-columns: repeat(3, 1fr) (desktop), 1fr (mobile)
- Gap: 20px
- Padding: 0 30px 30px

**Stat Cards:**
- Background: #ffffff
- Border-radius: 12px
- Padding: 25px
- Text-align: Center
- Box-shadow: 0 2px 4px rgba(0,0,0,0.1)
- Border-top: 4px solid (varies by card)

**Stat Values:**
- Font: Montserrat, Bold, 36px
- Color: #333333
- Margin-bottom: 10px

**Stat Labels:**
- Font: Open Sans, Regular, 14px
- Color: #666666
- Text-transform: Uppercase
- Letter-spacing: 0.5px

**Border Colors:**
- Active Courses: #4caf50
- Pending Tasks: #ff9800
- Attendance Rate: #2196f3

### Content Grid
**Container Settings:**
- Display: Grid
- Grid-template-columns: 2fr 1fr (desktop), 1fr (mobile)
- Gap: 30px
- Padding: 0 30px 30px

**Section Headers:**
- Font: Montserrat, Semi-bold, 22px
- Color: #333333
- Margin-bottom: 20px
- Padding-bottom: 10px
- Border-bottom: 2px solid #663399

**Course Cards:**
- Background: #ffffff
- Border-radius: 8px
- Padding: 20px
- Margin-bottom: 15px
- Box-shadow: 0 2px 4px rgba(0,0,0,0.1)
- Border-left: 4px solid #663399

**Course Titles:**
- Font: Montserrat, Semi-bold, 16px
- Color: #333333
- Margin-bottom: 8px

**Course Details:**
- Font: Open Sans, Regular, 14px
- Color: #666666
- Margin-bottom: 5px

**Progress Bars:**
- Height: 6px
- Background: #e0e0e0
- Border-radius: 3px
- Overflow: Hidden
- Margin: 10px 0

**Progress Fill:**
- Background: Linear gradient (90deg, #663399 0%, #ff6b35 100%)
- Height: 100%
- Border-radius: 3px
- Transition: width 0.3s ease

**Join Course Buttons:**
- Background: #4caf50
- Color: #ffffff
- Padding: 8px 16px
- Border: None
- Border-radius: 20px
- Font: Open Sans, Semi-bold, 12px
- Cursor: Pointer
- Transition: background-color 0.2s
- Hover: background-color #45a049

### Notification Items
**Notification Cards:**
- Background: #ffffff
- Border-radius: 8px
- Padding: 15px
- Margin-bottom: 10px
- Box-shadow: 0 1px 3px rgba(0,0,0,0.1)
- Border-left: 4px solid (varies by priority)

**Notification Titles:**
- Font: Montserrat, Semi-bold, 14px
- Color: #333333
- Margin-bottom: 5px

**Notification Content:**
- Font: Open Sans, Regular, 13px
- Color: #666666
- Line-height: 1.4
- Margin-bottom: 8px

**Notification Time:**
- Font: Open Sans, Regular, 11px
- Color: #999999

**Priority Colors:**
- High: #f44336
- Medium: #ff9800
- Low: #4caf50

## Color Scheme & Typography

### Primary Colors
- **Primary Purple**: #663399
- **Secondary Purple**: #4a2570
- **Accent Orange**: #ff6b35
- **Success Green**: #4caf50
- **Warning Orange**: #ff9800
- **Error Red**: #f44336
- **Info Blue**: #2196f3

### Neutral Colors
- **Dark Text**: #333333
- **Medium Text**: #666666
- **Light Text**: #999999
- **Background**: #f8f9fa
- **White**: #ffffff
- **Border**: #e0e0e0
- **Shadow**: rgba(0,0,0,0.1)

### Typography
**Primary Font: Montserrat**
- Headings and important text
- Weights: Regular (400), Semi-bold (600), Bold (700)
- Usage: Titles, buttons, navigation

**Secondary Font: Open Sans**
- Body text and descriptions
- Weights: Regular (400), Semi-bold (600)
- Usage: Content, labels, secondary text

### Font Sizes
- **H1 (Page Title)**: 32px
- **H2 (Section Header)**: 24px
- **H3 (Card Title)**: 18px
- **Body Large**: 16px
- **Body Regular**: 14px
- **Body Small**: 12px
- **Caption**: 11px

## Responsive Design Settings

### Breakpoints
- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: 767px and below

### Desktop Layout (1024px+)
- Sidebar: Fixed 250px width
- Main content: Remaining width with 30px padding
- Quick actions: 2x2 grid
- Statistics: 3 cards horizontal
- Content: 2-column layout (2fr 1fr)

### Tablet Layout (768px - 1023px)
- Sidebar: Hidden, replaced with mobile menu
- Main content: Full width with 20px padding
- Quick actions: 2x2 grid
- Statistics: 3 cards horizontal (smaller)
- Content: 2-column layout (1fr 1fr)

### Mobile Layout (767px and below)
- Sidebar: Hidden, slide-in menu
- Main content: Full width with 15px padding
- Quick actions: 1 column vertical
- Statistics: 1 column vertical
- Content: 1 column vertical
- Header: Compressed height (60px)
- Touch-friendly button sizes (minimum 44px)

### Mobile-Specific Adjustments
- Increase touch target sizes
- Reduce font sizes slightly
- Simplify navigation
- Stack elements vertically
- Optimize for thumb navigation
- Reduce padding and margins

## Element Configuration

### Sidebar Navigation Setup
1. **Create Container** (`#sidebarContainer`)
   - Set position to Fixed
   - Width: 250px, Height: 100vh
   - Apply gradient background
   - Set z-index to 1000

2. **Add Logo Text** (`#logoText`)
   - Text: "Purple Ruler Academy"
   - Apply Montserrat Bold 24px
   - Center align, white color

3. **Create Navigation Repeater** (`#navRepeater`)
   - Connect to Navigation dataset
   - Style navigation items
   - Add hover effects

4. **Add User Profile Section**
   - User avatar image
   - User name text
   - Student ID text

### Header Section Setup
1. **Create Header Container** (`#headerContainer`)
   - Set height to 80px
   - Apply white background
   - Add bottom border and shadow

2. **Add Welcome Text** (`#welcomeText`)
   - Dynamic greeting based on time
   - Montserrat Semi-bold 28px

3. **Add Notification Icon** (`#notificationIcon`)
   - Font Awesome bell icon
   - Add notification badge
   - Position relatively

4. **Add Emergency Button** (`#emergencyBtn`)
   - Red background
   - Rounded corners
   - White text

### Quick Actions Grid Setup
1. **Create Grid Container** (`#quickActionsContainer`)
   - CSS Grid layout
   - 2 columns on desktop, 1 on mobile
   - 20px gap between items

2. **Create Action Cards**
   - White background with shadow
   - Rounded corners (12px)
   - Hover animations
   - Icon, title, description, button

3. **Configure Card Content**
   - Submit Assignment Card
   - Resources Access Card
   - Wellbeing Check Card
   - Safeguarding Report Card

### Statistics Cards Setup
1. **Create Stats Container** (`#statsContainer`)
   - CSS Grid layout
   - 3 columns on desktop
   - Equal spacing

2. **Create Individual Stat Cards**
   - Active Courses Card
   - Pending Tasks Card
   - Attendance Rate Card

3. **Configure Card Elements**
   - Large number display
   - Descriptive label
   - Color-coded top border

### Content Grid Setup
1. **Create Content Container** (`#contentGrid`)
   - 2-column layout (2fr 1fr)
   - 30px gap

2. **Setup Courses Section**
   - Section header
   - Courses repeater
   - Empty state message

3. **Setup Notifications Section**
   - Section header
   - Notifications repeater
   - Notification panel

## Database Collections Setup

### Required Collections
1. **Students**
   - userId (Text)
   - firstName (Text)
   - lastName (Text)
   - studentId (Text)
   - profileImage (Image)
   - enrolledCourses (Reference - Courses)
   - attendanceRecords (Reference - AttendanceRecords)
   - assignments (Reference - Assignments)

2. **Courses**
   - title (Text)
   - description (Text)
   - startTime (Date)
   - endTime (Date)
   - meetingUrl (Text)
   - status (Text)
   - enrolledStudents (Reference - Students)
   - totalLessons (Number)
   - completedLessons (Number)

3. **Notifications**
   - recipientId (Text)
   - recipientType (Text)
   - title (Text)
   - content (Text)
   - type (Text)
   - priority (Text)
   - isRead (Boolean)
   - createdDate (Date)
   - readDate (Date)

4. **AttendanceRecords**
   - studentId (Reference - Students)
   - courseId (Reference - Courses)
   - date (Date)
   - status (Text)
   - joinTime (Date)

5. **Assignments**
   - studentId (Reference - Students)
   - courseId (Reference - Courses)
   - title (Text)
   - description (Text)
   - dueDate (Date)
   - status (Text)
   - submissionDate (Date)

### Dataset Configuration
1. **Create Datasets**
   - StudentsDataset (connected to Students collection)
   - CoursesDataset (connected to Courses collection)
   - NotificationsDataset (connected to Notifications collection)

2. **Set Permissions**
   - Students: Read own data only
   - Courses: Read enrolled courses only
   - Notifications: Read own notifications only

3. **Configure Filters**
   - Filter by current user ID
   - Filter by active status
   - Sort by relevant dates

## Lightbox Configuration

### Required Lightboxes
1. **UserProfileLightbox**
   - Display detailed user information
   - Edit profile functionality
   - Change password option

2. **CourseDetailsLightbox**
   - Course information display
   - Progress tracking
   - Assignment list

3. **NotificationDetailsLightbox**
   - Full notification content
   - Mark as read functionality
   - Related actions

4. **WellbeingFormLightbox**
   - Embedded Lark form
   - Wellbeing check questions
   - Submit functionality

5. **SafeguardingFormLightbox**
   - Embedded Lark form
   - Safeguarding report form
   - Emergency contact info

6. **FeedbackFormLightbox**
   - General feedback form
   - Rating system
   - Suggestion box

7. **EmergencyFormLightbox**
   - Emergency contact form
   - Immediate assistance request
   - Contact information display

8. **CourseMeetingLightbox**
   - Meeting room interface
   - Course joining instructions
   - Technical support links

### Lightbox Design Guidelines
- Maximum width: 600px
- Centered positioning
- White background with shadow
- Rounded corners (12px)
- Close button in top-right
- Responsive design
- Smooth open/close animations

## Final Design Checklist

### Visual Design
- [ ] All colors match the defined color scheme
- [ ] Typography is consistent throughout
- [ ] Proper visual hierarchy is established
- [ ] Icons are consistent in style and size
- [ ] Images are optimized and properly sized
- [ ] Spacing and padding are consistent
- [ ] Borders and shadows are applied correctly

### Layout & Structure
- [ ] Grid layouts are properly configured
- [ ] Elements are aligned correctly
- [ ] Responsive breakpoints are set
- [ ] Mobile layout is optimized
- [ ] Navigation is intuitive and accessible
- [ ] Content is organized logically

### Interactive Elements
- [ ] All buttons have hover states
- [ ] Links are properly styled
- [ ] Form elements are consistent
- [ ] Loading states are designed
- [ ] Error states are handled
- [ ] Success messages are styled

### Accessibility
- [ ] Color contrast meets WCAG AA standards
- [ ] Text is readable at all sizes
- [ ] Touch targets are minimum 44px
- [ ] Focus states are visible
- [ ] Alt text is provided for images
- [ ] Semantic HTML structure is used

### Performance
- [ ] Images are compressed and optimized
- [ ] Fonts are loaded efficiently
- [ ] CSS is optimized
- [ ] Animations are smooth
- [ ] Page load time is acceptable

### Cross-Browser Compatibility
- [ ] Design works in Chrome
- [ ] Design works in Safari
- [ ] Design works in Firefox
- [ ] Design works in Edge
- [ ] Mobile browsers are supported

### Content
- [ ] All text content is finalized
- [ ] Placeholder content is replaced
- [ ] Error messages are user-friendly
- [ ] Success messages are encouraging
- [ ] Empty states are informative

### Integration
- [ ] Database connections are configured
- [ ] External forms are embedded correctly
- [ ] Analytics tracking is set up
- [ ] Third-party integrations work
- [ ] API connections are established

This design guide provides all the necessary specifications for implementing the Student Dashboard in Wix. Follow each section carefully to ensure a consistent and professional result that meets user needs and accessibility standards.