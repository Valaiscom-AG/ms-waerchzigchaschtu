// editor.js

import { getSupabaseClient } from '/js/database.js';

document.addEventListener('DOMContentLoaded', async () => {

    const supabase = await getSupabaseClient();

    // Function to fetch and render apps
    async function fetchAndRenderApps() {
        const { data, error } = await supabase.from('apps').select('*');
        if (error) {
            console.error('Error fetching data:', error.message);
            return;
        }

        const navContainer = document.getElementById('m-navigation');
        navContainer.innerHTML = ''; // Clear existing navigation items

        const appList = document.getElementById('app-list');
        appList.innerHTML = ''; // Clear existing app list items

        data.forEach(app => {
            // Create nav item
            const navItem = document.createElement('li');
            navItem.className = 'nav-item';

            const navLink = document.createElement('a');
            navLink.className = 'nav-link active';
            navLink.href = app.link;
            navLink.innerHTML = `<img src="${app.icon}" alt="${app.name}" style="width: 16px; height: 16px; margin-right: 8px;"> ${app.name}`;

            navItem.appendChild(navLink);
            navContainer.appendChild(navItem);

            // Create list item in modal
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                    <span><img src="${app.icon}" alt="${app.name}" style="width: 16px; height: 16px; margin-right: 8px;">${app.name}</span>
                    <div>
                        <button class="btn btn-sm btn-secondary me-2" data-bs-toggle="collapse" data-bs-target="#editcol" aria-expanded="true" aria-controls="editcol" onclick="populateEditForm('${app.id}', '${app.name}', '${app.description}', '${app.link}', '${app.icon}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                            </svg>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteApp('${app.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                            </svg>
                        </button>
                    </div>
                `;
            appList.appendChild(listItem);
        });
    }

    // Function to populate edit form fields
    window.populateEditForm = (id, name, description, link, icon) => {
        document.getElementById('edit-app-id').value = id;
        document.getElementById('edit-app-name').value = name;
        document.getElementById('edit-app-description').value = description;
        document.getElementById('edit-app-link').value = link;
        document.getElementById('edit-app-icon').value = icon;
    };

    // Function to add a new app
    async function addApp(event) {
        event.preventDefault();

        const name = document.getElementById('add-app-name').value;
        const description = document.getElementById('add-app-description').value;
        const link = document.getElementById('add-app-link').value;
        const icon = document.getElementById('add-app-icon').value;

        const { data, error } = await supabase.from('apps').insert([{ name, description, link, icon }]);
        if (error) {
            console.error('Error adding data:', error.message);
            return;
        }

        fetchAndRenderApps();
        showToast(`App ${name} Hinzugefügt`);
        document.getElementById('add-form').reset();
    }

    // Attach the addApp function to the form submit event
    document.getElementById('add-form').addEventListener('submit', addApp);

    // Function to edit an existing app
    async function editApp(event) {
        event.preventDefault();

        const id = document.getElementById('edit-app-id').value;
        const name = document.getElementById('edit-app-name').value;
        const description = document.getElementById('edit-app-description').value;
        const link = document.getElementById('edit-app-link').value;
        const icon = document.getElementById('edit-app-icon').value;

        const { data, error } = await supabase.from('apps').update({ name, description, link, icon }).eq('id', id);
        if (error) {
            console.error('Error updating data:', error.message);
            return;
        }

        fetchAndRenderApps();
        showToast(`App ${name} Aktuallisiert`);
        $('#editAppModal').modal('hide'); // Close the modal
    }

    // Attach the editApp function to the edit-form submit event
    document.getElementById('edit-form').addEventListener('submit', editApp);

    // Function to delete an app with confirmation
    window.deleteApp = async (id) => {
        // Confirm deletion with user
        const confirmDelete = confirm('Willst du diese App wirklich löschen?');

        if (!confirmDelete) {
            return; // If user cancels, do nothing
        }

        const { data, error } = await supabase.from('apps').delete().eq('id', id);
        if (error) {
            console.error('Error deleting data:', error.message);
            return;
        }

        fetchAndRenderApps();
        showToast(`App Gelöscht`);
    };

    // Fetch and render apps on initial load
    fetchAndRenderApps();

    // Function to populate select element with options from the database
    async function populateSelectOptions() {
        try {
            const { data, error } = await supabase
                .from('departments')
                .select('name');

            if (error) throw error;

            // Clear existing options
            selectElement.innerHTML = '';

            // Add default option
            const defaultOption = document.createElement('option');
            defaultOption.textContent = '';
            selectElement.appendChild(defaultOption);

            // Add options from database
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.name;

                // Concatenate vereins_name and team_name if team_name exists
                let optionText = item.name;
                option.textContent = optionText;
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Function to fetch and render employees
    async function fetchAndRenderEmployees() {
        const { data, error } = await supabase.from('employees').select('*');
        if (error) {
            console.error('Error fetching employees:', error.message);
            return;
        }

        const employeeTableBody = document.getElementById('employee-table-body');
        employeeTableBody.innerHTML = '';

        data.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row" class="pt-3">${employee.id}</th>
                <td class="pt-3">${employee.lastname}</td>
                <td class="pt-3">${employee.firstname}</td>
                <td class="pt-3">${employee.department}</td>
                <td class="pt-3">${employee.jobtitle}</td>
                <td class="pt-3">${employee.workdays}</td>
                <td class="pt-3">${employee.email}</td>
                <td class="text-center pt-3"><input class="form-check-input" type="checkbox" ${employee.shareemail ? 'checked' : ''}></td>
                <td class="text-center pt-3">${employee.intphone}</td>
                <td class="pt-3">${employee.extphone}</td>
                <td class="pt-3">${employee.mobphone}</td>
                <td class="text-center pt-3"><input class="form-check-input" type="checkbox" ${employee.sharemobphone ? 'checked' : ''}></td>
                <td class="text-center">
                    <button type="button" class="btn btn-outline-danger mb-2" data-bs-target="#editemployeeModalToggle" data-bs-toggle="modal" onclick="populateEditEmployeeForm(${employee.id}, '${employee.lastname}', '${employee.firstname}', '${employee.department}', '${employee.jobtitle}', '${employee.workdays}', '${employee.email}', ${employee.shareemail}, '${employee.intphone}', '${employee.extphone}', '${employee.mobphone}', ${employee.sharemobphone})">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path
                            d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z">
                        </path>
                        <path fill-rule="evenodd"
                            d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z">
                        </path>
                    </svg>
                    </button>
                    <button class="btn btn btn-danger" onclick="deleteEmployee('${employee.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                    </svg>
                </button>
                </td>
            `;
            employeeTableBody.appendChild(row);
        });
    }

    function showToast(message) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-success border-0';
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


    // Function to populate edit employee form
    window.populateEditEmployeeForm = (id, lastname, firstname, department, jobtitle, workdays, email, shareemail, intphone, extphone, mobphone, sharemobphone) => {
        document.getElementById('ee-id').value = id;
        document.getElementById('ee-lastname').value = lastname;
        document.getElementById('ee-firstname').value = firstname;
        document.getElementById('ee-department').value = department;
        document.getElementById('ee-jobtitle').value = jobtitle;
        document.getElementById('ee-workdays').value = workdays;
        document.getElementById('ee-email').value = email;
        document.getElementById('ee-shareemail').checked = shareemail;
        document.getElementById('ee-intphone').value = intphone;
        document.getElementById('ee-extphone').value = extphone;
        document.getElementById('ee-mobphone').value = mobphone;
        document.getElementById('ee-sharemobphone').checked = sharemobphone;
    };

    // Function to add a new employee
    async function addEmployee(event) {
        event.preventDefault();

        const lastname = document.getElementById('ae-lastname').value;
        const firstname = document.getElementById('ae-firstname').value;
        const department = document.getElementById('ae-department').value;
        const jobtitle = document.getElementById('ae-jobtitle').value;
        const workdays = document.getElementById('ae-workdays').value;
        let email = document.getElementById('ae-email').value; // Change from const to let
        const shareemail = document.getElementById('ae-shareemail').checked;
        const intphone = document.getElementById('ae-intphone').value;
        let extphone = document.getElementById('ae-extphone').value;
        const mobphone = document.getElementById('ae-mobphone').value;
        const sharemobphone = document.getElementById('ae-sharemobphone').checked;

        // Modify the email by appending or prepending a string
        email = email + "@valaiscom-ag.ch";
        extphone = "027 948 40 " + extphone;

        const { data, error } = await supabase.from('employees').insert([{ lastname, firstname, department, jobtitle, workdays, email, shareemail, intphone, extphone, mobphone, sharemobphone }]);
        if (error) {
            console.error('Error adding employee:', error.message);
            return;
        }

        fetchAndRenderEmployees();
        showToast(`Mitarbeiter ${firstname} ${lastname} Hinzugefügt`);
        document.getElementById('add-employee-form').reset();
    }

    // Function to edit an existing employee
    async function editEmployee(event) {
        event.preventDefault();

        const id = document.getElementById('ee-id').value;
        const lastname = document.getElementById('ee-lastname').value;
        const firstname = document.getElementById('ee-firstname').value;
        const department = document.getElementById('ee-department').value;
        const jobtitle = document.getElementById('ee-jobtitle').value;
        const workdays = document.getElementById('ee-workdays').value;
        const email = document.getElementById('ee-email').value;
        const shareemail = document.getElementById('ee-shareemail').checked;
        const intphone = document.getElementById('ee-intphone').value;
        const extphone = document.getElementById('ee-extphone').value;
        const mobphone = document.getElementById('ee-mobphone').value;
        const sharemobphone = document.getElementById('ee-sharemobphone').checked;

        const { data, error } = await supabase.from('employees').update({ lastname, firstname, department, jobtitle, workdays, email, shareemail, intphone, extphone, mobphone, sharemobphone }).eq('id', id);
        if (error) {
            console.error('Error updating employee:', error.message);
            return;
        }

        fetchAndRenderEmployees();
        showToast(`Mitarbeiter ${firstname} ${lastname} Aktuallisiert`);
        $('#editemployeeModalToggle').modal('hide'); // Close the modal
    }

    // Function to delete an app with confirmation
    window.deleteEmployee = async (id) => {
        // Confirm deletion with user
        const confirmDelete = confirm('Wirklich löschen?');

        if (!confirmDelete) {
            return; // If user cancels, do nothing
        }

        const { data, error } = await supabase.from('employees').delete().eq('id', id);
        if (error) {
            console.error('Error deleting data:', error.message);
            return;
        }

        fetchAndRenderApps();
        showToast(`Mitarbeiter Gelöscht`);
    };


    // Attach the addEmployee function to the form submit event
    document.getElementById('add-employee-form').addEventListener('submit', addEmployee);

    // Attach the editEmployee function to the form submit event
    document.getElementById('edit-employee-form').addEventListener('submit', editEmployee);

    // Fetch and render employees on initial load
    fetchAndRenderEmployees();
    // ------------------
    // Function to fetch and render departments
    async function fetchAndRenderDepartments() {
        const { data, error } = await supabase.from('departments').select('*');
        if (error) {
            console.error('Error fetching Departments:', error.message);
            return;
        }

        const departmentsTableBody = document.getElementById('department-table-body');
        departmentsTableBody.innerHTML = '';

        data.forEach(department => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row" class="pt-3">${department.id}</th>
                <td class="pt-3">${department.name}</td>
                <td class="pt-3">${department.email}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-outline-danger" data-bs-target="#manageedModalToggle" data-bs-toggle="modal" onclick="populateEditDeparmentForm(${department.id}, '${department.name}', '${department.email}')">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path
                            d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z">
                        </path>
                        <path fill-rule="evenodd"
                            d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z">
                        </path>
                    </svg>
                    </button>
                                            <button class="btn btn-danger ms-2" onclick="deleteDepartment('${department.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                            </svg>
                        </button>
                </td>
            `;
            departmentsTableBody.appendChild(row);
        });
        // Function to populate edit employee form
        window.populateEditDeparmentForm = (id, name, email) => {
            document.getElementById('ed-id').value = id;
            document.getElementById('ed-name').value = name;
            document.getElementById('ed-email').value = email;
        };
    }



    // Function to add a new employee
    async function addDepartment(event) {
        event.preventDefault();

        const name = document.getElementById('ad-name').value;
        const email = document.getElementById('ad-email').value;

        const { data, error } = await supabase.from('departments').insert([{ name, email }]);
        if (error) {
            console.error('Error adding department:', error.message);
            return;
        }

        fetchAndRenderEmployees();
        showToast(`Abteilung ${name} Hinzugefügt`);
        document.getElementById('add-d-form').reset();
    }

    // Function to edit an existing employee
    async function editDepartment(event) {
        event.preventDefault();

        const id = document.getElementById('ed-id').value;
        const name = document.getElementById('ed-name').value;
        const email = document.getElementById('ed-email').value;

        const { data, error } = await supabase.from('departments').update({ name, email }).eq('id', id);
        if (error) {
            console.error('Error updating Departments:', error.message);
            return;
        }

        fetchAndRenderDepartments();
        showToast(`Abteilung ${name} Aktuallisiert`);
        $('#editdModalToggle').modal('hide'); // Close the modal
    }

    // Attach the addEmployee function to the form submit event
    document.getElementById('add-d-form').addEventListener('submit', addDepartment);

    // Attach the editEmployee function to the form submit event
    document.getElementById('edit-d-form').addEventListener('submit', editDepartment);

    // Function to delete an app with confirmation
    window.deleteDepartment = async (id) => {
        // Confirm deletion with user
        const confirmDelete = confirm('Willst diese Abteilung wirklich löschen?');

        if (!confirmDelete) {
            return; // If user cancels, do nothing
        }

        const { data, error } = await supabase.from('departments').delete().eq('id', id);
        if (error) {
            console.error('Error deleting data:', error.message);
            return;
        }

        fetchAndRenderApps();
        showToast(`Abteilung Gelöscht`);
    };

    // Fetch and render Departments on initial load
    fetchAndRenderDepartments();
    // ------------------------------
    // Function to populate select element with options from the database sales
    async function populateSelectOptionsRegions() {
        try {
            const { data, error } = await supabase
                .from('Employees')
                .select('firstname', 'lastname');

            if (error) throw error;

            // Clear existing options
            selectElement.innerHTML = '';

            // Add default option
            const defaultOption = document.createElement('option');
            defaultOption.textContent = '';
            selectElement.appendChild(defaultOption);

            // Add options from database
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.name;

                // Concatenate vereins_name and team_name if team_name exists
                let optionText = item.name;
                option.textContent = optionText;
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }
    //-----------------------------------
    // Function to fetch and render regions
    async function fetchAndRenderRegions() {
        const { data, error } = await supabase.from('regions').select('*');
        if (error) {
            console.error('Error fetching employees:', error.message);
            return;
        }

        const regionTableBody = document.getElementById('regions-table-body');
        regionTableBody.innerHTML = '';

        data.forEach(region => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row" class="pt-3">${region.id}</th>
                <td class="pt-3">${region.region}</td>
                <td class="pt-3">${region.assigned}</td>
                <td class="pt-3">${region.type}</td>
                <td class="pt-3">${region.technologie}</td>
                <td class="pt-3">${region.uu}</td>
                <td class="pt-3">${region.comment}</td>
                <td class="pt-3">${region.phase}</td>
                <td class="pt-3">${region.pop}</td>
                <td class="text-center">
                    <button type="button" class="btn btn-outline-danger" data-bs-target="#managereModalToggle" data-bs-toggle="modal" onclick="populateEditRegionForm(${region.id}, '${region.region}', '${region.assigned}', '${region.type}', '${region.technologie}', '${region.uu}', '${region.comment}', '${region.phase}',)">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path
                            d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z">
                        </path>
                        <path fill-rule="evenodd"
                            d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z">
                        </path>
                    </svg>
                    </button>
                    <button class="btn btn btn-danger" onclick="deleteRegion('${region.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                    </svg>
                </button>
                </td>
            `;
            regionTableBody.appendChild(row);
        });
    }

    // Function to populate edit employee form
    window.populateEditRegionForm = (id, region, assigned, type, technologie, uu, comment, phase) => {
        document.getElementById('er-id').value = id;
        document.getElementById('er-region').value = region;
        document.getElementById('er-assigned').value = assigned;
        document.getElementById('er-type').value = type;
        document.getElementById('er-technologie').value = technologie;
        document.getElementById('er-uu').value = uu;
        document.getElementById('er-comment').value = comment;
        document.getElementById('er-phase').value = phase;
        document.getElementById('er-pop').value = pop;
    };

    // Function to add a new employee
    async function addRegion(event) {
        event.preventDefault();

        const region = document.getElementById('ar-region').value;
        const assigned = document.getElementById('ar-assigned').value;
        const type = document.getElementById('ar-type').value;
        const technologie = document.getElementById('ar-technologie').value;
        const uu = document.getElementById('ar-uu').value;
        const comment = document.getElementById('ar-comment').value;
        const phase = document.getElementById('ar-phase').value;
        const pop = document.getElementById('ar-pop').value;

        const { data, error } = await supabase.from('regions').insert([{ region, assigned, type, technologie, uu, comment, phase, pop }]);
        if (error) {
            console.error('Error adding region:', error.message);
            return;
        }

        fetchAndRenderRegions();
        showToast(`Region ${region} Hinzugefügt`);
        document.getElementById('add-region-form').reset();
        $('#managerModalToggle').modal('hide');
    }

    // Function to edit an existing employee
    async function editRegion(event) {
        event.preventDefault();

        const id = document.getElementById('er-id').value;
        const region = document.getElementById('er-region').value;
        const assigned = document.getElementById('er-assigned').value;
        const type = document.getElementById('er-type').value;
        const technologie = document.getElementById('er-technologie').value;
        const uu = document.getElementById('er-uu').value;
        const comment = document.getElementById('er-comment').value;
        const phase = document.getElementById('er-phase').value;
        const pop = document.getElementById('er-pop').value;

        const { data, error } = await supabase.from('regions').update({ region, assigned, type, technologie, uu, comment, phase, pop }).eq('id', id);
        if (error) {
            console.error('Error updating region:', error.message);
            return;
        }

        fetchAndRenderRegions();
        showToast(`Region ${region} Aktuallisiert`);
        $('#managereModalToggle').modal('hide'); // Close the modal
    }

    // Function to delete an app with confirmation
    window.deleteRegion = async (id) => {
        // Confirm deletion with user
        const confirmDelete = confirm('Willst du diese Region wirklich löschen?');

        if (!confirmDelete) {
            return; // If user cancels, do nothing
        }

        const { data, error } = await supabase.from('regions').delete().eq('id', id);
        if (error) {
            console.error('Error deleting data:', error.message);
            return;
        }

        fetchAndRenderRegions();
        showToast(`Region Gelöscht`);
    };

    // Attach the addEmployee function to the form submit event
    document.getElementById('add-region-form').addEventListener('submit', addRegion);

    // Attach the editEmployee function to the form submit event
    document.getElementById('edit-region-form').addEventListener('submit', editRegion);

    // Fetch and render employees on initial load
    fetchAndRenderRegions();
    // ------------------

    // Function to populate select element with options from the database
    async function populateSelectOptionsRegions() {
        const selectElement = document.getElementById('ar-assigned');
        const selectElementEdit = document.getElementById('er-assigned');

        const { data: employees, error } = await supabase.from('employees')
            .select('firstname, lastname, email')
            .eq('department', 'Verkauf');

        if (error) {
            console.error('Error fetching employees:', error.message);
            return;
        }

        employees.forEach(employee => {
            const option = document.createElement('option');
            option.textContent = employee.firstname + ' ' + employee.lastname;
            option.value = employee.email;
            selectElement.appendChild(option);

            const editOption = option.cloneNode(true);
            selectElementEdit.appendChild(editOption);
        });
    }

    populateSelectOptionsRegions();


    // Function to populate select element with options from the database
    async function populateSelectOptions() {
        const selectElement = document.getElementById('ae-department');
        const selectElementEdit = document.getElementById('ee-department');

        const { data: departments, error } = await supabase.from('departments').select('name');
        if (error) {
            console.error('Error fetching departments:', error.message);
            return;
        }

        departments.forEach(department => {
            const option = document.createElement('option');
            option.textContent = department.name;
            option.value = department.name;
            selectElement.appendChild(option);

            const editOption = option.cloneNode(true);
            selectElementEdit.appendChild(editOption);
        });
    }

    populateSelectOptions();
});