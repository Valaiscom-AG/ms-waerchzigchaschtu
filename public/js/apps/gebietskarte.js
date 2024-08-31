// gebiets-karte.js

import { getSupabaseClient } from '/js/database.js';

document.addEventListener('DOMContentLoaded', async () => {

    const supabase = await getSupabaseClient();

    // Function to fetch and render regions
    async function fetchAndRenderRegions(filters = {}) {
        let query = supabase.from('regions').select('*');

        if (filters.assigned) {
            query = query.eq('assigned', filters.assigned);
        }
        if (filters.type) {
            query = query.eq('type', filters.type);
        }
        if (filters.technologie) {
            query = query.eq('technologie', filters.technologie);
        }
        if (filters.phase) {
            query = query.eq('phase', filters.phase);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching regions:', error.message);
            return;
        }

        const regionTableBody = document.getElementById('regions-table-body');
        regionTableBody.innerHTML = '';

        data.forEach(region => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row" class="pt-3 d-none">${region.id}</th>
                <td class="pt-3">${region.region}</td>
                <td class="pt-3">${region.assigned}</td>
                <td class="pt-3">${region.type}</td>
                <td class="pt-3">${region.technologie}</td>
                <td class="pt-3">${region.pop}</td>
                <td class="pt-3">${region.uu}</td>
                <td class="pt-3">${region.comment}</td>
                <td class="pt-3 d-none">${region.phase}</td>

            `;
            regionTableBody.appendChild(row);
        });
    }

    // Function to fetch distinct values for filters
    async function fetchDistinctValues(column) {
        const { data, error } = await supabase
            .from('regions')
            .select(column, { count: 'exact', head: false });

        if (error) {
            console.error(`Error fetching distinct values for ${column}:`, error.message);
            return [];
        }

        // Extract unique values
        const values = [...new Set(data.map(item => item[column]))];
        return values;
    }

    // Function to populate dropdowns
    async function populateDropdowns() {
        const assignedValues = await fetchDistinctValues('assigned');
        const typeValues = await fetchDistinctValues('type');
        const technologieValues = await fetchDistinctValues('technologie');
        const phaseValues = await fetchDistinctValues('phase');

        populateDropdown('assigned-dropdown', assignedValues);
        populateDropdown('type-dropdown', typeValues);
        populateDropdown('technologie-dropdown', technologieValues);
        populateDropdown('phase-dropdown', phaseValues);
    }

    // Helper function to populate a single dropdown
    function populateDropdown(dropdownId, values) {
        const dropdown = document.getElementById(dropdownId);
        dropdown.innerHTML = '<option value=""></option>';

        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            dropdown.appendChild(option);
        });
    }

    // Fetch and render regions on initial load
    fetchAndRenderRegions();

    // Populate dropdowns on initial load
    populateDropdowns();

    // Event listeners for dropdowns
    document.getElementById('assigned-dropdown').addEventListener('change', (event) => {
        const filters = getFilters();
        fetchAndRenderRegions(filters);
    });
    document.getElementById('type-dropdown').addEventListener('change', (event) => {
        const filters = getFilters();
        fetchAndRenderRegions(filters);
    });
    document.getElementById('technologie-dropdown').addEventListener('change', (event) => {
        const filters = getFilters();
        fetchAndRenderRegions(filters);
    });
    document.getElementById('phase-dropdown').addEventListener('change', (event) => {
        const filters = getFilters();
        fetchAndRenderRegions(filters);
    });

    // Event listener for reset button
    document.getElementById('reset-filters').addEventListener('click', () => {
        document.getElementById('assigned-dropdown').value = '';
        document.getElementById('type-dropdown').value = '';
        document.getElementById('technologie-dropdown').value = '';
        document.getElementById('phase-dropdown').value = '';
        fetchAndRenderRegions();
    });

    // Function to get current filter values
    function getFilters() {
        return {
            assigned: document.getElementById('assigned-dropdown').value,
            type: document.getElementById('type-dropdown').value,
            technologie: document.getElementById('technologie-dropdown').value,
            phase: document.getElementById('phase-dropdown').value
        };
    }
});