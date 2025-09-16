/**
 * AccessAssist - Accessibility Features Module
 * Provides comprehensive accessibility features including voice input/output,
 * screen reader support, keyboard navigation, and customizable preferences.
 */

class AccessibilityManager {
    constructor() {
        this.settings = this.loadSettings();
        this.voiceEnabled = false;
        this.speechRecognition = null;
        this.speechSynthesis = window.speechSynthesis;
        this.announcements = document.getElementById('announcements');
        
        this.init();
    }

    init() {
        this.applySettings();
        this.setupVoiceSupport();
        this.setupKeyboardNavigation();
        this.setupLiveRegions();
        this.setupSettingsModal();
        this.setupFocusManagement();
        
        // Announce page load
        this.announce('Page loaded. AccessAssist dashboard ready.');
    }

    loadSettings() {
        const defaultSettings = {
            fontSize: 'normal',
            theme: 'normal',
            reducedMotion: false,
            audioFeedback: false,
            language: 'en',
            languageLevel: 'simple'
        };

        try {
            const saved = localStorage.getItem('accessibility-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.warn('Error loading accessibility settings:', error);
            return defaultSettings;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('accessibility-settings', JSON.stringify(this.settings));
            this.announce('Settings saved successfully');
        } catch (error) {
            console.error('Error saving accessibility settings:', error);
            this.announce('Error saving settings. Please try again.');
        }
    }

    applySettings() {
        const { fontSize, theme, reducedMotion, language, languageLevel } = this.settings;
        
        // Apply font size
        document.documentElement.setAttribute('data-font-size', fontSize);
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', theme);
        
        // Apply language
        document.documentElement.setAttribute('lang', language);
        document.documentElement.setAttribute('data-language', language);
        
        // Apply language level
        document.documentElement.setAttribute('data-language-level', languageLevel);
        
        // Apply reduced motion
        if (reducedMotion) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms');
            document.documentElement.style.setProperty('--transition-duration', '0.01ms');
        } else {
            document.documentElement.style.removeProperty('--animation-duration');
            document.documentElement.style.removeProperty('--transition-duration');
        }

        // Apply language-specific content
        this.applyLanguageContent();
        
        // Apply complexity level content
        this.applyComplexityLevel();

        // Update form controls
        this.updateSettingsForm();
    }

