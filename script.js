/* ===================================
   CONTACT MANAGER - JAVASCRIPT LOGIC
   =================================== */

// ========== GLOBAL VGit add .ARIABLES ==========
let contacts = []; // Array to store all contacts
const STORAGE_KEY = 'contacts'; // Key for localStorage

// ========== DOM ELEMENTS ==========
const contactForm = document.getElementById('contactForm');
const contactName = document.getElementById('contactName');
const contactPhone = document.getElementById('contactPhone');
const contactEmail = document.getElementById('contactEmail');
const contactId = document.getElementById('contactId');
const submitBtn = document.getElementById('submitBtn');
const contactsList = document.getElementById('contactsList');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const totalContacts = document.getElementById('totalContacts');

// ========== INITIALIZATION ==========
/**
 * Initialize the app when page loads
 */
document.addEventListener('DOMContentLoaded', () => {
    loadContacts(); // Load contacts from localStorage
    displayContacts(contacts); // Display all contacts
    setupEventListeners(); // Setup all event listeners
});

// ========== EVENT LISTENERS ==========
/**
 * Setup all event listeners for the application
 */
function setupEventListeners() {
    // Form submission for adding/updating contact
    contactForm.addEventListener('submit', handleFormSubmit);

    // Search input for filtering contacts
    searchInput.addEventListener('keyup', handleSearch);

    // Clear search button
    clearSearchBtn.addEventListener('click', handleClearSearch);
}

/**
 * Handle form submission (Add or Update)
 */
function handleFormSubmit(e) {
    e.preventDefault();

    // Validate form inputs
    if (!contactName.value.trim() || !contactPhone.value.trim() || !contactEmail.value.trim()) {
        alert('Please fill in all fields!');
        return;
    }

    // Check if editing existing contact or adding new one
    const id = contactId.value;

    if (id) {
        // Update existing contact
        updateContact(id, {
            name: contactName.value.trim(),
            phone: contactPhone.value.trim(),
            email: contactEmail.value.trim()
        });
    } else {
        // Add new contact
        addContact({
            name: contactName.value.trim(),
            phone: contactPhone.value.trim(),
            email: contactEmail.value.trim()
        });
    }

    // Reset form
    resetForm();

    // Refresh display
    displayContacts(contacts);

    // Update search results
    handleSearch();
}

/**
 * Handle search functionality
 */
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === '') {
        // Show all contacts if search is empty
        displayContacts(contacts);
    } else {
        // Filter contacts by name or phone
        const filteredContacts = contacts.filter(contact => {
            const nameMatch = contact.name.toLowerCase().includes(searchTerm);
            const phoneMatch = contact.phone.includes(searchTerm);
            return nameMatch || phoneMatch;
        });

        displayContacts(filteredContacts);
    }
}

/**
 * Handle clear search button
 */
function handleClearSearch() {
    searchInput.value = ''; // Clear search input
    displayContacts(contacts); // Show all contacts
    searchInput.focus(); // Focus on search input
}

// ========== CONTACT OPERATIONS (CRUD) ==========
/**
 * Add a new contact
 * @param {Object} contactData - Contact data (name, phone, email)
 */
function addContact(contactData) {
    // Generate unique ID using timestamp
    const newContact = {
        id: Date.now(),
        name: contactData.name,
        phone: contactData.phone,
        email: contactData.email
    };

    // Add to contacts array
    contacts.push(newContact);

    // Save to localStorage
    saveContacts();

    // Show success message
    showNotification('Contact added successfully!', 'success');
}

/**
 * Update existing contact
 * @param {number} id - Contact ID
 * @param {Object} contactData - Updated contact data
 */
function updateContact(id, contactData) {
    // Find contact index
    const index = contacts.findIndex(contact => contact.id === parseInt(id));

    if (index !== -1) {
        // Update contact properties
        contacts[index] = {
            ...contacts[index],
            ...contactData
        };

        // Save to localStorage
        saveContacts();

        // Show success message
        showNotification('Contact updated successfully!', 'success');
    }
}

/**
 * Delete a contact
 * @param {number} id - Contact ID to delete
 */
function deleteContact(id) {
    // Show confirmation dialog
    if (confirm('Are you sure you want to delete this contact?')) {
        // Filter out the contact with the given ID
        contacts = contacts.filter(contact => contact.id !== id);

        // Save to localStorage
        saveContacts();

        // Show success message
        showNotification('Contact deleted successfully!', 'success');

        // Refresh display
        displayContacts(contacts);

        // Update search results
        handleSearch();
    }
}

