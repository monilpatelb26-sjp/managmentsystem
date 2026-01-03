// --- dascbord.js (Full Updated Code) ---

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Local Storage se data nikalo
    const storedRole = localStorage.getItem("userRole");
    const storedEmail = localStorage.getItem("userEmail");

    // Agar user bina login kiye aaya hai, to wapas bhejo
    if (!storedRole) {
        alert("Please Login First!");
        window.location.href = "index.html"; 
        return;
    }

    // 2. Welcome Message Update
    const welcomeMsg = document.getElementById('welcome-msg');
    if (welcomeMsg) {
        welcomeMsg.innerText = `Welcome, ${storedRole}`;
        if(storedEmail) {
             welcomeMsg.innerText += ` (${storedEmail})`;
        }
    }

    // 3. Dropdown set karo
    const roleSelector = document.querySelector('select');
    if (roleSelector) roleSelector.value = storedRole;

    // 4. Sahi View Dikhao (Admin vs Employee)
    toggleDashboard(storedRole);

    // 5. Logout Logic
    const logoutBtn = document.querySelector('.btn-logout');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if(confirm("Logout kar rahe hain?")) {
                localStorage.clear();
                window.location.href = "index.html";
            }
        });
    }
});

// --- MAIN FUNCTIONS ---

// View Change karne wala function
function toggleDashboard(role) {
    const empView = document.getElementById('employee-view');
    const adminView = document.getElementById('admin-view');
    const adminLink = document.getElementById('admin-link');
    const welcomeMsg = document.getElementById('welcome-msg');

    // Sabse pehle sabko chhupao (Safety Step)
    if(empView) empView.classList.add('hidden');
    if(adminView) adminView.classList.add('hidden');

    // Fir role ke hisaab se dikhao
    if (role === 'Admin' || role === 'HR') {
        if(adminView) adminView.classList.remove('hidden');
        if(adminLink) adminLink.classList.remove('hidden');
        if(welcomeMsg) welcomeMsg.innerText = "Welcome, Admin";
    } else {
        if(empView) empView.classList.remove('hidden'); // Ye line wapas layegi cards ko
        if(adminLink) adminLink.classList.add('hidden');
    }
}

// Profile Section Dikhane ke liye
function showProfileSection() {
    // Dashboard ke dono views chhupao
    const empView = document.getElementById('employee-view');
    const adminView = document.getElementById('admin-view');
    
    if(empView) empView.classList.add('hidden');
    if(adminView) adminView.classList.add('hidden');

    // Profile Section dikhao
    const profileSection = document.getElementById('profile-section');
    if (profileSection) {
        profileSection.classList.remove('hidden');
        loadProfileData(); // Data bhi load karo
    }
}

// Dashboard Wapas Dikhane ke liye (Ye function fix kiya gaya hai)
function showDashboardSection() {
    // 1. Profile ko chhupao
    const profileSection = document.getElementById('profile-section');
    if (profileSection) {
        profileSection.classList.add('hidden');
    }

    // 2. Role check karo (LocalStorage se)
    let role = localStorage.getItem("userRole");
    
    // Agar galti se role gayab ho gaya, to default "Employee" maan lo
    if (!role) {
        console.log("Role missing, defaulting to Employee");
        role = "Employee"; 
    }

    // 3. Dashboard wapas dikhao
    toggleDashboard(role);
}

// (Profile Data load aur save karne wale functions same rahenge...)
async function loadProfileData() {
    const empId = localStorage.getItem("userEmpId");
    try {
        const response = await fetch('http://127.0.0.1:5000/get_profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emp_id: empId })
        });
        const data = await response.json();
        if(response.ok) {
            document.getElementById('prof-id').value = data.emp_id;
            document.getElementById('prof-email').value = data.email;
            document.getElementById('prof-job').value = data.job_title;
            document.getElementById('prof-salary').value = "₹ " + data.salary;
            document.getElementById('prof-phone').value = data.phone;
            document.getElementById('prof-address').value = data.address || "";
        }
    } catch (error) { console.error(error); }
}

async function saveProfile() {
    const empId = localStorage.getItem("userEmpId");
    const phone = document.getElementById('prof-phone').value;
    const address = document.getElementById('prof-address').value;
    try {
        await fetch('http://127.0.0.1:5000/update_profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emp_id: empId, phone: phone, address: address })
        });
        alert("Profile Updated!");
    } catch (error) { alert("Failed to update"); }
}

// --- ATTENDANCE & LEAVE LOGIC ---

// 1. Sidebar Links Setup
// Is function ko Sidebar ke buttons par onclick lagane ke liye use karein
function showSection(sectionId) {
    // Sab chhupao
    document.getElementById('employee-view').classList.add('hidden');
    document.getElementById('admin-view').classList.add('hidden');
    document.getElementById('profile-section').classList.add('hidden');
    document.getElementById('attendance-section').classList.add('hidden');
    document.getElementById('leave-section').classList.add('hidden');

    // Jo chahiye wo dikhao
    document.getElementById(sectionId).classList.remove('hidden');

    // Agar leave section khula hai to history load karo
    if(sectionId === 'leave-section') loadLeaveHistory();
}

// 2. Attendance Function
async function markAttendance(action) {
    const empId = localStorage.getItem("userEmpId");
    try {
        const response = await fetch('http://127.0.0.1:5000/mark_attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emp_id: empId, action: action })
        });
        const result = await response.json();
        alert(result.message || result.error);
    } catch (error) {
        alert("Server Error");
    }
}

