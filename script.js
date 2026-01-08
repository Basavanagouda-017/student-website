// If we are on localhost, use localhost. If deployed, use the relative path ("").
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? "http://localhost:3000" 
    : "";
// ==========================================
// 1. REGISTER USER FUNCTION
// ==========================================
async function registerUser() {
    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-password');
    const message = document.getElementById('message');

    // Check if elements exist to prevent errors on other pages
    if (!nameInput || !emailInput || !passwordInput) return;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!name || !email || !password) {
        message.innerText = "All fields are required!";
        message.className = "error";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            message.innerText = "Registration Successful! Redirecting...";
            message.className = "success";
            setTimeout(() => window.location.href = 'login.html', 1500);
        } else {
            message.innerText = data.message;
            message.className = "error";
        }
    } catch (error) {
        console.error("Error:", error);
        message.innerText = "Server error. Is the backend running?";
        message.className = "error";
    }
}

// ==========================================
// 2. LOGIN USER FUNCTION
// ==========================================
async function loginUser() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const message = document.getElementById('message');

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        message.innerText = "Please enter email and password";
        message.className = "error";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Save user object (including _id) to localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            message.innerText = "Login Successful!";
            message.className = "success";
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
        } else {
            message.innerText = data.message;
            message.className = "error";
        }
    } catch (error) {
        console.error("Error:", error);
        message.innerText = "Server error. Check console.";
        message.className = "error";
    }
}

// ==========================================
// 3. DASHBOARD LOGIC (Auto-runs if on Dashboard)
// ==========================================

// Check if we are on the dashboard page
if (window.location.pathname.includes('dashboard.html')) {
    
    // Get user from storage
    const user = JSON.parse(localStorage.getItem('user'));

    // If no user, kick them back to login
    if (!user) {
        window.location.href = 'login.html';
    } else {
        // Display User Name
        const userNameElement = document.getElementById('user-name');
        if(userNameElement) userNameElement.innerText = user.name;
        
        // Load courses
        fetchMyCourses();
    }
}

// LOGOUT FUNCTION
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// REGISTER COURSE FUNCTION
async function registerCourse() {
    const user = JSON.parse(localStorage.getItem('user'));
    const select = document.getElementById('course-select');
    const msg = document.getElementById('msg');

    if (!select || !msg) return; // Safety check

    const [courseName, courseCode] = select.value.split('|'); 

    if (!user) {
        alert("Please login first");
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register-course`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user._id,       
                studentName: user.name, 
                courseName: courseName,
                courseCode: courseCode
            })
        });

        const data = await response.json();

        if (response.ok) {
            msg.innerText = "✅ Success!";
            msg.className = "success";
            fetchMyCourses(); // Refresh the list immediately
        } else {
            msg.innerText = "❌ " + data.message;
            msg.className = "error";
        }
    } catch (error) {
        console.error(error);
        msg.innerText = "Connection Error";
        msg.className = "error";
    }
}

// FETCH COURSES FUNCTION
async function fetchMyCourses() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
        const response = await fetch(`${API_URL}/my-courses/${user._id}`);
        const courses = await response.json();
        
        const list = document.getElementById('course-list');
        if(!list) return;

        list.innerHTML = ""; // Clear current list

        if (courses.length === 0) {
            list.innerHTML = "<li>No courses registered yet.</li>";
            return;
        }

        courses.forEach(course => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${course.courseName}</strong> <br> <small>${course.courseCode}</small>`;
            list.appendChild(li);
        });

    } catch (error) {
        console.error("Error loading courses:", error);
    }
}

// FETCH COURSES FUNCTION (Updated with Remove Button)
async function fetchMyCourses() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
        const response = await fetch(`${API_URL}/my-courses/${user._id}`);
        const courses = await response.json();
        
        const list = document.getElementById('course-list');
        if(!list) return;

        list.innerHTML = ""; // Clear current list

        if (courses.length === 0) {
            list.innerHTML = "<li>No courses registered yet.</li>";
            return;
        }

        courses.forEach(course => {
            const li = document.createElement('li');
            
            // Add Flexbox layout for text + button
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            li.style.alignItems = "center";

            li.innerHTML = `
                <div>
                    <strong>${course.courseName}</strong> <br> 
                    <small>${course.courseCode}</small>
                </div>
                <button 
                    onclick="deleteCourse('${course._id}')" 
                    class="remove-btn"
                >
                    Remove
                </button>
            `;
            list.appendChild(li);
        });

    } catch (error) {
        console.error("Error loading courses:", error);
    }
}

// DELETE COURSE FUNCTION (New!)
async function deleteCourse(courseId) {
    // 1. Confirm with the user
    if (!confirm("Are you sure you want to drop this course?")) {
        return;
    }

    try {
        // 2. Send DELETE request to backend
        const response = await fetch(`${API_URL}/delete-course/${courseId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            // 3. Refresh the list to show it's gone
            fetchMyCourses();
        } else {
            alert("Error: " + data.message);
        }
   } catch (error) {
        console.error("Error deleting course:", error);
        alert("Failed to delete course");
    }
}
// End of file (no extra brackets or text)