# COGNA MVP

## Minimal AI-Native Kanban Platform

---

## Vision

The goal of this MVP is **NOT** to build a complete project management platform.

The goal is to build:

- a clean,
- fast,
- modern,
- AI-ready,
- minimal operational Kanban platform,

inspired by:

- Notion
- Linear
- Trello
- Monday

with focus on:

- simplicity
- usability
- speed
- future scalability

---

## MVP Objective

Build a usable operational Kanban system capable of managing:

- projects
- tasks
- subtasks
- collaborators
- statuses
- comments
- attachments

inside a modern workspace experience.

---

## MVP Philosophy

### Important Principle

**DO NOT overengineer.**

The MVP should feel:

- lightweight
- elegant
- minimal
- operational
- extremely fast

---

## Product Positioning

Cogna should initially position itself as:

> "A modern AI-ready operational Kanban workspace."

**NOT:**

- ERP
- BPM suite
- enterprise monster platform

Yet.

---

## MVP Scope

The first version should contain ONLY the **core modules** below.

---

## Core Modules

### 1. Authentication

**Features:**

- Login
- Signup
- Logout
- Password reset
- Organization creation

---

### 2. Workspace

**Features:**

- Organizations
- Teams
- Members
- Basic permissions

---

### 3. Projects

**Features:**

- Create project
- Edit project
- Delete project
- Project icon
- Project description
- Project status
- Project members

---

### 4. Kanban Board

**Features:**

- Drag and drop
- Multiple columns
- Custom statuses
- Task ordering
- Real-time updates

**Default Columns:**

- Backlog
- Todo
- In Progress
- Review
- Done

---

### 5. Tasks

**Features:**

- Create task
- Edit task
- Delete task
- Task description
- Due date
- Assignee
- Priority
- Labels
- Subtasks

**Task Priorities:**

- Low
- Medium
- High
- Critical

---

### 6. Task Modal

When clicking a task:

**Features:**

- Full description
- Comments
- Attachments
- Activity log
- Subtasks
- Status history

---

### 7. Comments

**Features:**

- Task comments
- Mention users
- Activity timeline

---

### 8. Dashboard (Simple)

**Features:**

- Total tasks
- Completed tasks
- Overdue tasks
- Progress percentage

---

## UX Vision

The UX should feel like a hybrid between:

- Notion
- Linear
- ClickUp (minimal side)
- Trello modernized

### UX Principles

#### 1. Minimalism

Avoid:

- clutter
- excessive menus
- unnecessary complexity

#### 2. Speed

The interface must feel:

- instant
- smooth
- responsive

#### 3. Focus

The user should focus on:

- execution
- priorities
- flow

---

## Visual Identity

### Theme

Dark-first interface.

### Suggested Colors

- **Primary** — Deep Teal: `#0F766E`
- **Secondary** — Graphite: `#111827`
- **Accent** — Soft Neon Green: `#34D399`

### Typography Style

Modern rounded typography.

References:

- Inter
- Geist
- Satoshi

---

## Recommended Tech Stack

### Frontend

**Core:**

- Next.js
- React
- TypeScript

**Styling:**

- Tailwind CSS
- shadcn/ui

**Drag & Drop:**

- dnd-kit

**State Management:**

- Zustand

**Forms:**

- React Hook Form
- Zod

### Backend

**Supabase:**

- PostgreSQL
- Auth
- Storage
- Realtime
- Edge Functions

### Infrastructure

**Hosting:**

- Vercel
- Supabase

---

## Architecture

### Monorepo

Use **Turborepo**.

### Suggested Structure

```txt
/apps
   /web

/packages
   /ui
   /database
   /types
```

---

## Database Structure

### Main Tables

#### organizations

```sql
id
name
created_at
```

#### users

```sql
id
name
email
avatar
organization_id
created_at
```

#### projects

```sql
id
name
description
status
organization_id
created_by
created_at
```

#### columns

```sql
id
project_id
name
position
created_at
```

#### tasks

```sql
id
title
description
status
priority
due_date
project_id
column_id
assignee_id
position
created_at
```

#### subtasks

```sql
id
task_id
title
completed
created_at
```

#### comments

```sql
id
task_id
user_id
content
created_at
```

#### attachments

```sql
id
task_id
file_url
file_name
uploaded_by
created_at
```

---

## Realtime Features

Use Supabase realtime for:

- live Kanban updates
- live comments
- collaborative editing

---

## MVP Pages

### Public

- Landing Page
- Login
- Signup

### App

- Dashboard
- Projects
- Kanban
- Task Details
- Settings

---

## Main Layout

### Sidebar

Contains:

- Logo
- Dashboard
- Projects
- Favorites
- Settings

### Main Area

Displays:

- board
- tasks
- dashboards

### Right Panel (Future)

Reserved for:

- AI Assistant
- Activity feed
- Notifications

---

## AI Integration (LIGHT MVP)

AI should exist in the MVP, but **minimally**.

### Initial AI Features

#### 1. Generate Task Description

- User types: title
- AI generates: structured description

#### 2. Generate Subtasks

AI breaks tasks into actionable subtasks.

#### 3. Summarize Comments

AI summarizes long discussions.

### IMPORTANT

AI should **NOT** dominate the interface yet.

The MVP focus is:

- operational execution
- simplicity
- speed

---

## Performance Goals

The platform should feel:

- lightweight
- fast
- smooth

### Performance Rules

- avoid heavy animations
- avoid bloated dependencies
- optimize renders
- use lazy loading
- use server components when possible

---

## Design References

- Linear
- Notion
- Raycast
- Vercel dashboard

---

## Suggested Development Order

### Sprint 1

- setup monorepo
- setup Next.js
- setup Tailwind
- setup shadcn/ui
- setup Supabase
- auth

### Sprint 2

- organizations
- projects
- Kanban structure

### Sprint 3

- drag and drop
- tasks
- subtasks
- comments

### Sprint 4

- realtime updates
- dashboard
- notifications

### Sprint 5

- AI features
- task generation
- summaries

---

## MVP Success Criteria

The MVP is successful if users can:

- create projects
- organize work visually
- collaborate
- manage execution
- feel speed and simplicity
- enjoy the UX

---

## Future Expansion

**AFTER MVP:**

- BPM
- automations
- AI execution radar
- dashboards
- workflows
- integrations
- operational intelligence

---

## Final Principle

The first version of Cogna should feel like:

> "The cleanest operational Kanban workspace you've ever used."

Focus on:

- quality
- UX
- speed
- execution

**NOT:**

- feature overload

The MVP should create trust, usability and adoption first.