// Clock chalane ke liye (Decorative)
setInterval(() => {
    const now = new Date();
    const clock = document.getElementById('clock-display');
    const dateDisplay = document.getElementById('date-display');
    if(clock) {
        clock.innerText = now.toLocaleTimeString();
        dateDisplay.innerText = now.toDateString();
    }
}, 1000);

// Is function ko replace karein dascbord.js mein

async function applyLeave() {
    console.log("Submit button dabaya...");

    // 1. Data collect karna
    const empId = localStorage.getItem("userEmpId");
    const type = document.getElementById('leave-type').value;
    const reason = document.getElementById('leave-reason').value;
    const start = document.getElementById('leave-start').value;
    const end = document.getElementById('leave-end').value;

    // 2. Check: Kya sab kuch bhara hai?
    if (!empId) {
        alert("Error: Employee ID nahi mila. Please Logout karke wapas Login karein.");
        return;
    }
    if (!start || !end) {
        alert("⚠️ Please Start Date aur End Date select karein!");
        return;
    }

    // 3. Server ko bhejna
    try {
        const response = await fetch('http://127.0.0.1:5000/apply_leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                emp_id: empId, 
                leave_type: type, 
                reason: reason, 
                start_date: start, 
                end_date: end 
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ Success: " + result.message);
            loadLeaveHistory(); // Table refresh karo
        } else {
            alert("❌ Server Error: " + result.error);
        }

    } catch (error) {
        console.error(error);
        alert("❌ Connection Failed: Python Server check karein.");
    }
}

// 4. Load Leave History
async function loadLeaveHistory() {
    const empId = localStorage.getItem("userEmpId");
    const tbody = document.getElementById('leave-table-body');
    tbody.innerHTML = ""; // Clear table

    try {
        const response = await fetch('http://127.0.0.1:5000/my_leaves', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emp_id: empId })
        });
        const leaves = await response.json();

        leaves.forEach(leave => {
            // Table Row banao
            let statusColor = leave.status === 'Approved' ? 'green' : (leave.status === 'Rejected' ? 'red' : 'orange');
            
            let row = `<tr>
                <td>${leave.leave_type}</td>
                <td>${new Date(leave.start_date).toDateString()}</td>
                <td>${new Date(leave.end_date).toDateString()}</td>
                <td style="color:${statusColor}; font-weight:bold;">${leave.status}</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) { console.error(error); }
}

// --- PAYROLL & ADMIN MANAGEMENT ---

// 1. Sidebar Link Update
// Sidebar me 'showSection' use karein
// <div class="nav-item" onclick="showSection('payroll-section')">...Payroll</div>

// 2. Load Employee Payroll
async function loadPayroll() {
    const empId = localStorage.getItem("userEmpId");
    
    // Pehle Current Salary Dikhao (Profile API se)
    try {
        const profRes = await fetch('http://127.0.0.1:5000/get_profile', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({emp_id: empId})
        });
        const profData = await profRes.json();
        if(profData.salary) {
            document.getElementById('current-pkg').innerText = "₹ " + profData.salary;
        }
    } catch(e) {}

    // Fir History Table Bharo
    try {
        const response = await fetch('http://127.0.0.1:5000/my_payroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emp_id: empId })
        });
        const records = await response.json();
        const tbody = document.getElementById('payroll-table-body');
        tbody.innerHTML = "";

        records.forEach(rec => {
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px;">${rec.month}</td>
                    <td style="padding: 10px;">${rec.payment_date}</td>
                    <td style="padding: 10px;">₹ ${rec.amount}</td>
                    <td style="padding: 10px; color: green; font-weight: bold;">${rec.status}</td>
                </tr>
            `;
        });
    } catch (error) { console.error(error); }
}

// 3. ADMIN: Load All Employees
async function loadAllEmployees() {
    try {
        const response = await fetch('http://127.0.0.1:5000/get_all_employees');
        const users = await response.json();
        const tbody = document.getElementById('admin-table-body');
        tbody.innerHTML = "";

        users.forEach(user => {
            tbody.innerHTML += `
                <tr>
                    <td>${user.emp_id}</td>
                    <td>${user.email}</td>
                    <td>${user.job_title}</td>
                    <td>
                        <input type="number" value="${user.salary}" id="sal-${user.emp_id}" style="width: 80px;">
                    </td>
                    <td>
                        <button onclick="updateSalary('${user.emp_id}')" style="background: #2563eb; color: white; padding: 5px 10px; border-radius: 4px;">Update</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) { console.error(error); }
}

// 4. ADMIN: Update Salary Function
async function updateSalary(targetEmpId) {
    const newSalary = document.getElementById(`sal-${targetEmpId}`).value;
    
    if(!confirm(`Change salary for ${targetEmpId} to ₹${newSalary}?`)) return;

    try {
        const response = await fetch('http://127.0.0.1:5000/update_salary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emp_id: targetEmpId, new_salary: newSalary })
        });
        const result = await response.json();
        alert(result.message);
    } catch (error) { alert("Failed to update"); }
}

// --- LINKING FUNCTIONS ---
// Apne purane 'showSection' function me ye line add karein:
// if(sectionId === 'payroll-section') loadPayroll();

// Apne 'toggleDashboard' function me ye line add karein (Admin login hone par):
// if (role === 'Admin') loadAllEmployees();