    updateSettingsForm() {
        const form = document.getElementById('accessibility-settings');
        if (!form) return;

        Object.entries(this.settings).forEach(([key, value]) => {
            const element = form.querySelector(`#${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });
    }

    applyLanguageContent() {
        const language = this.settings.language;
        
        if (language === 'cy') {
            // Welsh translations for key UI elements
            const translations = {
                'AccessAssist': 'CymorthCyrraedd',
                'Make Your Voice Heard': 'Gwnewch i\'ch Llais Gael ei Glywed',
                'Dashboard': 'Dangosfwrdd',
                'Create Complaint': 'Creu Cwyn',
                'Track Complaints': 'Tracio Cwynion', 
                'Admin': 'Gweinyddu',
                'Start New Complaint': 'Dechrau Cwyn Newydd',
                'Track Progress': 'Tracio Cynnydd',
                'Accessibility First': 'Hygyrchedd yn Gyntaf',
                'Settings': 'Gosodiadau',
                'Recent Complaints': 'Cwynion Diweddar',
                'No complaints yet.': 'Dim cwynion eto.',
                'Create your first complaint': 'Creu eich cwyn gyntaf',
                'to get started.': 'i ddechrau.',
                'Accessibility Settings': 'Gosodiadau Hygyrchedd',
                'Save Settings': 'Cadw Gosodiadau',
                'Cancel': 'Canslo'
            };

            // Apply basic translations
            this.applyTranslations(translations);
        }
    }

    applyTranslations(translations) {
        Object.keys(translations).forEach(englishText => {
            const welshText = translations[englishText];
            
            // Update headings and buttons
            const elements = document.querySelectorAll('h1, h2, h3, .nav-link, button, .card-title');
            elements.forEach(element => {
                if (element.textContent.trim() === englishText) {
                    element.textContent = welshText;
                }
            });
        });
        
        // Update page title
        if (document.title.includes('AccessAssist')) {
            document.title = document.title.replace('AccessAssist', 'CymorthCyrraedd');
        }
    }

    applyComplexityLevel() {
        const level = this.settings.languageLevel;
        
        // Define text complexity alternatives
        const complexityTexts = {
            'simple': {
                'AccessAssist helps you create professional complaint letters with AI assistance. Designed for everyone - voice input, real-time UK sign language recognition with hand tracking, screen reader support, and plain language guidance.': 
                'AccessAssist helps you write complaints easily. Works for everyone with voice input and screen reader support.',
                
                'Guided process with voice input and clear prompts': 
                'Easy steps with voice help',
                
                'Monitor deadlines and get escalation guidance': 
                'Check deadlines and get help',
                
                'Voice, text, real-time UK sign language recognition, high contrast, and screen reader support': 
                'Voice input, high contrast, and screen reader help'
            },
            'advanced': {
                'AccessAssist helps you create professional complaint letters with AI assistance. Designed for everyone - voice input, real-time UK sign language recognition with hand tracking, screen reader support, and plain language guidance.':
                'AccessAssist facilitates the composition of professional complaint correspondence through artificial intelligence assistance. Engineered with comprehensive accessibility considerations including voice input modalities, real-time UK sign language recognition with hand tracking technology, screen reader compatibility, and plain language guidance.',
                
                'Guided process with voice input and clear prompts':
                'Comprehensive guided methodology incorporating voice input capabilities and explicit user prompts',
                
                'Monitor deadlines and get escalation guidance':
                'Monitor temporal deadlines and receive escalation guidance protocols'
            }
        };

        // Apply complexity level text
        if (complexityTexts[level]) {
            Object.keys(complexityTexts[level]).forEach(originalText => {
                const newText = complexityTexts[level][originalText];
                
                const elements = document.querySelectorAll('p, .card-text');
                elements.forEach(element => {
                    if (element.textContent.trim() === originalText) {
                        element.textContent = newText;
                    }
                });
            });
        }
    }

    setupSettingsModal() {
        const saveButton = document.getElementById('save-settings');
        const form = document.getElementById('accessibility-settings');
        const settingsButton = document.getElementById('settings-btn');
        const modal = document.getElementById('settingsModal');

        if (saveButton && form) {
            saveButton.addEventListener('click', () => {
                const formData = new FormData(form);
                
                // Update settings from form
                this.settings.fontSize = document.getElementById('font-size').value;
                this.settings.theme = document.getElementById('contrast-theme').value;
                this.settings.reducedMotion = document.getElementById('reduced-motion').checked;
                this.settings.audioFeedback = document.getElementById('audio-feedback').checked;
                this.settings.language = document.getElementById('language').value;
                this.settings.languageLevel = document.getElementById('language-level').value;

                this.saveSettings();
                this.applySettings();

                // Close modal
                try {
                    if (typeof bootstrap !== 'undefined') {
                        const modalInstance = bootstrap.Modal.getInstance(modal);
                        if (modalInstance) {
                            modalInstance.hide();
                        }
                    } else {
                        // Fallback when Bootstrap JS is not available
                        modal.style.display = 'none';
                        modal.classList.remove('show');
                        document.body.classList.remove('modal-open');
                        const backdrop = document.querySelector('.modal-backdrop');
                        if (backdrop) backdrop.remove();
                    }
                } catch (error) {
                    console.warn('Bootstrap modal not available, using fallback');
                    modal.style.display = 'none';
                }
            });
        }

        // Setup settings button click
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                this.updateSettingsForm();
            });
        }
    }

    setupVoiceSupport() {
        // Check for speech recognition support
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.speechRecognition = new SpeechRecognition();
            
            this.speechRecognition.continuous = false;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = this.settings.language === 'cy' ? 'cy-GB' : 'en-GB';

            this.voiceEnabled = true;
            this.addVoiceInputButtons();
            this.setupVoiceNavigationCommands();
            this.addVoiceNavigationButton();
        }
    }

    addVoiceInputButtons() {
        // Add voice input buttons to text inputs, email inputs and textareas
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="search"], textarea');
        
        inputs.forEach(input => {
            if (input.dataset.voiceAdded) return;
            
            const voiceButton = document.createElement('button');
            voiceButton.type = 'button';
            voiceButton.className = 'btn btn-outline-secondary btn-sm voice-btn';
            voiceButton.innerHTML = '<span aria-hidden="true">🎤</span>';
            voiceButton.setAttribute('aria-label', 'Start voice input');
            voiceButton.setAttribute('title', 'Click to use voice input');
            
            // Create wrapper for positioning
            const wrapper = document.createElement('div');
            wrapper.className = 'position-relative';
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            wrapper.appendChild(voiceButton);
            
            voiceButton.style.position = 'absolute';
            voiceButton.style.right = '8px';
            voiceButton.style.top = '50%';
            voiceButton.style.transform = 'translateY(-50%)';
            voiceButton.style.zIndex = '5';
            
            voiceButton.addEventListener('click', () => {
                this.startVoiceInput(input);
            });
            
            input.dataset.voiceAdded = 'true';
        });
    }

    startVoiceInput(targetInput) {
        if (!this.speechRecognition) {
            this.announce('Voice input not supported in this browser');
            return;
        }

        const voiceButton = targetInput.parentNode.querySelector('.voice-btn');
        
        this.speechRecognition.onstart = () => {
            voiceButton.classList.add('btn-danger');
            voiceButton.innerHTML = '<span aria-hidden="true">⏹️</span>';
            voiceButton.setAttribute('aria-label', 'Stop voice input');
            targetInput.classList.add('voice-indicator', 'listening');
            this.announce('Voice input started. Please speak now.');
        };

        this.speechRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            targetInput.value = transcript;
            targetInput.dispatchEvent(new Event('input', { bubbles: true }));
            this.announce(`Voice input completed: ${transcript}`);
        };

        this.speechRecognition.onerror = (event) => {
            this.announce(`Voice input error: ${event.error}`);
        };

        this.speechRecognition.onend = () => {
            voiceButton.classList.remove('btn-danger');
            voiceButton.innerHTML = '<span aria-hidden="true">🎤</span>';
            voiceButton.setAttribute('aria-label', 'Start voice input');
            targetInput.classList.remove('voice-indicator', 'listening');
        };

        this.speechRecognition.start();
    }

    setupVoiceNavigationCommands() {
        // Create a separate speech recognition instance for navigation
        if (!this.voiceEnabled) return;

        const NavigationRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.navigationRecognition = new NavigationRecognition();
        
        this.navigationRecognition.continuous = false;
        this.navigationRecognition.interimResults = false;
        this.navigationRecognition.lang = this.settings.language === 'cy' ? 'cy-GB' : 'en-GB';
        this.navigationRecognition.maxAlternatives = 1;

        // Voice navigation commands
        this.voiceCommands = {
            'en': {
                'dashboard': ['dashboard', 'go to dashboard', 'home'],
                'create-complaint': ['create complaint', 'new complaint', 'write complaint'],
                'track-complaints': ['track complaints', 'view complaints', 'my complaints'],
                'admin': ['admin', 'administration', 'admin panel'],
                'settings': ['settings', 'preferences', 'open settings', 'accessibility settings'],
                'help': ['help', 'voice commands', 'what can I say']
            },
            'cy': {
                'dashboard': ['dangosfwrdd', 'cartref'],
                'create-complaint': ['creu cwyn', 'cwyn newydd'],
                'track-complaints': ['tracio cwynion', 'fy nghwynion'],
                'admin': ['gweinyddu', 'panel gweinyddu'],
                'settings': ['gosodiadau', 'dewisiadau'],
                'help': ['cymorth', 'gorchmynion llais']
            }
        };

        this.navigationRecognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
            this.handleVoiceNavigationCommand(transcript);
        };

        this.navigationRecognition.onerror = (event) => {
            console.warn('Voice navigation error:', event.error);
            if (event.error === 'not-allowed') {
                this.announce('Voice navigation permission denied. Please enable microphone access.', 'assertive');
            }
        };
    }

    addVoiceNavigationButton() {
        // Add voice navigation toggle to the navbar
        const navbar = document.querySelector('.navbar-nav');
        if (!navbar) return;

        // Create voice navigation button in the navbar
        const voiceNavItem = document.createElement('li');
        voiceNavItem.className = 'nav-item';
        
        const voiceNavButton = document.createElement('button');
        voiceNavButton.type = 'button';
        voiceNavButton.className = 'nav-link btn btn-link p-0';
        voiceNavButton.id = 'voice-nav-btn';
        voiceNavButton.innerHTML = '<span aria-hidden="true">🎙️</span> Voice Navigation';
        voiceNavButton.setAttribute('aria-label', 'Toggle voice navigation');
        voiceNavButton.setAttribute('title', 'Click to start voice navigation');

        this.isVoiceNavigationActive = false;

        voiceNavButton.addEventListener('click', () => {
            if (!this.isVoiceNavigationActive) {
                this.startVoiceNavigation(voiceNavButton);
            } else {
                this.stopVoiceNavigation(voiceNavButton);
            }
        });

        voiceNavItem.appendChild(voiceNavButton);
        
        // Insert before the last item (Help button)
        const helpItem = navbar.querySelector('#help-btn')?.parentElement;
        if (helpItem) {
            navbar.insertBefore(voiceNavItem, helpItem);
        } else {
            navbar.appendChild(voiceNavItem);
        }

        // Add keyboard shortcut for voice navigation (Ctrl+Shift+V)
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.shiftKey && event.key === 'V') {
                event.preventDefault();
                voiceNavButton.click();
            }
        });

        // Setup help button functionality
        const helpButton = document.getElementById('help-btn');
        if (helpButton) {
            helpButton.addEventListener('click', () => {
                this.announceVoiceCommands();
            });
        }
    }

    startVoiceNavigation(button) {
        if (!this.navigationRecognition) return;

        button.classList.add('text-danger');
        button.innerHTML = '<span aria-hidden="true">⏹️</span> Stop Voice';
        button.setAttribute('aria-label', 'Stop voice navigation');
        
        this.isVoiceNavigationActive = true;
        this.navigationRecognition.start();
        this.announce('Voice navigation started', 'polite');
    }

    stopVoiceNavigation(button) {
        if (!this.navigationRecognition) return;

        button.classList.remove('text-danger');
        button.innerHTML = '<span aria-hidden="true">🎙️</span> Voice Navigation';
        button.setAttribute('aria-label', 'Start voice navigation');
        
        this.isVoiceNavigationActive = false;
        this.navigationRecognition.stop();
        this.announce('Voice navigation stopped', 'polite');
    }

    handleVoiceNavigationCommand(transcript) {
        const commands = this.voiceCommands[this.settings.language] || this.voiceCommands['en'];
        
        // Find matching command
        let matchedAction = null;
        
        for (const [action, variations] of Object.entries(commands)) {
            for (const variation of variations) {
                if (transcript.includes(variation)) {
                    matchedAction = action;
                    break;
                }
            }
            if (matchedAction) break;
        }

        if (matchedAction) {
            this.executeVoiceNavigationAction(matchedAction, transcript);
        } else {
            // Try partial matches for better UX
            const partialMatches = this.findPartialMatches(transcript, commands);
            if (partialMatches.length > 0) {
                this.announce(`Did you mean: ${partialMatches.join(', ')}?`, 'polite');
            } else {
                this.announce('Command not recognized. Say "Help" for available commands.', 'polite');
            }
        }
    }

    findPartialMatches(transcript, commands) {
        const matches = [];
        for (const [action, variations] of Object.entries(commands)) {
            for (const variation of variations) {
                if (variation.includes(transcript) || transcript.includes(variation.split(' ')[0])) {
                    matches.push(variation);
                    break;
                }
            }
        }
        return matches.slice(0, 3); // Limit to 3 suggestions
    }

    executeVoiceNavigationAction(action, originalTranscript) {
        switch (action) {
            case 'dashboard':
                window.location.href = 'index.html';
                break;
                
            case 'create-complaint':
                window.location.href = 'create-complaint.html';
                break;
                
            case 'track-complaints':
                window.location.href = 'track-complaints.html';
                break;
                
            case 'admin':
                window.location.href = 'admin.html';
                break;
                
            case 'settings':
                const settingsBtn = document.getElementById('settings-btn');
                if (settingsBtn) {
                    settingsBtn.click();
                } else {
                    // Fallback for settings button in accessibility card
                    const altSettingsBtn = document.querySelector('button[data-bs-target="#settingsModal"]');
                    if (altSettingsBtn) {
                        altSettingsBtn.click();
                    }
                }
                break;
                
            case 'help':
                this.announceVoiceCommands();
                break;
                
            default:
                this.announce('Command not recognized', 'polite');
        }
    }

    announceVoiceCommands() {
        const commands = this.voiceCommands[this.settings.language] || this.voiceCommands['en'];
        const commandList = [
            'Voice commands: Dashboard, Create Complaint, Track Complaints, Admin, Settings, Help. Press Ctrl+Shift+V to toggle voice navigation.'
        ];
        
        this.announce(commandList[0], 'polite');
        
        // Also speak the commands if audio feedback is enabled
        if (this.settings.audioFeedback) {
            setTimeout(() => this.speak(commandList[0]), 100);
        }
    }

    speak(text) {
        if (!this.settings.audioFeedback || !this.speechSynthesis) return;

        // Cancel any ongoing speech
        this.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.settings.language === 'cy' ? 'cy-GB' : 'en-GB';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        this.speechSynthesis.speak(utterance);
    }

    announce(message, priority = 'polite') {
        if (!this.announcements) return;

        // Create announcement element
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', priority);
        announcement.textContent = message;
        
        this.announcements.appendChild(announcement);
        
        // Clean up after announcement
        setTimeout(() => {
            if (announcement.parentNode) {
                announcement.parentNode.removeChild(announcement);
            }
        }, 1000);

        // Also speak if audio feedback is enabled
        if (this.settings.audioFeedback) {
            setTimeout(() => this.speak(message), 100);
        }
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation support
        document.addEventListener('keydown', (event) => {
            // Skip links with Alt+S
            if (event.altKey && event.key === 's') {
                event.preventDefault();
                const skipLink = document.querySelector('.skip-to-content');
                if (skipLink) {
                    skipLink.focus();
                }
            }

            // Settings with Alt+P (Preferences)
            if (event.altKey && event.key === 'p') {
                event.preventDefault();
                const settingsBtn = document.getElementById('settings-btn');
                if (settingsBtn) {
                    settingsBtn.click();
                }
            }

            // Voice navigation help with Alt+H
            if (event.altKey && event.key === 'h') {
                event.preventDefault();
                this.announceVoiceCommands();
            }

            // Escape key handling for modals
            if (event.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    const modalInstance = bootstrap.Modal.getInstance(openModal);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                }
            }
        });

        // Enhanced focus management
        this.setupRovingTabIndex();
        this.setupFocusTrap();
    }

    setupRovingTabIndex() {
        // Implement roving tabindex for card grids
        const cardContainers = document.querySelectorAll('.row.g-4, .row.g-3');
        
        cardContainers.forEach(container => {
            const cards = container.querySelectorAll('.card a, .card button');
            if (cards.length === 0) return;

            let currentIndex = 0;
            
            // Set initial tabindex
            cards.forEach((card, index) => {
                card.setAttribute('tabindex', index === 0 ? '0' : '-1');
            });

            container.addEventListener('keydown', (event) => {
                if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
                    return;
                }

                event.preventDefault();
                
                const cols = getComputedStyle(container).getPropertyValue('grid-template-columns').split(' ').length || 3;
                
                let newIndex = currentIndex;
                
                switch (event.key) {
                    case 'ArrowRight':
                        newIndex = (currentIndex + 1) % cards.length;
                        break;
                    case 'ArrowLeft':
                        newIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
                        break;
                    case 'ArrowDown':
                        newIndex = Math.min(currentIndex + cols, cards.length - 1);
                        break;
                    case 'ArrowUp':
                        newIndex = Math.max(currentIndex - cols, 0);
                        break;
                    case 'Home':
                        newIndex = 0;
                        break;
                    case 'End':
                        newIndex = cards.length - 1;
                        break;
                }

                if (newIndex !== currentIndex) {
                    cards[currentIndex].setAttribute('tabindex', '-1');
                    cards[newIndex].setAttribute('tabindex', '0');
                    cards[newIndex].focus();
                    currentIndex = newIndex;
                }
            });
        });
    }

    setupFocusTrap() {
        // Focus trap for modals
        document.addEventListener('shown.bs.modal', (event) => {
            const modal = event.target;
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            firstElement.focus();

            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            });
        });
    }

    setupLiveRegions() {
        // Setup ARIA live regions for dynamic content updates
        this.setupFormValidation();
        this.setupLoadingStates();
    }

    setupFormValidation() {
        // Enhanced form validation with screen reader announcements
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                input.addEventListener('invalid', (event) => {
                    event.preventDefault();
                    const message = input.validationMessage || 'This field is required';
                    this.announce(`Error in ${input.labels?.[0]?.textContent || input.name}: ${message}`, 'assertive');
                    
                    // Add visual error state
                    input.classList.add('is-invalid');
                    
                    // Create or update error message
                    let errorElement = input.parentNode.querySelector('.invalid-feedback');
                    if (!errorElement) {
                        errorElement = document.createElement('div');
                        errorElement.className = 'invalid-feedback';
                        input.parentNode.appendChild(errorElement);
                    }
                    errorElement.textContent = message;
                });

                input.addEventListener('input', () => {
                    if (input.classList.contains('is-invalid') && input.checkValidity()) {
                        input.classList.remove('is-invalid');
                        const errorElement = input.parentNode.querySelector('.invalid-feedback');
                        if (errorElement) {
                            errorElement.remove();
                        }
                    }
                });
            });
        });
    }

    setupLoadingStates() {
        // Announce loading states for better UX
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList?.contains('loading')) {
                            this.announce('Loading content, please wait');
                        }
                        
                        const loadingElements = node.querySelectorAll?.('.loading');
                        if (loadingElements?.length > 0) {
                            this.announce('Loading content, please wait');
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupFocusManagement() {
        // Manage focus for single-page app navigation
        let lastFocusedElement = null;

        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href]');
            if (link && !link.href.includes('#')) {
                lastFocusedElement = document.activeElement;
            }
        });

        // Focus management for page changes
        window.addEventListener('pageshow', () => {
            // Focus main heading on page load
            const mainHeading = document.querySelector('h1, h2');
            if (mainHeading) {
                mainHeading.setAttribute('tabindex', '-1');
                mainHeading.focus();
            }
        });
    }

    // Utility methods for other modules
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification alert alert-${type} alert-dismissible fade`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto dismiss
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);

        // Announce notification
        this.announce(message, type === 'danger' ? 'assertive' : 'polite');
    }

    updateComplaintCount(count) {
        const countElement = document.getElementById('complaint-count');
        if (countElement) {
            countElement.textContent = count;
            this.announce(`Complaint count updated to ${count}`);
        }
    }
}

// Initialize accessibility manager when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.accessibilityManager = new AccessibilityManager();
    });
} else {
    window.accessibilityManager = new AccessibilityManager();
}