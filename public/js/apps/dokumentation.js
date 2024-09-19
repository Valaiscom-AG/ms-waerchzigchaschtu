   // dokumentation.js

   import { getSupabaseClient } from '/js/database.js';

   document.addEventListener('DOMContentLoaded', async () => {

       const supabase = await getSupabaseClient();

       // Function to check if the user is an admin and load or redirect
       async function checkAdminAndRedirect() {
           const usernameElement = document.getElementById('username-d');
           const insertedEmail = usernameElement.innerText; // The inserted email

           // Query the employees table to check for the admin column
           const { data, error } = await supabase
               .from('employees')
               .select('admin')
               .eq('email', insertedEmail);

           if (error) {
               console.error('Error fetching admin status:', error.message);
               return;
           }

           if (data && data.length > 0) {
               const isAdmin = data[0].admin;

               if (isAdmin) {
                   // If the user is an admin, allow the page to load
                   console.log('User is admin, loading page...');
                   return true; // Admin access
               } else {
                   // If the user is not an admin, redirect to the index page
                   console.log('User is not admin, redirecting...');
                   window.location.href = '/';
                   return false; // Non-admin access
               }
           } else {
               console.log('User not found in the database');
               window.location.href = '/'; // Redirect if the user is not found
               return false;
           }
       }

       // Check if the user is an admin before loading the page
       const isAdmin = await checkAdminAndRedirect();

       if (isAdmin) {

       }
   });