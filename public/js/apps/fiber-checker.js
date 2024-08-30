document.addEventListener('DOMContentLoaded', () => {
    const addressInput = document.getElementById('addressInput');
    const searchButton = document.getElementById('searchButton');
    const suggestionsContainer = document.getElementById('suggestions');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsGrid = document.getElementById('resultsGrid');

    let timeoutId;

    // Autocomplete functionality
    addressInput.addEventListener('input', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
            const query = addressInput.value.trim();
            if (query.length > 2) {
                const suggestions = await fetchSuggestions(query);
                updateSuggestions(suggestions);
            } else {
                suggestionsContainer.innerHTML = '';
            }
        }, 250);
    });

    // Fetch address suggestions from the API
    async function fetchSuggestions(query) {
        const response = await fetch(`https://api.init7.net/v1/addresses?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data;
    }

    // Update the UI with the address suggestions
    function updateSuggestions(suggestions) {
        suggestionsContainer.innerHTML = '';
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('button');
            suggestionItem.classList.add('list-group-item', 'list-group-item-action');
            suggestionItem.textContent = suggestion.full_name;
            suggestionItem.addEventListener('click', () => handleSuggestionClick(suggestion));
            suggestionsContainer.appendChild(suggestionItem);
        });
    }

    // Handle the click on a suggestion
    async function handleSuggestionClick(suggestion) {
        suggestionsContainer.innerHTML = '';
        addressInput.value = suggestion.full_name;
        await fetchFiberDetails(suggestion.egaid);
    }

    // Handle the search button click
    searchButton.addEventListener('click', async () => {
        const query = addressInput.value.trim();
        if (query) {
            const suggestions = await fetchSuggestions(query);
            if (suggestions.length > 0) {
                await fetchFiberDetails(suggestions[0].egaid);
            }
        }
    });

    // Fetch fiber details from the API
    async function fetchFiberDetails(egaid) {
        const response = await fetch(`https://api.init7.net/v2/check/egaid/${egaid}`);
        const data = await response.json();
        displayResults(data.result);
    }

    function displayResults(result) {
        // Determine the badge based on the service type
        let badge = '';
        if (result.service === 'fiber7') {
            badge = '<h1>Technologie <span class="badge text-bg-success">FTTH</span></h1>';
        } else if (result.service === 'copper7') {
            badge = '<h1>Technologie <span class="badge text-bg-warning">BBCS/Offnet</span></h1>';
        }
    
        resultsGrid.innerHTML = `
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${badge}</h5>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Max Speed</h5>
                        <p class="card-text">Up: ${result.max_speed.up_kbps / 1000 - 15000} Mbit/s</p>
                        <p class="card-text">Down: ${result.max_speed.down_kbps / 1000 -15000} Mbit/s</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Access Provider</h5>
                        <p class="card-text">${result.access_provider}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">POP</h5>
                        <p class="card-text">${result.pop}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Bestellbar Ab</h5>
                        <p class="card-text">${result.ready_for_order_date}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Addresse</h5>
                        <p class="card-text">${result.address.street_name} ${result.address.house_number}, ${result.address.postal_code} ${result.address.locality}</p>
                    </div>
                </div>
            </div>
        `;
        resultsContainer.style.display = 'block';
    }
    
});
