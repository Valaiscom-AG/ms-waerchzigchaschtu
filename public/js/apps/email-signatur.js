// email.js

import { getSupabaseClient } from '/js/database.js';

document.addEventListener('DOMContentLoaded', async () => {

    const supabase = await getSupabaseClient();

    let employeesData = [];
    let departmentsData = [];

    // Fetch departments data
    async function fetchDepartments() {
        try {
            const { data, error } = await supabase.from('departments').select('*');
            if (error) throw error;
            departmentsData = data;
        } catch (error) {
            console.error('Error fetching departments:', error.message);
        }
    }

    // Fetch and render employees
    async function fetchAndRenderEmployees() {
        try {
            const { data, error } = await supabase.from('employees').select('*');
            if (error) throw error;

            if (data && data.length > 0) {
                await fetchDepartments();
                employeesData = data;

                const employeeDropdown = document.getElementById('employee-dropdown');
                populateDropdown(employeesData, employeeDropdown);

                const savedEmployeeId = getCookie('selectedEmployeeId');
                if (savedEmployeeId) {
                    const selectedEmployee = employeesData.find(emp => emp.id === parseInt(savedEmployeeId));
                    if (selectedEmployee) {
                        employeeDropdown.value = savedEmployeeId;
                        populateProfile(selectedEmployee);
                    }
                } else {
                    populateProfile(data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching and rendering employees:', error.message);
        }
    }

    // Populate dropdown with employees
    function populateDropdown(employees, dropdownElement) {
        dropdownElement.innerHTML = '';
        employees.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.id;
            option.textContent = `${employee.firstname} ${employee.lastname}`;
            dropdownElement.appendChild(option);
        });

        dropdownElement.addEventListener('change', () => {
            const selectedEmployeeId = dropdownElement.value;
            const selectedEmployee = employees.find(emp => emp.id === parseInt(selectedEmployeeId));
            setCookie('selectedEmployeeId', selectedEmployeeId, 7);
            location.reload();
        });
    }

    // Populate profile image and details
    async function populateProfile(employee) {
        try {
            const profileImage = document.getElementById('profileImage');
            if (!profileImage) throw new Error('Profile image element not found');

            document.getElementById('d-firstname').textContent = employee.firstname;
            document.getElementById('d-lastname').textContent = employee.lastname;
            document.getElementById('d-jobtitle').textContent = employee.jobtitle;
            document.getElementById('d-department').textContent = employee.department;
            document.getElementById('d-extphone').textContent = `D ${employee.extphone}`;

            if (employee.sharemobphone) {
                document.getElementById('d-mobphone').textContent = `| M ${employee.mobphone}`;
            } else {
                document.getElementById('d-mobphone').textContent = '';
            }

            let emailToDisplay = employee.email;
            if (!employee.shareemail) {
                const departmentData = departmentsData.find(dep => dep.name === employee.department);
                if (departmentData) emailToDisplay = departmentData.email;
            }
            document.getElementById('d-email').textContent = emailToDisplay;

            if (employee.workdays === 'WEEK') {
                document.getElementById('workdays-container').style.display = 'none';
            } else {
                document.getElementById('d-workdays').textContent = employee.workdays;
                document.getElementById('workdays-container').style.display = 'block';
            }

            // Load image with error handling
            const imageUrl = `/assets/apps/email-signatur/profil/${employee.id}.png?timestamp=${new Date().getTime()}`; // Avoid cache
            loadImage(profileImage, imageUrl);
        } catch (error) {
            console.error('Error populating profile:', error.message);
        }
    }

    // Load image and handle error if the image doesn't exist
    function loadImage(imageElement, url) {
        const img = new Image();
        img.onload = () => {
            imageElement.src = url;
        };
        img.onerror = () => {
            console.error('Image failed to load:', url);
            imageElement.src = '/assets/apps/email-signatur/profil/default.png'; // Fallback image
        };
        img.src = url;
    }

    // Utility function to set a cookie
    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    // Utility function to get a cookie by name
    function getCookie(cname) {
        const name = cname + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    // Initialize fetching and rendering employees
    fetchAndRenderEmployees();
});
