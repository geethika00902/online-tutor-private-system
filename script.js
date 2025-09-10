// Global variables
let currentUserType = '';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

// Initialize Application
function initializeApp() {
    // Check if we're on the login page
    if (document.getElementById('loginForm')) {
        setupLoginForm();
    }
    
    // Check if we're on the home page
    if (document.getElementById('registrationForm')) {
        setupRegistrationForm();
    }
}

// Setup Login Form
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
}

// Setup Registration Form
function setupRegistrationForm() {
    const registrationForm = document.getElementById('registrationForm');
    
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegistration();
    });
}

// Handle Login
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;
    
    // Basic validation
    if (!email || !password || !userType) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    // Email validation
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = document.querySelector('.login-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;
        
        // Simulate API call (replace with actual API call)
        const response = await simulateLogin(email, password, userType);
        
        if (response.success) {
            showAlert('Login successful!', 'success');
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(response.user));
            // Redirect to dashboard (you can create this page later)
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showAlert(response.message || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        showAlert('An error occurred. Please try again.', 'error');
    } finally {
        // Reset button state
        const submitBtn = document.querySelector('.login-btn');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Handle Registration
async function handleRegistration() {
    const formData = new FormData(document.getElementById('registrationForm'));
    const userData = Object.fromEntries(formData);
    
    // Basic validation
    if (!userData.firstName || !userData.lastName || !userData.email || 
        !userData.password || !userData.confirmPassword || !userData.phone) {
        showAlert('Please fill in all required fields', 'error');
        return;
    }
    
    // Email validation
    if (!isValidEmail(userData.email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }
    
    // Password validation
    if (userData.password !== userData.confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }
    
    if (userData.password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'error');
        return;
    }
    
    // User type specific validation
    if (currentUserType === 'student' && !userData.grade) {
        showAlert('Please select your grade level', 'error');
        return;
    }
    
    if (currentUserType === 'teacher' && (!userData.subject || !userData.experience)) {
        showAlert('Please fill in all teacher-specific fields', 'error');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = document.querySelector('.register-submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
        submitBtn.disabled = true;
        
        // Prepare user data
        const registrationData = {
            ...userData,
            userType: currentUserType,
            createdAt: new Date().toISOString()
        };
        
        // Simulate API call (replace with actual API call)
        const response = await simulateRegistration(registrationData);
        
        if (response.success) {
            showAlert('Registration successful! You can now login.', 'success');
            // Close modal and redirect to login
            setTimeout(() => {
                closeRegistration();
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showAlert(response.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        showAlert('An error occurred. Please try again.', 'error');
    } finally {
        // Reset button state
        const submitBtn = document.querySelector('.register-submit-btn');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Open Registration Modal
function openRegistration(userType) {
    currentUserType = userType;
    const modal = document.getElementById('registrationModal');
    const modalTitle = document.getElementById('modalTitle');
    const studentFields = document.getElementById('studentFields');
    const teacherFields = document.getElementById('teacherFields');
    const teacherExperience = document.getElementById('teacherExperience');
    
    // Update modal title
    modalTitle.textContent = `Register as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`;
    
    // Show/hide relevant fields
    if (userType === 'student') {
        studentFields.style.display = 'block';
        teacherFields.style.display = 'none';
        teacherExperience.style.display = 'none';
        // Make grade required
        document.getElementById('regGrade').required = true;
        document.getElementById('regSubject').required = false;
        document.getElementById('regExperience').required = false;
    } else if (userType === 'teacher') {
        studentFields.style.display = 'none';
        teacherFields.style.display = 'block';
        teacherExperience.style.display = 'block';
        // Make teacher fields required
        document.getElementById('regGrade').required = false;
        document.getElementById('regSubject').required = true;
        document.getElementById('regExperience').required = true;
    }
    
    // Show modal
    modal.style.display = 'block';
    
    // Clear form
    document.getElementById('registrationForm').reset();
}

// Close Registration Modal
function closeRegistration() {
    const modal = document.getElementById('registrationModal');
    modal.style.display = 'none';
    currentUserType = '';
    
    // Reset form
    document.getElementById('registrationForm').reset();
    
    // Hide all conditional fields
    document.getElementById('studentFields').style.display = 'none';
    document.getElementById('teacherFields').style.display = 'none';
    document.getElementById('teacherExperience').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('registrationModal');
    if (event.target === modal) {
        closeRegistration();
    }
}

// Utility Functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

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

// API calls to backend server
async function simulateLogin(email, password, userType) {
    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, userType })
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Login API error:', error);
        return {
            success: false,
            message: 'Unable to connect to server. Please make sure the backend is running.'
        };
    }
}

async function simulateRegistration(userData) {
    try {
        const response = await fetch('http://localhost:3001/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Registration API error:', error);
        return {
            success: false,
            message: 'Unable to connect to server. Please make sure the backend is running.'
        };
    }
}

// Add CSS animations for alerts
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
