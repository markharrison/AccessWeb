/**
 * Create Complaint Page JavaScript
 * Handles the multi-step form for creating complaints with full accessibility support
 */

class ComplaintFormManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {};
        this.organizations = [];
        
        this.init();
    }

    init() {
        this.loadOrganizations();
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupProgressIndicator();
        
        // Announce form ready
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Complaint creation form loaded. Step 1 of 4: Select organization.');
        }
    }

    loadOrganizations() {
        // Get organizations from main app
        if (window.complaintManager) {
            this.organizations = window.complaintManager.organizations;
        } else {
            // Fallback if main app not loaded
            try {
                const saved = localStorage.getItem('organizations');
                this.organizations = saved ? JSON.parse(saved) : [];
            } catch (error) {
                console.error('Error loading organizations:', error);
                this.organizations = [];
            }
        }

        this.populateOrganizationDropdown();
    }

    populateOrganizationDropdown() {
        const select = document.getElementById('organization');
        if (!select) return;

        // Clear existing options except the first one
        select.innerHTML = '<option value="">Choose an organization...</option>';

        this.organizations.forEach(org => {
            const option = document.createElement('option');
            option.value = org.id;
            option.textContent = org.name;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        // Organization selection
        const orgSelect = document.getElementById('organization');
        if (orgSelect) {
            orgSelect.addEventListener('change', this.handleOrganizationSelection.bind(this));
        }

        // Navigation buttons
        document.getElementById('next-to-step-2')?.addEventListener('click', () => this.goToStep(2));
        document.getElementById('back-to-step-1')?.addEventListener('click', () => this.goToStep(1));
        document.getElementById('next-to-step-3')?.addEventListener('click', () => this.goToStep(3));
        document.getElementById('back-to-step-2')?.addEventListener('click', () => this.goToStep(2));
        document.getElementById('next-to-step-4')?.addEventListener('click', () => this.goToStep(4));
        document.getElementById('back-to-step-3')?.addEventListener('click', () => this.goToStep(3));

        // Form submission
        const form = document.getElementById('complaint-form');
        if (form) {
            form.addEventListener('submit', this.handleFormSubmission.bind(this));
        }

        // Auto-save form data
        this.setupAutoSave();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    handleOrganizationSelection(event) {
        const selectedId = event.target.value;
        const detailsContainer = document.getElementById('organization-details');
        const detailsContent = document.getElementById('org-details-content');

        if (!selectedId) {
            detailsContainer.classList.add('d-none');
            return;
        }

        const organization = this.organizations.find(org => org.id === selectedId);
        if (!organization) return;

        detailsContent.innerHTML = `
            <p><strong>Type:</strong> ${organization.type}</p>
            <p><strong>Contact Email:</strong> ${organization.contactEmail}</p>
            <p><strong>Typical Response Time:</strong> ${organization.responseTimedays} days</p>
            <p><strong>Escalation After:</strong> ${organization.escalationTimedays} days</p>
        `;

        detailsContainer.classList.remove('d-none');

        // Announce the selection
        if (window.accessibilityManager) {
            window.accessibilityManager.announce(`Selected ${organization.name}. Response time is typically ${organization.responseTimedays} days.`);
        }
    }

    setupFormValidation() {
        const form = document.getElementById('complaint-form');
        if (!form) return;

        // Custom validation messages
        const validationMessages = {
            'organization': 'Please select an organization to complain about',
            'full-name': 'Please enter your full name',
            'email': 'Please enter a valid email address',
            'phone': 'Please enter a valid phone number',
            'complaint-title': 'Please enter a title for your complaint',
            'complaint-description': 'Please describe your complaint in detail',
            'desired-outcome': 'Please explain what you would like them to do',
            'confirm-accuracy': 'Please confirm that your information is accurate'
        };

        // Set up validation for each field
        Object.keys(validationMessages).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field) return;

            field.addEventListener('invalid', (event) => {
                event.preventDefault();
                const message = validationMessages[fieldId] || field.validationMessage;
                this.showFieldError(field, message);
            });

            field.addEventListener('input', () => {
                this.clearFieldError(field);
            });

            // Custom validation for specific fields
            if (fieldId === 'email') {
                field.addEventListener('blur', () => {
                    if (field.value && !this.isValidEmail(field.value)) {
                        this.showFieldError(field, 'Please enter a valid email address');
                    }
                });
            }

            if (fieldId === 'phone') {
                field.addEventListener('blur', () => {
                    if (field.value && !this.isValidPhone(field.value)) {
                        this.showFieldError(field, 'Please enter a valid phone number');
                    }
                });
            }
        });
    }

    showFieldError(field, message) {
        field.classList.add('is-invalid');
        field.setAttribute('aria-invalid', 'true');

        let errorElement = field.parentNode.querySelector('.invalid-feedback');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            errorElement.setAttribute('role', 'alert');
            field.parentNode.appendChild(errorElement);
        }

        errorElement.textContent = message;

        // Announce error
        if (window.accessibilityManager) {
            const label = field.labels?.[0]?.textContent || field.name || 'Field';
            window.accessibilityManager.announce(`Error in ${label}: ${message}`, 'assertive');
        }
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid');
        field.removeAttribute('aria-invalid');

        const errorElement = field.parentNode.querySelector('.invalid-feedback');
        if (errorElement) {
            errorElement.remove();
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    setupProgressIndicator() {
        this.updateProgressIndicator();
    }

    updateProgressIndicator() {
        const progressBar = document.querySelector('.progress-indicator');
        if (!progressBar) return;

        progressBar.setAttribute('aria-valuenow', this.currentStep);
        
        const steps = progressBar.querySelectorAll('.progress-step');
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            
            step.classList.remove('current', 'completed');
            
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
                step.setAttribute('aria-label', `Step ${stepNumber}: Completed`);
            } else if (stepNumber === this.currentStep) {
                step.classList.add('current');
                step.setAttribute('aria-label', `Step ${stepNumber}: Current step`);
            } else {
                step.setAttribute('aria-label', `Step ${stepNumber}: Not started`);
            }
        });
    }

    goToStep(stepNumber) {
        if (stepNumber < 1 || stepNumber > this.totalSteps) return;
        
        // Validate current step before proceeding
        if (stepNumber > this.currentStep && !this.validateCurrentStep()) {
            return;
        }

        // Save current step data
        this.saveCurrentStepData();

        // Hide current step
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        if (currentStepElement) {
            currentStepElement.classList.add('d-none');
        }

        // Show new step
        const newStepElement = document.getElementById(`step-${stepNumber}`);
        if (newStepElement) {
            newStepElement.classList.remove('d-none');
            
            // Focus first input in new step
            const firstInput = newStepElement.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }

        this.currentStep = stepNumber;
        this.updateProgressIndicator();

        // Announce step change
        if (window.accessibilityManager) {
            const stepNames = ['', 'Select Organization', 'Your Details', 'Complaint Details', 'Review'];
            window.accessibilityManager.announce(`Step ${stepNumber} of ${this.totalSteps}: ${stepNames[stepNumber]}`);
        }

        // Special handling for review step
        if (stepNumber === 4) {
            this.populateReviewStep();
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    validateCurrentStep() {
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        if (!currentStepElement) return true;

        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.checkValidity()) {
                this.showFieldError(field, field.validationMessage);
                isValid = false;
            }
        });

        return isValid;
    }

    saveCurrentStepData() {
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        if (!currentStepElement) return;

        const fields = currentStepElement.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            if (field.type === 'checkbox') {
                this.formData[field.id] = field.checked;
            } else {
                this.formData[field.id] = field.value;
            }
        });

        // Save to localStorage for recovery
        try {
            localStorage.setItem('complaint-form-draft', JSON.stringify(this.formData));
        } catch (error) {
            console.warn('Could not save form draft:', error);
        }
    }

    populateReviewStep() {
        const reviewContent = document.getElementById('review-content');
        if (!reviewContent) return;

        const organization = this.organizations.find(org => org.id === this.formData.organization);
        
        reviewContent.innerHTML = `
            <div class="row g-3">
                <div class="col-md-6">
                    <h5 class="h6">Organization</h5>
                    <p class="mb-0">${organization?.name || 'Not selected'}</p>
                </div>
                <div class="col-md-6">
                    <h5 class="h6">Your Name</h5>
                    <p class="mb-0">${this.formData['full-name'] || 'Not provided'}</p>
                </div>
                <div class="col-md-6">
                    <h5 class="h6">Email</h5>
                    <p class="mb-0">${this.formData.email || 'Not provided'}</p>
                </div>
                <div class="col-md-6">
                    <h5 class="h6">Phone</h5>
                    <p class="mb-0">${this.formData.phone || 'Not provided'}</p>
                </div>
                <div class="col-12">
                    <h5 class="h6">Complaint Title</h5>
                    <p class="mb-0">${this.formData['complaint-title'] || 'Not provided'}</p>
                </div>
                <div class="col-12">
                    <h5 class="h6">Description</h5>
                    <p class="mb-0">${this.formData['complaint-description'] || 'Not provided'}</p>
                </div>
                <div class="col-12">
                    <h5 class="h6">Desired Outcome</h5>
                    <p class="mb-0">${this.formData['desired-outcome'] || 'Not provided'}</p>
                </div>
                ${this.formData['incident-date'] ? `
                <div class="col-md-6">
                    <h5 class="h6">Incident Date</h5>
                    <p class="mb-0">${this.formatDate(this.formData['incident-date'])}</p>
                </div>
                ` : ''}
                ${this.formData['reference-number'] ? `
                <div class="col-md-6">
                    <h5 class="h6">Reference Number</h5>
                    <p class="mb-0">${this.formData['reference-number']}</p>
                </div>
                ` : ''}
                ${this.formData['previous-contact'] ? `
                <div class="col-12">
                    <h5 class="h6">Previous Contact</h5>
                    <p class="mb-0">${this.formData['previous-contact']}</p>
                </div>
                ` : ''}
            </div>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.saveCurrentStepData();
        }, 30000);

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveCurrentStepData();
        });

        // Try to restore previous draft
        this.restoreDraft();
    }

    restoreDraft() {
        try {
            const draft = localStorage.getItem('complaint-form-draft');
            if (draft) {
                const draftData = JSON.parse(draft);
                
                // Ask user if they want to restore
                if (confirm('We found a saved draft of your complaint. Would you like to restore it?')) {
                    this.formData = draftData;
                    this.populateFormFromData();
                    
                    if (window.accessibilityManager) {
                        window.accessibilityManager.announce('Draft restored successfully');
                    }
                }
            }
        } catch (error) {
            console.warn('Could not restore draft:', error);
        }
    }

    populateFormFromData() {
        Object.keys(this.formData).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = this.formData[fieldId];
                } else {
                    field.value = this.formData[fieldId];
                }

                // Trigger change event for organization dropdown
                if (fieldId === 'organization') {
                    field.dispatchEvent(new Event('change'));
                }
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Alt + Right Arrow: Next step
            if (event.altKey && event.key === 'ArrowRight') {
                event.preventDefault();
                if (this.currentStep < this.totalSteps) {
                    this.goToStep(this.currentStep + 1);
                }
            }

            // Alt + Left Arrow: Previous step
            if (event.altKey && event.key === 'ArrowLeft') {
                event.preventDefault();
                if (this.currentStep > 1) {
                    this.goToStep(this.currentStep - 1);
                }
            }

            // Escape: Cancel (go back to dashboard)
            if (event.key === 'Escape') {
                if (confirm('Are you sure you want to cancel? Your progress will be saved as a draft.')) {
                    this.saveCurrentStepData();
                    window.location.href = 'index.html';
                }
            }
        });
    }

    handleFormSubmission(event) {
        event.preventDefault();

        // Final validation
        if (!this.validateCurrentStep()) {
            return;
        }

        this.saveCurrentStepData();

        // Check required fields across all steps
        const requiredFields = ['organization', 'full-name', 'email', 'complaint-title', 'complaint-description', 'desired-outcome', 'confirm-accuracy'];
        const missingFields = requiredFields.filter(field => !this.formData[field]);

        if (missingFields.length > 0) {
            if (window.accessibilityManager) {
                window.accessibilityManager.announce('Please complete all required fields before submitting', 'assertive');
            }
            return;
        }

        // Create complaint object
        const complaintData = {
            organizationId: this.formData.organization,
            title: this.formData['complaint-title'],
            description: this.formData['complaint-description'],
            desiredOutcome: this.formData['desired-outcome'],
            contactDetails: {
                fullName: this.formData['full-name'],
                email: this.formData.email,
                phone: this.formData.phone || '',
                address: this.formData.address || '',
                preferredContact: this.formData['preferred-contact'] || 'email'
            },
            incidentDate: this.formData['incident-date'] || null,
            referenceNumber: this.formData['reference-number'] || '',
            previousContact: this.formData['previous-contact'] || ''
        };

        // Show loading state
        const submitButton = document.getElementById('submit-complaint');
        if (submitButton) {
            submitButton.classList.add('loading');
            submitButton.disabled = true;
        }

        // Simulate submission delay for better UX
        setTimeout(() => {
            try {
                // Create complaint using the main complaint manager
                let complaint;
                if (window.complaintManager) {
                    complaint = window.complaintManager.createComplaint(complaintData);
                } else {
                    // Fallback direct creation
                    complaint = this.createComplaintFallback(complaintData);
                }

                // Clear draft
                localStorage.removeItem('complaint-form-draft');

                // Show success message
                if (window.accessibilityManager) {
                    window.accessibilityManager.announce('Complaint submitted successfully! You will be redirected to the tracking page.', 'assertive');
                }

                // Redirect to tracking page with success message
                setTimeout(() => {
                    window.location.href = `track-complaints.html?success=true&id=${complaint.id}`;
                }, 1500);

            } catch (error) {
                console.error('Error submitting complaint:', error);
                
                if (submitButton) {
                    submitButton.classList.remove('loading');
                    submitButton.disabled = false;
                }

                if (window.accessibilityManager) {
                    window.accessibilityManager.announce('Error submitting complaint. Please try again.', 'assertive');
                }
            }
        }, 1000);
    }

    createComplaintFallback(complaintData) {
        // Direct localStorage fallback if main app not available
        const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        
        const complaint = {
            id: 'complaint_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ...complaintData,
            createdDate: new Date().toISOString(),
            status: 'submitted',
            updates: []
        };

        // Calculate deadline
        const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
        const organization = organizations.find(org => org.id === complaintData.organizationId);
        if (organization) {
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + organization.responseTimedays);
            complaint.deadline = deadline.toISOString();
        }

        complaints.push(complaint);
        localStorage.setItem('complaints', JSON.stringify(complaints));
        
        return complaint;
    }
}

// Initialize form manager when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.complaintFormManager = new ComplaintFormManager();
    });
} else {
    window.complaintFormManager = new ComplaintFormManager();
}