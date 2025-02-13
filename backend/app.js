const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 3000;
const usersFile = path.join(__dirname, 'users.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serwowanie strony rejestracji
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Serwowanie strony logowania
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serwowanie dashboardu (panelu użytkownika)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Obsługa rejestracji użytkownika
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  console.log("Otrzymano dane:", { username, email, password });

  if (!username || !email || !password) {
    return res.status(400).send('Proszę wypełnić wszystkie pola.');
  }

  fs.readFile(usersFile, 'utf8', async (err, data) => {
    if (err) {
      console.error("Błąd odczytu pliku:", err);
      return res.status(500).send('Błąd odczytu danych.');
    }

    let users = JSON.parse(data);
    console.log("Obecni użytkownicy:", users);

    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).send('Ten email jest już zarejestrowany.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, email, password: hashedPassword };
    users.push(newUser);

    fs.writeFile(usersFile, JSON.stringify(users, null, 2), err => {
      if (err) {
        console.error("Błąd zapisu pliku:", err);
        return res.status(500).send('Błąd zapisu danych.');
      }
      console.log("Zapisano użytkownika do pliku!");

      // Po rejestracji przekierowanie na stronę logowania
      res.send(`
        <script>
          alert("Rejestracja zakończona sukcesem! Możesz się teraz zalogować.");
          window.location.href = "/login";
        </script>
      `);
    });
  });
});

// Obsługa logowania (z przekierowaniem na dashboard)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  fs.readFile(usersFile, 'utf8', async (err, data) => {
    if (err) {
      return res.status(500).send('Błąd odczytu danych.');
    }

    let users = JSON.parse(data);
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(400).send('Nieprawidłowy email lub hasło.');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.send(`
        <script>
          localStorage.setItem("username", "${user.username}");
          window.location.href = "/dashboard";
        </script>
      `);
    } else {
      res.status(400).send('Nieprawidłowy email lub hasło.');
    }
  });
});

// Tymczasowa trasa do sprawdzania zapisanych użytkowników (po testach usunąć!)
app.get('/users', (req, res) => {
  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Błąd odczytu pliku.');
    }
    res.send(data);
  });
});

// Start serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
