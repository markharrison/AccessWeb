/**
 * Track Complaints Page JavaScript
 * Handles complaint tracking, filtering, and status management
 */

class ComplaintTracker {
    constructor() {
        this.complaints = [];
        this.organizations = [];
        this.filteredComplaints = [];
        this.currentFilters = {
            search: '',
            status: '',
            organization: ''
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.checkForSuccessMessage();
        this.updateStatistics();
        this.renderComplaints();
        
        // Announce page ready
        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Complaint tracker loaded. Use filters to find specific complaints.');
        }
    }

    loadData() {
        // Get complaints and organizations from main app or localStorage
        if (window.complaintManager) {
            this.complaints = window.complaintManager.complaints;
            this.organizations = window.complaintManager.organizations;
        } else {
            try {
                this.complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
                this.organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
            } catch (error) {
                console.error('Error loading data:', error);
                this.complaints = [];
                this.organizations = [];
            }
        }

        this.filteredComplaints = [...this.complaints];
        this.populateOrganizationFilter();
    }

    populateOrganizationFilter() {
        const select = document.getElementById('filter-organization');
        if (!select) return;

        // Clear existing options except first
        select.innerHTML = '<option value="">All Organizations</option>';

        // Get unique organizations from complaints
        const usedOrgIds = [...new Set(this.complaints.map(c => c.organizationId))];
        const usedOrgs = this.organizations.filter(org => usedOrgIds.includes(org.id));

        usedOrgs.forEach(org => {
            const option = document.createElement('option');
            option.value = org.id;
            option.textContent = org.name;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        // Search and filter controls
        const searchInput = document.getElementById('search-complaints');
        const statusFilter = document.getElementById('filter-status');
        const orgFilter = document.getElementById('filter-organization');
        const clearButton = document.getElementById('clear-filters');

        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.currentFilters.search = searchInput.value;
                this.applyFilters();
            }, 300));
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.currentFilters.status = statusFilter.value;
                this.applyFilters();
            });
        }

        if (orgFilter) {
            orgFilter.addEventListener('change', () => {
                this.currentFilters.organization = orgFilter.value;
                this.applyFilters();
            });
        }

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Modal actions
        const escalateButton = document.getElementById('escalate-complaint');
        const resolveButton = document.getElementById('mark-resolved');

        if (escalateButton) {
            escalateButton.addEventListener('click', () => {
                this.escalateComplaint();
            });
        }

        if (resolveButton) {
            resolveButton.addEventListener('click', () => {
                this.markComplaintResolved();
            });
        }

        // URL hash handling for direct links
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });

        // Initial hash check
        this.handleHashChange();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    checkForSuccessMessage() {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const complaintId = urlParams.get('id');

        if (success === 'true') {
            const successMessage = document.getElementById('success-message');
            if (successMessage) {
                successMessage.classList.remove('d-none');
                
                // Announce success
                if (window.accessibilityManager) {
                    window.accessibilityManager.announce('Complaint submitted successfully! You can track its progress on this page.', 'assertive');
                }

                // Scroll to specific complaint if ID provided
                if (complaintId) {
                    setTimeout(() => {
                        const complaintElement = document.getElementById(`complaint-${complaintId}`);
                        if (complaintElement) {
                            complaintElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            complaintElement.focus();
                        }
                    }, 1000);
                }

                // Clear URL parameters
                const newUrl = window.location.pathname + window.location.hash;
                window.history.replaceState({}, document.title, newUrl);
            }
        }
    }

    handleHashChange() {
        const hash = window.location.hash;
        if (hash.startsWith('#complaint-')) {
            const complaintId = hash.replace('#complaint-', '');
            const complaint = this.complaints.find(c => c.id === complaintId);
            if (complaint) {
                this.showComplaintDetails(complaint);
            }
        }
    }

    applyFilters() {
        const { search, status, organization } = this.currentFilters;
        
        this.filteredComplaints = this.complaints.filter(complaint => {
            // Search filter
            if (search) {
                const searchTerm = search.toLowerCase();
                const orgName = this.getOrganizationName(complaint.organizationId).toLowerCase();
                const matchesSearch = 
                    complaint.title.toLowerCase().includes(searchTerm) ||
                    complaint.description.toLowerCase().includes(searchTerm) ||
                    orgName.includes(searchTerm);
                
                if (!matchesSearch) return false;
            }

            // Status filter
            if (status && complaint.status !== status) {
                return false;
            }

            // Organization filter
            if (organization && complaint.organizationId !== organization) {
                return false;
            }

            return true;
        });

        this.updateStatistics();
        this.renderComplaints();

        // Announce filter results
        if (window.accessibilityManager) {
            const count = this.filteredComplaints.length;
            window.accessibilityManager.announce(`Showing ${count} complaint${count !== 1 ? 's' : ''}`);
        }
    }

    clearFilters() {
        this.currentFilters = { search: '', status: '', organization: '' };
        
        // Reset form controls
        const searchInput = document.getElementById('search-complaints');
        const statusFilter = document.getElementById('filter-status');
        const orgFilter = document.getElementById('filter-organization');

        if (searchInput) searchInput.value = '';
        if (statusFilter) statusFilter.value = '';
        if (orgFilter) orgFilter.value = '';

        this.applyFilters();

        if (window.accessibilityManager) {
            window.accessibilityManager.announce('Filters cleared. Showing all complaints.');
        }
    }

    updateStatistics() {
        const total = this.complaints.length;
        const active = this.complaints.filter(c => c.status !== 'resolved').length;
        const overdue = this.complaints.filter(c => this.isComplaintOverdue(c)).length;
        const resolved = this.complaints.filter(c => c.status === 'resolved').length;

        document.getElementById('total-count').textContent = total;
        document.getElementById('active-count').textContent = active;
        document.getElementById('overdue-count').textContent = overdue;
        document.getElementById('resolved-count').textContent = resolved;
    }

    renderComplaints() {
        const container = document.getElementById('complaints-container');
        const emptyState = document.getElementById('empty-state');

        if (!container || !emptyState) return;

        if (this.filteredComplaints.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('d-none');
            return;
        }

        emptyState.classList.add('d-none');

        // Sort complaints by date (newest first) and then by status priority
        const sortedComplaints = this.filteredComplaints.sort((a, b) => {
            // Priority order: overdue, escalation, response-due, in-progress, submitted, resolved
            const statusPriority = {
                'escalation': 6,
                'response-due': 5,
                'in-progress': 4,
                'acknowledged': 3,
                'submitted': 2,
                'resolved': 1
            };

            const aOverdue = this.isComplaintOverdue(a);
            const bOverdue = this.isComplaintOverdue(b);

            if (aOverdue && !bOverdue) return -1;
            if (!aOverdue && bOverdue) return 1;

            const aPriority = statusPriority[a.status] || 0;
            const bPriority = statusPriority[b.status] || 0;

            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }

            return new Date(b.createdDate) - new Date(a.createdDate);
        });

        container.innerHTML = sortedComplaints.map(complaint => 
            this.createComplaintCard(complaint)
        ).join('');

        // Add event listeners to cards
        this.setupComplaintCardListeners();
    }

    createComplaintCard(complaint) {
        const organization = this.organizations.find(org => org.id === complaint.organizationId);
        const isOverdue = this.isComplaintOverdue(complaint);
        const daysElapsed = this.calculateDaysElapsed(complaint.createdDate);
        const statusClass = this.getStatusClass(complaint.status);
        const progressPercentage = this.calculateProgress(complaint);

        return `
            <div class="card complaint-card ${isOverdue ? 'overdue' : ''} mb-3" id="complaint-${complaint.id}" tabindex="0" role="button" aria-labelledby="complaint-${complaint.id}-title" data-complaint-id="${complaint.id}">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h3 id="complaint-${complaint.id}-title" class="card-title h5 mb-0">
                                    ${this.escapeHtml(complaint.title)}
                                </h3>
                                <span class="status-badge status-${statusClass} ms-2" aria-label="Status: ${this.formatStatus(complaint.status)}">
                                    ${this.formatStatus(complaint.status)}
                                    ${isOverdue ? ' (Overdue)' : ''}
                                </span>
                            </div>
                            
                            <p class="text-muted mb-2">
                                <strong>Organization:</strong> ${organization?.name || 'Unknown Organization'}
                            </p>
                            
                            <p class="card-text mb-3">
                                ${this.escapeHtml(this.truncateText(complaint.description, 120))}
                            </p>

                            <div class="row g-2 small text-muted">
                                <div class="col-md-6">
                                    <strong>Created:</strong> ${this.formatDate(complaint.createdDate)}
                                </div>
                                <div class="col-md-6">
                                    <strong>Days Elapsed:</strong> ${daysElapsed}
                                </div>
                                ${complaint.deadline ? `
                                <div class="col-md-6">
                                    <strong class="${isOverdue ? 'text-danger' : ''}">Deadline:</strong> 
                                    <span class="${isOverdue ? 'text-danger' : ''}">${this.formatDate(complaint.deadline)}</span>
                                </div>
                                ` : ''}
                                ${organization ? `
                                <div class="col-md-6">
                                    <strong>Expected Response:</strong> ${organization.responseTimedays} days
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="text-end">
                                <div class="mb-3">
                                    <small class="text-muted d-block">Progress</small>
                                    <div class="progress" style="height: 8px;" role="progressbar" aria-valuenow="${progressPercentage}" aria-valuemin="0" aria-valuemax="100" aria-label="Complaint progress">
                                        <div class="progress-bar ${this.getProgressBarClass(complaint.status)}" style="width: ${progressPercentage}%"></div>
                                    </div>
                                    <small class="text-muted">${progressPercentage}% complete</small>
                                </div>
                                
                                <div class="d-flex flex-column gap-2">
                                    <button type="button" class="btn btn-sm btn-outline-primary view-details-btn" data-complaint-id="${complaint.id}">
                                        View Details
                                    </button>
                                    ${isOverdue && complaint.status !== 'resolved' ? `
                                    <button type="button" class="btn btn-sm btn-warning escalate-btn" data-complaint-id="${complaint.id}">
                                        <span aria-hidden="true">⚠️</span> Escalate
                                    </button>
                                    ` : ''}
                                    ${complaint.status !== 'resolved' ? `
                                    <button type="button" class="btn btn-sm btn-success resolve-btn" data-complaint-id="${complaint.id}">
                                        <span aria-hidden="true">✓</span> Mark Resolved
                                    </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupComplaintCardListeners() {
        // View details buttons
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const complaintId = btn.dataset.complaintId;
                const complaint = this.complaints.find(c => c.id === complaintId);
                if (complaint) {
                    this.showComplaintDetails(complaint);
                }
            });
        });

        // Escalate buttons
        document.querySelectorAll('.escalate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const complaintId = btn.dataset.complaintId;
                this.escalateComplaintDirect(complaintId);
            });
        });

        // Resolve buttons
        document.querySelectorAll('.resolve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const complaintId = btn.dataset.complaintId;
                this.markComplaintResolvedDirect(complaintId);
            });
        });

        // Card click to view details
        document.querySelectorAll('.complaint-card').forEach(card => {
            card.addEventListener('click', () => {
                const complaintId = card.dataset.complaintId;
                const complaint = this.complaints.find(c => c.id === complaintId);
                if (complaint) {
                    this.showComplaintDetails(complaint);
                }
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    }

    showComplaintDetails(complaint) {
        const modal = document.getElementById('complaintModal');
        const content = document.getElementById('complaint-detail-content');
        const escalateBtn = document.getElementById('escalate-complaint');
        const resolveBtn = document.getElementById('mark-resolved');

        if (!modal || !content) return;

        const organization = this.organizations.find(org => org.id === complaint.organizationId);
        const isOverdue = this.isComplaintOverdue(complaint);
        
        content.innerHTML = this.createDetailedView(complaint, organization, isOverdue);

        // Configure action buttons
        if (escalateBtn) {
            escalateBtn.style.display = (isOverdue && complaint.status !== 'resolved') ? 'inline-block' : 'none';
            escalateBtn.dataset.complaintId = complaint.id;
        }

        if (resolveBtn) {
            resolveBtn.style.display = complaint.status !== 'resolved' ? 'inline-block' : 'none';
            resolveBtn.dataset.complaintId = complaint.id;
        }

        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        // Update URL hash
        window.history.pushState(null, null, `#complaint-${complaint.id}`);

        // Announce modal opening
        if (window.accessibilityManager) {
            window.accessibilityManager.announce(`Opened details for complaint: ${complaint.title}`, 'polite');
        }
    }

    createDetailedView(complaint, organization, isOverdue) {
        return `
            <div class="row g-4">
                <div class="col-md-8">
                    <h4 class="h5 mb-3">Complaint Information</h4>
                    <dl class="row">
                        <dt class="col-sm-3">Title:</dt>
                        <dd class="col-sm-9">${this.escapeHtml(complaint.title)}</dd>
                        
                        <dt class="col-sm-3">Organization:</dt>
                        <dd class="col-sm-9">${organization?.name || 'Unknown Organization'}</dd>
                        
                        <dt class="col-sm-3">Status:</dt>
                        <dd class="col-sm-9">
                            <span class="status-badge status-${this.getStatusClass(complaint.status)}">
                                ${this.formatStatus(complaint.status)}
                                ${isOverdue ? ' (Overdue)' : ''}
                            </span>
                        </dd>
                        
                        <dt class="col-sm-3">Created:</dt>
                        <dd class="col-sm-9">${this.formatDateTime(complaint.createdDate)}</dd>
                        
                        ${complaint.deadline ? `
                        <dt class="col-sm-3">Deadline:</dt>
                        <dd class="col-sm-9 ${isOverdue ? 'text-danger' : ''}">${this.formatDate(complaint.deadline)}</dd>
                        ` : ''}
                        
                        ${complaint.incidentDate ? `
                        <dt class="col-sm-3">Incident Date:</dt>
                        <dd class="col-sm-9">${this.formatDate(complaint.incidentDate)}</dd>
                        ` : ''}
                        
                        ${complaint.referenceNumber ? `
                        <dt class="col-sm-3">Reference:</dt>
                        <dd class="col-sm-9">${this.escapeHtml(complaint.referenceNumber)}</dd>
                        ` : ''}
                    </dl>

                    <h5 class="h6 mt-4 mb-2">Description</h5>
                    <p class="border-start border-3 ps-3">${this.escapeHtml(complaint.description)}</p>

                    <h5 class="h6 mt-4 mb-2">Desired Outcome</h5>
                    <p class="border-start border-3 ps-3">${this.escapeHtml(complaint.desiredOutcome)}</p>

                    ${complaint.previousContact ? `
                    <h5 class="h6 mt-4 mb-2">Previous Contact</h5>
                    <p class="border-start border-3 ps-3">${this.escapeHtml(complaint.previousContact)}</p>
                    ` : ''}
                </div>
                
                <div class="col-md-4">
                    <h4 class="h5 mb-3">Contact Details</h4>
                    <dl>
                        <dt>Name:</dt>
                        <dd>${this.escapeHtml(complaint.contactDetails.fullName)}</dd>
                        
                        <dt>Email:</dt>
                        <dd><a href="mailto:${complaint.contactDetails.email}">${this.escapeHtml(complaint.contactDetails.email)}</a></dd>
                        
                        ${complaint.contactDetails.phone ? `
                        <dt>Phone:</dt>
                        <dd><a href="tel:${complaint.contactDetails.phone}">${this.escapeHtml(complaint.contactDetails.phone)}</a></dd>
                        ` : ''}
                        
                        <dt>Preferred Contact:</dt>
                        <dd>${this.formatContactMethod(complaint.contactDetails.preferredContact)}</dd>
                        
                        ${complaint.contactDetails.address ? `
                        <dt>Address:</dt>
                        <dd>${this.escapeHtml(complaint.contactDetails.address)}</dd>
                        ` : ''}
                    </dl>

                    ${organization ? `
                    <h5 class="h6 mt-4 mb-2">Organization Details</h5>
                    <dl>
                        <dt>Type:</dt>
                        <dd>${this.escapeHtml(organization.type)}</dd>
                        
                        <dt>Contact Email:</dt>
                        <dd><a href="mailto:${organization.contactEmail}">${this.escapeHtml(organization.contactEmail)}</a></dd>
                        
                        <dt>Response Time:</dt>
                        <dd>${organization.responseTimedays} days</dd>
                        
                        <dt>Escalation Time:</dt>
                        <dd>${organization.escalationTimedays} days</dd>
                    </dl>
                    ` : ''}

                    ${complaint.updates && complaint.updates.length > 0 ? `
                    <h5 class="h6 mt-4 mb-2">Update History</h5>
                    <div class="timeline">
                        ${complaint.updates.map(update => `
                            <div class="timeline-item">
                                <small class="text-muted">${this.formatDateTime(update.date)}</small>
                                <div>${this.escapeHtml(update.details.status || update.type)}</div>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    escalateComplaintDirect(complaintId) {
        const complaint = this.complaints.find(c => c.id === complaintId);
        if (!complaint) return;

        if (confirm('Are you sure you want to escalate this complaint? This will mark it as needing escalation and update its priority.')) {
            this.updateComplaintStatus(complaintId, 'escalation');
            
            if (window.accessibilityManager) {
                window.accessibilityManager.announce('Complaint escalated successfully', 'assertive');
            }
        }
    }

    markComplaintResolvedDirect(complaintId) {
        const complaint = this.complaints.find(c => c.id === complaintId);
        if (!complaint) return;

        if (confirm('Are you sure you want to mark this complaint as resolved? This action cannot be undone.')) {
            this.updateComplaintStatus(complaintId, 'resolved');
            
            if (window.accessibilityManager) {
                window.accessibilityManager.announce('Complaint marked as resolved', 'assertive');
            }
        }
    }

    escalateComplaint() {
        const btn = document.getElementById('escalate-complaint');
        if (!btn) return;

        const complaintId = btn.dataset.complaintId;
        this.escalateComplaintDirect(complaintId);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('complaintModal'));
        if (modal) modal.hide();
    }

    markComplaintResolved() {
        const btn = document.getElementById('mark-resolved');
        if (!btn) return;

        const complaintId = btn.dataset.complaintId;
        this.markComplaintResolvedDirect(complaintId);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('complaintModal'));
        if (modal) modal.hide();
    }

    updateComplaintStatus(complaintId, newStatus) {
        if (window.complaintManager) {
            window.complaintManager.updateComplaint(complaintId, { status: newStatus });
        } else {
            // Direct update fallback
            const complaint = this.complaints.find(c => c.id === complaintId);
            if (complaint) {
                complaint.status = newStatus;
                complaint.updates.push({
                    date: new Date().toISOString(),
                    type: 'status_change',
                    details: { status: newStatus }
                });
                localStorage.setItem('complaints', JSON.stringify(this.complaints));
            }
        }

        // Refresh display
        this.loadData();
        this.applyFilters();
    }

    // Utility methods
    getOrganizationName(organizationId) {
        const org = this.organizations.find(o => o.id === organizationId);
        return org ? org.name : 'Unknown Organization';
    }

    isComplaintOverdue(complaint) {
        if (!complaint.deadline) return false;
        return new Date() > new Date(complaint.deadline);
    }

    calculateDaysElapsed(date) {
        const now = new Date();
        const created = new Date(date);
        const diffTime = Math.abs(now - created);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    calculateProgress(complaint) {
        const statusProgress = {
            'submitted': 20,
            'acknowledged': 40,
            'in-progress': 60,
            'response-due': 80,
            'escalation': 90,
            'resolved': 100
        };
        return statusProgress[complaint.status] || 0;
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

    getProgressBarClass(status) {
        const classMap = {
            'submitted': 'bg-info',
            'acknowledged': 'bg-primary',
            'in-progress': 'bg-primary',
            'response-due': 'bg-warning',
            'escalation': 'bg-danger',
            'resolved': 'bg-success'
        };
        return classMap[status] || 'bg-info';
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

    formatContactMethod(method) {
        const methodMap = {
            'email': 'Email',
            'phone': 'Phone',
            'letter': 'Letter'
        };
        return methodMap[method] || method;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize tracker when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.complaintTracker = new ComplaintTracker();
    });
} else {
    window.complaintTracker = new ComplaintTracker();
}