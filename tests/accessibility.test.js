// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

/**
 * AccessAssist Accessibility Tests
 * Comprehensive testing for WCAG 2.1 AA compliance and accessibility features
 */

test.describe('AccessAssist Accessibility Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start local server if not already running
    await page.goto('http://localhost:8000/');
  });

  test('Dashboard page passes accessibility scan', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Create complaint page passes accessibility scan', async ({ page }) => {
    await page.goto('http://localhost:8000/create-complaint.html');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Track complaints page passes accessibility scan', async ({ page }) => {
    await page.goto('http://localhost:8000/track-complaints.html');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Admin page passes accessibility scan', async ({ page }) => {
    await page.goto('http://localhost:8000/admin.html');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Keyboard navigation works on dashboard', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    
    // Test skip link
    await page.keyboard.press('Tab');
    const skipLink = page.getByText('Skip to main content');
    await expect(skipLink).toBeFocused();
    
    // Navigate through main cards
    await page.keyboard.press('Tab'); // Settings button
    await page.keyboard.press('Tab'); // Navigation toggle
    await page.keyboard.press('Tab'); // First nav link
    
    // Test main content navigation
    await skipLink.click();
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();
  });

  test('Form validation provides accessible error messages', async ({ page }) => {
    await page.goto('http://localhost:8000/create-complaint.html');
    
    // Try to proceed without selecting organization
    await page.getByRole('button', { name: 'Next: Your Details' }).click();
    
    // Check that error is announced
    const orgSelect = page.getByLabel('Organization *');
    await expect(orgSelect).toHaveAttribute('aria-invalid', 'true');
    
    // Check for error message
    const errorMessage = page.locator('.invalid-feedback').first();
    await expect(errorMessage).toBeVisible();
  });

  test('Multi-step form maintains focus management', async ({ page }) => {
    await page.goto('http://localhost:8000/create-complaint.html');
    
    // Select an organization
    await page.getByLabel('Organization *').selectOption('techmart');
    
    // Proceed to next step
    await page.getByRole('button', { name: 'Next: Your Details' }).click();
    
    // Check that focus moves to first input of new step
    const fullNameInput = page.getByLabel('Full Name *');
    await expect(fullNameInput).toBeFocused();
    
    // Check progress indicator is updated
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '2');
  });

  test('Voice navigation button is present and functional', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    
    // Check that voice navigation button is present
    const voiceNavButton = page.getByRole('button', { name: 'Start voice navigation' });
    await expect(voiceNavButton).toBeVisible();
    await expect(voiceNavButton).toHaveAttribute('aria-label', 'Start voice navigation');
    await expect(voiceNavButton).toHaveAttribute('title', /Click to start voice navigation/);
    
    // Test clicking the button changes state
    await voiceNavButton.click();
    
    // Button should change to stop state
    const stopButton = page.getByRole('button', { name: 'Stop voice navigation' });
    await expect(stopButton).toBeVisible();
    await expect(stopButton).toHaveAttribute('aria-label', 'Stop voice navigation');
  });

  test('Voice navigation keyboard shortcut works', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    
    // Test Ctrl+Shift+V shortcut
    await page.keyboard.press('Control+Shift+V');
    
    // Should activate voice navigation
    const stopButton = page.getByRole('button', { name: 'Stop voice navigation' });
    await expect(stopButton).toBeVisible();
  });

  test('Voice navigation button appears on all pages', async ({ page }) => {
    const pages = ['/', '/create-complaint.html', '/track-complaints.html', '/admin.html'];
    
    for (const pagePath of pages) {
      await page.goto(`http://localhost:8000${pagePath}`);
      
      const voiceNavButton = page.locator('#voice-nav-btn');
      await expect(voiceNavButton).toBeVisible();
      await expect(voiceNavButton).toContainText('Voice Navigation');
    }
  });

  test('Voice input buttons are added to form fields', async ({ page }) => {
    await page.goto('http://localhost:8000/create-complaint.html');
    
    // Check for voice input buttons on text inputs
    const voiceButtons = page.locator('.voice-btn');
    const count = await voiceButtons.count();
    
    // Should have voice buttons for all text inputs and textareas
    expect(count).toBeGreaterThan(5); // Multiple form fields have voice input
    
    // Check each button has proper attributes
    for (let i = 0; i < count; i++) {
      const button = voiceButtons.nth(i);
      await expect(button).toHaveAttribute('aria-label', 'Start voice input');
      await expect(button).toHaveAttribute('title', 'Click to use voice input');
    }
  });

  test('Settings modal is accessible', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    
    // Open settings modal
    await page.getByRole('button', { name: 'Open accessibility settings' }).click();
    
    // Check modal accessibility
    const modal = page.locator('#settingsModal');
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute('aria-labelledby', 'settingsModalLabel');
    
    // Check that focus is trapped in modal
    const firstFocusable = modal.locator('select, input').first();
    await expect(firstFocusable).toBeFocused();
    
    // Test keyboard navigation within modal
    await page.keyboard.press('Tab');
    const secondFocusable = modal.locator('select, input').nth(1);
    await expect(secondFocusable).toBeFocused();
  });

  test('Live regions announce status changes', async ({ page }) => {
    await page.goto('http://localhost:8000/create-complaint.html');
    
    // Check that announcement region exists
    const announcements = page.locator('#announcements');
    await expect(announcements).toHaveAttribute('aria-live', 'polite');
    await expect(announcements).toHaveAttribute('aria-atomic', 'true');
    
    // Select organization and check for status update
    await page.getByLabel('Organization *').selectOption('techmart');
    
    // Wait for potential announcement (content may be dynamically added)
    await page.waitForTimeout(500);
  });

  test('High contrast mode can be enabled', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    
    // Open settings
    await page.getByRole('button', { name: 'Open accessibility settings' }).click();
    
    // Enable high contrast
    await page.getByLabel('Color Theme').selectOption('high-contrast');
    await page.getByRole('button', { name: 'Save Settings' }).click();
    
    // Wait for settings to apply
    await page.waitForTimeout(500);
    
    // Check that theme is applied
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'high-contrast');
  });

  test('Reduced motion setting works', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    
    // Open settings
    await page.getByRole('button', { name: 'Open accessibility settings' }).click();
    
    // Enable reduced motion
    await page.getByLabel('Reduce animations and motion').check();
    await page.getByRole('button', { name: 'Save Settings' }).click();
    
    // Check that reduced motion styles are applied
    const animationDuration = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--animation-duration');
    });
    
    expect(animationDuration).toBe('0.01ms');
  });

  test('Organization details display when selected', async ({ page }) => {
    await page.goto('http://localhost:8000/create-complaint.html');
    
    // Initially details should be hidden
    const orgDetails = page.locator('#organization-details');
    await expect(orgDetails).toHaveClass(/d-none/);
    
    // Select organization
    await page.getByLabel('Organization *').selectOption('techmart');
    
    // Details should now be visible
    await expect(orgDetails).not.toHaveClass(/d-none/);
    await expect(orgDetails).toContainText('TechMart Electronics');
    await expect(orgDetails).toContainText('30 days');
  });

  test('Form auto-save works', async ({ page }) => {
    await page.goto('http://localhost:8000/create-complaint.html');
    
    // Fill some form data
    await page.getByLabel('Organization *').selectOption('techmart');
    await page.getByRole('button', { name: 'Next: Your Details' }).click();
    
    await page.getByLabel('Full Name *').fill('Test User');
    await page.getByLabel('Email Address *').fill('test@example.com');
    
    // Wait for auto-save
    await page.waitForTimeout(1000);
    
    // Check that data is saved to localStorage
    const savedData = await page.evaluate(() => {
      return localStorage.getItem('complaint-form-draft');
    });
    
    expect(savedData).toBeTruthy();
    const parsedData = JSON.parse(savedData);
    expect(parsedData['full-name']).toBe('Test User');
    expect(parsedData.email).toBe('test@example.com');
  });

  test('Color contrast meets WCAG standards', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    
    // Run axe with color contrast checks
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('All images have alt text or are decorative', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    
    // Run axe with image checks
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.images'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Page has proper heading structure', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    
    // Check heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText('AccessAssist');
    
    // Check that h2 follows h1
    const h2 = page.locator('h2').first();
    await expect(h2).toBeVisible();
  });

  test('Language is properly declared', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('Complaint tracking page filters work accessibly', async ({ page }) => {
    await page.goto('http://localhost:8000/track-complaints.html');
    
    // Check that search has proper label
    const searchInput = page.getByLabel('Search Complaints');
    await expect(searchInput).toBeVisible();
    
    // Check that filters have labels
    const statusFilter = page.getByLabel('Status');
    await expect(statusFilter).toBeVisible();
    
    const orgFilter = page.getByLabel('Organization');
    await expect(orgFilter).toBeVisible();
  });

  test('Admin page organization management is accessible', async ({ page }) => {
    await page.goto('http://localhost:8000/admin.html');
    
    // Check tabs are accessible
    const tabs = page.locator('[role="tab"]');
    const firstTab = tabs.first();
    await expect(firstTab).toHaveAttribute('aria-selected', 'true');
    
    // Check add organization button
    const addButton = page.getByRole('button', { name: /Add Organization/ });
    await expect(addButton).toBeVisible();
  });
});

