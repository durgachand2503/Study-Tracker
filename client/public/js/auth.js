import { registerUser, loginUser } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        name:     registerForm.name.value,
        username: registerForm.username.value,
        email:    registerForm.email.value,
        password: registerForm.password.value,
        role:     registerForm.role.value
      };
      try {
        const result = await registerUser(data);
        localStorage.setItem('token', result.token);
        alert('Registered successfully!');
        window.location.href = '/login.html';
      } catch (err) {
        alert(err.message);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        email:    loginForm.email.value,
        password: loginForm.password.value
      };
      try {
        const result = await loginUser(data);
        localStorage.setItem('token', result.token);
        window.location.href = '/dashboard.html';
      } catch (err) {
        alert(err.message);
      }
    });
  }
});
