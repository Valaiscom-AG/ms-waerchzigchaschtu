import { getSupabaseClient } from '/js/database.js';

document.addEventListener('DOMContentLoaded', async () => {
    const supabase = await getSupabaseClient();

    async function replaceEmailWithFirstName() {
        const usernameElement = document.getElementById('usernamedst');
        const insertedEmail = usernameElement.innerText;

        // Query the employees table to fetch the matching email
        const { data, error } = await supabase
            .from('employees')
            .select('firstname')
            .eq('email', insertedEmail);

        if (error || !data || data.length === 0) {
            console.error('Error fetching employee name:', error ? error.message : 'No data found');
            return;
        }

        const firstName = data[0].firstname;
        usernameElement.innerText = `Hallo ${firstName} \n Bitte ergänze deine \n neueste Bewertung`;
        usernameElement.className = 'fw-bold';
    }

    async function fetchEmployeeNameByEmail() {
        const usernameElement = document.getElementById('usernamedst');
        const email = usernameElement.innerText;

        // Query the employees table for first and last name based on email
        const { data, error } = await supabase
            .from('employees')
            .select('firstname, lastname')
            .eq('email', email);

        if (error || !data || data.length === 0) {
            console.error('Error fetching employee name:', error ? error.message : 'No data found');
            return null;
        }

        const { firstname, lastname } = data[0];
        return `${firstname} ${lastname}`;
    }

    async function fetchAndDisplayCsFeedbackEntries(employeeFullName) {
        // Query the cs_feedback table for entries associated with the employee
        const { data, error } = await supabase
            .from('cs_feedback')
            .select('created_at, cus_nr, uuid')
            .eq('employee', employeeFullName)
            .order('created_at', { ascending: false }); // Sort by latest entry first
    
        if (error || !data) {
            console.error('Error fetching cs_feedback entries:', error ? error.message : 'No data found');
            return;
        }
    
        const tableBody = document.getElementById('cs-feedback-table-body');
        tableBody.innerHTML = ''; // Clear any existing rows
    
        data.forEach((entry) => {
            const row = document.createElement('tr');
    
            const createdAtCell = document.createElement('td');
            createdAtCell.innerText = new Date(entry.created_at).toLocaleString('de-DE', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
    
            const cusNrCell = document.createElement('td');
            cusNrCell.innerText = entry.cus_nr;
    
            const actionCell = document.createElement('td');
            const actionButton = document.createElement('button');
            actionButton.className = 'btn btn-success btn-sm';
            actionButton.innerText = 'Auswählen';
    
            // Handle the click event for each action button
            actionButton.onclick = () => {
                document.getElementById('uuid').value = entry.uuid;
                document.getElementById('created-at').innerText = `${createdAtCell.innerText}`;
            };
            actionCell.appendChild(actionButton);
    
            row.appendChild(createdAtCell);
            row.appendChild(cusNrCell);
            row.appendChild(actionCell);
    
            tableBody.appendChild(row);
        });
    
        // Check if there is a `uuid` parameter in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const uuidParam = urlParams.get('uuid');
        
        if (uuidParam) {
            // Find the entry with the matching uuid
            const selectedEntry = data.find(entry => entry.uuid === uuidParam);
            if (selectedEntry) {
                document.getElementById('uuid').value = selectedEntry.uuid;
                document.getElementById('cus_nr').value = selectedEntry.cus_nr;
                document.getElementById('created-at').innerText = `${new Date(selectedEntry.created_at).toLocaleString('de-DE', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}`;
            }
        } else if (data.length > 0) {
            // If no `uuid` in URL, load the latest entry
            const latestEntry = data[0];
            document.getElementById('uuid').value = latestEntry.uuid;
            document.getElementById('cus_nr').value = latestEntry.cus_nr;
            document.getElementById('created-at').innerText = `${new Date(latestEntry.created_at).toLocaleString('de-DE', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}`;
        }
    }
    

    // Fetch and display employee entries on page load
    const employeeFullName = await fetchEmployeeNameByEmail();
    if (employeeFullName) {
        await fetchAndDisplayCsFeedbackEntries(employeeFullName);
    }
    replaceEmailWithFirstName();

    // Form submission handler
    document.getElementById('cs-form-updates').addEventListener('submit', async (e) => {
        e.preventDefault();

        const uuid = document.getElementById('uuid').value;
        const csNr = document.getElementById('cus_nr').value;
        const selectedRadio = document.querySelector('input[name="exampleRadios"]:checked').value;
        const csNrValue = `${selectedRadio}${csNr}`;

        if (uuid && csNr) {
            const { error } = await supabase
                .from('cs_feedback')
                .update({ cus_nr: csNrValue })
                .eq('uuid', uuid);

            if (error) {
                showToast("Das hat nicht geklappt...", "danger");
            } else {
                showToast("Bewertung aktualisiert!", "success");
                await fetchAndDisplayCsFeedbackEntries(employeeFullName);
            }
        } else {
            showToast("Das hat nicht geklappt... Alles ausgefüllt?", "danger");
        }
    });

    function showToast(message, type) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
});
