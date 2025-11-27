# Product Requirements Document: Enlace

## Executive Summary

**Product Name:** Enlace  
**Version:** 1.0 (MVP)  
**Date:** November 25, 2025  
**Document Owner:** Product Team

### Vision
Create an affordable, feature-rich employee communication platform that democratizes internal communications for companies in LATAM and other regions with budget constraints, serving as a cost-effective alternative to Actimo.

### Mission
Empower organizations to engage their employees through dynamic content pages, feeds, and targeted communications while maintaining affordability and ease of use.

---

## 1. Problem Statement

### Current Market Situation
- **Actimo** and similar platforms are prohibitively expensive for companies in emerging markets
- LATAM companies struggle to afford modern employee communication tools
- Small to medium businesses need professional communication features without enterprise pricing

### Target Pain Points
1. High subscription costs limit adoption in price-sensitive markets
2. Complex systems require extensive training and setup time
3. Lack of flexibility in content creation and distribution
4. Limited analytics and engagement tracking

---

## 2. Target Users

### Primary Personas

#### 1. Company Administrator
- **Role:** HR Manager, Internal Communications Manager, CEO (small companies)
- **Goals:** 
  - Create engaging content for employees
  - Track engagement and analytics
  - Manage employee groups and contacts
  - Maintain brand consistency
- **Pain Points:**
  - Limited budget for communication tools
  - Need for intuitive content creation
  - Difficulty tracking employee engagement

#### 2. Employee/End User
- **Role:** All company employees across departments
- **Goals:**
  - Access company information easily
  - Stay informed about company updates
  - Engage with content (reactions, comments)
  - Complete required validations (surveys, quizzes)
- **Pain Points:**
  - Information overload
  - Difficulty finding relevant content
  - Lack of mobile-friendly solutions

---

## 3. Product Overview

### Core Value Proposition
"Affordable, intuitive employee communication platform with powerful content creation, targeted distribution, and comprehensive analytics."

### Key Differentiators
1. **Affordability:** Priced for emerging markets
2. **Flexibility:** Custom page builder with versatile components
3. **Multi-tenant Architecture:** Enterprise-grade infrastructure at accessible pricing
4. **Native Experience:** Desktop app powered by Tauri for optimal performance
5. **No-Code Editor:** Tiptap-based interface for non-technical users

---

## 4. Technical Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Multi-Tenant System                      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼────────┐                   ┌─────────▼────────┐
│  Admin Portal  │                   │   Employee App    │
│   (Nuxt.js)    │                   │ (Nuxt.js+Tauri)  │
│   Web-based    │                   │   Native App     │
└───────┬────────┘                   └─────────┬────────┘
        │                                       │
        └───────────────────┬───────────────────┘
                            │
                ┌───────────▼───────────┐
                │   Backend API Layer   │
                │   (Nuxt Server API)   │
                └───────────┬───────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐   ┌───────▼────────┐
