// API Base URL
const API_BASE_URL = "http://127.0.0.1:5000";

// --- 1. TOGGLE FORMS ---
function toggleForms() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const title = document.getElementById('form-title');

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        title.innerText = 'Sign In';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        title.innerText = 'Sign Up';
    }
}

// --- 2. UPDATE ROLE LABEL ---
function updateRoleLabel() {
    const roleSelect = document.getElementById('signup-role');
    const idLabel = document.getElementById('dynamic-id-label');
    const idInput = document.getElementById('signup-empid');

    if (roleSelect.value === 'Admin') {
        idLabel.innerText = "Admin / HR ID";
        idInput.placeholder = "e.g., ADMIN001";
    } else {
        idLabel.innerText = "Employee ID";
        idInput.placeholder = "e.g., EMP001";
    }
}

// --- 3. SIGN UP FUNCTION ---
async function handleSignUp() {
    const empId = document.getElementById('signup-empid').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-pass').value;
    const role = document.getElementById('signup-role').value;

    if (!empId || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ empId, email, password, role })
        });
        const data = await response.json();
        
        if (response.ok) {
            alert("✅ " + data.message);
            toggleForms();
        } else {
            alert("❌ Error: " + (data.error || "Signup Failed"));
        }
    } catch (error) {
        console.error(error);
        alert("Server connection failed!");
    }
}

// --- 4. LOGIN FUNCTION (FIXED FOR ADMIN DASHBOARD) ---
async function handleLogin() {
    console.log("Login Clicked");
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;

    if (!email || !password) {
        alert("Enter Email & Password");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Save Data
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userEmpId', data.emp_id);
            localStorage.setItem('userEmail', data.email);

            // === ADMIN LOGIC ===
            if (data.role === 'Admin' || data.role === 'HR') {
                alert("Welcome Admin! Loading Dashboard...");
                
                // 1. Hide Login Box
                document.getElementById('main-container').style.display = 'none';

                // 2. CSS RESET (VERY IMPORTANT)
                // Login page ka Flexbox aur Blue Background hatana padega
                document.body.style.display = "block"; 
                document.body.style.background = "#ffffff"; 
                document.body.style.height = "auto";
                document.body.style.padding = "0";

                // 3. Show Admin Dashboard
                const adminDiv = document.getElementById('adminFeatures');
                adminDiv.style.display = 'block';
                adminDiv.classList.remove('hidden');

                // 4. Load Data
                loadAdminDashboard();
            } 
            // === EMPLOYEE LOGIC ===
            else {
                window.location.href = 'dascbord.html';
            }
        } else {
            alert("❌ Login Failed: " + data.message);
        }
    } catch (error) {
        console.error(error);
        alert("Server connection failed.");
    }
}

// ==========================================
// ADMIN DASHBOARD LOGIC
// ==========================================

function loadAdminDashboard() {
    showAdminSection('employees'); // Show first tab
    fetchEmployees(); 
}

function showAdminSection(sectionName) {
    // Hide all
    document.getElementById('section-employees').style.display = 'none';
    document.getElementById('section-attendance').style.display = 'none';
    document.getElementById('section-leaves').style.display = 'none';
    document.getElementById('section-payroll').style.display = 'none';

    // Show selected
    document.getElementById('section-' + sectionName).style.display = 'block';

    // Fetch Data
    if(sectionName === 'employees') fetchEmployees();
    if(sectionName === 'attendance') fetchAllAttendance();
    if(sectionName === 'leaves') fetchPendingLeaves();
}

async function fetchEmployees() {
    try {
        const res = await fetch(`${API_BASE_URL}/get_all_employees`);
        const users = await res.json();
        const table = document.getElementById('admin-emp-table');
        table.innerHTML = '';
        users.forEach(u => {
            table.innerHTML += `
                <tr>
                    <td style="padding:10px;">${u.emp_id}</td>
                    <td style="padding:10px;">${u.email}</td>
                    <td style="padding:10px;">${u.job_title || '-'}</td>
                    <td style="padding:10px;">₹${u.salary || 0}</td>
                </tr>`;
        });
    } catch(e) { console.error(e); }
}

async function fetchAllAttendance() {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/attendance`);
        const records = await res.json();
        const table = document.getElementById('admin-att-table');
        table.innerHTML = '';
        if(records.length === 0) table.innerHTML = '<tr><td colspan="4" style="padding:10px; text-align:center;">No attendance marked today.</td></tr>';
        records.forEach(r => {
            table.innerHTML += `
                <tr>
                    <td style="padding:10px;">${r.emp_id}</td>
                    <td style="padding:10px;">${r.email}</td>
                    <td style="padding:10px;">${r.check_in}</td>
                    <td style="padding:10px; color:green; font-weight:bold;">${r.status}</td>
                </tr>`;
        });
    } catch(e) { console.error(e); }
}

async function fetchPendingLeaves() {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/get_leaves`);
        const leaves = await res.json();
        const container = document.getElementById('admin-leave-list');
        container.innerHTML = '';
        if(leaves.length === 0) container.innerHTML = '<p>No pending requests.</p>';
        leaves.forEach(l => {
            container.innerHTML += `
                <div style="border:1px solid #ddd; padding:15px; margin-bottom:10px; background:white; border-radius:5px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                    <strong>${l.emp_id}</strong> wants <strong>${l.leave_type}</strong> <br>
                    <small>Reason: ${l.reason}</small> <br>
                    <small>Date: ${l.start_date} To ${l.end_date}</small>
                    <div style="margin-top:10px;">
                        <button onclick="approveLeave(${l.id}, 'Approved')" style="padding:5px 10px; background:green; color:white; border:none; cursor:pointer; margin-right:5px;">Approve</button>
                        <button onclick="approveLeave(${l.id}, 'Rejected')" style="padding:5px 10px; background:red; color:white; border:none; cursor:pointer;">Reject</button>
                    </div>
                </div>`;
        });
    } catch(e) { console.error(e); }
}

async function approveLeave(id, status) {
    if(!confirm(`Confirm ${status}?`)) return;
    await fetch(`${API_BASE_URL}/admin/update_leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, status: status })
    });
    alert("Updated!");
    fetchPendingLeaves(); 
}

async function updateSalary() {
    const empId = document.getElementById('salary-emp-id').value;
    const amount = document.getElementById('salary-amount').value;
    if(!empId || !amount) { alert("Please enter details"); return; }
    
    const res = await fetch(`${API_BASE_URL}/update_salary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emp_id: empId, new_salary: amount })
    });
    const data = await res.json();
    alert(data.message);
}