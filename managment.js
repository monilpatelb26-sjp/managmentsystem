// Toggle between Login and Signup forms
function toggleForms() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const title = document.getElementById('form-title');

    if (loginForm.style.display === 'none') {
        // Show Login
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        title.innerText = "Sign In";
    } else {
        // Show Sign Up
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        title.innerText = "Sign Up";
    }
}

// 1. SIGN UP FUNCTION
async function handleSignUp() {
    console.log("Signup clicked...");

    // HTML Inputs se data lena (IDs match karayi hain)
    const empId = document.getElementById("signup-empid").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-pass").value;
    const role = document.getElementById("signup-role").value;

    if(!empId || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ empId, email, password, role })
        });

        const result = await response.json();
        
        if (response.ok) {
            alert("✅ " + result.message);
            toggleForms(); // Go to login after signup
        } else {
            alert("❌ Error: " + result.error);
        }
    } catch (error) {
        console.error(error);
        alert("Server connection failed. Check if Python is running.");
    }
}

// --- managment.js ---

async function handleLogin() {
    console.log("Login clicked...");
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-pass").value;

    if(!email || !password) { alert("Please enter details"); return; }

    try {
        const response = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.status === 200) {
            // --- YAHAN CHANGE KIYA HAI ---
            alert("Login Successful! Redirecting...");

            // 1. Data Browser me save karo taaki agle page ko pata chale kon aaya hai
            localStorage.setItem("userRole", result.role);   // Admin ya Employee
            localStorage.setItem("userEmail", result.email); // User ka email
            localStorage.setItem("userEmpId", result.emp_id);// User ka ID

            // 2. Page ko Dashboard wali file par bhejo
            // Dhyan rahe: Aapki dashboard file ka naam 'dascbord.html' hona chahiye
            window.location.href = "dascbord.html"; 
            
        } else {
            alert("Login Failed: " + result.message);
        }
    } catch (error) {
        console.error(error);
        alert("Server connection failed. Check Python server.");
    }
}

        