│   PostgreSQL   │  │    Storage  │   │  Push/Email    │
│   (Supabase)   │  │   (S3/CDN)  │   │  Notification  │
│   + Drizzle    │  │             │   │    Services    │
└────────────────┘  └─────────────┘   └────────────────┘
```

### Technology Stack

#### Frontend
- **Admin Dashboard:** Nuxt.js 3
- **Employee App:** Nuxt.js 3 + Tauri
- **UI Framework:** NuxtUI + TailwindCSS
- **Editor:** Tiptap (WYSIWYG editor)
- **State Management:** Nuxt built-in composables + Pinia

#### Backend
- **Framework:** Nuxt Server API (server routes)
- **Database:** PostgreSQL (Supabase hosted)
- **ORM:** Drizzle ORM
- **Authentication:** Nuxt Auth / Supabase Auth
- **File Storage:** Supabase Storage or AWS S3

#### Infrastructure
- **Hosting:** Vercel/Netlify (Admin), Tauri binary distribution (Employee App)
- **Database:** Supabase
- **CDN:** CloudFront or Cloudflare
- **Notifications:** 
  - Push: Firebase Cloud Messaging / OneSignal
  - Email: SendGrid / AWS SES

### Database Schema (High-Level)

#### Core Entities

**Companies (Tenants)**
- id, name, slug, branding_config (logo, colors, fonts)
- subscription_tier, status, created_at, updated_at

**Users**
- id, email, password_hash, role (admin/employee)
- company_id, first_name, last_name, avatar_url
- status, last_login, created_at, updated_at

**Groups**
- id, company_id, name, description
- created_by, created_at, updated_at

**Group_Members**
- group_id, user_id, joined_at

**Pages**
- id, company_id, title, slug
- content (JSON - Tiptap document)
- social_enabled (reactions, comments, share)
- status (draft/published/archived)
- created_by, published_at, created_at, updated_at

**Page_Publications**
- id, page_id, published_by
- target_type (all/groups/contacts)
- notify_email, notify_push
- published_at

**Publication_Targets**
- publication_id, target_type, target_id (group_id or user_id)

**Page_Views**
- id, page_id, user_id, viewed_at, duration_seconds

**Page_Interactions**
- id, page_id, user_id, interaction_type (reaction/comment/share)
- interaction_data (JSON), created_at

**Validations**
- id, page_id, validation_type (quiz/confirm/survey)
- config (JSON - questions, options, etc.)
- required (boolean), created_at

**Validation_Responses**
- id, validation_id, user_id
- response_data (JSON), submitted_at

**Feedback**
- id, page_id, feedback_type (survey/slider/nps/comment)
- config (JSON), created_at

**Feedback_Responses**
- id, feedback_id, user_id
- response_data (JSON), submitted_at

**Feeds**
- id, company_id, name, feed_type (company/group/custom)
- filter_config (JSON), created_at

**Feed_Items**
- id, feed_id, page_id, published_at, sort_order

---

## 5. Feature Requirements

### 5.1 Multi-Tenancy

#### Requirements
- **MT-001:** System shall support multiple independent companies (tenants)
- **MT-002:** Data isolation between tenants (company data never crosses boundaries)
- **MT-003:** Each company has independent user management
- **MT-004:** Each company can configure branding (logo, colors, typography)
- **MT-005:** Tenant identification via subdomain or company_id parameter

#### Acceptance Criteria
- Company A cannot access Company B's data under any circumstance
- Each company can have independent admin users
- Branding applied consistently across all pages for that company

---

### 5.2 Admin Dashboard

#### 5.2.1 Authentication & Authorization

**Requirements**
- **AUTH-001:** Admin login with email/password
- **AUTH-002:** Role-based access control (Super Admin, Admin, Editor)
- **AUTH-003:** Session management with automatic timeout
- **AUTH-004:** Password reset functionality
- **AUTH-005:** Multi-factor authentication (future enhancement)

#### 5.2.2 Page Editor

**Navigation Components**
- **NAV-001:** Grid component - arrange content in responsive grid layout
- **NAV-002:** Button component - clickable buttons with custom styling and actions
- **NAV-003:** Feed component - display dynamic feed of pages

**Content Components**
- **CONT-001:** Text component - rich text with formatting options
- **CONT-002:** Video component - embed videos (URL or upload)
- **CONT-003:** Image component - upload images with alt text
- **CONT-004:** Embed component - iframe embeds (YouTube, Google Docs, etc.)
- **CONT-005:** Audio component - audio file player
- **CONT-006:** Contact component - display contact information with links

**Validation Components**
- **VAL-001:** Quiz component - multiple choice with correct answers
- **VAL-002:** Confirm component - require user acknowledgment
- **VAL-003:** Survey component - gather structured feedback

**Feedback Components**
- **FEED-001:** Survey component - multi-question feedback forms
- **FEED-002:** Slider component - scale-based rating (1-10)
- **FEED-003:** NPS component - Net Promoter Score widget
- **FEED-004:** Feedback comment - free-text feedback

**Social Features**
- **SOC-001:** Enable/disable reactions per page
- **SOC-002:** Enable/disable comments per page
- **SOC-003:** Enable/disable sharing per page
- **SOC-004:** Reaction types: like, love, celebrate, insightful, support
- **SOC-005:** Comment threading (replies to comments)

#### 5.2.3 Editor Modes

**Design Mode**
- **DES-001:** Drag-and-drop component placement
- **DES-002:** Visual editor powered by Tiptap
- **DES-003:** Component property panel (styling, content, behavior)
- **DES-004:** Preview mode (desktop/mobile)
- **DES-005:** Auto-save drafts every 30 seconds
- **DES-006:** Undo/redo functionality
- **DES-007:** Template library for quick page creation

**Publish Mode**
- **PUB-001:** Select target audience (All, Specific Groups, Specific Contacts)
- **PUB-002:** Schedule publishing (now or future date/time)
- **PUB-003:** Enable/disable email notification
- **PUB-004:** Enable/disable push notification
- **PUB-005:** Preview notification message
- **PUB-006:** Publication history log

**Analytics Mode**
- **ANA-001:** Page view count (total and unique)
- **ANA-002:** View duration statistics (avg, median, distribution)
- **ANA-003:** Engagement metrics (reactions, comments, shares)
- **ANA-004:** Validation completion rates
- **ANA-005:** Feedback response rates
- **ANA-006:** User-level view tracking (who viewed, when)
- **ANA-007:** Export analytics data (CSV/PDF)
- **ANA-008:** Date range filtering
- **ANA-009:** Visual charts and graphs

#### 5.2.4 Groups Management

**Requirements**
- **GRP-001:** Create, edit, delete groups
- **GRP-002:** Add/remove members from groups
- **GRP-003:** Import members from CSV
- **GRP-004:** Search and filter groups
- **GRP-005:** View group member list
- **GRP-006:** Bulk operations (add multiple users to group)
- **GRP-007:** Nested groups (future enhancement)

#### 5.2.5 Contacts Management

**Requirements**
- **CONT-001:** View all employee contacts
- **CONT-002:** Add new contacts manually
- **CONT-003:** Import contacts from CSV
- **CONT-004:** Edit contact information
- **CONT-005:** Deactivate/reactivate contacts
- **CONT-006:** Search and filter contacts
- **CONT-007:** View contact engagement history
- **CONT-008:** Bulk operations (group assignment, notifications)

#### 5.2.6 Landing Page Customization

**Requirements**
- **LAND-001:** Create custom landing page for company
- **LAND-002:** Use same editor components as regular pages
- **LAND-003:** Set default feed for landing page
- **LAND-004:** Apply company branding automatically
- **LAND-005:** Preview landing page as employee would see it

---

### 5.3 Employee App (Nuxt.js + Tauri)

#### 5.3.1 Core Features

**Requirements**
- **EMP-001:** Native desktop application (Windows, macOS, Linux)
- **EMP-002:** Webview powered by Nuxt.js frontend
- **EMP-003:** Offline capability (cache viewed pages)
- **EMP-004:** Auto-update mechanism
- **EMP-005:** System tray integration with notification counter
- **EMP-006:** Deep linking support (open specific pages from notifications)

#### 5.3.2 User Interface

**Requirements**
- **UI-001:** Display company landing page on login
- **UI-002:** Navigation sidebar with feeds and pinned pages
- **UI-003:** Search functionality (pages, content)
- **UI-004:** Notification center
- **UI-005:** User profile settings
- **UI-006:** Dark mode / light mode toggle
- **UI-007:** Responsive layout (works on various screen sizes)

#### 5.3.3 Page Viewing

**Requirements**
- **VIEW-001:** Render all component types from admin editor
- **VIEW-002:** Interactive components (quizzes, surveys, feedback)
- **VIEW-003:** Social interactions (react, comment, share)
- **VIEW-004:** Track view duration
- **VIEW-005:** Mark validations as completed
- **VIEW-006:** Smooth scrolling and animations

#### 5.3.4 Notifications

**Requirements**
- **NOTIF-001:** Receive push notifications for new pages
- **NOTIF-002:** Email notifications with deep links
- **NOTIF-003:** In-app notification center
- **NOTIF-004:** Notification preferences (enable/disable by type)
- **NOTIF-005:** Badge count on app icon

---

## 6. Non-Functional Requirements

### 6.1 Performance
- **PERF-001:** Page editor load time < 2 seconds
- **PERF-002:** Page rendering in employee app < 1 second
- **PERF-003:** API response time < 200ms (95th percentile)
- **PERF-004:** Support 10,000+ employees per company
- **PERF-005:** Handle 1000+ concurrent users per company

### 6.2 Security
- **SEC-001:** All data encrypted in transit (HTTPS/TLS)
- **SEC-003:** SQL injection prevention via ORM parameterization
- **SEC-004:** XSS prevention via content sanitization
- **SEC-005:** CSRF protection on all forms

### 6.3 Reliability
- **REL-001:** 99.5% uptime SLA
- **REL-002:** Automated database backups (daily)
- **REL-003:** Point-in-time recovery capability
- **REL-004:** Error logging and monitoring (Sentry/LogRocket)
- **REL-005:** Graceful error handling with user-friendly messages

### 6.4 Usability
- **USA-001:** Admin dashboard accessible to non-technical users
- **USA-002:** No training required for basic operations
- **USA-003:** Comprehensive in-app help documentation
- **USA-004:** Keyboard shortcuts for power users
- **USA-005:** Mobile-responsive admin dashboard (future enhancement)

### 6.5 Accessibility
- **ACC-001:** WCAG 2.1 Level AA compliance
- **ACC-002:** Screen reader support
- **ACC-003:** Keyboard navigation
- **ACC-004:** Sufficient color contrast ratios
- **ACC-005:** Alt text for images

---

## 7. User Flows

### 7.1 Admin: Create and Publish Page

1. Admin logs into dashboard
2. Navigates to Pages → Create New
3. Enters page title
4. Switches to Design mode (default)
5. Adds components via drag-and-drop or insert menu
6. Configures component properties
7. Previews page on desktop/mobile
8. Switches to Publish mode
9. Selects target audience (groups/contacts)
10. Enables email and/or push notifications
11. Reviews notification preview
12. Clicks "Publish Now" or schedules for later
13. System processes publication
14. Sends notifications to target audience
15. Admin redirected to Analytics mode to track engagement

### 7.2 Employee: View and Interact with Page

1. Employee receives notification (email or push)
2. Clicks notification link
3. Employee app opens to specific page
4. System tracks page view
5. Employee reads content
6. Employee completes quiz/survey if present
7. Employee reacts to page (like, love, etc.)
8. Employee adds comment
9. System saves interactions
10. Page marked as viewed/completed in employee's history

### 7.3 Admin: Manage Groups

1. Admin navigates to Groups section
2. Clicks "Create Group"
3. Enters group name and description
4. Clicks "Add Members"
5. Searches for employees
6. Selects multiple employees
7. Clicks "Add to Group"
8. Group created and members assigned
9. Group available for targeting in Publish mode

---

## 8. MVP Scope

### Phase 1: MVP (3-4 months)

#### Must Have
- Multi-tenant architecture with company isolation
- Admin authentication and user management
- Page editor with core components:
  - Navigation: Grid, Button
  - Content: Text, Image, Video
  - Validation: Quiz, Confirm
  - Social: Reactions, Comments
- Three editor modes: Design, Publish, Analytics (basic)
- Groups and Contacts management
- Publishing to groups/contacts
- Email notifications
- Employee web app (not Tauri yet - web-based MVP)
- Basic landing page customization
- Core analytics (views, completion rates)
- PostgreSQL database with Drizzle ORM
- Supabase integration

#### Should Have (if time permits)
- Feed component
- Embed component
- Survey and feedback components
- Push notifications
- Advanced analytics with charts
- CSV import for contacts/groups

#### Won't Have (Post-MVP)
- Tauri native app (web version only for MVP)
- Audio component
- NPS and slider feedback
- Comment threading
- Template library
- Dark mode
- Offline capability
- Mobile admin dashboard
- Advanced scheduling
- A/B testing
- Integrations with HR systems

---

## 9. Success Metrics

### Business Metrics
- **Number of companies signed up:** Target 50 companies in first 6 months
- **Monthly Active Users (MAU):** Target 10,000 employees
- **Average Revenue Per User (ARPU):** Target $2-5/employee/month
- **Customer Acquisition Cost (CAC):** < $500 per company
- **Churn Rate:** < 5% monthly

### Product Metrics
- **Pages created per company:** Average 10+ pages/month
- **Employee engagement rate:** 70%+ of employees view published pages
- **Validation completion rate:** 80%+ for required validations
- **Time to first page publish:** < 15 minutes from signup
- **User satisfaction (NPS):** > 40

### Technical Metrics
- **System uptime:** 99.5%
- **API response time (p95):** < 200ms
- **Page load time:** < 2 seconds
- **Error rate:** < 0.1% of requests

---

## 10. Pricing Strategy

### Target Pricing (for LATAM and emerging markets)

We will build the product without pricing for now, we will make contracts outside the app.

---

## 11. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Tiptap complexity for custom components | High | Medium | Start with simpler components, extend gradually |
| Notification delivery reliability | High | Medium | Use established services (SendGrid, FCM) |
| Multi-tenancy data leakage | Critical | Low | Strict testing, code reviews, security audits |
| Performance with large datasets | High | Medium | Implement pagination, caching, CDN early |
| Competition from established players | Medium | High | Focus on pricing and LATAM market fit |
| User adoption challenges | High | Medium | Invest in onboarding, documentation, support |
| Tauri learning curve | Medium | Medium | Start with web MVP, Tauri in Phase 2 |

---

## 12. Timeline Estimate

### Month 1: Foundation
- [x] Database schema design and implementation
- [x] Authentication and authorization
- [x] Multi-tenancy setup
- [x] Basic admin dashboard shell
- [x] User and company management

### Month 2: Core Editor
- [x] Tiptap integration
- [x] Basic components (Text, Image, Grid, Button)
- [x] Design mode implementation
- [x] Draft saving and preview
- [x] Component property panel

### Month 3: Publishing & Social
- [ ] Groups and Contacts management
- [ ] Publish mode with targeting
- [ ] Email notification system
- [ ] Social features (reactions, comments)
- [ ] Basic validation components (Quiz, Confirm)

### Month 4: Analytics & Employee App
- [ ] Analytics mode with basic metrics
- [ ] Employee web app (responsive)
- [ ] Landing page customization
- [ ] Feed component
- [ ] Polish and bug fixes
- [ ] Beta testing

### Post-MVP: Enhancements
- [ ] Tauri native app conversion
- [ ] Advanced analytics
- [ ] Additional components (Audio, NPS, etc.)
- [ ] Push notifications
- [ ] Template library
- [ ] Mobile admin app

---

## 13. Open Questions

1. **Internationalization:** Should MVP support multiple languages or English-only? MVP will be english only, then we will add internationalization.
2. **File Upload Limits:** What are max file sizes for images, videos, audio? Max file size will be 10MB for images, 100MB for videos, 10MB for audio.
3. **Content Moderation:** Should admins be able to moderate employee comments? No, admins will not be able to moderate employee comments.
4. **User Roles:** Beyond Admin and Employee, do we need Editor or Viewer roles? No, we will not need Editor or Viewer roles.
5. **API Access:** Should we expose a REST API for third-party integrations? Yes, we should expose a REST API for third-party integrations.
6. **White-labeling:** Do we allow companies to fully white-label the solution? No, we will not allow companies to fully white-label the solution.

---

## 14. Appendix

### A. Glossary

- **Tenant:** A company using the platform (in multi-tenant architecture)
- **Admin:** User with permissions to create pages and manage company settings
- **Employee:** End user who views and interacts with pages
- **Page:** A content unit created by admins and viewed by employees
- **Component:** Building block for pages (text, image, quiz, etc.)
- **Feed:** Dynamic list of pages, automatically updated
- **Validation:** Interactive component requiring user input (quiz, confirm, survey)
- **Publication:** The act of making a page available to target audience
- **Engagement:** User interactions with pages (views, reactions, comments, completions)

### B. References

- Actimo platform analysis
- Tiptap documentation
- Nuxt.js documentation
- Tauri documentation
- Drizzle ORM documentation
- Supabase documentation


