// Przykład prostego skryptu walidującego formularz rejestracji
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if(form) {
    form.addEventListener('submit', function(e) {
      const password = document.getElementById('password').value;
      if(password.length < 6) {
        e.preventDefault();
        alert('Hasło musi mieć co najmniej 6 znaków!');
      }
    });
  }
});
