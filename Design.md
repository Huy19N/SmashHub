# SmashHub System UI Design Document

## 1. Overview & Architecture
SmashHub is a multi-role web platform (User, Facility Owner, Admin) built with React and Vite. It utilizes Tailwind CSS for styling and follows a modular feature-based architecture (`src/features`).

## 2. Global Styling & Theming
- **Color Palette**: Emerald/Green as primary brand color (`emerald-500`, `emerald-600`), neutral gray scales for backgrounds and text.
- **Dark Mode**: Fully supported via `.dark` class in Tailwind CSS. Dark backgrounds typically use `bg-gray-900` or `bg-card-dark`, with borders `border-border-dark`.
- **Glassmorphism**: Extensively used using `backdrop-blur-md`, `bg-white/70`, `dark:bg-gray-800/50`.
- **Typography**: Clean, sans-serif fonts. High contrast for headings (font-black, tracking-tight).

## 3. UI Components & Layouts
- **Layout Structure**: 
  - `MainLayout`: Public pages (Home, About).
  - `AuthLayout`: Authentication pages (Login, Register).
  - `AdminLayout`: Admin portal pages.
  - `ProtectedRoute`: Role-based gated wrapper for features.
- **Common Patterns**:
  - **Cards**: Rounded corners (`rounded-2xl`, `rounded-3xl`), subtle shadows (`shadow-sm`, `shadow-lg`).
  - **Buttons**: Fully rounded (`rounded-full`), active scaling (`active:scale-95`), transition colors (`transition-colors`).
  - **Inputs/Forms**: Soft borders, focus rings (`focus:ring-emerald-500/30`), clear labels.
  - **Modals**: Centered overlays with `framer-motion` for entrance/exit animations.

## 4. Current Feature Modules
- **Auth**: Login, Register.
- **Groups**: Team Management, Matchmaking, Group Dashboards.
- **Bookings**: Interactive Map (Leaflet), Facility search, Direct Bookings.
- **Schedules**: Calendar views, Participant lists.
- **Courts Management**: Facility Owner dashboard, dynamic pricing configuration, operating hours.
- **Profiles & Subscriptions**: User settings, Tier upgrades.
- **Admin**: System-wide management, approvals, payouts.

## 5. Upcoming Feature: Social Module
- **Purpose**: A timeline/feed-based interface for users to discover posts, find opponents, and see promotional content from Facility Owners.
- **Key UI Elements to Build**:
  - `SocialFeed`: Infinite scrolling or paginated list of `PostCard`s.
  - `PostCard`: Displays author info, content, likes, and a comments section.
  - `CreatePostWidget`: A rich input area to compose new posts.
  - `CommentList`: Nested list of comments under a post.
- **State Management**: React Query or standard React hooks with Context for caching feed data.
- **Optimizations**: Lazy loading images, virtualized lists (if needed), debounced interactions (likes).


