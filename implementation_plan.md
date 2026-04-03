# Layout and Navigation Improvement Plan

The current navigation and content layout are experiencing issues due to:

1.  **Tab Overcrowding**: 11 tabs are being squeezed into a single row on desktop without scrolling, leading to unreadable labels.
2.  **Improper Layout Constraints**: The search for the `dc-tabs__content--main__tabs` in `main.scss` shows a `display: flex; justify-content: space-between;` layout which may be constraining the content visibility.

## Action Steps

### 1. Enable Tab Scrolling

Update `src/pages/main/main.tsx` into the `Tabs` component. Pass `is_scrollable={true}` to allow the tabs to overflow gracefully and be scrolled, instead of being squished.

### 2. Modernize Tab Styling

Refresh `src/pages/main/main.scss` to:

- Add better padding and spacing for the tabs.
- Implement a consistent horizontal scroll layout for all screen sizes.
- Provide clear active states and hover effects.
- Remove horizontal constraints on the content area so it can fill the available space.

### 3. Verification

Confirm and restore any missing styles that might be affecting visibility, including checking the `z-index` and position of the main content wrapper.
