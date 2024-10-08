import { getSupabaseClient } from '/js/database.js';

document.addEventListener('DOMContentLoaded', async () => {
    const supabase = await getSupabaseClient();
    
    // Select the form
    const npsForm = document.getElementById('npsForm');

    // Add an event listener for form submission
    npsForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        
        // Get form values
        const employee = document.getElementById('employeeDropdown').value;
        const rating = document.querySelector('input[name="rating"]:checked')?.value; // Get selected rating
        const comment = document.getElementById('comment').value;

        // Check if all required fields are filled
        if (!employee || !rating) {
            alert('Please fill out all required fields.');
            return;
        }

        // Insert data into Supabase
        const { error } = await supabase
            .from('nps_feedback')  // Assume table name is 'nps_feedback'
            .insert([
                {
                    employee: employee,
                    rating: rating,
                    comment: comment || null  // Allow empty comment
                }
            ]);

        if (error) {
            console.error('Error inserting data:', error);
            alert('Failed to submit feedback. Please try again.');
        } else {
            alert('Feedback submitted successfully!');
            npsForm.reset();  // Reset the form after successful submission
        }
    });
});
