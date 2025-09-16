/**
 * AccessAssist - Main Application Logic
 * Handles complaint management, data persistence, and core functionality.
 */

class ComplaintManager {
    constructor() {
        this.complaints = this.loadComplaints();
        this.organizations = this.loadOrganizations();
        this.init();
    }

    init() {
        this.updateDashboard();
        this.setupEventListeners();
        this.loadRecentComplaints();
    }

    loadComplaints() {
        try {
            const saved = localStorage.getItem('complaints');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading complaints:', error);
            return [];
        }
    }

    saveComplaints() {
        try {
            localStorage.setItem('complaints', JSON.stringify(this.complaints));
        } catch (error) {
            console.error('Error saving complaints:', error);
            if (window.accessibilityManager) {
                window.accessibilityManager.announce('Error saving data. Please try again.', 'assertive');
            }
        }
    }

    loadOrganizations() {
        try {
            const saved = localStorage.getItem('organizations');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading organizations:', error);
        }

        // Default organizations if none saved
        const defaultOrgs = [
            {
                id: 'techmart',
                name: 'TechMart Electronics',
                type: 'Retailer',
                contactEmail: 'complaints@techmart.co.uk',
                responseTimedays: 30,
                escalationTimedays: 60
            },
            {
                id: 'quickfix',
                name: 'QuickFix Plumbing Services',
                type: 'Service Provider',
                contactEmail: 'support@quickfixplumbing.co.uk',
                responseTimedays: 14,
                escalationTimedays: 28
            },
            {
                id: 'streamflex',
                name: 'StreamFlex Entertainment',
                type: 'Subscription Service',
                contactEmail: 'customer.service@streamflex.co.uk',
                responseTimedays: 21,
                escalationTimedays: 42
            }
        ];

        this.saveOrganizations(defaultOrgs);
        return defaultOrgs;
    }

    saveOrganizations(orgs = this.organizations) {
        try {
            localStorage.setItem('organizations', JSON.stringify(orgs));
            this.organizations = orgs;
        } catch (error) {
            console.error('Error saving organizations:', error);
        }
    }

    updateDashboard() {
        // Update complaint count
        const activeComplaints = this.complaints.filter(c => c.status !== 'resolved').length;
        if (window.accessibilityManager) {
            window.accessibilityManager.updateComplaintCount(activeComplaints);
        }
    }

