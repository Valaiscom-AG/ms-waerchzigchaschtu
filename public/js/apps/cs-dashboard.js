// cs-dashboard.js
import { getSupabaseClient } from '/js/database.js';

document.addEventListener('DOMContentLoaded', async () => {
  const supabase = await getSupabaseClient();
  
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

  // Initialize state
  let currentView = 'today';
  let currentChart = 'bar';
  let currentFilter = 'all';
  let employeesMap = new Map(); // Cache for employee data
  
  // Initialize dashboard
  await initializeDashboard();
  setupEventListeners();
  
  async function initializeDashboard() {
    const container = document.createElement('div');
    container.className = 'container-fluid mt-4';
    container.innerHTML = `
      <div class="row">
        <!-- Time Filter -->
        <div class="col-12 mb-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="btn-group" role="group">
                <button class="btn btn-outline-primary active" data-time="today">
                  <i class="bi bi-calendar-day"></i> Heute
                </button>
                <button class="btn btn-outline-primary" data-time="week">
                  <i class="bi bi-calendar-week"></i> Woche
                </button>
                <button class="btn btn-outline-primary" data-time="month">
                  <i class="bi bi-calendar-month"></i> Monat
                </button>
                <button class="btn btn-outline-primary" data-time="year">
                  <i class="bi bi-calendar"></i> Jahr
                </button>
              </div>
    <div class="btn-group ms-3" role="group">
    <button class="btn btn-outline-secondary" data-chart="bar">
        <i class="bi bi-bar-chart"></i>
    </button>
    <button class="btn btn-outline-secondary" data-chart="line">
        <i class="bi bi-graph-up"></i>
    </button>
    <button class="btn btn-outline-secondary" data-chart="pie">
        <i class="bi bi-pie-chart"></i>
    </button>
</div>

          </div>
        </div>

        <!-- Bento Grid Layout -->
        <div class="col-12 col-lg-8 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title text-center fw-bold"">Übersicht</h5>
              <canvas id="mainChart"></canvas>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-4">
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <h5 class="card-title">Quick Stats</h5>
              <div id="quickStats" class="row g-3">
                <!-- Stats will be inserted here -->
              </div>
            </div>
          </div>
        </div>

        <!-- Top Rated Employees -->
        <div class="col-12 mb-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title text-center fw-bold">Beste Bewertungen</h5>
              <div class="row" id="topRated">
                <!-- Top rated cards will be inserted here -->
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Feedback Table -->
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="card-title mb-0 fw-bold">Details</h5>
                <div class="d-flex gap-2">
                  <select class="form-select" id="departmentFilter">
                    <option value="all">All Departments</option>
                  </select>
                  <select class="form-select" id="employeeFilter">
                    <option value="all">All Employees</option>
                  </select>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Mitarbeiter</th>
                      <th>Abtielung</th>
                      <th>Bewertungen</th>
                      <th>Kommentar</th>
                      <th>Datum</th>
                    </tr>
                  </thead>
                  <tbody id="feedbackTable">
                    <!-- Feedback rows will be inserted here -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.querySelector('main').appendChild(container);
    await loadData();
  }

  async function loadData() {
    try {
      // First, fetch all employees to create a lookup map
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*');

      if (employeesError) throw employeesError;

      // Create lookup map using combined first and last names
      employeesMap = new Map(
        employees.map(emp => [
          `${emp.firstname} ${emp.lastname}`.toLowerCase(),
          emp
        ])
      );

      // Then fetch feedback data
      const { data: feedback, error: feedbackError } = await supabase
        .from('cs_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      // Enrich feedback data with employee information
      const enrichedFeedback = feedback.map(item => ({
        ...item,
        employeeData: employeesMap.get(item.employee.toLowerCase()) || {
          firstname: 'Unknown',
          lastname: 'Employee',
          department: 'Unknown'
        }
      }));

      updateDashboard(enrichedFeedback);
      updateFilters(enrichedFeedback);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  function setupEventListeners() {
    // Time Filter
    document.querySelectorAll('[data-time]').forEach(button => {
        button.addEventListener('click', (event) => {
            currentView = event.target.getAttribute('data-time');
            console.log('Current View:', currentView); // Debug
            loadData(); // Reload data when the time filter changes
        });
    });

    // Chart Type Filter
    document.querySelectorAll('[data-chart]').forEach(button => {
        button.addEventListener('click', (event) => {
            currentChart = event.target.getAttribute('data-chart');
            console.log('Current Chart Type:', currentChart); // Debug
            loadData(); // Update chart when chart type changes
        });
    });

    // Export button (if applicable)
    document.getElementById('exportBtn')?.addEventListener('click', exportToExcel);
}



function updateDashboard(feedback) {
    updateFeedbackTable(feedback);
    updateTopRated(feedback);
    renderMainChart(processChartData(feedback)); // Ensure this is reprocessed
    updateQuickStats(feedback);
}

  function updateFilters(feedback) {
    // Update department filter
    const departments = new Set(feedback.map(f => f.employeeData.department));
    const departmentFilter = document.getElementById('departmentFilter');
    departmentFilter.innerHTML = `
      <option value="all">All Departments</option>
      ${Array.from(departments).map(dept => 
        `<option value="${dept}">${dept}</option>`
      ).join('')}
    `;
  
    // Update employee filter
    const employees = new Set(feedback.map(f => f.employeeData.firstname + ' ' + f.employeeData.lastname));
    const employeeFilter = document.getElementById('employeeFilter');
    employeeFilter.innerHTML = `
      <option value="all">All Employees</option>
      ${Array.from(employees).map(emp => 
        `<option value="${emp}">${emp}</option>`
      ).join('')}
    `;
  }
  

  function updateFeedbackTable(feedback) {
    const tableBody = document.getElementById('feedbackTable');
    const filteredFeedback = filterFeedback(feedback);
    
    tableBody.innerHTML = filteredFeedback.map(item => `
      <tr>
        <td>
          <div class="d-flex align-items-center">
            <img src="/assets/apps/email-signatur/profil/${item.employeeData.id || '10'}.png" 
                 class="rounded-circle me-2" 
                 height="40"
                 alt="${item.employee}"
                 draggable="false"
                 onerror="this.src='/assets/default-avatar.png'">
            <div>
              ${item.employee}
            </div>
          </div>
        </td>
        <td>${item.employeeData.department || 'Unknown'}</td>
        <td>
          <div class="d-flex gap-1">
            ${Array.from({ length: 4 }, (_, i) => `
              <span class="badge ${item['rating_' + (i + 1)] >= 4 ? 'bg-success' : 'bg-secondary'}">
                ${item['rating_' + (i + 1)]}
              </span>
            `).join('')}
          </div>
        </td>
        <td>${item.comment}</td>
        <td>${new Date(item.created_at).toLocaleDateString('de-DE', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })}</td>
      </tr>
    `).join('');
  }

  function updateTopRated(feedback) {
    const employeeStats = feedback.reduce((acc, curr) => {
      if (!acc[curr.employee]) {
        acc[curr.employee] = {
          ratings: [],
          employee: curr.employee,
          employeeData: curr.employeeData
        };
      }
      acc[curr.employee].ratings.push(
        (curr.rating_1 + curr.rating_2 + curr.rating_3 + curr.rating_4) / 4
      );
      return acc;
    }, {});

    const topEmployees = Object.values(employeeStats)
      .sort((a, b) => 
        (b.ratings.reduce((sum, rating) => sum + rating, 0) / b.ratings.length) - 
        (a.ratings.reduce((sum, rating) => sum + rating, 0) / a.ratings.length)
      )
      .slice(0, 3);

    const topRatedContainer = document.getElementById('topRated');
    topRatedContainer.innerHTML = topEmployees.map(emp => `
      <div class="col-md-4">
        <div class="card text-center shadow-sm h-100">
          <div class="card-body">
            <img src="/assets/apps/email-signatur/profil/${emp.employeeData.id || 'default'}.png" 
                 class="rounded-circle mb-3"
                 height="80"
                 alt="${emp.employee}"
                 draggable="false"
                 onerror="this.src='/assets/apps/email-signatur/profil/10.png'">
            <h5 class="card-title">${emp.employee}</h5>
            <p class="text-muted">${emp.employeeData.department || 'Unknown'}</p>
            <p class="fw-bold">${(emp.ratings.reduce((sum, rating) => sum + rating, 0) / emp.ratings.length).toFixed(2)}</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderMainChart(chartData) {
    const ctx = document.getElementById('mainChart').getContext('2d');

    if (window.mainChart instanceof Chart) {
        window.mainChart.destroy();
    }

    window.mainChart = new Chart(ctx, {
        type: currentChart,
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Ratings',
                    },
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Scores',
                    },
                },
            },
        },
    });
}



  function updateQuickStats(feedback) {
    const stats = calculateStats(feedback);
    const quickStatsContainer = document.getElementById('quickStats');
    quickStatsContainer.innerHTML = `
      <div class="col">
        <div class="stat-card">
          <h6>Average Rating</h6>
          <p>${stats.averageRating.toFixed(2)}</p>
        </div>
      </div>
      <div class="col">
        <div class="stat-card">
          <h6>Total Feedback</h6>
          <p>${stats.totalFeedback}</p>
        </div>
      </div>
      <div class="col">
        <div class="stat-card">
          <h6>Departments</h6>
          <p>${stats.departmentCount}</p>
        </div>
      </div>
      <div class="col">
        <div class="stat-card">
          <h6>Top Rating</h6>
          <p>${stats.topRating}</p>
        </div>
      </div>
    `;
  }

  function calculateStats(feedback) {
    const ratings = feedback.map(f => 
      (f.rating_1 + f.rating_2 + f.rating_3 + f.rating_4) / 4
    );

    return {
      averageRating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
      totalFeedback: feedback.length,
      departmentCount: new Set(feedback.map(f => f.employeeData.department)).size,
      topRating: Math.max(...ratings)
    };
  }

  function filterFeedback(feedback) {
    const departmentFilter = document.getElementById('departmentFilter').value;
    const employeeFilter = document.getElementById('employeeFilter').value;

    return feedback.filter(item => {
      const matchesDepartment = departmentFilter === 'all' || item.employeeData.department === departmentFilter;
      const matchesEmployee = employeeFilter === 'all' || item.employee === employeeFilter;
      return matchesDepartment && matchesEmployee;
    });
  }
  function processChartData(feedback) {
    const chartData = {
        labels: ['Rating 1', 'Rating 2', 'Rating 3', 'Rating 4'],
        datasets: []
    };

    const ratings = ['rating_1', 'rating_2', 'rating_3', 'rating_4'];

    ratings.forEach((rating, index) => {
        const ratingData = feedback.map(f => f[rating] || 0); // Ensure no undefined values
        const total = ratingData.reduce((sum, value) => sum + value, 0);
        
        chartData.datasets.push({
            label: `Rating ${index + 1}`,
            data: ratingData,
            backgroundColor: `rgba(${index * 60}, ${index * 40}, 100, 0.6)`,
        });
    });

    console.log('Processed Chart Data:', chartData); // Debug the data here

    return chartData;
}



  function exportToExcel() {
    const feedback = Array.from(document.querySelectorAll('#feedbackTable tr')).map(row => {
      const cells = row.querySelectorAll('td');
      return {
        Employee: cells[0].innerText.trim(),
        Department: cells[1].innerText.trim(),
        Ratings: Array.from(cells[2].querySelectorAll('.badge')).map(badge => badge.innerText.trim()).join(', '),
        Comment: cells[3].innerText.trim(),
        Date: cells[4].innerText.trim()
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(feedback);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedback');

    // Export the file
    XLSX.writeFile(workbook, 'feedback_data.xlsx');
  }
});
