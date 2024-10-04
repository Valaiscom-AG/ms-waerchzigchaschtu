import { getSupabaseClient } from './database.js';

document.addEventListener('DOMContentLoaded', async () => {

    const supabase = await getSupabaseClient();

    // Function to replace email with the corresponding first name and display it
    async function replaceEmailWithFirstName() {
        const usernameElement = document.getElementById('username-d');
        const insertedEmail = usernameElement.innerText; // The inserted email

        // Query the employees table to check for the matching email
        const { data, error } = await supabase
            .from('employees')
            .select('firstname')
            .eq('email', insertedEmail);

        if (error) {
            console.error('Error fetching employee data:', error.message);
            return;
        }

        if (data && data.length > 0) {
            const firstName = data[0].firstname;

            // Replace the email with the first name in the DOM and display a greeting
            usernameElement.innerText = `Willkommen zurück, ${firstName}`;
            usernameElement.className = 'fw-bold';
        } else {
            // If no match is found, display the email as is
            console.log('Email not found in the database');
        }
    }

    // Fetch and replace email on page load
    replaceEmailWithFirstName();

    // Function to fetch and render apps
    async function fetchAndRenderApps() {
        const { data, error } = await supabase.from('apps').select('*');
        if (error) {
            console.error('Error fetching data:', error.message);
            return;
        }

        const appHub = document.getElementById('app-hub');
        appHub.innerHTML = ''; // Clear existing app list items

        data.forEach(app => {
            // Create card in app hub
            const appHubItem = document.createElement('a');
            
            appHubItem.className = 'text-decoration-none';
            appHubItem.style = '';
            appHubItem.herf = `${app.link}`;
            appHubItem.innerHTML = `
            <div style="width:300px;min-width:200px;max-width:400px;height:210px;" class="card m-2 border border-0">
                            <a target="_blank" rel="noopener noreferrer" href="${app.link}" class="btn m-1 mt-2"> <img src="${app.icon}" alt="${app.icon}" width="100" class="me-2 rounded-3" draggable="false"></a>
                            <span class="fw-bold fs-5">${app.name}</span>
                        </div>
                        `;
            appHub.appendChild(appHubItem);
        });
    }

    // Fetch and render apps on page load
    fetchAndRenderApps();
});