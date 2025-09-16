/**
 * Admin Page JavaScript
 * Handles organization management, data import/export, and system settings
 */

class AdminManager {
    constructor() {
        this.organizations = [];
        this.complaints = [];
        this.systemSettings = this.loadSystemSettings();
        this.currentEditingOrg = null;
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderOrganizations();
        this.updateStatistics();
        this.updateSystemInfo();
        this.loadSystemSettingsForm();
        
        // Announce page ready
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Admin panel loaded. Use tabs to navigate between sections.');
        }
    }

    loadData() {
        // Get data from main app or localStorage
        if (window.complaintManager) {
            this.organizations = window.complaintManager.organizations;
            this.complaints = window.complaintManager.complaints;
        } else {
            try {
                this.organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
                this.complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
            } catch (error) {
                console.error('Error loading data:', error);
                this.organizations = [];
                this.complaints = [];
            }
        }
    }

    loadSystemSettings() {
        const defaultSettings = {
            defaultResponseTime: 30,
            defaultEscalationTime: 60,
            autoSaveInterval: 30,
            notificationTimeout: 5
        };

        try {
            const saved = localStorage.getItem('system-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.warn('Error loading system settings:', error);
            return defaultSettings;
        }
    }

    saveSystemSettings() {
        try {
            localStorage.setItem('system-settings', JSON.stringify(this.systemSettings));
            if (window.accessibilityManager) {
                window.accessibilityManager.announce('System settings saved successfully');
            }
        } catch (error) {
            console.error('Error saving system settings:', error);
            if (window.accessibilityManager) {
                window.accessibilityManager.announce('Error saving system settings', 'assertive');
            }
        }
    }

    setupEventListeners() {
        // Organization management
        const saveOrgButton = document.getElementById('save-organization');
        const orgForm = document.getElementById('organization-form');

        if (saveOrgButton) {
            saveOrgButton.addEventListener('click', () => {
                this.saveOrganization();
            });
        }

        if (orgForm) {
            orgForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveOrganization();
            });
        }

        // Data management
        const exportButton = document.getElementById('export-data');
        const importButton = document.getElementById('import-data');
        const importFile = document.getElementById('import-file');
        const clearButton = document.getElementById('clear-data');

        if (exportButton) {
            exportButton.addEventListener('click', () => {
                this.exportData();
            });
        }

        if (importFile) {
            importFile.addEventListener('change', () => {
                importButton.disabled = !importFile.files.length;
            });
        }

        if (importButton) {
            importButton.addEventListener('click', () => {
                this.importData();
            });
        }

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clearAllData();
            });
        }

        // System settings
        const systemForm = document.getElementById('system-settings-form');
        if (systemForm) {
            systemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSystemSettingsForm();
            });
        }

        // Modal events
        const orgModal = document.getElementById('organizationModal');
        if (orgModal) {
            orgModal.addEventListener('hidden.bs.modal', () => {
                this.resetOrganizationForm();
            });
        }

        // Tab change events
        document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (event) => {
                const target = event.target.getAttribute('data-bs-target');
                if (target === '#organizations') {
                    this.renderOrganizations();
                } else if (target === '#data') {
                    this.updateStatistics();
                }
            });
        });
    }

    renderOrganizations() {
        const container = document.getElementById('organizations-list');
        if (!container) return;

        if (this.organizations.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-muted">No organizations configured yet.</p>
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#organizationModal">
                        Add First Organization
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover" role="table" aria-label="Organizations list">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Type</th>
                            <th scope="col">Contact Email</th>
                            <th scope="col">Response Time</th>
                            <th scope="col">Escalation Time</th>
                            <th scope="col" class="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.organizations.map(org => this.createOrganizationRow(org)).join('')}
                    </tbody>
                </table>
            </div>
        `;

        this.setupOrganizationRowListeners();
    }

    createOrganizationRow(org) {
        return `
            <tr id="org-row-${org.id}">
                <td>
                    <strong>${this.escapeHtml(org.name)}</strong>
                </td>
                <td>${this.escapeHtml(org.type)}</td>
                <td>
                    <a href="mailto:${this.escapeHtml(org.contactEmail)}">${this.escapeHtml(org.contactEmail)}</a>
                </td>
                <td>${org.responseTimedays} days</td>
                <td>${org.escalationTimedays} days</td>
                <td class="text-end">
                    <div class="btn-group" role="group" aria-label="Organization actions">
                        <button type="button" class="btn btn-sm btn-outline-primary edit-org-btn" data-org-id="${org.id}" aria-label="Edit ${org.name}">
                            <span aria-hidden="true">✏️</span> Edit
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger delete-org-btn" data-org-id="${org.id}" aria-label="Delete ${org.name}">
                            <span aria-hidden="true">🗑️</span> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    setupOrganizationRowListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-org-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const orgId = btn.dataset.orgId;
                this.editOrganization(orgId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-org-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const orgId = btn.dataset.orgId;
                this.deleteOrganization(orgId);
            });
        });
    }

    editOrganization(orgId) {
        const org = this.organizations.find(o => o.id === orgId);
        if (!org) return;

        this.currentEditingOrg = org;

        // Populate form
        document.getElementById('org-id').value = org.id;
        document.getElementById('org-name').value = org.name;
        document.getElementById('org-type').value = org.type;
        document.getElementById('org-email').value = org.contactEmail;
        document.getElementById('org-response-time').value = org.responseTimedays;
        document.getElementById('org-escalation-time').value = org.escalationTimedays;

        // Update modal title
        document.getElementById('organizationModalLabel').textContent = 'Edit Organization';

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('organizationModal'));
        modal.show();

        if (window.accessibilityManager) {
            window.accessibilityManager.announce(`Editing organization: ${org.name}`);
        }
    }

    deleteOrganization(orgId) {
        const org = this.organizations.find(o => o.id === orgId);
        if (!org) return;

        // Check if organization has complaints
        const hasComplaints = this.complaints.some(c => c.organizationId === orgId);
        
        let confirmMessage = `Are you sure you want to delete "${org.name}"?`;
        if (hasComplaints) {
            confirmMessage += `\n\nWarning: This organization has existing complaints. Deleting it will make those complaints reference an unknown organization.`;
        }

        if (confirm(confirmMessage)) {
            this.organizations = this.organizations.filter(o => o.id !== orgId);
            this.saveOrganizations();
            this.renderOrganizations();

            if (window.accessibilityManager) {
                window.accessibilityManager.announce(`Organization "${org.name}" deleted successfully`, 'assertive');
            }
        }
    }

    saveOrganization() {
        const form = document.getElementById('organization-form');
        if (!form) return;

        // Validate form
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const orgData = {
            id: document.getElementById('org-id').value || this.generateOrgId(),
            name: document.getElementById('org-name').value.trim(),
            type: document.getElementById('org-type').value,
            contactEmail: document.getElementById('org-email').value.trim(),
            responseTimedays: parseInt(document.getElementById('org-response-time').value),
            escalationTimedays: parseInt(document.getElementById('org-escalation-time').value)
        };

        // Additional validation
        if (orgData.escalationTimedays <= orgData.responseTimedays) {
            this.showFormError('org-escalation-time', 'Escalation time must be greater than response time');
            return;
        }

        // Check for duplicate names (excluding current editing org)
        const duplicate = this.organizations.find(o => 
            o.name.toLowerCase() === orgData.name.toLowerCase() && 
            o.id !== orgData.id
        );
        if (duplicate) {
            this.showFormError('org-name', 'An organization with this name already exists');
            return;
        }

        // Save organization
        const existingIndex = this.organizations.findIndex(o => o.id === orgData.id);
        if (existingIndex >= 0) {
            this.organizations[existingIndex] = orgData;
        } else {
            this.organizations.push(orgData);
        }

        this.saveOrganizations();
        this.renderOrganizations();

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('organizationModal'));
        if (modal) modal.hide();

        const action = existingIndex >= 0 ? 'updated' : 'created';
        if (window.accessibilityManager) {
            window.accessibilityManager.announce(`Organization "${orgData.name}" ${action} successfully`);
        }
    }

    showFormError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.classList.add('is-invalid');
        
        let errorElement = field.parentNode.querySelector('.invalid-feedback');
        if (errorElement) {
            errorElement.textContent = message;
        }

        field.focus();

        if (window.accessibilityManager) {
            window.accessibilityManager.announce(`Error: ${message}`, 'assertive');
        }
    }

    resetOrganizationForm() {
        const form = document.getElementById('organization-form');
        if (!form) return;

        form.reset();
        form.classList.remove('was-validated');
        
        // Clear any error states
        form.querySelectorAll('.is-invalid').forEach(field => {
            field.classList.remove('is-invalid');
        });

        document.getElementById('org-id').value = '';
        document.getElementById('organizationModalLabel').textContent = 'Add Organization';
        this.currentEditingOrg = null;
    }

    generateOrgId() {
        return 'org_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    saveOrganizations() {
        try {
            localStorage.setItem('organizations', JSON.stringify(this.organizations));
            
            // Update main app if available
            if (window.complaintManager) {
                window.complaintManager.saveOrganizations(this.organizations);
            }
        } catch (error) {
            console.error('Error saving organizations:', error);
            if (window.accessibilityManager) {
                window.accessibilityManager.announce('Error saving organizations', 'assertive');
            }
        }
    }

    updateStatistics() {
        const totalComplaints = this.complaints.length;
        const totalOrganizations = this.organizations.length;
        
        // Calculate storage used
        const dataSize = new Blob([
            localStorage.getItem('complaints') || '',
            localStorage.getItem('organizations') || '',
            localStorage.getItem('accessibility-settings') || '',
            localStorage.getItem('system-settings') || ''
        ]).size;
        
        const storageKB = Math.round(dataSize / 1024 * 100) / 100;

        document.getElementById('total-complaints').textContent = totalComplaints;
        document.getElementById('total-organizations').textContent = totalOrganizations;
        document.getElementById('storage-used').textContent = `${storageKB} KB`;
    }

    exportData() {
        try {
            const data = {
                complaints: this.complaints,
                organizations: this.organizations,
                systemSettings: this.systemSettings,
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };

            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `accessassist-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            if (window.accessibilityManager) {
                window.accessibilityManager.announce('Data exported successfully. Download should start automatically.');
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            if (window.accessibilityManager) {
                window.accessibilityManager.announce('Error exporting data', 'assertive');
            }
        }
    }

    importData() {
        const fileInput = document.getElementById('import-file');
        if (!fileInput || !fileInput.files.length) return;

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data structure
                if (!data.complaints || !Array.isArray(data.complaints) ||
                    !data.organizations || !Array.isArray(data.organizations)) {
                    throw new Error('Invalid data format');
                }

                // Confirm import
                const confirmMessage = `Import data from ${file.name}?\n\n` +
                    `This will add:\n` +
                    `- ${data.complaints.length} complaints\n` +
                    `- ${data.organizations.length} organizations\n\n` +
                    `Existing data will be preserved.`;

                if (confirm(confirmMessage)) {
                    this.performImport(data);
                }
            } catch (error) {
                console.error('Error parsing import file:', error);
                if (window.accessibilityManager) {
                    window.accessibilityManager.announce('Error: Invalid file format. Please select a valid AccessAssist data file.', 'assertive');
                }
            }
        };

        reader.readAsText(file);
    }

    performImport(data) {
        try {
            // Merge organizations (avoid duplicates)
            data.organizations.forEach(newOrg => {
                const exists = this.organizations.find(org => 
                    org.name.toLowerCase() === newOrg.name.toLowerCase()
                );
                if (!exists) {
                    // Generate new ID to avoid conflicts
                    newOrg.id = this.generateOrgId();
                    this.organizations.push(newOrg);
                }
            });

            // Merge complaints
            data.complaints.forEach(newComplaint => {
                // Generate new ID to avoid conflicts
                newComplaint.id = this.generateComplaintId();
                this.complaints.push(newComplaint);
            });

            // Save data
            this.saveOrganizations();
            localStorage.setItem('complaints', JSON.stringify(this.complaints));

            // Update main app if available
            if (window.complaintManager) {
                window.complaintManager.complaints = this.complaints;
                window.complaintManager.organizations = this.organizations;
            }

            // Update UI
            this.renderOrganizations();
            this.updateStatistics();

            // Clear file input
            document.getElementById('import-file').value = '';
            document.getElementById('import-data').disabled = true;

            if (window.accessibilityManager) {
                window.accessibilityManager.announce('Data imported successfully', 'assertive');
            }
        } catch (error) {
            console.error('Error importing data:', error);
            if (window.accessibilityManager) {
                window.accessibilityManager.announce('Error importing data', 'assertive');
            }
        }
    }

    generateComplaintId() {
        return 'complaint_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    clearAllData() {
        const confirmMessage = 'This will permanently delete ALL complaints and reset organizations to defaults.\n\n' +
            'This action cannot be undone. Are you sure you want to continue?';

        if (confirm(confirmMessage)) {
            const doubleConfirm = 'Type "DELETE" to confirm permanent data deletion:';
            const userInput = prompt(doubleConfirm);
            
            if (userInput === 'DELETE') {
                // Clear all data
                localStorage.removeItem('complaints');
                localStorage.removeItem('organizations');
                localStorage.removeItem('complaint-form-draft');
                
                // Reset to defaults
                this.complaints = [];
                this.loadDefaultOrganizations();
                
                // Update main app if available
                if (window.complaintManager) {
                    window.complaintManager.complaints = [];
                    window.complaintManager.organizations = this.organizations;
                    window.complaintManager.saveComplaints();
                    window.complaintManager.saveOrganizations();
                }

                // Update UI
                this.renderOrganizations();
                this.updateStatistics();

                if (window.accessibilityManager) {
                    window.accessibilityManager.announce('All data cleared successfully. Organizations reset to defaults.', 'assertive');
                }
            }
        }
    }

    loadDefaultOrganizations() {
        this.organizations = [
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
        this.saveOrganizations();
    }

    loadSystemSettingsForm() {
        document.getElementById('default-response-time').value = this.systemSettings.defaultResponseTime;
        document.getElementById('default-escalation-time').value = this.systemSettings.defaultEscalationTime;
        document.getElementById('auto-save-interval').value = this.systemSettings.autoSaveInterval;
        document.getElementById('notification-timeout').value = this.systemSettings.notificationTimeout;
    }

    saveSystemSettingsForm() {
        this.systemSettings.defaultResponseTime = parseInt(document.getElementById('default-response-time').value);
        this.systemSettings.defaultEscalationTime = parseInt(document.getElementById('default-escalation-time').value);
        this.systemSettings.autoSaveInterval = parseInt(document.getElementById('auto-save-interval').value);
        this.systemSettings.notificationTimeout = parseInt(document.getElementById('notification-timeout').value);

        this.saveSystemSettings();

        if (window.accessibilityManager) {
            window.accessibilityManager.announce('System settings saved successfully');
        }
    }

    updateSystemInfo() {
        // Browser info
        const browserInfo = `${navigator.userAgent.split(' ').slice(-2).join(' ')}`;
        document.getElementById('browser-info').textContent = browserInfo;

        // Last updated (from localStorage timestamps)
        const timestamps = [
            localStorage.getItem('complaints'),
            localStorage.getItem('organizations'),
            localStorage.getItem('accessibility-settings')
        ].map(item => {
            try {
                return JSON.parse(item)?.lastModified || 0;
            } catch {
                return 0;
            }
        });

        const lastUpdate = Math.max(...timestamps);
        if (lastUpdate > 0) {
            document.getElementById('last-updated').textContent = new Date(lastUpdate).toLocaleString('en-GB');
        } else {
            document.getElementById('last-updated').textContent = 'N/A';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize admin manager when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.adminManager = new AdminManager();
    });
} else {
    window.adminManager = new AdminManager();
}