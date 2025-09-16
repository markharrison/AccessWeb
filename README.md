# AccessAssist - Accessible Complaint Management System

AccessAssist is a fully accessible web application designed to help users create and track complaints to organizations. Built with comprehensive accessibility features to ensure usability for people with diverse disabilities and needs.

![Dashboard Screenshot](https://github.com/user-attachments/assets/23a0fe1d-1fc3-4c0f-bf2e-ff27fd7a06e2)

## Features

### Core Functionality
- **Complaint Creation**: Multi-step guided form with voice input support
- **Complaint Tracking**: Monitor progress with visual indicators and status updates  
- **Organization Management**: Admin interface for managing complaint recipients
- **Data Management**: Import/export functionality for backup and transfer

### Accessibility Features

#### For Blind / Visually Impaired Users
- ✅ **Voice Input/Output**: Speech recognition for all text inputs and text-to-speech announcements
- ✅ **Screen Reader Support**: Semantic HTML, ARIA roles/labels, alt text for images
- ✅ **Keyboard Navigation**: All features operable via keyboard with visible focus indicators
- ✅ **High Contrast & Scalable Text**: Multiple color themes and adjustable font sizes
- ✅ **Skip Links**: Allow screen readers to skip navigation content

#### For Deaf / Hard of Hearing Users  
- ✅ **Visual Alerts**: All notifications and status changes have visual indicators
- ✅ **Text Equivalents**: No reliance on sound for critical information
- ✅ **Captions**: All audio feedback has text equivalents

#### For Users with Cognitive or Mental Health Needs
- ✅ **Plain Language**: Simple, clear language (B1/B2 CEFR level)
- ✅ **Short Prompts**: Clear, concise instructions throughout
- ✅ **Progress Indicators**: Visual timeline for multi-step processes
- ✅ **Reduced Cognitive Load**: Consistent navigation and predictable layout
- ✅ **Reduced Motion**: Options to disable animations and transitions

#### For Mobility-Impaired Users
- ✅ **Voice Input**: Speech recognition available for all text inputs
- ✅ **Large Touch Targets**: Minimum 44px clickable areas  
- ✅ **Keyboard-Only Navigation**: Full functionality without mouse
- ✅ **No Time Limits**: Auto-save prevents data loss

#### For Users with Color Vision Deficiency
- ✅ **High Contrast**: WCAG 2.1 AA compliant contrast ratios (4.5:1)
- ✅ **Multiple Visual Cues**: Icons, textures, and labels alongside color
- ✅ **Color-Blind Themes**: Accessible color combinations

#### For Users with Photosensitivity/Seizure Risk
- ✅ **No Flashing Content**: No elements flash more than 3 times per second
- ✅ **Animation Controls**: Option to reduce or disable all animations

## Screenshots

### Dashboard
![Dashboard](https://github.com/user-attachments/assets/23a0fe1d-1fc3-4c0f-bf2e-ff27fd7a06e2)

### Complaint Creation Form
![Create Complaint Form](https://github.com/user-attachments/assets/72f06cc2-7906-421b-a55c-42163a17c804)

## Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Python 3 (for local development server)
- Node.js and npm (for running tests)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/markharrison/AccessWeb.git
   cd AccessWeb
   ```

2. **Install dependencies** (for testing)
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run serve
   # Or manually: python3 -m http.server 8000
   ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

### File Structure

```
AccessWeb/
├── index.html              # Dashboard/homepage
├── create-complaint.html   # Complaint creation form
├── track-complaints.html   # Complaint tracking interface  
├── admin.html             # Organization management
├── assets/
│   ├── css/
│   │   └── styles.css     # Comprehensive accessible styles
│   └── js/
│       ├── main.js            # Core application logic
│       ├── accessibility.js   # Accessibility features
│       ├── create-complaint.js # Form wizard functionality
│       ├── track-complaints.js # Tracking interface
│       └── admin.js           # Admin features
├── tests/
│   └── accessibility.test.js # Playwright accessibility tests
├── package.json
├── playwright.config.js
└── README.md
```

## Usage

### Creating a Complaint

1. **Navigate to Dashboard**: Visit the main page
2. **Select "Create Complaint"**: Click the card or use keyboard navigation
3. **Follow the 4-Step Process**:
   - Step 1: Select the organization to complain about
   - Step 2: Provide your contact details
   - Step 3: Describe your complaint and desired outcome
   - Step 4: Review and submit

### Voice Input
- Click the 🎤 microphone button next to any text field
- Speak clearly when the indicator shows listening
- Voice input will automatically populate the field

### Tracking Complaints
- Visit the "Track Complaints" page
- Use filters to find specific complaints
- Click on any complaint to view detailed information
- Use action buttons to escalate or mark as resolved

### Accessibility Settings
- Click the "Settings" button in the top right
- Adjust text size, color theme, motion preferences
- Enable audio feedback for announcements
- Choose language and complexity level

## Testing

### Accessibility Testing

This project includes comprehensive accessibility tests using Playwright and axe-core:

```bash
# Run all accessibility tests
npm run test:accessibility

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests with UI (interactive)
npm run test:ui

# View test report
npm run report
```

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Use arrow keys for card navigation  
- [ ] Test keyboard shortcuts (Alt+S, Alt+P, Alt+N, Alt+T, Alt+H)
- [ ] Verify focus is visible and logical
- [ ] Test escape key for modal dismissal

#### Screen Reader Testing
- [ ] Test with NVDA, JAWS, or VoiceOver
- [ ] Verify all content is announced
- [ ] Check landmark navigation works
- [ ] Test form validation announcements
- [ ] Verify live region updates

#### Voice Input Testing  
- [ ] Test microphone buttons on all text inputs
- [ ] Verify speech recognition works
- [ ] Check visual feedback during recording
- [ ] Test error handling for unsupported browsers

#### Visual Testing
- [ ] Test all color themes (normal, high-contrast, dark)
- [ ] Verify text scaling works (normal, large, x-large) 
- [ ] Check color contrast meets WCAG standards
- [ ] Test with Windows High Contrast mode
- [ ] Verify no information is conveyed by color alone

## Technical Implementation

### Accessibility Standards Compliance
- **WCAG 2.1 AA**: Meets all Level A and AA success criteria
- **Section 508**: Compliant with US federal accessibility requirements
- **EN 301 549**: Meets European accessibility standard

### Technologies Used
- **Vanilla JavaScript**: No frameworks for maximum compatibility
- **HTML5**: Semantic elements and ARIA attributes
- **CSS3**: Custom properties, responsive design, accessibility features
- **Bootstrap 5**: CDN-based responsive framework with fallback styles
- **Local Storage**: Data persistence without server requirements

### Browser Compatibility
- Chrome 80+
- Firefox 75+  
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Features
- Lazy loading of content
- Minimal JavaScript bundle
- Optimized images and assets
- Offline-capable with service worker (future enhancement)

## Accessibility Implementation Details

### Form Accessibility
- All form controls have associated labels
- Error messages are linked to fields via `aria-describedby`
- Required fields are marked with `aria-required="true"`
- Invalid fields get `aria-invalid="true"` and visual indicators
- Form validation errors are announced to screen readers

### Navigation Accessibility  
- Skip links for keyboard users
- Logical heading hierarchy (h1 → h2 → h3)
- Landmark roles for page structure
- Breadcrumb navigation where appropriate
- Focus management for single-page interactions

### Dynamic Content
- ARIA live regions for status announcements
- Loading states communicated to assistive technology
- Progressive enhancement for JavaScript features
- Graceful degradation when features unavailable

### Color and Contrast
- Color contrast ratios exceed WCAG 2.1 AA standards (4.5:1)
- Information not conveyed by color alone
- High contrast theme available
- Support for Windows High Contrast mode
- Dark mode with appropriate contrast adjustments

## Contributing

### Accessibility Guidelines
When contributing to this project, please ensure:

1. **Test with assistive technology** (screen readers, voice recognition)
2. **Verify keyboard accessibility** for all new features
3. **Check color contrast** meets WCAG 2.1 AA standards  
4. **Use semantic HTML** and appropriate ARIA attributes
5. **Test with accessibility linters** (axe, WAVE)
6. **Include accessibility tests** for new functionality

### Code Standards
- Use semantic HTML elements
- Include alt text for images
- Provide ARIA labels for complex widgets
- Ensure logical focus order
- Test with reduced motion preferences
- Support high contrast mode

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built following [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/QuickRef/)
- Implements [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- Follows [Inclusive Design Principles](https://inclusivedesignprinciples.org/)
- Tested with [axe accessibility engine](https://www.deque.com/axe/)

## Support

For questions about accessibility features or to report accessibility issues, please [open an issue](https://github.com/markharrison/AccessWeb/issues) with the "accessibility" label.

---

*AccessAssist - Making complaint management accessible to everyone.*