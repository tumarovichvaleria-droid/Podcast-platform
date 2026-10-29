document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorAlert = document.getElementById('errorAlert');

  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Отменяем стандартную отправку формы

    // Скрываем прошлые ошибки
    errorAlert.classList.add('d-none');
    errorAlert.textContent = '';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      // Отправляем данные на ваш роутер
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // Если роутер вернул ошибку (400, 401, 403)
      if (!response.ok) {
        errorAlert.textContent = data.error || 'Ошибка входа';
        errorAlert.classList.remove('d-none'); // Показываем блок с ошибкой
        return;
      }

      // Если всё успешно (200 OK) — переходим на главную
      window.location.href = '/';

    } catch (err) {
      errorAlert.textContent = 'Ошибка сети. Попробуйте позже.';
      errorAlert.classList.remove('d-none');
    }
  });
});