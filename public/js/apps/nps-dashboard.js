import { getSupabaseClient } from '/js/database.js';

document.addEventListener('DOMContentLoaded', async () => {
    const supabase = await getSupabaseClient();
    const employeeFilter = document.getElementById('employeeFilter');
    const timeSpanFilter = document.getElementById('timeSpanFilter');
    const commentsTable = document.getElementById('commentsTable');
    const ratingsByEmployeeChartCtx = document.getElementById('ratingsByEmployeeChart').getContext('2d');

    // Define radio buttons for chart type and data type
    const displayTypeRadios = document.querySelectorAll('input[name="displayType"]');
    const dataTypeRadios = document.querySelectorAll('input[name="dataType"]');

    let employeeData = [];
    let overallData = [];
    let commentsData = [];
    let ratingsChart = null; // Reference for the chart instance

    async function checkAdminAndRedirect() {
        const usernameElement = document.getElementById('username-d');
        const insertedEmail = usernameElement.innerText; // The inserted email

        // Query the employees table to check for the admin column
        const { data, error } = await supabase
            .from('employees')
            .select('admin')
            .eq('email', insertedEmail);

        if (error) {
            console.error('Error fetching admin status:', error.message);
            return;
        }

        if (data && data.length > 0) {
            const isAdmin = data[0].admin;

            if (isAdmin) {
                // If the user is an admin, allow the page to load
                console.log('User is admin, loading page...');
                return true; // Admin access
            } else {
                // If the user is not an admin, redirect to the index page
                console.log('User is not admin, redirecting...');
                window.location.href = '/';
                return false; // Non-admin access
            }
        } else {
            console.log('User not found in the database');
            window.location.href = '/'; // Redirect if the user is not found
            return false;
        }
    }

    // Check if the user is an admin before loading the page
    const isAdmin = await checkAdminAndRedirect();

    if (isAdmin) {

    }
   // Function to update the dashboard based on selected filters
   async function updateDashboard() {
    const employee = employeeFilter.value;
    const timeSpan = timeSpanFilter.value;

    // Fetch filtered data from Supabase
    const { data: feedback, error } = await supabase
        .from('nps_feedback')
        .select('*')
        .filter('employee', employee !== 'all' ? 'eq' : 'like', employee !== 'all' ? employee : '%')
        .gte('created_at', calculateDateRange(timeSpan));

    if (error) {
        console.error('Error fetching feedback:', error);
        return;
    }

    // Process data
    processFeedbackData(feedback);

    // Update charts
    renderCharts();

    // Update comments table
    renderCommentsTable(employee);
}

function calculateDateRange(timeSpan) {
    const now = new Date();
    if (timeSpan === 'day') return new Date(now.setDate(now.getDate() - 1)).toISOString();
    if (timeSpan === 'week') return new Date(now.setDate(now.getDate() - 7)).toISOString();
    if (timeSpan === 'month') return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
    if (timeSpan === 'year') return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    return '1970-01-01T00:00:00Z'; // All-time
}

function processFeedbackData(feedback) {
    employeeData = [];
    commentsData = feedback;

    feedback.forEach(item => {
        employeeData.push({
            employee: item.employee,
            rating: item.rating,
            createdAt: item.created_at // Store date for all ratings
        });
    });
}

function renderCharts() {
    const displayType = Array.from(displayTypeRadios).find(radio => radio.checked).value;
    const dataType = Array.from(dataTypeRadios).find(radio => radio.checked).value;

    const employeeLabels = [...new Set(employeeData.map(item => item.employee))];
    const ratingsPerEmployee = employeeLabels.map(employee => {
        const ratings = employeeData.filter(item => item.employee === employee).map(item => item.rating);
        return dataType === 'average' 
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length // Average rating
            : ratings; // All ratings
    });

    // Destroy existing chart if it exists
    if (ratingsChart) {
        ratingsChart.destroy();
    }

    // Create chart based on selected display type
    ratingsChart = new Chart(ratingsByEmployeeChartCtx, {
        type: displayType,
        data: {
            labels: employeeLabels,
            datasets: [{
                label: dataType === 'average' ? 'Durchschnittsbewertung' : 'Bewertungen',
                data: dataType === 'average' ? ratingsPerEmployee : ratingsPerEmployee.flat(),
                backgroundColor: generateColors(employeeLabels.length, displayType),
                borderColor: 'rgba(0, 0, 0, 1)', // Black border for better contrast
                borderWidth: 1,
                fill: displayType === 'line' // Only fill if it's a line chart
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5 // Y-axis fixed at 0-5
                }
            }
        }
    });
}

// Function to generate an array of colors
function generateColors(count, type) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        if (type === 'bar') {
            colors.push(`hsl(${i * (360 / count)}, 70%, 50%)`); // Bar colors in HSL
        } else if (type === 'pie') {
            colors.push(`hsl(${i * (360 / count)}, 70%, 60%)`); // Pie colors in HSL
        }
    }
    return colors;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}.${month}.${year}`; // Format as dd.mm.yyyy
}

function renderCommentsTable(employee) {
    const filteredComments = commentsData.filter(comment => employee === 'all' || comment.employee === employee);
    commentsTable.innerHTML = filteredComments.map(comment => `
        <tr>
            <td>${comment.employee}</td>
            <td>${comment.rating}</td>
            <td>${comment.comment || 'N/A'}</td>
            <td>${formatDate(comment.created_at)}</td> <!-- Change date format here -->
        </tr>
    `).join('');
}

// Add event listeners to filters
employeeFilter.addEventListener('change', updateDashboard);
timeSpanFilter.addEventListener('change', updateDashboard);
displayTypeRadios.forEach(radio => radio.addEventListener('change', renderCharts));
dataTypeRadios.forEach(radio => radio.addEventListener('change', renderCharts));

// Initial load
updateDashboard();
});