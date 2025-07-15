# Wix Mentor Dashboard Implementation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Required Wix Elements](#required-wix-elements)

4. [Step-by-Step Implementation Guide](#step-by-step-implementation-guide)
5. [Deployment and Maintenance](#deployment-and-maintenance)

## Project Overview

This guide will help you create a comprehensive mentor dashboard in Wix with the following features:
- **Course Management**: Course enrollment, extension, and cancellation
- **Tutoring Student Management**: Add and remove tutoring students
- **Alternative Provision (AP) Student Management**: Specialized AP student enrollment with curriculum selection
- **Ticket Management**: Support ticket submission and tracking
- **Statistics Display**: Real-time student counts and metrics
- **Pricing Plans**: Four-tier curriculum selection for AP students
- **Lark Integration**: External form integration for course enrollment and tickets

**Important Note:** The original HTML file (`mentor-dashboard.html`) uses traditional HTML modals and CSS/JavaScript. In Wix, these popups will be implemented using **Wix Lightbox components** instead of custom HTML modals. This provides better integration with Wix's responsive design system and built-in functionality.

**Key Implementation Differences:**
- HTML `<div class="modal">` → Wix **Lightbox** element
- CSS modal styles → Wix built-in lightbox styles and custom modifications
- JavaScript `modal.style.display = 'block'` → Wix `$w('#lightboxId').show()`
- JavaScript `modal.style.display = 'none'` → Wix `$w('#lightboxId').hide()`

**Estimated Time:** 4-6 hours
**Difficulty Level:** Intermediate
**Required Wix Plan:** Business and eCommerce (for database functionality)

## Required Wix Elements

### Layout Elements (Total: 15)
- **3 Strips** (header, main content, footer)
- **2 Columns** (sidebar, main content)
- **4 Grids** (action cards, statistics, pricing, navigation)
- **6 Containers** (card containers)

### Navigation Elements (Total: 8)
- **6 Buttons** (dashboard, students, sessions, reports, finance, settings)
- **1 Image** (user avatar)
- **1 Text** (username)

### Action Buttons (Total: 14)
- **3 Buttons** (courses: register, extend, cancel)
- **2 Buttons** (students: add, remove)
- **2 Buttons** (AP students: add, remove)
- **2 Buttons** (tickets: submit, check status)
- **5 Buttons** (modal close buttons)

### Display Elements (Total: 16)
- **8 Text Elements** (statistics labels and values)
- **4 Text Elements** (card titles)
- **4 Text Elements** (card descriptions)

### Form Elements (Total: 20)
- **8 Input Fields** (name, email, phone, age, etc.)
- **4 Dropdown Menus** (status, courses, education plan)
- **2 Text Areas** (medical info, education background)
- **1 Upload Button** (EHCP file)
- **5 Submit Buttons** (form submissions)

### Modal Elements (Total: 5)
- **5 Lightboxes** (course, student, AP student, delete, plan)

### Data Elements (Total: 6)
- **6 Datasets** (students, courses, statistics, pricing, tickets, AP students)

**Total Element Count: Approximately 84 elements**



## Step-by-Step Implementation Guide

### Phase 1: Page Setup (30 minutes)

#### Step 1.1: Create New Page
1. **Open Wix Editor**
2. **Click:** "Add Page" → "Blank Page"
3. **Page Name:** "Mentor Dashboard"
4. **Page URL:** `/mentor-dashboard`
5. **Set as:** Homepage (optional)

#### Step 1.2: Configure Page Settings
1. **Click:** Page Settings (gear icon)
2. **SEO Title:** "Mentor Dashboard - Student Management System"
3. **Meta Description:** "Comprehensive mentor dashboard for managing students, courses, and educational programs"
4. **Page Background:** Set to `#f8f9fa`

### Phase 2: Layout Structure (45 minutes)

#### Step 2.1: Add Header Strip
1. **Click:** Add Elements → Layout → Strip
2. **Strip Name:** `headerStrip`
3. **Position:** Top of page
4. **Height:** 80px
5. **Background Color:** `#ffffff`
6. **Bottom Border:** 1px solid `#e9ecef`

#### Step 2.2: Add Main Content Strip
1. **Click:** Add Elements → Layout → Strip
2. **Strip Name:** `mainContentStrip`
3. **Position:** Below header
4. **Height:** Fill remaining space
5. **Background Color:** `#f8f9fa`
6. **Padding:** 20px all around

#### Step 2.3: Add Sidebar Column
1. **Inside main content strip add:** Add Elements → Layout → Column
2. **Column Name:** `sidebarColumn`
3. **Width:** 250px
4. **Background Color:** `#ffffff`
5. **Right Border:** 1px solid `#e9ecef`
6. **Padding:** 20px

#### Step 2.4: Add Main Content Column
1. **Add second column:** `mainColumn`
2. **Width:** Fill remaining space
3. **Padding:** 20px

### Phase 3: Navigation Setup (30 minutes)

#### Step 3.1: Add User Info Area
1. **At top of sidebar add:**
   - **User Avatar Image:** `userAvatar` (60x60px, circular)
   - **Username Text:** `userName` (Font: 16px, bold)
   - **User Role Text:** `userRole` (Font: 14px, color: #6c757d)

#### Step 3.2: Add Navigation Buttons
1. **Below user info add navigation buttons:**
   - `dashboardNavBtn` - "Dashboard"
   - `studentsNavBtn` - "Students"
   - `sessionsNavBtn` - "Sessions"
   - `reportsNavBtn` - "Reports"
   - `financeNavBtn` - "Finance"
   - `settingsNavBtn` - "Settings"

2. **Button Styling:**
   - Width: 100%
   - Height: 40px
   - Margin: 5px 0
   - Background: Transparent
   - Hover: `#f8f9fa`
   - Active: `#007bff` (white text)

### Phase 4: Student Type Toggle (20 minutes)

#### Step 4.1: Add Student Type Toggle
1. **At top of main column add:** Student type toggle buttons
2. **Tutoring Students Button:** `tutoringStudentsBtn`
   - Text: "Tutoring Students"
   - Background: #17a2b8 (info color)
3. **Alternative Provision Students Button:** `apStudentsBtn`
   - Text: "Alternative Provision Students"
   - Background: #663399 (primary color)

#### Step 4.2: Add Statistics Cards
Create dynamic statistics cards that update based on student type:

1. **Total Students Card:**
   - Container: `totalStudentsCard`
   - Value Text: `totalStudentsValue` (Font: 48px, bold)
   - Label Text: `totalStudentsLabel` ("Total Students")

2. **Active Students Card:**
   - Container: `activeStudentsCard`
   - Value Text: `activeStudentsValue` (Font: 48px, bold)
   - Label Text: `activeStudentsLabel` ("Active Students")

3. **Pending Approval Card:**
   - Container: `pendingApprovalCard`
   - Value Text: `pendingApprovalValue` (Font: 48px, bold)
   - Label Text: `pendingApprovalLabel` ("Pending Approval")

4. **Need Attention Card:**
   - Container: `needAttentionCard`
   - Value Text: `needAttentionValue` (Font: 48px, bold)
   - Label Text: `needAttentionLabel` ("Need Attention")

### Phase 5: Action Cards (45 minutes)

#### Step 5.1: Create Action Grid
1. **Below statistics grid add:** Add Elements → Layout → Grid
2. **Grid Name:** `actionCardsGrid`
3. **Columns:** 3
4. **Spacing:** 20px
5. **Height:** Auto

#### Step 5.2: Add Action Cards

1. **Course Management Card:**
   - Container: `courseManagementCard`
   - Title: "Course Management"
   - Description: "Manage course extensions, cancellations and new courses"
   - Buttons:
     - `courseEnrollmentBtn` ("Course Enrolment") - Links to Lark form
     - `courseExtensionBtn` ("Course Extension")
     - `cancelCourseBtn` ("Cancel Course")

2. **Tutoring Student Management Card:**
   - Container: `tutoringStudentCard`
   - Title: "Tutoring Student"
   - Description: "Manage tutoring student enrollment and sessions"
   - Buttons:
     - `addTutoringStudentBtn` ("Add Tutoring Student")
     - `removeTutoringStudentBtn` ("Remove Student")

3. **Alternative Provision Card:**
   - Container: `apStudentCard`
   - Title: "Alternative Provision"
   - Description: "Manage AP students and specialized educational provision"
   - AP Student Counter: `apStudentCount`
   - Buttons:
     - `addAPStudentBtn` ("Add AP Student")
     - `removeAPStudentBtn` ("Remove Student")

4. **Ticket Management Card:**
   - Container: `ticketManagementCard`
   - Title: "Ticket Management"
   - Description: "Submit support tickets and check status"
   - Buttons:
     - `submitTicketBtn` ("Submit Ticket") - Links to Lark form
     - `checkTicketStatusBtn` ("Check Status")
     - `addStudentBtn` ("Add Student")
     - `removeStudentBtn` ("Remove Student")

3. **AP Student Card:**
   - Container: `apStudentCard`
   - Title: "AP Students"
   - Description: "Manage AP student registration"
   - Button Group:
     - `addAPStudentBtn` ("Add AP Student")
     - `removeAPStudentBtn` ("Remove AP Student")

4. **Ticket System Card:**
   - Container: `ticketSystemCard`
   - Title: "Ticket System"
   - Description: "Submit and track tickets"
   - Button Group:
     - `submitTicketBtn` ("Submit Ticket")
     - `checkStatusBtn` ("Check Status")

### Phase 6: Pricing Plans (30 minutes)

#### Step 6.1: Create Pricing Grid
1. **Below action cards add:** Add Elements → Layout → Grid
2. **Grid Name:** `pricingGrid`
3. **Columns:** 3
4. **Spacing:** 20px

#### Step 6.2: Add Pricing Cards
Create three pricing plan cards, each containing:
- Plan name
- Price
- Feature list
- "Select Plan" button

### Phase 7: Dataset Connections (30 minutes)

#### Step 7.1: Add Datasets
1. **Click:** Add Elements → Database → Dataset
2. **Add the following datasets:**
   - `studentsDataset` → Students collection
   - `coursesDataset` → Courses collection
   - `statisticsDataset` → Statistics collection
   - `pricingDataset` → PricingPlans collection
   - `ticketsDataset` → Tickets collection
   - `apStudentsDataset` → Students collection (filter isAP = true)

#### Step 7.2: Connect Elements to Datasets
1. **Connect statistics values to statisticsDataset**
2. **Connect pricing cards to pricingDataset**
3. **Set dataset permissions to "Admin Only"**

### Phase 8: Modal/Lightbox Creation (60 minutes)

**Important:** Modals from the original HTML file should be replaced with Lightbox components in Wix. Here are the correspondences:
- HTML `courseModal` → Wix `courseManagementLightbox`
- HTML `studentModal` → Wix `studentManagementLightbox`
- HTML `apStudentModal` → Wix `apStudentRegistrationLightbox`

#### Step 8.1: Course Management Modal
**Replaces:** `courseModal` from original HTML file
1. **Add:** Elements → Popups & Lightboxes → Lightbox
2. **Lightbox ID:** `courseManagementLightbox`
3. **Title:** "Course Management"
4. **Content:**
   - Course selection dropdown
   - Action selection (register/extend/cancel)
   - Confirm button
   - Cancel button

#### Step 8.2: Student Management Modal
**Replaces:** `studentModal` from original HTML file
1. **Add:** Elements → Popups & Lightboxes → Lightbox
2. **Lightbox ID:** `studentManagementLightbox`
3. **Title:** "Student Management"
4. **Content:** Multi-state container including:
   - Add student form
   - Remove student form
   - Tab navigation

#### Step 8.3: AP Student Registration Modal
**Replaces:** `apStudentModal` from original HTML file
1. **Add:** Elements → Popups & Lightboxes → Lightbox
2. **Lightbox ID:** `apStudentRegistrationLightbox`
3. **Title:** "AP Student Registration"
4. **Content:** Complete AP student registration form

### Phase 9: Form Creation (90 minutes)

#### Step 9.1: Add Student Form
Create form in Student Management Lightbox:

**Required Fields:**
- `studentNameInput` - Student Name (text input)
- `studentEmailInput` - Email (email input)
- `studentPhoneInput` - Phone (phone input)
- `studentStatusDropdown` - Status (dropdown)
- `studentCourseDropdown` - Course (dropdown)

**Buttons:**
- `submitAddStudentBtn` - Submit
- `cancelAddStudentBtn` - Cancel

#### Step 9.2: AP Student Registration Form
Create complete form in AP Student Lightbox:

**Student Information:**
- `apStudentNameInput` - Name
- `apStudentAgeInput` - Age
- `sendStatusDropdown` - SEND Status

**Guardian Information:**
- `guardianNameInput` - Guardian Name
- `guardianPhoneInput` - Guardian Phone
- `guardianEmailInput` - Guardian Email

**Other Information:**
- `medicalInfoTextarea` - Medical Information
- `educationBackgroundTextarea` - Education Background
- `educationPlanDropdown` - Education Plan
- `ehcpFileUpload` - EHCP File Upload

**Buttons:**
- `registerAPStudentBtn` - Register
- `cancelAPRegistrationBtn` - Cancel

### Phase 10: Responsive Design (45 minutes)

#### Step 10.1: Mobile Layout
1. **Switch to mobile view**
2. **Hide sidebar**
3. **Adjust grid to single column**
4. **Adjust font sizes and spacing**

#### Step 10.2: Tablet Layout
1. **Switch to tablet view**
2. **Adjust sidebar width to 200px**
3. **Adjust grid to 2 columns**
4. **Optimize touch interactions**

## Deployment and Maintenance

### Step 11: Pre-Deployment Checklist

#### Content Review
- [ ] All text content is accurate and professional
- [ ] All images are optimized and properly sized
- [ ] All links and buttons work correctly
- [ ] Form validation works properly
- [ ] Database connections are secure

#### Technical Review
- [ ] All code is properly commented
- [ ] Error handling is implemented
- [ ] Console errors are resolved
- [ ] Performance is optimized
- [ ] Security best practices are followed

#### Testing Review
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified
- [ ] All user flows tested
- [ ] Database operations tested
- [ ] Third-party integrations tested

### Step 12: Deployment Process

1. **Final Testing:**
   - Test in Wix preview mode
   - Test all forms and interactions
   - Verify database operations
   - Test Lark integration

2. **Publish Website:**
   - Click "Publish" in Wix Editor
   - Choose domain (custom or Wix subdomain)
   - Configure SSL certificate
   - Set up analytics tracking

3. **Post-Deployment Testing:**
   - Test live website functionality
   - Verify database operations in production
   - Test form submissions
   - Monitor error logs

### Step 13: Ongoing Maintenance

#### Daily Tasks
- Monitor website performance
- Check error logs
- Review form submissions
- Monitor database usage

#### Weekly Tasks
- Review analytics data
- Update content as needed
- Check for broken links
- Review user feedback

#### Monthly Tasks
- Database cleanup and optimization
- Security updates
- Performance optimization
- Feature updates based on user feedback

#### Quarterly Tasks
- Comprehensive security audit
- Complete backup of website and database
- Review and update documentation
- Plan new features and improvements

## Conclusion

This comprehensive guide provides everything needed to create a fully functional mentor dashboard in Wix. The implementation includes:

- **Complete UI/UX Design:** Professional, responsive interface
- **Database Integration:** Robust data management system
- **Form Processing:** Comprehensive validation and submission
- **Third-party Integration:** Lark notification system
- **Responsive Design:** Mobile, tablet, and desktop optimization
- **Error Handling:** Comprehensive error management
- **Performance Optimization:** Fast, efficient operations

**Estimated Total Implementation Time:** 6-8 hours
**Maintenance Time:** 2-4 hours per month

**Next Steps:**
1. Follow the step-by-step implementation guide
2. Conduct thorough testing before deployment
3. Train team members on system usage
4. Plan ongoing maintenance and updates
5. Gather user feedback for future improvements

For additional support or custom requirements, please refer to Wix documentation or consult with Wix development experts.