// telefonliste.js

import { getSupabaseClient } from '/js/database.js';

document.addEventListener('DOMContentLoaded', async () => {

    const supabase = await getSupabaseClient();

    // Function to fetch and render employees
    async function fetchAndRenderPhonelist() {
        const { data, error } = await supabase.from('employees')
            .select('firstname, lastname, intphone, extphone, mobphone, department');
        if (error) {
            console.error('Error fetching employees:', error.message);
            return;
        }

        // Log data to inspect its structure
        console.log('Fetched data:', data);

        // Sort data by department and then by internal phone number within each department
        data.sort((a, b) => {
            if (a.department === b.department) {
                return a.intphone - b.intphone; // Sort by intphone if in the same department
            }
            return a.department.localeCompare(b.department); // Sort by department
        });

        const employeeTableBody = document.getElementById('phone-table');
        employeeTableBody.innerHTML = '';

        let currentDepartment = '';

        data.forEach(employee => {
            console.log('Employee data:', employee); // Log each employee's data

            // If the department changes, insert a new header row
            if (employee.department !== currentDepartment) {
                currentDepartment = employee.department;

                // Create a department header row
                const departmentHeaderRow = document.createElement('tr');
                departmentHeaderRow.classList.add('table-danger'); // Optional: Add a class for styling the department header
                departmentHeaderRow.innerHTML = `
                    <td colspan="4" class="fw-bold">${currentDepartment}</td>
                `;
                employeeTableBody.appendChild(departmentHeaderRow);
            }

            // Create the employee row
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="pt-3">${employee.firstname} ${employee.lastname}</td>
                <td class="pt-3">${employee.intphone}</td>
                <td class="pt-3"><a href="tel:${employee.extphone}">${employee.extphone}</a></td>
                <td class="pt-3"><div class="collapse" id="collapseExample"><a href="tel:${employee.mobphone}">${employee.mobphone}</a></div></td>
                <td class="pt-3 d-none">${employee.department}</td>
            `;
            employeeTableBody.appendChild(row);
        });
    }

    // Fetch and render employees on initial load
    fetchAndRenderPhonelist();
});
