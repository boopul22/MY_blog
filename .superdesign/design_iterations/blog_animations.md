# BLOG SITE ANIMATIONS - MICRO-SYNTAX

## Core Content Animations
postCard: 400ms ease-out [Y+20→0, α0→1] stagger+100ms
featuredPost: 600ms ease-out [Y+30→0, α0→1] +200ms
textReveal: 800ms ease-out [Y+10→0, α0→1] +300ms

## Navigation & Interface
mobileMenu: 300ms ease-out [X-100%→0, α0→1]
menuItem: 200ms ease-out [X+10→0] stagger+50ms
sidebarToggle: 150ms [R0°→90°] hover
pagination: 300ms ease-out [Y+10→0, α0→1]

## Interactive Elements
readMore: 200ms ease-out [X0→5, α0.7→1] hover
categoryTag: 150ms ease-out [S1→1.05] hover
socialIcon: 200ms ease-out [Y0→-5] hover
searchInput: 200ms [border-width: 1px→2px] focus

## Loading States
contentLoad: 500ms ease-out [Y+40→0, α0→1]
skeleton: 1500ms ∞ [bg: muted↔secondary]
imageLoad: 400ms ease-out [S0.8→1, α0→1]

## Micro Interactions
postHover: 200ms [shadow↗, Y0→-5]
authorCard: 200ms ease-out [S1→1.02] hover
newsletterButton: 150ms [S1→0.95→1] press
scrollToTop: 300ms ease-out [Y+20→0, α0→1] show/hide

## Reading Experience
articleFade: 600ms ease-out [α0→1] on scroll
headingHighlight: 200ms [border-left: 0→4px] on scroll
codeBlock: 300ms ease-out [bg: card→muted] hover

These animations are designed to enhance readability and engagement without being distracting. They focus on providing visual feedback and smooth transitions between states.