// ========== DISPLAY FUNCTIONS ==========
/**
 * Display contacts on the screen
 * @param {Array} contactsToDisplay - Array of contacts to display
 */
function displayContacts(contactsToDisplay) {
    // Update total contacts count
    totalContacts.textContent = contacts.length;

    // Clear previous content
    contactsList.innerHTML = '';

    if (contactsToDisplay.length === 0) {
        // Show empty state message
        contactsList.innerHTML = `
            <div class="col-12">
                <p class="text-center text-muted">
                    <i class="fas fa-inbox"></i><br>
                    No contacts found. ${searchInput.value ? 'Try a different search.' : 'Add one to get started!'}
                </p>
            </div>
        `;
        return;
    }

    // Create HTML for each contact
    contactsToDisplay.forEach(contact => {
        const contactCard = createContactCard(contact);
        contactsList.appendChild(contactCard);
    });
}

/**
 * Create a contact card element
 * @param {Object} contact - Contact object
 * @returns {HTMLElement} Contact card element
 */
function createContactCard(contact) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';

    col.innerHTML = `
        <div class="contact-card">
            <!-- Contact Header with Name -->
            <div class="contact-card-header">
                <h6 class="contact-name">
                    <i class="fas fa-user-circle" style="color: #667eea;"></i> ${contact.name}
                </h6>
            </div>

            <!-- Contact Information -->
            <div class="contact-info">
                <!-- Phone Number -->
                <div class="contact-info-item">
                    <i class="fas fa-phone"></i>
                    <span class="contact-info-value">${contact.phone}</span>
                </div>

                <!-- Email Address -->
                <div class="contact-info-item">
                    <i class="fas fa-envelope"></i>
                    <span class="contact-info-value" style="word-break: break-all;">${contact.email}</span>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="contact-actions">
                <!-- Edit Button -->
                <button class="btn btn-warning btn-sm" onclick="editContact(${contact.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>

                <!-- Delete Button -->
                <button class="btn btn-danger btn-sm" onclick="deleteContact(${contact.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;

    return col;
}

// ========== EDIT FUNCTIONALITY ==========
/**
 * Load contact data into form for editing
 * @param {number} id - Contact ID to edit
 */
function editContact(id) {
    // Find the contact
    const contact = contacts.find(c => c.id === id);

    if (contact) {
        // Populate form with contact data
        contactName.value = contact.name;
        contactPhone.value = contact.phone;
        contactEmail.value = contact.email;
        contactId.value = contact.id;

        // Update button text
        submitBtn.textContent = '✓ Update Contact';
        submitBtn.classList.add('btn-warning');
        submitBtn.classList.remove('btn-primary');

        // Scroll to form
        contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Focus on first input
        contactName.focus();
    }
}

/**
 * Reset form to initial state
 */
function resetForm() {
    contactForm.reset();
    contactId.value = '';
    submitBtn.textContent = '✓ Add Contact';
    submitBtn.classList.add('btn-primary');
    submitBtn.classList.remove('btn-warning');
}

// ========== LOCALSTORAGE FUNCTIONS ==========
/**
 * Save contacts to localStorage
 */
function saveContacts() {
    // Convert contacts array to JSON and save
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

/**
 * Load contacts from localStorage
 */
function loadContacts() {
    // Get contacts from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
        try {
            // Parse JSON and load into contacts array
            contacts = JSON.parse(stored);
        } catch (error) {
            // If parsing fails, start fresh
            console.error('Error parsing contacts from storage:', error);
            contacts = [];
        }
    } else {
        // Start with empty array if no stored contacts
        contacts = [];
    }
}

// ========== UTILITY FUNCTIONS ==========
/**
 * Show notification message
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'info'} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Insert at the beginning of container
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

/**
 * Export contacts as JSON (bonus feature)
 */
function exportContacts() {
    const dataStr = JSON.stringify(contacts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contacts.json';
    link.click();
}

/**
 * Clear all contacts (for development/testing)
 */
function clearAllContacts() {
    if (confirm('Are you sure? This will delete all contacts!')) {
        contacts = [];
        saveContacts();
        displayContacts([]);
        showNotification('All contacts cleared!', 'info');
    }
}

// ========== DEBUG CONSOLE COMMANDS ==========
// You can use these commands in browser console:
// exportContacts() - Export all contacts as JSON file
// clearAllContacts() - Clear all contacts
// contacts - View all contacts in console
