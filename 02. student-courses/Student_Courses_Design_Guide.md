# Student Courses Page - Design Implementation Guide

## Table of Contents

1. [Project Overview](#project-overview)
2. [Required Wix Elements](#required-wix-elements)
3. [Layout Structure](#layout-structure)
4. [Design Specifications](#design-specifications)
5. [Color Scheme & Typography](#color-scheme--typography)
6. [Responsive Design Settings](#responsive-design-settings)
7. [Element Configuration](#element-configuration)
8. [Database Collections & Datasets](#database-collections--datasets)
9. [Lightbox Configuration](#lightbox-configuration)
10. [Final Design Checklist](#final-design-checklist)

---

## 1. Project Overview

### 1.1 Page Purpose
The Student Courses page serves as the central hub for students to manage and access their enrolled courses. Students can view course progress, access course materials, search for specific courses, and track their academic journey.

### 1.2 Target Users
- **Primary**: Enrolled students accessing their courses
- **Secondary**: Academic advisors monitoring student progress

### 1.3 Key Functionality
- Course list display with progress tracking
- Search and filter capabilities
- Course detail viewing
- Quick access to course materials
- Progress statistics dashboard

### 1.4 Design Goals
- Clean, academic-focused interface
- Easy navigation and course discovery
- Clear progress visualization
- Mobile-responsive design
- Consistent with Purple Ruler Academy branding

---

## 2. Required Wix Elements

### 2.1 Navigation Elements
- **Header Container**: Main page header
- **Sidebar Navigation**: Left navigation panel
- **Breadcrumb Navigation**: Page hierarchy indicator
- **User Profile Section**: User information display

### 2.2 Content Elements
- **Search Input**: Course search functionality
- **Filter Dropdowns**: Subject, level, and status filters
- **Course Repeater**: Dynamic course list display
- **Statistics Cards**: Quick stats container
- **View Toggle Buttons**: Grid/list view switcher

### 2.3 Interactive Elements
- **Course Cards**: Individual course display items
- **Action Buttons**: Continue, view details, resources
- **Progress Bars**: Visual progress indicators
- **Filter Controls**: Dropdown menus and checkboxes

### 2.4 Feedback Elements
- **Loading Indicators**: Progress spinners
- **Message Containers**: Success/error notifications
- **Empty State**: No courses found display
- **Lightbox**: Course details popup

---

## 3. Layout Structure

### 3.1 Page Layout Hierarchy
```
Page Container
├── Header Section
│   ├── Logo & Navigation
│   ├── User Profile
│   └── Page Title
├── Main Content Area
│   ├── Quick Statistics Row
│   ├── Search & Filter Section
│   ├── View Controls
│   └── Courses Display Area
└── Footer Section
```

### 3.2 Grid System
- **Desktop**: 12-column grid system
- **Tablet**: 8-column grid system
- **Mobile**: 4-column grid system
- **Gutter Width**: 20px between columns
- **Container Max Width**: 1200px

### 3.3 Section Spacing
- **Section Margins**: 40px top/bottom
- **Element Spacing**: 20px between major elements
- **Card Spacing**: 16px between course cards
- **Internal Padding**: 16px inside containers

---

## 4. Design Specifications

### 4.1 Header Section
- **Height**: 80px fixed
- **Background**: White (#FFFFFF)
- **Border**: 1px solid #E0E0E0 (bottom)
- **Shadow**: 0 2px 4px rgba(0,0,0,0.1)

### 4.2 Quick Statistics Cards
- **Card Size**: 240px width × 120px height
- **Background**: White (#FFFFFF)
- **Border Radius**: 8px
- **Shadow**: 0 2px 8px rgba(0,0,0,0.1)
- **Padding**: 20px
- **Grid**: 4 cards per row (desktop)

### 4.3 Search & Filter Section
- **Height**: 60px
- **Background**: #F8F9FA
- **Border Radius**: 8px
- **Padding**: 16px
- **Margin**: 20px bottom

### 4.4 Course Cards
- **Grid Layout**: 3 cards per row (desktop)
- **Card Size**: 360px width × 280px height
- **Border Radius**: 12px
- **Shadow**: 0 4px 12px rgba(0,0,0,0.1)
- **Hover Effect**: Lift with increased shadow

---

## 5. Color Scheme & Typography

### 5.1 Primary Colors
- **Primary Purple**: #663399
- **Secondary Purple**: #8A4FBE
- **Light Purple**: #E8D5F2
- **Accent Purple**: #4A1A5C

### 5.2 Neutral Colors
- **White**: #FFFFFF
- **Light Gray**: #F8F9FA
- **Medium Gray**: #6C757D
- **Dark Gray**: #343A40
- **Border Gray**: #E0E0E0

### 5.3 Status Colors
- **Success Green**: #28A745
- **Warning Orange**: #FFC107
- **Error Red**: #DC3545
- **Info Blue**: #17A2B8

### 5.4 Typography
- **Font Family**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Headings**: Bold weight, Purple (#663399)
- **Body Text**: Regular weight, Dark Gray (#343A40)
- **Secondary Text**: Regular weight, Medium Gray (#6C757D)

### 5.5 Font Sizes
- **H1 (Page Title)**: 32px
- **H2 (Section Headers)**: 24px
- **H3 (Card Titles)**: 18px
- **Body Text**: 14px
- **Small Text**: 12px

---

## 6. Responsive Design Settings

### 6.1 Desktop Layout (1200px+)
- **Sidebar**: 250px fixed width, always visible
- **Statistics Grid**: 4 columns
- **Course Grid**: 3 columns
- **Search Bar**: Full width with filters inline

### 6.2 Tablet Layout (768px - 1199px)
- **Sidebar**: Collapsible, overlay when open
- **Statistics Grid**: 2 columns
- **Course Grid**: 2 columns
- **Search Bar**: Full width, filters stacked

### 6.3 Mobile Layout (767px and below)
- **Sidebar**: Hidden, hamburger menu
- **Statistics Grid**: 2 columns (stacked)
- **Course Grid**: 1 column
- **Search Bar**: Full width, filters in dropdown

### 6.4 Breakpoint Settings
- **Large Desktop**: 1200px+
- **Desktop**: 992px - 1199px
- **Tablet**: 768px - 991px
- **Mobile**: 767px and below

---

## 7. Element Configuration

### 7.1 Header Configuration

#### Logo Element
- **Element Type**: Image
- **ID**: #logoImage
- **Size**: 120px × 40px
- **Position**: Left aligned
- **Link**: Homepage URL

#### User Profile Section
- **Container ID**: #userProfileContainer
- **Avatar Image**: #userAvatarImage (40px × 40px, circular)
- **Name Text**: #userNameText
- **Role Text**: #userRoleText

### 7.2 Quick Statistics Configuration

#### Statistics Container
- **Element Type**: Container
- **ID**: #statsContainer
- **Layout**: CSS Grid
- **Grid Template**: repeat(4, 1fr)
- **Gap**: 20px

#### Individual Stat Cards
- **Total Courses Card**: #totalCoursesCard
- **Active Courses Card**: #activeCoursesCard
- **Completed Courses Card**: #completedCoursesCard
- **Average Progress Card**: #averageProgressCard

### 7.3 Search & Filter Configuration

#### Search Input
- **Element Type**: Input
- **ID**: #searchInput
- **Placeholder**: "Search courses..."
- **Width**: 300px (desktop)
- **Height**: 40px

#### Filter Dropdowns
- **Subject Filter**: #subjectFilter
- **Level Filter**: #levelFilter
- **Status Filter**: #statusFilter
- **Clear Filters Button**: #clearFiltersButton

### 7.4 Course Display Configuration

#### Course Repeater
- **Element Type**: Repeater
- **ID**: #coursesRepeater
- **Layout**: Grid (default)
- **Items Per Row**: 3 (desktop), 2 (tablet), 1 (mobile)
- **Gap**: 20px

#### Course Card Template
- **Card Container**: #courseCard
- **Course Image**: #courseImage (360px × 180px)
- **Course Title**: #courseTitleText
- **Course Subject**: #courseSubjectText
- **Instructor Name**: #courseInstructorText
- **Progress Bar**: #progressBar
- **Progress Text**: #progressText
- **Continue Button**: #continueButton
- **Details Button**: #viewDetailsButton

### 7.5 View Controls Configuration

#### View Toggle Buttons
- **Container**: #viewToggleContainer
- **Grid View Button**: #gridViewButton
- **List View Button**: #listViewButton
- **Button Size**: 40px × 40px

---

## 8. Database Collections & Datasets

### 8.1 Required Collections

#### StudentProfiles Collection
- **Purpose**: Store student profile information
- **Key Fields**: userId, firstName, lastName, yearGroup, avatar
- **Permissions**: Read (Student own data only)

#### Courses Collection
- **Purpose**: Store course information
- **Key Fields**: title, description, subject, instructor, level, image
- **Permissions**: Read (All students)

#### CourseEnrollments Collection
- **Purpose**: Track student course enrollments
- **Key Fields**: studentId, courseId, enrollmentDate, progress, status
- **Permissions**: Read/Write (Student own data only)

### 8.2 Dataset Configuration

#### User Courses Dataset
- **Dataset ID**: #userCoursesDataset
- **Collection**: CourseEnrollments
- **Filter**: studentId equals current user ID
- **Sort**: enrollmentDate descending
- **Mode**: Read-Write

#### All Courses Dataset
- **Dataset ID**: #allCoursesDataset
- **Collection**: Courses
- **Filter**: status equals "active"
- **Sort**: subject ascending, title ascending
- **Mode**: Read-Only

### 8.3 Data Relationships
- **CourseEnrollments.courseId** → **Courses._id**
- **CourseEnrollments.studentId** → **StudentProfiles.userId**

---

## 9. Lightbox Configuration

### 9.1 Course Details Lightbox

#### Lightbox Settings
- **Element Type**: Lightbox
- **ID**: #courseDetailsLightbox
- **Size**: 800px × 600px
- **Background**: White (#FFFFFF)
- **Border Radius**: 12px
- **Overlay**: Semi-transparent black (rgba(0,0,0,0.5))

#### Lightbox Content
- **Course Image**: #lightboxCourseImage
- **Course Title**: #lightboxCourseTitle
- **Course Description**: #lightboxCourseDescription
- **Instructor Info**: #lightboxInstructorInfo
- **Progress Section**: #lightboxProgressSection
- **Action Buttons**: #lightboxContinueButton, #lightboxResourcesButton
- **Close Button**: #lightboxCloseButton

### 9.2 Enrollment Lightbox

#### Lightbox Settings
- **Element Type**: Lightbox
- **ID**: #enrollmentLightbox
- **Size**: 600px × 400px
- **Purpose**: New course enrollment

---

## 10. Final Design Checklist

### 10.1 Visual Design Verification
- [ ] Brand colors applied consistently
- [ ] Typography hierarchy implemented
- [ ] Proper spacing and alignment
- [ ] Visual feedback for interactive elements
- [ ] Loading states designed
- [ ] Error states designed
- [ ] Empty states designed

### 10.2 Layout Verification
- [ ] Desktop layout (1200px+) implemented
- [ ] Tablet layout (768px-1199px) implemented
- [ ] Mobile layout (767px-) implemented
- [ ] Grid system properly applied
- [ ] Responsive breakpoints configured

### 10.3 Element Configuration Verification
- [ ] All required elements created with correct IDs
- [ ] Repeater template properly configured
- [ ] Datasets connected to appropriate elements
- [ ] Form elements properly configured
- [ ] Navigation elements functional

### 10.4 Interactive Elements Verification
- [ ] Hover effects implemented
- [ ] Click states defined
- [ ] Focus states for accessibility
- [ ] Transition animations smooth
- [ ] Button states (normal, hover, active, disabled)

### 10.5 Content Verification
- [ ] Placeholder text appropriate
- [ ] Image placeholders sized correctly
- [ ] Icon usage consistent
- [ ] Text content properly formatted
- [ ] Links and buttons labeled clearly

### 10.6 Accessibility Verification
- [ ] Color contrast meets WCAG AA standards
- [ ] Alt text provided for images
- [ ] Form labels properly associated
- [ ] Keyboard navigation possible
- [ ] Screen reader compatibility

### 10.7 Performance Verification
- [ ] Images optimized for web
- [ ] Minimal use of heavy animations
- [ ] Efficient use of Wix elements
- [ ] Fast loading design choices
- [ ] Mobile performance optimized

### 10.8 Database Integration Verification
- [ ] All required collections created
- [ ] Datasets properly configured
- [ ] Data relationships established
- [ ] Permissions correctly set
- [ ] Test data populated

### 10.9 Cross-Browser Verification
- [ ] Chrome compatibility
- [ ] Firefox compatibility
- [ ] Safari compatibility
- [ ] Edge compatibility
- [ ] Mobile browser compatibility

### 10.10 Final Quality Assurance
- [ ] Design matches specifications
- [ ] All functionality accessible
- [ ] Responsive design working
- [ ] Performance acceptable
- [ ] Ready for development handoff

---

## Implementation Notes

### Design Priorities
1. **User Experience**: Intuitive navigation and clear course organization
2. **Visual Hierarchy**: Clear distinction between different course statuses
3. **Performance**: Fast loading and smooth interactions
4. **Accessibility**: Inclusive design for all users
5. **Consistency**: Aligned with overall Purple Ruler Academy design system

### Common Design Patterns
- **Card-based Layout**: Consistent card design across all course displays
- **Progressive Disclosure**: Show essential info first, details on demand
- **Status Indicators**: Clear visual cues for course progress and status
- **Responsive Grid**: Flexible layout that adapts to screen size

### Design System Integration
- Follow Purple Ruler Academy brand guidelines
- Use established color palette and typography
- Maintain consistency with other portal pages
- Implement standard interaction patterns

**Estimated Design Time**: 16-24 hours
**Recommended Tools**: Wix Editor, Figma (for mockups)
**Design Complexity**: Medium
**Maintenance Level**: Low

For code implementation details, refer to the development documentation. For testing procedures, consult the testing guide.