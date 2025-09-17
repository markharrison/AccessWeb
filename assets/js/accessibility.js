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
            languageLevel: 'simple',
            voiceNavigationActive: false  // Add voice navigation state
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
        
        // Set longer timeout for voice input - allow up to 10 seconds for user to speak
        if ('webkitSpeechRecognition' in window) {
            // For Chrome/Webkit browsers, we can set a longer speech timeout
            this.navigationRecognition.serviceURI = null; // Use default service
        }

        // Add debouncing and loop prevention
        this.lastTranscript = '';
        this.lastCommandTime = 0;
        this.recognitionRetryCount = 0;
        this.maxRetryAttempts = 10; // Limit continuous retries
        this.recognitionActive = false;

        // Voice navigation commands
        this.voiceCommands = {
            'en': {
                'dashboard': ['dashboard', 'go to dashboard', 'home'],
                'create-complaint': ['create complaint', 'new complaint', 'write complaint'],
                'track-complaints': ['track complaints', 'view complaints', 'my complaints', 'view tracker', 'tracker', 'check tracker', 'open tracker'],
                'admin': ['admin', 'administration', 'admin panel'],
                'settings': ['settings', 'preferences', 'open settings', 'accessibility settings'],
                'help': ['help', 'voice commands', 'what can I say'],
                // Settings modal navigation commands
                'close-settings': ['close settings', 'close', 'cancel settings', 'exit settings'],
                'save-settings': ['save settings', 'save', 'save changes', 'apply'],
                'text-size-normal': ['normal text', 'normal size', 'text normal'],
                'text-size-large': ['large text', 'large size', 'text large', 'bigger text'],
                'text-size-xlarge': ['extra large text', 'very large text', 'largest text'],
                'theme-normal': ['normal theme', 'default theme', 'standard theme'],
                'theme-dark': ['dark theme', 'dark mode'],
                'theme-high-contrast': ['high contrast', 'contrast theme'],
                'enable-audio': ['enable audio', 'turn on audio', 'audio on'],
                'disable-audio': ['disable audio', 'turn off audio', 'audio off'],
                'language-english': ['english', 'english language'],
                'language-welsh': ['welsh', 'cymraeg', 'welsh language']
            },
            'cy': {
                'dashboard': ['dangosfwrdd', 'cartref'],
                'create-complaint': ['creu cwyn', 'cwyn newydd'],
                'track-complaints': ['tracio cwynion', 'fy nghwynion', 'gwylio traciwr', 'traciwr'],
                'admin': ['gweinyddu', 'panel gweinyddu'],
                'settings': ['gosodiadau', 'dewisiadau'],
                'help': ['cymorth', 'gorchmynion llais'],
                'close-settings': ['cau gosodiadau', 'cau'],
                'save-settings': ['cadw gosodiadau', 'cadw'],
                'language-english': ['saesneg'],
                'language-welsh': ['cymraeg']
            }
        };

        this.navigationRecognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
            const currentTime = Date.now();
            
            // Prevent duplicate/looping commands
            if (transcript === this.lastTranscript && (currentTime - this.lastCommandTime) < 2000) {
                console.log('Ignoring duplicate command:', transcript);
                this.restartRecognitionWithDelay();
                return;
            }
            
            // Ignore very short or empty transcripts
            if (transcript.length < 2) {
                console.log('Ignoring short transcript:', transcript);
                this.restartRecognitionWithDelay();
                return;
            }
            
            // Process the command
            this.lastTranscript = transcript;
            this.lastCommandTime = currentTime;
            this.recognitionRetryCount = 0; // Reset retry count on successful recognition
            
            console.log('Processing voice command:', transcript);
            this.handleVoiceNavigationCommand(transcript);
            
            // Restart listening with a brief delay to prevent loops
            this.restartRecognitionWithDelay();
        };

        this.navigationRecognition.onerror = (event) => {
            console.warn('Voice navigation error:', event.error);
            this.recognitionActive = false;
            
            if (event.error === 'not-allowed') {
                this.announce('Voice navigation permission denied. Please enable microphone access.', 'assertive');
                // Stop trying completely on permission errors
                this.isVoiceNavigationActive = false;
                // Persist the stopped state
                this.settings.voiceNavigationActive = false;
                this.saveSettings();
                // Reset the button state
                const voiceButton = document.getElementById('voice-nav-btn');
                if (voiceButton) {
                    this.stopVoiceNavigation(voiceButton);
                }
                return; // Don't retry on permission errors
            } 
            
            // Limit retry attempts to prevent infinite loops
            if (this.recognitionRetryCount >= this.maxRetryAttempts) {
                console.warn('Maximum retry attempts reached. Pausing voice recognition.');
                this.announce('Voice recognition paused. Click the voice navigation button to restart.', 'polite');
                return;
            }
            
            this.recognitionRetryCount++;
            
            if (event.error === 'no-speech' || event.error === 'audio-capture') {
                // Wait longer on no-speech to give user time
                if (this.isVoiceNavigationActive) {
                    setTimeout(() => {
                        this.startVoiceRecognition();
                    }, 3000); // Increased delay
                }
            } else if (event.error === 'network') {
                // Network errors - wait even longer before retrying
                if (this.isVoiceNavigationActive) {
                    setTimeout(() => {
                        this.startVoiceRecognition();
                    }, 5000);
                }
            } else {
                // Other errors - moderate delay
                if (this.isVoiceNavigationActive) {
                    setTimeout(() => {
                        this.startVoiceRecognition();
                    }, 2000);
                }
            }
        };

        this.navigationRecognition.onend = () => {
            this.recognitionActive = false;
            
            // Only restart if voice navigation is still active and we haven't hit retry limit
            if (this.isVoiceNavigationActive && this.recognitionRetryCount < this.maxRetryAttempts) {
                this.restartRecognitionWithDelay();
            }
        };
    }

    addVoiceNavigationButton() {
        // Add voice navigation button to the header (top left)
        const headerContainer = document.querySelector('header .container .row .col-auto');
        if (!headerContainer) return;

        // Create voice navigation button in the header
        const voiceNavButton = document.createElement('button');
        voiceNavButton.type = 'button';
        voiceNavButton.className = 'btn btn-outline-light btn-sm';
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

        // Restore voice navigation state from localStorage
        if (this.settings.voiceNavigationActive) {
            // Delay restoration to ensure page is fully loaded
            setTimeout(() => {
                this.startVoiceNavigation(voiceNavButton);
            }, 1000);
        }

        headerContainer.appendChild(voiceNavButton);

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

        button.classList.remove('btn-outline-light');
        button.classList.add('btn-danger');
        button.innerHTML = '<span aria-hidden="true">⏹️</span> Stop Voice';
        button.setAttribute('aria-label', 'Stop voice navigation');
        
        this.isVoiceNavigationActive = true;
        
        // Persist voice navigation state
        this.settings.voiceNavigationActive = true;
        this.saveSettings();
        
        // Reset loop prevention counters
        this.recognitionRetryCount = 0;
        this.lastTranscript = '';
        this.lastCommandTime = 0;
        
        // Start the recognition with better error handling
        this.startVoiceRecognition();
        // Remove verbose announcements - just start silently
        
        // Show voice help if Settings is visible
        setTimeout(() => {
            const settingsVisible = document.getElementById('voice-commands-help');
            if (settingsVisible) {
                this.showSettingsVoiceHelp();
            }
        }, 1000);
    }

    stopVoiceNavigation(button) {
        if (!this.navigationRecognition) return;

        button.classList.remove('btn-danger');
        button.classList.add('btn-outline-light');
        button.innerHTML = '<span aria-hidden="true">🎙️</span> Voice Navigation';
        button.setAttribute('aria-label', 'Start voice navigation');
        
        this.isVoiceNavigationActive = false;
        this.recognitionActive = false;
        
        // Persist voice navigation state (off)
        this.settings.voiceNavigationActive = false;
        this.saveSettings();
        
        // Reset counters
        this.recognitionRetryCount = 0;
        this.lastTranscript = '';
        this.lastCommandTime = 0;
        
        // Stop the recognition
        try {
            this.navigationRecognition.stop();
        } catch (e) {
            // Ignore errors from stopping
        }
        
        // Hide voice help
        this.hideSettingsVoiceHelp();
        
        // Remove verbose announcements - just stop silently
    }

    startVoiceRecognition() {
        if (!this.isVoiceNavigationActive || !this.navigationRecognition || this.recognitionActive) return;
        
        try {
            this.recognitionActive = true;
            this.navigationRecognition.start();
        } catch (e) {
            // If recognition is already running, ignore the error
            this.recognitionActive = false;
            if (e.name !== 'InvalidStateError') {
                console.warn('Voice recognition start error:', e);
            }
        }
    }

    restartRecognitionWithDelay() {
        if (!this.isVoiceNavigationActive) return;
        
        // Use progressive delay based on retry count to prevent loops
        const delay = Math.min(1000 + (this.recognitionRetryCount * 500), 5000);
        
        setTimeout(() => {
            if (this.isVoiceNavigationActive && !this.recognitionActive) {
                this.startVoiceRecognition();
            }
        }, delay);
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
                // Show voice help after settings opens
                setTimeout(() => {
                    this.showSettingsVoiceHelp();
                }, 500);
                break;
                
            case 'help':
                window.location.href = 'help.html';
                break;

            // Settings modal commands
            case 'close-settings':
                this.closeSettingsModal();
                break;
                
            case 'save-settings':
                this.saveSettingsFromVoice();
                break;
                
            case 'text-size-normal':
                this.setTextSize('normal');
                break;
                
            case 'text-size-large':
                this.setTextSize('large');
                break;
                
            case 'text-size-xlarge':
                this.setTextSize('x-large');
                break;
                
            case 'theme-normal':
                this.setTheme('normal');
                break;
                
            case 'theme-dark':
                this.setTheme('dark');
                break;
                
            case 'theme-high-contrast':
                this.setTheme('high-contrast');
                break;
                
            case 'enable-audio':
                this.setAudioFeedback(true);
                break;
                
            case 'disable-audio':
                this.setAudioFeedback(false);
                break;
                
            case 'language-english':
                this.setLanguage('en');
                break;
                
            case 'language-welsh':
                this.setLanguage('cy');
                break;
                
            default:
                this.announce('Command not recognized', 'polite');
        }
    }

    announceVoiceCommands() {
        const commands = this.voiceCommands[this.settings.language] || this.voiceCommands['en'];
        const isSettingsOpen = document.querySelector('#settingsModal.show') !== null || 
                              document.querySelector('#settingsModal[style*="display: block"]') !== null ||
                              document.querySelector('#voice-commands-help');
        
        if (isSettingsOpen) {
            const settingsCommands = [
                'Settings voice commands: Save Settings, Close Settings, Normal Text, Large Text, Dark Theme, High Contrast, Enable Audio, Disable Audio, English, Welsh.'
            ];
            this.announce(settingsCommands[0], 'polite');
            if (this.settings.audioFeedback) {
                setTimeout(() => this.speak(settingsCommands[0]), 100);
            }
            // Show visual help in Settings
            this.showSettingsVoiceHelp();
        } else {
            const commandList = [
                'Voice commands: Dashboard, Create Complaint, Track Complaints or View Tracker, Admin, Settings, Help. Press Ctrl+Shift+V to toggle voice navigation.'
            ];
            this.announce(commandList[0], 'polite');
            if (this.settings.audioFeedback) {
                setTimeout(() => this.speak(commandList[0]), 100);
            }
        }
    }

    showSettingsVoiceHelp() {
        const helpSection = document.getElementById('voice-commands-help');
        if (helpSection && this.isVoiceNavigationActive) {
            helpSection.style.display = 'block';
            helpSection.setAttribute('aria-live', 'polite');
            helpSection.innerHTML = `
                <h6 class="alert-heading">🎙️ Voice Commands Available (Voice Navigation Active)</h6>
                <div class="row">
                    <div class="col-md-6">
                        <strong>Text Size:</strong><br>
                        • "Normal Text"<br>
                        • "Large Text"<br>
                        • "Extra Large Text"
                    </div>
                    <div class="col-md-6">
                        <strong>Themes:</strong><br>
                        • "Normal Theme"<br>
                        • "Dark Theme"<br>
                        • "High Contrast"
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-md-6">
                        <strong>Audio:</strong><br>
                        • "Enable Audio"<br>
                        • "Disable Audio"
                    </div>
                    <div class="col-md-6">
                        <strong>Actions:</strong><br>
                        • "Save Settings"<br>
                        • "Close Settings"
                    </div>
                </div>
                <div class="mt-2">
                    <small class="text-muted">💡 Just speak these commands naturally - no button clicks needed!</small>
                </div>
            `;
        }
    }

    hideSettingsVoiceHelp() {
        const helpSection = document.getElementById('voice-commands-help');
        if (helpSection) {
            helpSection.style.display = 'none';
        }
    }

    closeSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
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
                this.announce('Settings closed', 'polite');
                this.showTemporaryFeedback('✓ Settings closed');
                this.hideSettingsVoiceHelp();
            } catch (error) {
                console.warn('Error closing settings modal:', error);
            }
        }
    }

    saveSettingsFromVoice() {
        const saveButton = document.getElementById('save-settings');
        if (saveButton) {
            saveButton.click();
            this.announce('Settings saved', 'polite');
            this.showTemporaryFeedback('✓ Settings saved successfully');
        }
    }

    setTextSize(size) {
        const fontSizeSelect = document.getElementById('font-size');
        if (fontSizeSelect) {
            fontSizeSelect.value = size;
            this.settings.fontSize = size;
            this.announce(`Text size set to ${size}`, 'polite');
            this.showTemporaryFeedback(`✓ Text size changed to ${size}`);
        }
    }

    setTheme(theme) {
        const themeSelect = document.getElementById('contrast-theme');
        if (themeSelect) {
            themeSelect.value = theme;
            this.settings.theme = theme;
            this.announce(`Theme set to ${theme.replace('-', ' ')}`, 'polite');
            this.showTemporaryFeedback(`✓ Theme changed to ${theme.replace('-', ' ')}`);
        }
    }

    setAudioFeedback(enabled) {
        const audioCheckbox = document.getElementById('audio-feedback');
        if (audioCheckbox) {
            audioCheckbox.checked = enabled;
            this.settings.audioFeedback = enabled;
            this.announce(`Audio feedback ${enabled ? 'enabled' : 'disabled'}`, 'polite');
            this.showTemporaryFeedback(`✓ Audio feedback ${enabled ? 'enabled' : 'disabled'}`);
        }
    }

    setLanguage(lang) {
        const languageSelect = document.getElementById('language');
        if (languageSelect) {
            languageSelect.value = lang;
            this.settings.language = lang;
            // Update voice recognition language
            if (this.navigationRecognition) {
                this.navigationRecognition.lang = lang === 'cy' ? 'cy-GB' : 'en-GB';
            }
            const langName = lang === 'cy' ? 'Welsh' : 'English';
            this.announce(`Language set to ${langName}`, 'polite');
            this.showTemporaryFeedback(`✓ Language changed to ${langName}`);
        }
    }

    showTemporaryFeedback(message) {
        // Create or update a temporary feedback element
        let feedbackEl = document.getElementById('voice-feedback');
        if (!feedbackEl) {
            feedbackEl = document.createElement('div');
            feedbackEl.id = 'voice-feedback';
            feedbackEl.className = 'alert alert-success position-fixed';
            feedbackEl.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 250px;';
            document.body.appendChild(feedbackEl);
        }
        
        feedbackEl.innerHTML = `<strong>${message}</strong>`;
        feedbackEl.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            if (feedbackEl && feedbackEl.parentElement) {
                feedbackEl.style.display = 'none';
            }
        }, 3000);
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