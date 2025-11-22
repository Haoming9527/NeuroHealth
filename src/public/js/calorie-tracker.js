(function () {
    const API_BASE_URL = 'http://localhost:3000/api';
    const redirectToAuth = () => window.location.href = 'auth.html';

    const loggedIn = isAuthenticated();
    const user = loggedIn ? getUserData() : null;

    // DOM elements
    const navLinks = document.getElementById('navLinks');
    const userChip = document.getElementById('userChip');
    const saveButton = document.getElementById('saveMealBtn');
    const analyzeMealBtn = document.getElementById('analyzeMealBtn');
    const clearBtn = document.getElementById('clearBtn');
    const mealForm = document.getElementById('mealForm');
    const formStatus = document.getElementById('formStatus');
    const aiResultContainer = document.getElementById('aiResultContainer');
    const calorieValue = document.getElementById('calorieValue');
    const aiInsights = document.getElementById('aiInsights');
    const emptyState = document.getElementById('emptyState');

    let currentAnalysisResult = null;

    function renderNav() {
        if (!navLinks) return null;

        if (loggedIn) {
            navLinks.innerHTML = `
                <a href="dashboard.html">Dashboard</a>
                <a href="calorie-tracker.html">Calorie Tracking</a>
                <button id="authToggleBtn" class="btn-primary">Logout</button>
            `;
        } else {
            navLinks.innerHTML = `
                <a href="../index.html#features">Features</a>
                <a href="../index.html#about">About</a>
                <a href="calorie-tracker.html">Calorie Tracking</a>
                <a href="auth.html" class="btn-primary">Get Started</a>
            `;
        }

        return document.getElementById('authToggleBtn');
    }

    const authButton = renderNav();

    if (userChip) {
        userChip.textContent = loggedIn && user ? user.username : 'Guest mode';
    }

    if (loggedIn) {
        if (authButton) {
            setupLogoutButton('authToggleBtn');
        }
    } else {
        if (authButton) {
            authButton.textContent = 'Login';
            authButton.classList.remove('btn-primary');
            authButton.classList.add('btn-secondary');
            authButton.addEventListener('click', redirectToAuth);
        }

        if (saveButton) {
            saveButton.textContent = 'Login to save';
            saveButton.classList.remove('btn-primary');
            saveButton.classList.add('btn-secondary');
            saveButton.addEventListener('click', redirectToAuth);
        }
    }

    async function analyzeMeal() {

        const mealType = document.getElementById('mealType').value;
        const description = document.getElementById('mealDescription').value.trim();
        const portion = document.getElementById('mealPortion').value.trim();
        const notes = document.getElementById('mealNotes').value.trim();

        if (!description) {
            formStatus.textContent = 'Please enter what you ate.';
            formStatus.style.color = 'var(--error-color)';
            return;
        }

        if (!portion) {
            formStatus.textContent = 'Please enter the portion size.';
            formStatus.style.color = 'var(--error-color)';
            return;
        }

        try {
            analyzeMealBtn.disabled = true;
            analyzeMealBtn.textContent = 'Analyzing...';
            formStatus.textContent = 'Analyzing with Gemini AI...';
            formStatus.style.color = 'var(--text-secondary)';

            const headers = {
                'Content-Type': 'application/json',
            };
            
            // Only add auth header if logged in (optional for guest mode)
            if (loggedIn) {
                const token = getAuthToken();
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }

            const response = await fetch(`${API_BASE_URL}/calorie/generate`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    mealType,
                    description,
                    portion,
                    notes,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to analyze meal');
            }

            const result = await response.json();
            currentAnalysisResult = result;

            // Display results
            if (result.aiEstimateCalories) {
                calorieValue.textContent = Math.round(result.aiEstimateCalories);
            } else {
                calorieValue.textContent = '?';
            }

            // Format and display AI insights
            if (result.aiInsights) {
                const formattedInsights = result.aiInsights
                    .replace(/ESTIMATED_CALORIES:\s*\d+(?:\.\d+)?/gi, '')
                    .trim();
                aiInsights.innerHTML = formattedInsights.replace(/\n/g, '<br>');
            }

            aiResultContainer.style.display = 'block';
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            // Only enable save button if logged in
            if (loggedIn) {
                saveButton.disabled = false;
                formStatus.textContent = 'Analysis complete! You can now save this meal.';
            } else {
                saveButton.disabled = true;
                formStatus.textContent = 'Analysis complete! Login to save this meal.';
            }
            formStatus.style.color = 'var(--success-color)';
        } catch (error) {
            console.error('Analysis error:', error);
            formStatus.textContent = `Error: ${error.message}`;
            formStatus.style.color = 'var(--error-color)';
        } finally {
            analyzeMealBtn.disabled = false;
            analyzeMealBtn.textContent = 'Analyze with Gemini';
        }
    }

    async function saveMeal() {
        if (!loggedIn || !currentAnalysisResult) {
            return;
        }

        try {
            saveButton.disabled = true;
            saveButton.textContent = 'Saving...';
            formStatus.textContent = 'Saving meal...';
            formStatus.style.color = 'var(--text-secondary)';

            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/calorie/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userFoodIntake: `${currentAnalysisResult.description} (${currentAnalysisResult.portion})${currentAnalysisResult.notes ? ' - ' + currentAnalysisResult.notes : ''}`,
                    aiEstimateCalories: currentAnalysisResult.aiEstimateCalories,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save meal');
            }

            formStatus.textContent = 'Meal saved successfully!';
            formStatus.style.color = 'var(--success-color)';

            // Reset form
            mealForm.reset();
            aiResultContainer.style.display = 'none';
            currentAnalysisResult = null;
            saveButton.disabled = true;
        } catch (error) {
            console.error('Save error:', error);
            formStatus.textContent = `Error: ${error.message}`;
            formStatus.style.color = 'var(--error-color)';
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Save meal';
        }
    }


    function clearForm() {
        mealForm.reset();
        aiResultContainer.style.display = 'none';
        currentAnalysisResult = null;
        saveButton.disabled = true;
        formStatus.textContent = '';
        if (emptyState) {
            emptyState.style.display = 'block';
        }
    }

    // Event listeners
    // Analyze button works for both guests and logged-in users
    if (analyzeMealBtn) {
        analyzeMealBtn.addEventListener('click', analyzeMeal);
    }

    // Save button only works for logged-in users
    if (saveButton && loggedIn) {
        saveButton.addEventListener('click', saveMeal);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearForm);
    }

})();
