// Dashboard JavaScript
let currentUser = null;
let selectedTeacher = null;
let currentConversationPartner = null;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

// Initialize Dashboard
function initializeDashboard() {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
        // Redirect to login if not logged in
        window.location.href = 'index.html';
        return;
    }
    
    // Parse user data
    currentUser = JSON.parse(userData);
    
    // Setup dashboard
    setupDashboard();
    setupNavigation();
    setupMessageForm();
    loadUserData();
}

// Setup Dashboard
function setupDashboard() {
    // Update welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    const userInfo = document.getElementById('userInfo');
    
    welcomeMessage.textContent = `Welcome, ${currentUser.first_name || 'User'}!`;
    userInfo.textContent = `${(currentUser.user_type || 'User').charAt(0).toUpperCase() + (currentUser.user_type || 'user').slice(1)} Dashboard`;
    
    // Show/hide relevant profile sections
    if (currentUser.user_type === 'student') {
        document.getElementById('profileGradeSection').style.display = 'block';
        document.getElementById('profileSubjectSection').style.display = 'none';
        document.getElementById('profileExperienceSection').style.display = 'none';
        // Show teachers directory for students
        document.getElementById('teachersNav').style.display = 'block';
    } else if (currentUser.user_type === 'teacher') {
        document.getElementById('profileGradeSection').style.display = 'none';
        document.getElementById('profileSubjectSection').style.display = 'block';
        document.getElementById('profileExperienceSection').style.display = 'block';
        // Hide teachers directory for teachers
        document.getElementById('teachersNav').style.display = 'none';
    }
}

// Setup Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
}

// Setup Message Form
function setupMessageForm() {
    const messageForm = document.getElementById('messageForm');
    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendMessage();
        });
    }
    
    const replyForm = document.getElementById('replyForm');
    if (replyForm) {
        replyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendReply();
        });
    }
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const messageModal = document.getElementById('messageModal');
        const conversationModal = document.getElementById('conversationModal');
        
        if (event.target === messageModal) {
            closeMessageModal();
        }
        if (event.target === conversationModal) {
            closeConversationModal();
        }
    };
}

// Show Section
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Load section-specific data
    switch (sectionId) {
        case 'overview':
            loadOverviewData();
            break;
        case 'profile':
            loadProfileData();
            break;
        case 'sessions':
            loadSessionsData();
            break;
        case 'teachers':
            loadTeachersData();
            break;
        case 'messages':
            loadMessagesData();
            break;
    }
}

