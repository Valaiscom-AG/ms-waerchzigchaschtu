import { getSupabaseClient } from '/js/database.js';

document.addEventListener('DOMContentLoaded', async () => {
    const supabase = await getSupabaseClient();

    async function checkAdminAndRedirect() {
        const usernameElement = document.getElementById('username-d');
        if (!usernameElement) {
            console.error('Username element not found.');
            return false;
        }

        const insertedEmail = usernameElement.innerText.trim(); // The inserted email

        // Query the employees table to check for the admin column
        const { data, error } = await supabase
            .from('employees')
            .select('admin')
            .eq('email', insertedEmail);

        if (error) {
            console.error('Error fetching admin status:', error);
            return false;
        }

        if (data && data.length > 0) {
            const isAdmin = data[0].admin;

            if (isAdmin) {
                console.log('User is admin, loading page...');
                return true; // Admin access
            } else {
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

    if (!isAdmin) {
        return; // Stop execution if not admin
    }

    // Function to update the dashboard based on selected filters
    async function updateDashboard() {
        // Find the list element where feedback will be displayed
        const appList = document.getElementById('app-list');
        if (!appList) {
            console.error('Feedback list element not found.');
            return;
        }

        // Fetch filtered data from Supabase
        const { data: feedback, error } = await supabase
            .from('cs_feedback')
            .select('*');

        if (error) {
            console.error('Error fetching feedback:', error);
            return;
        }

        // Clear previous feedback items
        appList.innerHTML = '';

        // Create list items from the feedback data
        feedback.forEach(app => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                <div>ID: ${app.id}</div>
                <div>UUID: ${app.uuid}</div>
                <div>Employee: ${app.employee}</div>
                <div>Rating Importance: ${app.rating_imp}</div>
                <div>Rating Satisfaction: ${app.rating_sat}</div>
                <div>Rating Solution: ${app.rating_sol}</div>
                <div>Overall Rating: ${app.rating_ovr}</div>
                <div>Comment: ${app.comment}</div>
                <div>GAW: ${app.gaw}</div>
                <div>Contact: ${app.contact}</div>
                <div>Customer Number: ${app.cus_nr}</div>
                <div>Department: ${app.department}</div>
                <div>Created At: ${app.created_at}</div>
            `;
            appList.appendChild(listItem);
        });
    }

    // Initial load
    updateDashboard();
});
