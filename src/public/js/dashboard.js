// Dashboard page behavior: enforce auth, populate stats, wire actions.
(function () {
    requireAuth();

    const API_BASE_URL = 'http://localhost:3000/api';
    const user = getUserData();

    const recentEntriesEl = document.getElementById('recentEntries');
    const emptyStateEl = document.getElementById('emptyState');
    const todayCaloriesEl = document.getElementById('todayCalories');
    const todayMealsEl = document.getElementById('todayMeals');
    const avgCaloriesEl = document.getElementById('avgCalories');
    const avgDaysEl = document.getElementById('avgDays');
    const weekCaloriesEl = document.getElementById('weekCalories');
    const weekDaysEl = document.getElementById('weekDays');
    const dateFilterEl = document.getElementById('dateFilter');
    const prevDayBtn = document.getElementById('prevDayBtn');
    const nextDayBtn = document.getElementById('nextDayBtn');
    const todayBtn = document.getElementById('todayBtn');
    const mealsHeaderEl = document.getElementById('mealsHeader');
    const mealsSubheaderEl = document.getElementById('mealsSubheader');

    if (user && document.getElementById('userName')) {
        document.getElementById('userName').textContent = user.username;
    }

    async function fetchCaloriesForDate(date) {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/calorie/date?date=${date}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch calories');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching calories:', error);
            return [];
        }
    }

    async function fetchAllUserCalories() {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/calorie/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch calories');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching all calories:', error);
            return [];
        }
    }

    function calculateStatistics(allCalories) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        // Today's calories
        const todayCalories = allCalories
            .filter(entry => {
                const entryDate = new Date(entry.createdDate);
                entryDate.setHours(0, 0, 0, 0);
                return entryDate.getTime() === today.getTime();
            })
            .reduce((sum, entry) => sum + (entry.aiEstimateCalories || 0), 0);

        const todayMeals = allCalories.filter(entry => {
            const entryDate = new Date(entry.createdDate);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
        }).length;

        // Group by date and calculate daily totals (using local timezone)
        const dailyTotals = {};
        allCalories.forEach(entry => {
            const entryDate = new Date(entry.createdDate);
            const year = entryDate.getFullYear();
            const month = String(entryDate.getMonth() + 1).padStart(2, '0');
            const day = String(entryDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            if (!dailyTotals[dateStr]) {
                dailyTotals[dateStr] = 0;
            }
            dailyTotals[dateStr] += entry.aiEstimateCalories || 0;
        });

        // Calculate average
        const dates = Object.keys(dailyTotals);
        const avgCalories = dates.length > 0
            ? Math.round(dates.reduce((sum, date) => sum + dailyTotals[date], 0) / dates.length)
            : 0;

        // This week's calories (last 7 days)
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        
        const weekCalories = Object.entries(dailyTotals)
            .filter(([dateStr]) => {
                // Parse date string as local date
                const [year, month, day] = dateStr.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                return date >= weekAgo && date <= today;
            })
            .reduce((sum, [, calories]) => sum + calories, 0);

        const weekDays = Object.keys(dailyTotals).filter(dateStr => {
            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            return date >= weekAgo && date <= today;
        }).length;

        return {
            todayCalories: Math.round(todayCalories),
            todayMeals,
            avgCalories,
            avgDays: dates.length,
            weekCalories: Math.round(weekCalories),
            weekDays,
        };
    }

    async function renderStats() {
        try {
            const allCalories = await fetchAllUserCalories();
            const stats = calculateStatistics(allCalories);

            todayCaloriesEl.textContent = stats.todayCalories;
            todayMealsEl.textContent = `${stats.todayMeals} ${stats.todayMeals === 1 ? 'meal' : 'meals'} logged`;

            avgCaloriesEl.textContent = stats.avgCalories;
            avgDaysEl.textContent = `Based on ${stats.avgDays} ${stats.avgDays === 1 ? 'day' : 'days'}`;

            weekCaloriesEl.textContent = stats.weekCalories;
            weekDaysEl.textContent = `${stats.weekDays} ${stats.weekDays === 1 ? 'day' : 'days'} tracked`;
        } catch (error) {
            console.error('Error rendering stats:', error);
        }
    }

    function getSelectedDate() {
        if (dateFilterEl && dateFilterEl.value) {
            return new Date(dateFilterEl.value);
        }
        return new Date();
    }

    function formatDateForDisplay(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (selectedDate.getTime() === today.getTime()) {
            return 'Today';
        }
        
        return selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    function updateDateFilter(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        if (dateFilterEl) {
            dateFilterEl.value = dateStr;
        }
        
        if (mealsHeaderEl) {
            mealsHeaderEl.textContent = formatDateForDisplay(date) + "'s Meals";
        }
        
        if (mealsSubheaderEl) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);
            
            if (selectedDate.getTime() === today.getTime()) {
                mealsSubheaderEl.textContent = 'Your calorie entries for today';
            } else {
                mealsSubheaderEl.textContent = `Your calorie entries for ${formatDateForDisplay(date)}`;
            }
        }
    }

    async function renderEntries() {
        try {
            const selectedDate = getSelectedDate();
            const allCalories = await fetchAllUserCalories();
            
            const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0);
            const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999);
            
            const filteredCalories = allCalories.filter(entry => {
                const entryDate = new Date(entry.createdDate);
                return entryDate >= startOfDay && entryDate <= endOfDay;
            });
            
            const recentEntries = filteredCalories.reverse();

            recentEntriesEl.innerHTML = '';

            if (recentEntries.length === 0) {
                emptyStateEl.style.display = 'block';
                const selectedDate = getSelectedDate();
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                
                if (selectedDate.getTime() === today.getTime()) {
                    emptyStateEl.textContent = 'No meals logged today. Head over to the tracker to add your first one!';
                } else {
                    emptyStateEl.textContent = `No meals logged for ${formatDateForDisplay(selectedDate)}.`;
                }
                return;
            }

            emptyStateEl.style.display = 'none';

            recentEntries.forEach(entry => {
                const item = document.createElement('div');
                item.className = 'recent-item';
                const calories = entry.aiEstimateCalories ? Math.round(entry.aiEstimateCalories) : '?';
                item.innerHTML = `
                    <div>
                        <strong>${entry.userFoodIntake || 'Meal'}</strong>
                        <p class="helper-text">${new Date(entry.createdDate).toLocaleString()}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span>${calories} kcal</span>
                        <button class="btn-ghost" data-id="${entry.id}" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;">Delete</button>
                    </div>
                `;
                
                const deleteBtn = item.querySelector('button');
                deleteBtn.addEventListener('click', () => deleteMeal(entry.id));
                
                recentEntriesEl.appendChild(item);
            });
        } catch (error) {
            console.error('Error rendering entries:', error);
        }
    }

    async function deleteMeal(id) {
        if (!confirm('Delete this meal entry?')) return;

        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/calorie/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete meal');
            }

            // Refresh entries and stats after deletion
            await renderEntries();
            await renderStats();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete meal. Please try again.');
        }
    }

    function navigateDate(days) {
        const currentDate = getSelectedDate();
        currentDate.setDate(currentDate.getDate() + days);
        updateDateFilter(currentDate);
        renderEntries();
    }

    function goToToday() {
        updateDateFilter(new Date());
        renderEntries();
    }

    // Initialize date filter to today
    if (dateFilterEl) {
        updateDateFilter(new Date());
        
        dateFilterEl.addEventListener('change', () => {
            if (dateFilterEl.value) {
                const selectedDate = new Date(dateFilterEl.value);
                updateDateFilter(selectedDate);
                renderEntries();
            }
        });
    }

    if (prevDayBtn) {
        prevDayBtn.addEventListener('click', () => navigateDate(-1));
    }

    if (nextDayBtn) {
        nextDayBtn.addEventListener('click', () => navigateDate(1));
    }

    if (todayBtn) {
        todayBtn.addEventListener('click', goToToday);
    }

    setupLogoutButton('authToggleBtn');

    // Initial load
    renderEntries();
    renderStats();
})();
