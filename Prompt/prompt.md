# Prompt

## Context and Role

As a Frontend Developer specializing in modern web experiences, you are responsible for designing and implementing a high-performance personal portfolio website. The website must use Framer Motion to create immersive, scroll-based storytelling animations while maintaining responsiveness, accessibility, and production-level quality.

The portfolio should present projects, skills, and experience in a narrative-driven format that guides visitors through a smooth visual journey. Additionally, the system must include a secure and functional contact mechanism that collects user information and triggers an email notification to the site owner.

## Objective

Develop a complete full-stack portfolio website that:

Implements scroll-based storytelling animations using Framer Motion.

Provides a modern, responsive UI with smooth transitions.

Includes a “Get in Touch” button that opens a contact form modal.

Logs user submissions securely.

Triggers an email to the portfolio owner with the submitted details.

## UI and Animation Requirements

### Scroll-Based Storytelling

Implement scroll-triggered animations using Framer Motion.

Use parallax effects, fade-ins, and staggered transitions.

Animate sections sequentially to create a narrative flow.

Include smooth transitions between:

Hero Section

About Section

Skills Section

Projects Section

Contact Section

Ensure animations:

Are performant (avoid layout thrashing)

Use GPU-friendly properties (transform, opacity)

Do not block scroll performance

## Layout Requirements

The portfolio must include:

Hero section with animated introduction

About section with animated text reveal

Skills section with animated progress indicators

Projects section with hover interactions and motion transitions

Call-to-action section with “Get in Touch” button

The layout must be:

Fully responsive (mobile, tablet, desktop)

Accessible (ARIA labels, semantic HTML)

Optimized for performance

## Contact System Requirements

### Modal Behavior

Clicking the “Get in Touch” button must:

Open a modal contact form

Animate modal entrance and exit using Framer Motion

### Contact Form Fields

Name (required)

Email (required, validated)

Phone Number (required, validated)

Message (optional)

### Validation

Client-side validation with proper error messages.

Prevent submission if required fields are invalid.

## Backend Requirements

Implement an API endpoint to handle form submissions.

Securely log submissions in:

Server logs

Optional database (e.g., MongoDB or PostgreSQL)

Trigger an email to the portfolio owner containing:

Name

Email

Phone number

Message

Timestamp

Use a secure email service (e.g., Nodemailer with SMTP or transactional email API).

Store credentials securely using environment variables.

Prevent spam using basic rate limiting or CAPTCHA integration.

## Data Processing Requirements

Sanitize all inputs to prevent:

XSS attacks

Injection attacks

Validate email format properly.

Ensure API returns structured JSON responses:

Success message

Error message (if applicable)

## Output Requirements

Smooth animated storytelling portfolio.

Functional modal contact form.

Email notification successfully triggered upon submission.

Confirmation message shown to user after successful submission.

Graceful error handling if email fails.

## Error Handling and Documentation

Handle frontend form errors gracefully.

Handle backend validation errors.

Provide structured error responses.

Log backend failures appropriately.

Document:

Folder structure

Setup instructions

Environment variable configuration

Deployment steps

## Performance and Scalability

Optimize bundle size.

Lazy-load heavy components.

Ensure animations do not degrade performance.

Support high traffic without API bottlenecks.

Use proper debouncing for user interactions.

Ensure accessibility and SEO optimization.

## Technology Stack

Use the following:

### Frontend:

React (or Next.js)

Framer Motion

Tailwind CSS (or equivalent styling solution)

### Backend:

Node.js + Express (or Next.js API routes)

Nodemailer (or equivalent email service)

dotenv for environment configuration

### Optional:

MongoDB or PostgreSQL for storing submissions
