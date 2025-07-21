# Student Assignments & Exams Page - Design Implementation Guide

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
The Student Assignments & Exams page serves as a comprehensive dashboard for students to view, manage, and interact with their academic assignments and examinations.

### 1.2 Core Design Features
- **Clean Dashboard Layout**: Organized sidebar navigation with main content area
- **Quick Statistics Cards**: Visual overview of assignment metrics
- **Advanced Filtering System**: Multiple filter options for easy content discovery
- **Responsive Grid/List Views**: Flexible content display options
- **Interactive Assignment Cards**: Engaging card-based design for assignments
- **Emergency Support Access**: Prominent emergency assistance button

### 1.3 Design Requirements
- **Estimated Design Time**: 8-12 hours
- **Difficulty Level**: Intermediate
- **Required Wix Plan**: Business & eCommerce
- **Responsive Breakpoints**: Desktop (1200px+), Tablet (768px-1199px), Mobile (767px-)

---

## 2. Required Wix Elements

### 2.1 Layout Elements

#### Main Containers
- **Sidebar Container** (`#sidebarContainer`)
  - Type: Container
  - Width: 250px (desktop), collapsed (mobile)
  - Background: Linear gradient 135deg (#663399, #4b2e72)
  - Position: Fixed left

- **Main Content Container** (`#mainContentContainer`)
  - Type: Container
  - Margin-left: 250px (desktop), 0 (mobile)
  - Padding: 20px
  - Background: #f5f5f5

#### Header Section
- **Header Container** (`#headerSection`)
  - Type: Container
  - Display: Flex
  - Justify-content: space-between
  - Margin-bottom: 30px

### 2.2 Navigation Elements

#### Sidebar Navigation
- **Logo Container** (`#logoContainer`)
  - Type: Container
  - Padding: 20px
  - Text-align: center
  - Border-bottom: 1px solid rgba(255,255,255,0.1)

- **Navigation Menu** (`#navigationMenu`)
  - Type: Menu
  - Items: Dashboard, My Courses, Schedule, Assignments (active), Resources, Wellbeing, Safeguarding, Get Support
  - Icon font: Font Awesome 5

- **User Profile Section** (`#userProfileSection`)
  - Type: Container
  - Position: Absolute bottom
  - Padding: 20px
  - Border-top: 1px solid rgba(255,255,255,0.1)

### 2.3 Interactive Elements

#### Buttons
- **Emergency Button** (`#emergencyButton`)
  - Type: Button
  - Background: #dc3545
  - Color: white
  - Icon: fas fa-exclamation-triangle

- **View Toggle Buttons**
  - Grid View Button (`#gridViewButton`)
  - List View Button (`#listViewButton`)
  - Type: Button
  - Style: Toggle button group

#### Form Elements
- **Search Input** (`#assignmentSearchInput`)
  - Type: Text Input
  - Placeholder: "Search assignments..."
  - Width: 100%
  - Border-radius: 8px

- **Filter Dropdowns**
  - Subject Filter (`#subjectFilterDropdown`)
  - Type Filter (`#typeFilterDropdown`)
  - Status Filter (`#statusFilterDropdown`)
  - Due Date Filter (`#dueDateFilterDropdown`)
  - Type: Dropdown
  - Style: Consistent with design theme

### 2.4 Display Elements

#### Text Elements
- **Page Title** (`#pageTitle`)
  - Type: Text
  - Content: "Assignments & Exams"
  - Style: H1, color: #663399

- **Stat Numbers** (Dynamic)
  - Due This Week (`#dueThisWeekCount`)
  - Exams This Week (`#examsThisWeekCount`)
  - Completed Assignments (`#completedAssignmentsCount`)
  - Completed Exams (`#completedExamsCount`)
  - Type: Text
  - Style: Large, bold numbers

#### Dynamic Content Areas
- **Assignment Cards Repeater** (`#assignmentCardsRepeater`)
  - Type: Repeater
  - Data Source: Assignments dataset
  - Template: Assignment card layout

- **Assignment List Repeater** (`#assignmentListRepeater`)
  - Type: Repeater
  - Data Source: Assignments dataset
  - Template: List row layout

### 2.5 Media Elements

#### Images
- **User Avatar** (`#userAvatarImage`)
  - Type: Image
  - Size: 40px x 40px
  - Border-radius: 50%

- **Assignment Icons** (Dynamic)
  - Type: Image or Icon
  - Size: 24px x 24px
  - Subject-specific icons

---

## 3. Layout Structure

### 3.1 Page Layout Hierarchy

```
Page Container
├── Sidebar Container
│   ├── Logo Container
│   ├── Navigation Menu
│   └── User Profile Section
└── Main Content Container
    ├── Header Section
    │   ├── Page Title
    │   └── Emergency Button
    ├── Quick Stats Container
    │   ├── Due This Week Card
    │   ├── Exams This Week Card
    │   ├── Completed Assignments Card
    │   └── Completed Exams Card
    ├── Filter Section Container
    │   ├── Filter Controls
    │   ├── Search Input
    │   └── View Toggle Buttons
    └── Content Display Area
        ├── Assignments Grid Container
        └── Assignment List Container
```

### 3.2 Grid System

#### Desktop Layout (1200px+)
- **Sidebar**: 250px fixed width
- **Main Content**: Remaining width with 20px padding
- **Stats Grid**: 4 columns, 20px gap
- **Assignment Grid**: 3-4 columns, responsive based on content

#### Tablet Layout (768px-1199px)
- **Sidebar**: Collapsible overlay
- **Main Content**: Full width with 15px padding
- **Stats Grid**: 2 columns, 15px gap
- **Assignment Grid**: 2 columns

#### Mobile Layout (767px-)
- **Sidebar**: Hidden/hamburger menu
- **Main Content**: Full width with 10px padding
- **Stats Grid**: 1 column, 10px gap
- **Assignment Grid**: 1 column (list view preferred)

---

## 4. Design Specifications

### 4.1 Spacing System
- **Base Unit**: 8px
- **Small Spacing**: 8px, 16px
- **Medium Spacing**: 24px, 32px
- **Large Spacing**: 40px, 48px
- **Extra Large Spacing**: 64px, 80px

### 4.2 Border Radius
- **Small Elements**: 4px
- **Cards and Containers**: 8px
- **Buttons**: 8px
- **Images**: 50% (circular), 8px (rectangular)

### 4.3 Shadows
- **Card Shadow**: 0 4px 6px rgba(0,0,0,0.1)
- **Hover Shadow**: 0 8px 15px rgba(0,0,0,0.1)
- **Focus Shadow**: 0 0 0 3px rgba(102,51,153,0.2)

### 4.4 Transitions
- **Standard Transition**: all 0.3s ease
- **Quick Transition**: all 0.15s ease
- **Slow Transition**: all 0.5s ease

---

## 5. Color Scheme & Typography

### 5.1 Color Palette

#### Primary Colors
- **Primary Purple**: #663399
- **Primary Purple Dark**: #4b2e72
- **Primary Purple Light**: #8a5cb8

#### Secondary Colors
- **Success Green**: #28a745
- **Warning Orange**: #ffc107
- **Danger Red**: #dc3545
- **Info Blue**: #17a2b8

#### Neutral Colors
- **White**: #ffffff
- **Light Gray**: #f8f9fa
- **Medium Gray**: #e9ecef
- **Dark Gray**: #6c757d
- **Black**: #212529

#### Background Colors
- **Page Background**: #f5f5f5
- **Card Background**: #ffffff
- **Sidebar Background**: Linear gradient 135deg (#663399, #4b2e72)

### 5.2 Typography

#### Font Family
- **Primary Font**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Fallback Fonts**: Arial, Helvetica, sans-serif

#### Font Sizes
- **H1 (Page Title)**: 1.8rem (28.8px)
- **H2 (Section Headers)**: 1.5rem (24px)
- **H3 (Card Titles)**: 1.25rem (20px)
- **Body Text**: 1rem (16px)
- **Small Text**: 0.875rem (14px)
- **Caption**: 0.75rem (12px)

#### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semi-bold**: 600
- **Bold**: 700

---

## 6. Responsive Design Settings

### 6.1 Breakpoint Configuration

#### Desktop (1200px and above)
- Full sidebar navigation (250px width)
- 4-column stats grid
- 3-4 column assignment grid
- All features fully visible
- Hover effects enabled

#### Tablet (768px-1199px)
- Collapsible sidebar navigation
- 2-column stats grid
- 2-column assignment grid
- Condensed spacing
- Touch-friendly interactions

#### Mobile (767px and below)
- Hidden sidebar (hamburger menu)
- 1-column stats grid
- List view for assignments
- Minimal spacing
- Large touch targets (44px minimum)

### 6.2 Responsive Element Behavior

#### Sidebar Navigation
- **Desktop**: Fixed position, always visible
- **Tablet**: Overlay when opened, hidden by default
- **Mobile**: Full-screen overlay menu

#### Assignment Cards
- **Desktop**: Grid layout with hover effects
- **Tablet**: 2-column grid, reduced padding
- **Mobile**: Single column list, simplified layout

#### Filter Section
- **Desktop**: Horizontal layout with all filters visible
- **Tablet**: Wrapped layout with 2 filters per row
- **Mobile**: Vertical stack with full-width elements

---

## 7. Element Configuration

### 7.1 Quick Stats Cards

#### Card Structure
```
Stat Card Container
├── Icon Container
│   └── Subject Icon
├── Number Container
│   └── Stat Number
└── Label Container
    └── Stat Label
```

#### Styling
- **Background**: White
- **Padding**: 20px
- **Border-radius**: 8px
- **Box-shadow**: 0 4px 6px rgba(0,0,0,0.1)
- **Text-align**: Center
- **Transition**: all 0.3s ease

### 7.2 Assignment Cards

#### Card Structure
```
Assignment Card
├── Card Header
│   ├── Subject Badge
│   └── Due Date
├── Card Body
│   ├── Assignment Title
│   ├── Description Preview
│   └── Progress Bar
└── Card Footer
    ├── Status Badge
    └── Action Buttons
```

#### Styling
- **Background**: White
- **Border-radius**: 8px
- **Padding**: 20px
- **Box-shadow**: 0 4px 6px rgba(0,0,0,0.1)
- **Hover transform**: translateY(-5px)
- **Hover shadow**: 0 8px 15px rgba(0,0,0,0.1)

### 7.3 Filter Section

#### Layout
- **Display**: Flex
- **Gap**: 20px
- **Flex-wrap**: wrap
- **Margin-bottom**: 20px

#### Filter Elements
- **Width**: 200px (desktop), 100% (mobile)
- **Height**: 40px
- **Border**: 1px solid #e1e1e1
- **Border-radius**: 8px
- **Background**: #f8f9fa

---

## 8. Database Collections & Datasets

### 8.1 Required Collections

#### Assignments Collection
- **Collection Name**: Assignments
- **Permissions**: Read (Students can only see their own)
- **Key Fields**: studentId, title, subject, type, status, dueDate, description, points

#### Students Collection
- **Collection Name**: Students
- **Permissions**: Read (Own data only)
- **Key Fields**: firstName, lastName, yearGroup, profileImage

### 8.2 Dataset Configuration

#### Assignments Dataset
- **Dataset ID**: assignmentsDataset
- **Collection**: Assignments
- **Mode**: Read-only
- **Filter**: studentId equals current user ID
- **Sort**: dueDate ascending

#### Students Dataset
- **Dataset ID**: studentsDataset
- **Collection**: Students
- **Mode**: Read-only
- **Filter**: _id equals current user ID

---

## 9. Lightbox Configuration

### 9.1 Assignment Details Lightbox

#### Lightbox Settings
- **Name**: AssignmentDetailsLightbox
- **Size**: 800px x 600px
- **Background**: White
- **Border-radius**: 12px
- **Overlay**: Semi-transparent dark

#### Content Structure
```
Lightbox Container
├── Header Section
│   ├── Assignment Title
│   └── Close Button
├── Content Section
│   ├── Assignment Details
│   ├── Description
│   ├── Attachments
│   └── Submission History
└── Footer Section
    └── Action Buttons
```

### 9.2 Emergency Support Lightbox

#### Lightbox Settings
- **Name**: EmergencySupportLightbox
- **Size**: 500px x 400px
- **Background**: White
- **Border-radius**: 12px

#### Content Elements
- Contact method selection
- Message input field
- Emergency contact information
- Submit and cancel buttons

---

## 10. Final Design Checklist

### 10.1 Visual Design
- [ ] Color scheme matches brand guidelines
- [ ] Typography is consistent throughout
- [ ] Icons are uniform and accessible
- [ ] Images are optimized and properly sized
- [ ] Spacing follows the defined system

### 10.2 Layout and Structure
- [ ] Grid system is properly implemented
- [ ] Element hierarchy is clear and logical
- [ ] Navigation is intuitive and accessible
- [ ] Content areas are well-organized
- [ ] White space is used effectively

### 10.3 Responsive Design
- [ ] Desktop layout displays correctly (1200px+)
- [ ] Tablet layout is functional (768px-1199px)
- [ ] Mobile layout is optimized (767px and below)
- [ ] Touch interactions work on mobile devices
- [ ] Text remains readable at all screen sizes

### 10.4 Interactive Elements
- [ ] All buttons have proper hover states
- [ ] Form elements are styled consistently
- [ ] Loading states are visually clear
- [ ] Error states are properly designed
- [ ] Success states provide clear feedback

### 10.5 Accessibility
- [ ] Color contrast meets WCAG guidelines
- [ ] Alt text is provided for all images
- [ ] Heading structure is logical (H1, H2, H3)
- [ ] Keyboard navigation is functional
- [ ] Screen reader compatibility is ensured

### 10.6 Performance
- [ ] Images are compressed and optimized
- [ ] CSS is organized and efficient
- [ ] Animations are smooth and purposeful
- [ ] Page load time is acceptable
- [ ] Mobile performance is optimized

### 10.7 Cross-browser Compatibility
- [ ] Design works in Chrome
- [ ] Design works in Firefox
- [ ] Design works in Safari
- [ ] Design works in Edge
- [ ] Mobile browsers are supported

---

## Conclusion

This design guide provides comprehensive specifications for implementing the Student Assignments & Exams page in Wix. The design emphasizes usability, accessibility, and visual appeal while maintaining consistency with the overall brand identity.

**Key Design Principles:**
- Clean and organized layout
- Consistent visual hierarchy
- Responsive design approach
- Accessible and inclusive design
- Performance-optimized implementation

**Estimated Implementation Time:** 8-12 hours
**Recommended Team:** 1 designer with Wix experience
**Testing Phase:** 2-3 hours
**Final Review:** 1 hour

For technical implementation details, refer to the corresponding code documentation. For testing procedures, consult the testing guide.