    loadRecentComplaints() {
        const container = document.getElementById('recent-complaints');
        if (!container) return;

        if (this.complaints.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <p class="text-muted">No complaints yet. <a href="create-complaint.html">Create your first complaint</a> to get started.</p>
                </div>
            `;
            return;
        }

        // Sort by creation date (newest first) and take top 3
        const recentComplaints = this.complaints
            .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
            .slice(0, 3);

        container.innerHTML = recentComplaints.map(complaint => 
            this.createComplaintPreviewCard(complaint)
        ).join('');
    }

    createComplaintPreviewCard(complaint) {
        const organization = this.organizations.find(org => org.id === complaint.organizationId);
        const statusClass = this.getStatusClass(complaint.status);
        const daysElapsed = this.calculateDaysElapsed(complaint.createdDate);
        const isOverdue = this.isComplaintOverdue(complaint);

        return `
            <div class="col-md-6 col-lg-4">
                <div class="card complaint-card ${isOverdue ? 'overdue' : ''}" role="region" aria-labelledby="complaint-${complaint.id}-title">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h3 id="complaint-${complaint.id}-title" class="card-title h6 mb-0">
                                Complaint to ${organization?.name || 'Unknown Organization'}
                            </h3>
                            <span class="status-badge status-${statusClass}" aria-label="Status: ${complaint.status}">
                                ${this.formatStatus(complaint.status)}
                            </span>
                        </div>
                        <p class="card-text text-muted small mb-2">
                            ${this.truncateText(complaint.description, 80)}
                        </p>
                        <div class="small text-muted mb-3">
                            <div>Created: ${this.formatDate(complaint.createdDate)}</div>
                            ${complaint.deadline ? `<div class="${isOverdue ? 'text-danger' : ''}">Deadline: ${this.formatDate(complaint.deadline)} ${isOverdue ? '(Overdue)' : ''}</div>` : ''}
                            <div>${daysElapsed} days elapsed</div>
                        </div>
                        <div class="d-flex gap-2">
                            <a href="track-complaints.html#complaint-${complaint.id}" class="btn btn-sm btn-outline-primary">
                                View Details
                            </a>
                            ${isOverdue ? '<button class="btn btn-sm btn-warning">Escalate</button>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getStatusClass(status) {
        const statusMap = {
            'submitted': 'submitted',
            'acknowledged': 'in-progress',
            'in-progress': 'in-progress',
            'response-due': 'response-due',
            'escalation': 'escalation',
            'resolved': 'resolved'
        };
        return statusMap[status] || 'submitted';
    }

    formatStatus(status) {
        const statusMap = {
            'submitted': 'Submitted',
            'acknowledged': 'Acknowledged',
            'in-progress': 'In Progress',
            'response-due': 'Response Due',
            'escalation': 'Needs Escalation',
            'resolved': 'Resolved'
        };
        return statusMap[status] || status;
    }

    calculateDaysElapsed(date) {
        const now = new Date();
        const created = new Date(date);
        const diffTime = Math.abs(now - created);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    isComplaintOverdue(complaint) {
        if (!complaint.deadline) return false;
        return new Date() > new Date(complaint.deadline);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    setupEventListeners() {
        // Handle settings modal
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.addEventListener('shown.bs.modal', () => {
                const firstInput = settingsModal.querySelector('select, input');
                if (firstInput) {
                    firstInput.focus();
                }
            });
        }

        // Handle card interactions
        this.setupCardAccessibility();
        
        // Handle keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    setupCardAccessibility() {
        // Add keyboard support for card interactions
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            const primaryAction = card.querySelector('a.btn-primary, button.btn-primary');
            
            if (primaryAction) {
                card.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        primaryAction.click();
                    }
                });

                // Make cards focusable
                if (!card.hasAttribute('tabindex')) {
                    card.setAttribute('tabindex', '0');
                }

                // Add focus styles
                card.addEventListener('focus', () => {
                    card.classList.add('focus-ring');
                });

                card.addEventListener('blur', () => {
                    card.classList.remove('focus-ring');
                });
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Alt + N: New complaint
            if (event.altKey && event.key === 'n') {
                event.preventDefault();
                window.location.href = 'create-complaint.html';
            }

            // Alt + T: Track complaints
            if (event.altKey && event.key === 't') {
                event.preventDefault();
                window.location.href = 'track-complaints.html';
            }

            // Alt + H: Home/Dashboard
            if (event.altKey && event.key === 'h') {
                event.preventDefault();
                window.location.href = 'index.html';
            }
        });
    }

    // Utility methods for form validation
    validateRequired(value, fieldName) {
        if (!value || value.trim() === '') {
            return `${fieldName} is required`;
        }
        return null;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        return null;
    }

    validatePhone(phone) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            return 'Please enter a valid phone number';
        }
        return null;
    }

    // Create a new complaint
    createComplaint(complaintData) {
        const complaint = {
            id: this.generateId(),
            ...complaintData,
            createdDate: new Date().toISOString(),
            status: 'submitted',
            updates: []
        };

        // Calculate deadline based on organization response time
        const organization = this.organizations.find(org => org.id === complaintData.organizationId);
        if (organization) {
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + organization.responseTimedays);
            complaint.deadline = deadline.toISOString();
        }

        this.complaints.push(complaint);
        this.saveComplaints();
        
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Complaint created successfully', 'polite');
        }
        
        return complaint;
    }

    updateComplaint(complaintId, updates) {
        const complaint = this.complaints.find(c => c.id === complaintId);
        if (!complaint) return false;

        Object.assign(complaint, updates);
        
        // Add update to history
        complaint.updates.push({
            date: new Date().toISOString(),
            type: 'status_change',
            details: updates
        });

        this.saveComplaints();
        
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Complaint updated successfully', 'polite');
        }
        
        return true;
    }

    deleteComplaint(complaintId) {
        const index = this.complaints.findIndex(c => c.id === complaintId);
        if (index === -1) return false;

        this.complaints.splice(index, 1);
        this.saveComplaints();
        
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Complaint deleted successfully', 'polite');
        }
        
        return true;
    }

    generateId() {
        return 'complaint_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Export/Import functionality
    exportData() {
        const data = {
            complaints: this.complaints,
            organizations: this.organizations,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `accessassist-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Data exported successfully', 'polite');
        }
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.complaints) {
                this.complaints = data.complaints;
                this.saveComplaints();
            }
            
            if (data.organizations) {
                this.organizations = data.organizations;
                this.saveOrganizations();
            }
            
            this.updateDashboard();
            this.loadRecentComplaints();
            
            if (window.accessibilityManager) {
                window.accessibilityManager.announce('Data imported successfully', 'polite');
            }
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            if (window.accessibilityManager) {
                window.accessibilityManager.announce('Error importing data. Please check the file format.', 'assertive');
            }
            return false;
        }
    }
}

// Initialize complaint manager when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.complaintManager = new ComplaintManager();
    });
} else {
    window.complaintManager = new ComplaintManager();
}

// Utility functions for date/time formatting
window.dateUtils = {
    formatDateTime(date) {
        return new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date(date));
    },

    formatDateOnly(date) {
        return new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'medium'
        }).format(new Date(date));
    },

    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
};