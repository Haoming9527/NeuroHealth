// API Configuration
const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your backend URL

if (typeof redirectIfAuthenticated === 'function') {
    redirectIfAuthenticated();
}

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

// Form Toggle Functions
function showRegisterForm() {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    clearErrors();
}

function showLoginForm() {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    clearErrors();
}

// Event Listeners for Form Toggle
showRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterForm();
});

showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});

// Validation Functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

function validateUsername(username) {
    return username.trim().length >= 2;
}

function validateAge(age) {
    return age >= 13 && age <= 120;
}

function validateHeight(height) {
    return height >= 100 && height <= 250;
}

function validateWeight(weight) {
    return weight >= 30 && weight <= 300;
}

// Error Display Functions
function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
}

function clearErrors() {
    loginError.classList.remove('show');
    registerError.classList.remove('show');
    loginError.textContent = '';
    registerError.textContent = '';
}

// Loading State Functions
function setLoadingState(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        button.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        button.disabled = false;
    }
}

// Login Form Handler
loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');

    // Client-side validation
    if (!validateEmail(email)) {
        showError(loginError, 'Please enter a valid email address');
        return;
    }

    if (!validatePassword(password)) {
        showError(loginError, 'Password must be at least 8 characters long');
        return;
    }

    // Set loading state
    setLoadingState(loginBtn, true);

    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store JWT token
            localStorage.setItem('token', data.token);
            
            // Store user data if provided
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Redirect to dashboard
            window.location.href = '/html/dashboard.html';
        } else {
            // Display error message from server
            showError(loginError, data.message || 'Invalid email or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(loginError, 'Unable to connect to server. Please try again later.');
    } finally {
        setLoadingState(loginBtn, false);
    }
});

// Register Form Handler
registerFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const username = document.getElementById('registerUsername').value.trim();
    const age = parseInt(document.getElementById('registerAge').value);
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const height = parseFloat(document.getElementById('registerHeight').value);
    const weight = parseFloat(document.getElementById('registerWeight').value);
    const registerBtn = document.getElementById('registerBtn');

    // Client-side validation
    if (!validateUsername(username)) {
        showError(registerError, 'Please enter a valid username (at least 2 characters)');
        return;
    }

    if (!validateAge(age)) {
        showError(registerError, 'Age must be between 13 and 120');
        return;
    }

    if (!validateEmail(email)) {
        showError(registerError, 'Please enter a valid email address');
        return;
    }

    if (!validatePassword(password)) {
        showError(registerError, 'Password must be at least 8 characters long');
        return;
    }

    if (!validateHeight(height)) {
        showError(registerError, 'Height must be between 100 and 250 cm');
        return;
    }

    if (!validateWeight(weight)) {
        showError(registerError, 'Weight must be between 30 and 300 kg');
        return;
    }

    // Set loading state
    setLoadingState(registerBtn, true);

    try {
        const BMI = Number.isFinite(height) && height > 0
            ? parseFloat((weight / Math.pow(height / 100, 2)).toFixed(2))
            : undefined;

        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                email,
                password,
                age,
                height,
                weight,
                BMI
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Store JWT token
            localStorage.setItem('token', data.token);

            // Store user data if provided
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            window.location.href = '/html/dashboard.html';
        } else {
            // Display error message from server
            showError(registerError, data.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError(registerError, 'Unable to connect to server. Please try again later.');
    } finally {
        setLoadingState(registerBtn, false);
    }
});

// Expose helper hooks for other scripts if needed
window.authHelpers = {
    API_BASE_URL
};