// Load User Data
async function loadUserData() {
    try {
        // Load user profile from API to get fresh data
        const response = await fetch(`http://localhost:3001/api/profile/${currentUser.id}`);
        const data = await response.json();
        
        if (data.success) {
            // Update current user with fresh data from database
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            // Update welcome message with correct name
            const welcomeMessage = document.getElementById('welcomeMessage');
            const userInfo = document.getElementById('userInfo');
            
            welcomeMessage.textContent = `Welcome, ${currentUser.first_name}!`;
            userInfo.textContent = `${currentUser.user_type.charAt(0).toUpperCase() + currentUser.user_type.slice(1)} Dashboard`;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
    
    // Load profile data
    loadProfileData();
    
    // Load overview data
    loadOverviewData();
}

// Load Profile Data
function loadProfileData() {
    document.getElementById('profileFirstName').value = currentUser.first_name || '';
    document.getElementById('profileLastName').value = currentUser.last_name || '';
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profilePhone').value = currentUser.phone || '';
    
    if (currentUser.user_type === 'student') {
        document.getElementById('profileGrade').value = currentUser.grade || '';
    } else if (currentUser.user_type === 'teacher') {
        document.getElementById('profileSubject').value = currentUser.subject || '';
        document.getElementById('profileExperience').value = currentUser.experience || '';
    }
}

// Load Overview Data
function loadOverviewData() {
    // Simulate loading data (replace with actual API calls)
    setTimeout(() => {
        // Update stats (these would come from your database)
        document.getElementById('totalSessions').textContent = '0';
        document.getElementById('averageRating').textContent = '0.0';
        document.getElementById('hoursCompleted').textContent = '0';
        document.getElementById('unreadMessages').textContent = '0';
        
        // Update recent activity
        const recentActivity = document.getElementById('recentActivity');
        recentActivity.innerHTML = `
            <div class="activity-item">
                <i class="fas fa-user-plus"></i>
                <p>Account created successfully</p>
                <span class="activity-time">${new Date().toLocaleDateString()}</span>
            </div>
            <div class="activity-item">
                <i class="fas fa-info-circle"></i>
                <p>Complete your profile to get started</p>
                <span class="activity-time">Just now</span>
            </div>
            ${currentUser.user_type === 'student' ? `
            <div class="activity-item">
                <i class="fas fa-chalkboard-teacher"></i>
                <p>Browse available teachers in the "Find Teachers" section</p>
                <span class="activity-time">Just now</span>
            </div>
            ` : ''}
        `;
    }, 500);
}

// Load Sessions Data
function loadSessionsData() {
    const sessionsList = document.getElementById('sessionsList');
    
    // Simulate loading sessions (replace with actual API calls)
    setTimeout(() => {
        sessionsList.innerHTML = `
            <div class="no-sessions">
                <i class="fas fa-calendar-times"></i>
                <p>No sessions scheduled yet.</p>
                <p>Start by finding a ${currentUser.user_type === 'student' ? 'teacher' : 'student'} to begin tutoring!</p>
            </div>
        `;
    }, 500);
}

// Load Teachers Data
async function loadTeachersData() {
    const teachersDirectory = document.getElementById('teachersDirectory');
    
    try {
        const response = await fetch('http://localhost:3001/api/teachers');
        const data = await response.json();
        
        if (data.success) {
            displayTeachers(data.teachers);
        } else {
            teachersDirectory.innerHTML = `
                <div class="no-teachers">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load teachers. Please try again.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading teachers:', error);
        teachersDirectory.innerHTML = `
            <div class="no-teachers">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Unable to connect to server. Please make sure the backend is running.</p>
            </div>
        `;
    }
}

// Display Teachers
function displayTeachers(teachers) {
    const teachersDirectory = document.getElementById('teachersDirectory');
    
    if (teachers.length === 0) {
        teachersDirectory.innerHTML = `
            <div class="no-teachers">
                <i class="fas fa-chalkboard-teacher"></i>
                <p>No teachers available at the moment.</p>
            </div>
        `;
        return;
    }
    
    const teachersHTML = teachers.map(teacher => `
        <div class="teacher-card">
            <div class="teacher-header">
                <div class="teacher-info">
                    <h3>${teacher.first_name} ${teacher.last_name}</h3>
                    <p>${teacher.subject.charAt(0).toUpperCase() + teacher.subject.slice(1)} Teacher</p>
                </div>
                <div class="teacher-rating">
                    <i class="fas fa-star"></i>
                    <span>${teacher.rating || '0.0'} (${teacher.total_ratings || 0} reviews)</span>
                </div>
            </div>
            
            <div class="teacher-details">
                <div class="detail-item">
                    <i class="fas fa-envelope"></i>
                    <span>${teacher.email}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-phone"></i>
                    <span>${teacher.phone}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>${teacher.experience} years experience</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-book"></i>
                    <span>${teacher.subject.charAt(0).toUpperCase() + teacher.subject.slice(1)}</span>
                </div>
            </div>
            
            <div class="teacher-actions">
                <button class="action-btn message-btn" onclick="openMessageModal(${teacher.id}, '${teacher.first_name} ${teacher.last_name}')">
                    <i class="fas fa-envelope"></i> Send Message
                </button>
                <button class="action-btn book-btn" onclick="bookAppointment(${teacher.id}, '${teacher.first_name} ${teacher.last_name}')">
                    <i class="fas fa-calendar-plus"></i> Book Session
                </button>
            </div>
        </div>
    `).join('');
    
    teachersDirectory.innerHTML = teachersHTML;
}

// Load Messages Data
async function loadMessagesData() {
    const messagesList = document.getElementById('messagesList');
    
    try {
        // Get all messages for the current user
        const response = await fetch(`http://localhost:3001/api/user-messages/${currentUser.id}`);
        const data = await response.json();
        
        if (data.success) {
            displayMessages(data.messages);
        } else {
            messagesList.innerHTML = `
                <div class="no-messages">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load messages. Please try again.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        messagesList.innerHTML = `
            <div class="no-messages">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Unable to connect to server. Please make sure the backend is running.</p>
            </div>
        `;
    }
}

// Display Messages
function displayMessages(messages) {
    const messagesList = document.getElementById('messagesList');
    
    if (messages.length === 0) {
        messagesList.innerHTML = `
            <div class="no-messages">
                <i class="fas fa-envelope-open"></i>
                <p>No messages yet.</p>
                <p>Messages will appear here when you start communicating with ${currentUser.user_type === 'student' ? 'teachers' : 'students'}.</p>
            </div>
        `;
        return;
    }
    
    // Group messages by conversation partner
    const conversations = {};
    messages.forEach(message => {
        const partnerId = message.sender_id === currentUser.id ? message.receiver_id : message.sender_id;
        const partnerName = message.sender_id === currentUser.id ? 
            `${message.receiver_first_name} ${message.receiver_last_name}` : 
            `${message.sender_first_name} ${message.sender_last_name}`;
        
        if (!conversations[partnerId]) {
            conversations[partnerId] = {
                partnerName: partnerName,
                partnerId: partnerId,
                messages: []
            };
        }
        conversations[partnerId].messages.push(message);
    });
    
    // Display conversations
    const conversationsHTML = Object.values(conversations).map(conversation => {
        const latestMessage = conversation.messages[conversation.messages.length - 1];
        const isFromMe = latestMessage.sender_id === currentUser.id;
        const messagePreview = latestMessage.message_text.length > 50 ? 
            latestMessage.message_text.substring(0, 50) + '...' : 
            latestMessage.message_text;
        
        return `
            <div class="conversation-item" onclick="openConversation(${conversation.partnerId}, '${conversation.partnerName}')">
                <div class="conversation-header">
                    <h4>${conversation.partnerName}</h4>
                    <span class="message-time">${new Date(latestMessage.created_at).toLocaleDateString()}</span>
                </div>
                <div class="message-preview">
                    <span class="message-sender">${isFromMe ? 'You: ' : ''}</span>
                    <span class="message-text">${messagePreview}</span>
                </div>
                <div class="unread-indicator" style="display: ${latestMessage.is_read ? 'none' : 'block'}"></div>
            </div>
        `;
    }).join('');
    
    messagesList.innerHTML = `
        <div class="messages-container">
            <div class="messages-header">
                <h3>Your Conversations</h3>
                <button class="refresh-messages-btn" onclick="loadMessagesData()">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
            <div class="conversations-list">
                ${conversationsHTML}
            </div>
        </div>
    `;
}

// Update Password
async function updatePassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (!newPassword || !confirmPassword) {
        showAlert('Please fill in both password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showAlert('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3001/api/update-password/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newPassword })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Password updated successfully!', 'success');
            // Clear password fields
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmNewPassword').value = '';
        } else {
            showAlert(data.message || 'Failed to update password', 'error');
        }
    } catch (error) {
        console.error('Password update error:', error);
        showAlert('Unable to connect to server', 'error');
    }
}

// Open Message Modal
function openMessageModal(teacherId, teacherName) {
    selectedTeacher = { id: teacherId, name: teacherName };
    const modal = document.getElementById('messageModal');
    const modalTitle = document.getElementById('messageModalTitle');
    
    modalTitle.textContent = `Send Message to ${teacherName}`;
    modal.style.display = 'block';
    
    // Clear message input
    document.getElementById('messageInput').value = '';
}

// Close Message Modal
function closeMessageModal() {
    const modal = document.getElementById('messageModal');
    modal.style.display = 'none';
    selectedTeacher = null;
}

// Send Message
async function sendMessage() {
    if (!selectedTeacher) return;
    
    const messageText = document.getElementById('messageInput').value.trim();
    
    if (!messageText) {
        showAlert('Please enter a message', 'error');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3001/api/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                senderId: currentUser.id,
                receiverId: selectedTeacher.id,
                messageText: messageText
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Message sent successfully!', 'success');
            closeMessageModal();
        } else {
            showAlert(data.message || 'Failed to send message', 'error');
        }
    } catch (error) {
        console.error('Send message error:', error);
        showAlert('Unable to connect to server', 'error');
    }
}

// Book Appointment (placeholder function)
function bookAppointment(teacherId, teacherName) {
    showAlert(`Appointment booking with ${teacherName} - Feature coming soon!`, 'info');
}

// Open Conversation
async function openConversation(partnerId, partnerName) {
    currentConversationPartner = { id: partnerId, name: partnerName };
    
    const modal = document.getElementById('conversationModal');
    const modalTitle = document.getElementById('conversationModalTitle');
    
    modalTitle.textContent = `Conversation with ${partnerName}`;
    modal.style.display = 'block';
    
    // Load conversation messages
    await loadConversationMessages(partnerId);
}

// Load Conversation Messages
async function loadConversationMessages(partnerId) {
    const conversationMessages = document.getElementById('conversationMessages');
    
    try {
        const response = await fetch(`http://localhost:3001/api/messages/${currentUser.id}/${partnerId}`);
        const data = await response.json();
        
        if (data.success) {
            displayConversationMessages(data.messages);
        } else {
            conversationMessages.innerHTML = `
                <div class="no-messages">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load conversation. Please try again.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading conversation:', error);
        conversationMessages.innerHTML = `
            <div class="no-messages">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Unable to connect to server.</p>
            </div>
        `;
    }
}

// Display Conversation Messages
function displayConversationMessages(messages) {
    const conversationMessages = document.getElementById('conversationMessages');
    
    if (messages.length === 0) {
        conversationMessages.innerHTML = `
            <div class="no-messages">
                <i class="fas fa-comments"></i>
                <p>No messages yet. Start the conversation!</p>
            </div>
        `;
        return;
    }
    
    const messagesHTML = messages.map(message => {
        const isFromMe = message.sender_id === currentUser.id;
        const senderName = isFromMe ? 'You' : `${message.sender_first_name} ${message.sender_last_name}`;
        const time = new Date(message.created_at).toLocaleString();
        
        return `
            <div class="message-bubble ${isFromMe ? 'sent' : 'received'}">
                <div class="message-content">
                    ${message.message_text}
                </div>
                <div class="message-meta">
                    ${senderName} • ${time}
                </div>
            </div>
        `;
    }).join('');
    
    conversationMessages.innerHTML = messagesHTML;
    
    // Scroll to bottom
    conversationMessages.scrollTop = conversationMessages.scrollHeight;
}

// Close Conversation Modal
function closeConversationModal() {
    const modal = document.getElementById('conversationModal');
    modal.style.display = 'none';
    currentConversationPartner = null;
}

// Send Reply
async function sendReply() {
    if (!currentConversationPartner) return;
    
    const replyText = document.getElementById('replyInput').value.trim();
    
    if (!replyText) {
        showAlert('Please enter a reply', 'error');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3001/api/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                senderId: currentUser.id,
                receiverId: currentConversationPartner.id,
                messageText: replyText
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Clear input
            document.getElementById('replyInput').value = '';
            
            // Reload conversation messages
            await loadConversationMessages(currentConversationPartner.id);
            
            showAlert('Reply sent successfully!', 'success');
        } else {
            showAlert(data.message || 'Failed to send reply', 'error');
        }
    } catch (error) {
        console.error('Send reply error:', error);
        showAlert('Unable to connect to server', 'error');
    }
}

// Logout
function logout() {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    
    // Show logout message
    showAlert('Logged out successfully!', 'success');
    
    // Redirect to login page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Show Alert (reuse from main script.js)
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    // Add alert styles
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            alert.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
            break;
        case 'error':
            alert.style.background = 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)';
            break;
        default:
            alert.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    // Add to page
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 300);
        }
    }, 5000);
}
