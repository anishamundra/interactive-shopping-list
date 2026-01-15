## Overview

The Interactive Shoping list is a web application that helps users to manage their shopping items. I have bult this solution using a clean and separate HTML for the structure, CSS for styling and JavaScript for functionality. This application follows the modern web development practices with a responsive design that works for both desktop and mobile devices.

## Key Features
1. Filtering by All, Active and Purchased
2. Interactive UI
3. Responsive Design
4. Notification System

## Technical Decisions
### Category Detection
I impemented a priority based category detection sysytem using the array so that I do not have to use different variable for each category. 
const priorityOrder = ['fruits', 'vegetables', 'dairy', 'meat', 'bakery', 'beverages'];
This ensures that the items are categories properly.

### State Management
This project uses three state management approaches:
- items aray are the single source of truth
- currentFilter to track the active view filter
- Local storage integration for data persistance

### Responsive Design
CSS used media query to ensure that the application works well on mobile devices as well
- Stacked layout for the form element on small screens
- Adjusted font sizes and spacing

### User Experience Enhancement
- Visual feedback with hover effect.
- Notification system for important actions
- Empty states for helpful and meaning full messages
- Smooth transition between states
