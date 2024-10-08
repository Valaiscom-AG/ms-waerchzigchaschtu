// visitenkarten.js

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
                        generatePDF(selectedEmployee); // Generate PDF on load
                    }
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
            generatePDF(selectedEmployee); // Generate PDF for the selected employee
        });
    }

    // Function to generate the PDF
    async function generatePDF(employee) {
        try {
            // Load the template PDF
            const existingPdfBytes = await fetch('/assets/apps/visitenkarten/pdfs/Valaiscom_VK_Template_Plane.pdf').then(res => res.arrayBuffer());
            const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);

            // Register fontkit
            pdfDoc.registerFontkit(fontkit); // Registering fontkit in the browser

            const pages = pdfDoc.getPages();
            const firstPage = pages[1]; // Use the second page
            const { width, height } = firstPage.getSize();

            // Load the custom font (Assuming you have the font available as a URL)
            const fontBytes = await fetch('/assets/apps/visitenkarten/europa-regular-webfont.ttf').then(res => res.arrayBuffer());
            const fontBoldBytes = await fetch('/assets/apps/visitenkarten/europa-regular-webfont.ttf').then(res => res.arrayBuffer());
            const europaFont = await pdfDoc.embedFont(fontBytes);
            const europaFontBold = await pdfDoc.embedFont(fontBoldBytes);

            // Prepare employee details
            const name = `${employee.firstname} ${employee.lastname}\n`;
            const jobtitle = `${employee.jobtitle}`; // Assuming job title is available
            const extphone = `D ${employee.extphone}`;
            const mobphone = employee.sharemobphone ? `M ${employee.mobphone}` : employee.shareemail ? `${employee.email}` : 'info@valaiscom-ag.ch'; // Condition based on sharemobphone
            const email = employee.sharemobphone ? (employee.shareemail ? employee.email : 'info@valaiscom-ag.ch') : '';
            const boldColor = PDFLib.rgb(214 / 255, 1 / 255, 55 / 255); // Equivalent to hex #d60137

            firstPage.drawText(name, {
                x: 27,
                y: height - 117,
                size: 12,
                font: europaFontBold, // Use bold font
                color: boldColor, // Set the color to #d60137
                lineHeight: 14,
                opacity: 1,
                rotate: PDFLib.degrees(0),
            });

firstPage.drawText(jobtitle, {
    x: 27,
    y: height - 130,
    size: 10,
    font: europaFont,
    color: PDFLib.rgb(0, 0, 0),
    rotate: PDFLib.degrees(0), // Add rotation as required
});

firstPage.drawText(`${extphone}`, {
    x: 27,
    y: height - 150,
    size: 8,
    font: europaFont,
    color: PDFLib.rgb(0, 0, 0),
    rotate: PDFLib.degrees(0), // Add rotation as required
});

firstPage.drawText(`${mobphone}`, {
    x: 27,
    y: height - 162,
    size: 8,
    font: europaFont,
    color: PDFLib.rgb(0, 0, 0),
    rotate: PDFLib.degrees(0), // Add rotation as required
});

firstPage.drawText(`${email}`, {
    x: 27,
    y: height - 174,
    size: 8,
    font: europaFont,
    color: PDFLib.rgb(0, 0, 0),
    rotate: PDFLib.degrees(0), // Add rotation as required
});


const PngUrl = `/assets/apps/email-signatur/profil/${employee.id}.png?timestamp=${new Date().getTime()}`;
const PngImageBytes = await fetch(PngUrl).then((res) => res.arrayBuffer());

// Use embedPng for PNG images, not embedJpg
const PngImage = await pdfDoc.embedPng(PngImageBytes); 
const PngDims = PngImage.scale(0.12);

firstPage.drawImage(PngImage, {
  x: 7,
  y: 140,
  width: PngDims.width,
  height: PngDims.height,
  opacity: 1,
});


            const pdfBytes = await pdfDoc.save();
            displayPDF(pdfBytes);
        } catch (error) {
            console.error('Error generating PDF:', error.message);
        }
    }

    // Display the generated PDF in the iframe
    function displayPDF(pdfBytes) {
        const pdfBlobUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
        const pdfPreviewIframe = document.getElementById('pdfPreview');
        if (pdfPreviewIframe) {
            pdfPreviewIframe.src = `${pdfBlobUrl}#toolbar=1&navpanes=0&scrollbar=0`;
        } else {
            console.error("PDF preview iframe not found.");
        }
    }

    // Utility function to set a cookie
    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = `${cname}=${cvalue}; ${expires}; path=/`;
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
