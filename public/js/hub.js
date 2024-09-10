import { getSupabaseClient } from './database.js';

document.addEventListener('DOMContentLoaded', async () => {

    const supabase = await getSupabaseClient();

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
            appHubItem.herf = `${app.link}`
            appHubItem.innerHTML = `
            <div style="width:300px;min-width:200px;max-width:400px;height:210px;" class="card m-2">
                        <div class="card-header text-center">
                        <a target="_blank" rel="noopener noreferrer" herf="${app.link}">
                            <img src="${app.icon}" alt="${app.icon}" width="50" class="me-2" draggable="false">
                        </a>
                            <span class="fw-bold fs-5">${app.name}</span>
                        </div>
                        <div class="card-body text-center">
                            <small>${app.description}</small><br>
                        </div>
                        <div class="card-footer text-center">
                            <a target="_blank" rel="noopener noreferrer" href="${app.link}" class="btn btn-danger btn-sm m-1 mt-2">Öffnen</a>
                        </div>
                        `;
            appHub.appendChild(appHubItem);

        });
    }

    // Fetch and render apps on page load
    fetchAndRenderApps();
});