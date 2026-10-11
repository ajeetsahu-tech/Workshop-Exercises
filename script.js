const credentials = {
  admin: 'admin123',
  staff: 'campus2026',
};

const registrations = [];

const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const signupUsernameInput = document.getElementById('signupUsername');
const signupPasswordInput = document.getElementById('signupPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');

const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const showSignupBtn = document.getElementById('showSignupBtn');
const showLoginBtn = document.getElementById('showLoginBtn');
const loginPanel = document.getElementById('loginPanel');
const signupPanel = document.getElementById('signupPanel');

const themeToggle = document.getElementById('themeToggle');
const userBadge = document.getElementById('userBadge');
const searchInput = document.getElementById('searchInput');
const departmentFilter = document.getElementById('filterDepartment');
const eventFilter = document.getElementById('filterEvent');
const attendanceTableBody = document.getElementById('attendanceTableBody');

const form = {
  fullName: document.getElementById('fullName'),
  studentId: document.getElementById('studentId'),
  email: document.getElementById('email'),
  department: document.getElementById('department'),
  event: document.getElementById('event'),
  contact: document.getElementById('contact'),
};

const summary = {
  totalRegistrations: document.getElementById('totalRegistrations'),
  uniqueDepartments: document.getElementById('uniqueDepartments'),
  eventsScheduled: document.getElementById('eventsScheduled'),
  filteredResults: document.getElementById('filteredResults'),
};

loginBtn.addEventListener('click', handleLogin);
signupBtn.addEventListener('click', handleSignup);
showSignupBtn.addEventListener('click', () => switchAuthMode('signup'));
showLoginBtn.addEventListener('click', () => switchAuthMode('login'));

const registerBtn = document.getElementById('registerBtn');
registerBtn.addEventListener('click', registerParticipant);

document.getElementById('clearBtn').addEventListener('click', clearForm);
document.getElementById('exportBtn').addEventListener('click', exportCsv);
themeToggle.addEventListener('click', toggleTheme);
searchInput.addEventListener('input', filterAttendance);
departmentFilter.addEventListener('change', filterAttendance);
eventFilter.addEventListener('change', filterAttendance);

function switchAuthMode(mode) {
  if (mode === 'signup') {
    loginPanel.classList.remove('active');
    signupPanel.classList.add('active');
    loginPanel.style.display = 'none';
    signupPanel.style.display = 'block';
    return;
  }

  signupPanel.classList.remove('active');
  loginPanel.classList.add('active');
  signupPanel.style.display = 'none';
  loginPanel.style.display = 'block';
}

function handleLogin() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (credentials[username.toLowerCase()] === password) {
    userBadge.textContent = `Logged in as: ${username.charAt(0).toUpperCase() + username.slice(1)}`;
    loginScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    return;
  }

  alert('Invalid username or password.');
}

function handleSignup() {
  const username = signupUsernameInput.value.trim();
  const password = signupPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  if (!username) {
    alert('Please enter a username.');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters long.');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  credentials[username.toLowerCase()] = password;
  usernameInput.value = username;
  passwordInput.value = password;
  alert('Account created successfully! You can now login.');
  switchAuthMode('login');
}

function clearForm() {
  Object.values(form).forEach((input) => {
    if (input.tagName === 'SELECT') {
      input.selectedIndex = 0;
      return;
    }
    input.value = '';
  });
}

function validateForm(data) {
  if (!data.fullName.trim()) throw new Error('Full Name is required.');
  if (!/^[A-Za-z ]+$/.test(data.fullName.trim())) throw new Error('Full Name can only contain letters and spaces.');

  if (!data.studentId.trim()) throw new Error('Student ID is required.');
  if (data.studentId.trim().length < 4) throw new Error('Student ID must be at least 4 characters long.');

  if (!data.email.trim()) throw new Error('Email is required.');
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(data.email.trim())) throw new Error('Please enter a valid email address.');

  if (!data.department.trim()) throw new Error('Please select the department.');
  if (!data.event.trim()) throw new Error('Please select the event.');

  if (!data.contact.trim()) throw new Error('Contact Number is required.');
  if (!/^\d{10,11}$/.test(data.contact.trim())) throw new Error('Contact Number must be 10 or 11 digits.');

  const duplicate = registrations.some(
    (reg) => reg.studentId.toLowerCase() === data.studentId.trim().toLowerCase() || reg.email.toLowerCase() === data.email.trim().toLowerCase()
  );

  if (duplicate) throw new Error('Duplicate registration detected. Student ID or Email already exists.');
}

function registerParticipant() {
  const data = {
    fullName: form.fullName.value,
    studentId: form.studentId.value,
    email: form.email.value,
    department: form.department.value,
    event: form.event.value,
    contact: form.contact.value,
  };

  try {
    validateForm(data);
    registrations.push({ ...data });
    clearForm();
    filterAttendance();
    alert(`${data.fullName} has been successfully registered.`);
  } catch (error) {
    alert(error.message);
  }
}

function filterAttendance() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedDepartment = departmentFilter.value;
  const selectedEvent = eventFilter.value;

  let filtered = [...registrations];

  if (query) {
    filtered = filtered.filter(
      (item) =>
        item.fullName.toLowerCase().includes(query) ||
        item.studentId.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query)
    );
  }

  if (selectedDepartment !== 'All') {
    filtered = filtered.filter((item) => item.department === selectedDepartment);
  }

  if (selectedEvent !== 'All') {
    filtered = filtered.filter((item) => item.event === selectedEvent);
  }

  renderTable(filtered);
  updateSummary(filtered);
}

function renderTable(filtered) {
  attendanceTableBody.innerHTML = '';

  if (!filtered.length) {
    attendanceTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--muted);">No registrations found.</td></tr>';
    return;
  }

  filtered.forEach((entry) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.fullName}</td>
      <td>${entry.studentId}</td>
      <td>${entry.email}</td>
      <td>${entry.department}</td>
      <td>${entry.event}</td>
      <td>${entry.contact}</td>
    `;
    attendanceTableBody.appendChild(row);
  });
}

function updateSummary(filtered) {
  const total = registrations.length;
  const uniqueDepartments = new Set(registrations.map((item) => item.department)).size;
  const uniqueEvents = new Set(registrations.map((item) => item.event)).size;

  summary.totalRegistrations.textContent = total;
  summary.uniqueDepartments.textContent = uniqueDepartments;
  summary.eventsScheduled.textContent = uniqueEvents;
  summary.filteredResults.textContent = filtered.length;
}

function exportCsv() {
  if (!registrations.length) {
    alert('No registrations are available to export.');
    return;
  }

  const rows = [
    ['Name', 'Student ID', 'Email', 'Department', 'Event', 'Contact'],
    ...registrations.map((item) => [
      item.fullName,
      item.studentId,
      item.email,
      item.department,
      item.event,
      item.contact,
    ]),
  ];

  const csv = rows.map((row) => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'attendance_list.csv';
  link.click();
  URL.revokeObjectURL(url);

  alert('Attendance list exported successfully.');
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

switchAuthMode('login');
updateSummary([]);
renderTable([]);
