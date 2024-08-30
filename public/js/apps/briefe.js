document.addEventListener('DOMContentLoaded', () => {
    const templateDropdown = document.getElementById('templateDropdown');
    const titleInput = document.getElementById('title');
    const textArea = document.getElementById('text');
    const dateInput = document.getElementById('date');

    const firstNameInput = document.querySelector('[aria-label="First name"]');
    const lastNameInput = document.querySelector('[aria-label="Last name"]');
    const streetInput = document.querySelector('[aria-label="Strasse & Haus Nr."]');
    const plzInput = document.querySelector('[aria-label="PLZ"]');
    const cityInput = document.querySelector('[aria-label="Ort"]');
    const countryInput = document.querySelector('[aria-label="Land"]');

    // Check if all inputs are correctly referenced
    if (!firstNameInput || !lastNameInput || !streetInput || !plzInput || !cityInput || !countryInput || !titleInput || !textArea || !dateInput) {
        console.error("One or more form elements could not be found.");
        return;
    }

    // Load templates from JSON and populate dropdown
    fetch('templates.json')
        .then(response => response.json())
        .then(data => {
            data.templates.forEach(template => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.className = 'dropdown-item';
                a.href = '#';
                a.textContent = template.title;
                a.addEventListener('click', () => {
                    titleInput.value = template.title;
                    textArea.value = template.text;
                    updatePreview();
                });
                li.appendChild(a);
                templateDropdown.appendChild(li);
            });
        });

    // Update the preview whenever the form inputs change
    document.getElementById('pdfForm').addEventListener('input', updatePreview);

    // Print button functionality to print the PDF
    document.getElementById('printBtn').addEventListener('click', () => {
        generatePDF().then(pdfBytes => {
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            iframe.contentWindow.print();
        });
    });

    // Function to format the date
    function formatDate(date) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(date).toLocaleDateString('de-DE', options);
    }

    function updatePreview() {
        generatePDF().then(pdfBytes => {
            const pdfBlobUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
            const pdfPreviewIframe = document.getElementById('pdfPreview');
            if (pdfPreviewIframe) {
                pdfPreviewIframe.src = `${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=0`;
            } else {
                console.error("PDF preview iframe not found.");
            }
        });
    }

    // Function to generate the PDF
    async function generatePDF() {
        const existingPdfBytes = await fetch('pdfs/letterhead.pdf').then(res => res.arrayBuffer());

        const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        const address = `${firstNameInput.value} ${lastNameInput.value}\n` +
            `${streetInput.value}\n` +
            `${plzInput.value} ${cityInput.value}\n` +
            `${countryInput.value}`;

        const title = titleInput.value;
        const date = formatDate(dateInput.value);
        const text = textArea.value;

        firstPage.drawText(address, {
            x: 75,
            y: height - 145,
            size: 12,
            color: PDFLib.rgb(0, 0, 0),
        });

        firstPage.drawText(title, {
            x: 75,
            y: height - 320,
            size: 18,
            color: PDFLib.rgb(0, 0, 0),
        });

        firstPage.drawText(date, {
            x: width - 150,
            y: height - 150,
            size: 12,
            color: PDFLib.rgb(0, 0, 0),
        });

        firstPage.drawText(text, {
            x: 75,
            y: height - 345,
            size: 12,
            color: PDFLib.rgb(0, 0, 0),
        });

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    }

    // Trigger the initial preview
    updatePreview();
});