test.describe('Keyboard Navigation Tests', () => {
  
  test('All interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    
    let tabCount = 0;
    const maxTabs = 20; // Prevent infinite loop
    
    // Tab through all focusable elements
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;
      
      const focusedElement = page.locator(':focus');
      const tagName = await focusedElement.evaluate(el => el.tagName);
      
      // Check that focused element is interactive
      expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(tagName)).toBeTruthy();
    }
  });

  test('Keyboard shortcuts work', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    
    // Test Alt+S for skip link
    await page.keyboard.press('Alt+s');
    const skipLink = page.getByText('Skip to main content');
    await expect(skipLink).toBeFocused();
    
    // Test Alt+P for settings
    await page.keyboard.press('Alt+p');
    const settingsModal = page.locator('#settingsModal');
    await expect(settingsModal).toBeVisible();
  });
});

test.describe('Screen Reader Support Tests', () => {
  
  test('ARIA landmarks are present', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    
    // Check for main landmarks
    await expect(page.locator('[role="banner"]')).toBeVisible();
    await expect(page.locator('[role="navigation"]')).toBeVisible();
    await expect(page.locator('[role="main"]')).toBeVisible();
    await expect(page.locator('[role="contentinfo"]')).toBeVisible();
  });

  test('Form labels are properly associated', async ({ page }) => {
    await page.goto('http://localhost:8000/create-complaint.html');
    
    // Check that all form controls have labels
    const formControls = page.locator('input, select, textarea');
    const count = await formControls.count();
    
    for (let i = 0; i < count; i++) {
      const control = formControls.nth(i);
      const id = await control.getAttribute('id');
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });

  test('Status messages are announced', async ({ page }) => {
    await page.goto('http://localhost:8000/track-complaints.html');
    
    // Check for success message handling
    await page.goto('http://localhost:8000/track-complaints.html?success=true');
    
    const successMessage = page.locator('#success-message');
    await expect(successMessage).toHaveAttribute('role', 'alert');
    await expect(successMessage).toHaveAttribute('aria-live', 'assertive');
  });
});