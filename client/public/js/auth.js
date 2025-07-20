import { registerUser, loginUser } from './api.js';

const rf = document.getElementById('registerForm');
if (rf) rf.addEventListener('submit', async e => {
  e.preventDefault();
  const d = {
    name:     rf.name.value,
    username: rf.username.value,
    email:    rf.email.value,
    password: rf.password.value,
    role:     rf.role.value
  };
  try {
    const { token, user } = await registerUser(d);
    localStorage.setItem('token', token);
    window.location.href = user.role === 'mentor'
      ? 'mentor-dashboard.html'
      : 'student-dashboard.html';
  } catch (err) {
    alert(err.message);
  }
});

const lf = document.getElementById('loginForm');
if (lf) lf.addEventListener('submit', async e => {
  e.preventDefault();
  const d = { email: lf.email.value, password: lf.password.value };
  try {
    const { token, user } = await loginUser(d);
    localStorage.setItem('token', token);
    window.location.href = user.role === 'mentor'
      ? 'mentor-dashboard.html'
      : 'student-dashboard.html';
  } catch (err) {
    alert(err.message);
  }
});
