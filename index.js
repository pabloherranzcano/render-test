const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
const distPath = path.join(__dirname, 'dist');

app.use(cors());
app.use(express.json());
app.use(express.static(distPath));

morgan.token('body', (req, res) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : '';
});

// Log format (tiny) including the body for POST requests
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body'),
);

const dbPath = path.join(__dirname, '../db.json');

const readDb = () => {
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
};

const writeDb = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

app.get('/api/persons', (request, response) => {
  const db = readDb();
  response.json(db.persons);
});

app.get('/api/persons/:id', (request, response) => {
  const db = readDb();
  const person = db.persons.find((p) => p.id === request.params.id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing',
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number missing',
    });
  }

  const db = readDb();

  const newPerson = {
    name: body.name,
    number: body.number,
    id: Math.random().toString(16).slice(2),
  };

  db.persons.push(newPerson);
  writeDb(db);

  response.json(newPerson);
});

app.put('/api/persons/:id', (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing',
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'number missing',
    });
  }

  const db = readDb();
  const person = db.persons.find((p) => p.id === request.params.id);

  if (!person) {
    return response.status(404).end();
  }

  person.name = body.name;
  person.number = body.number;

  writeDb(db);
  response.json(person);
});

app.delete('/api/persons/:id', (request, response) => {
  const db = readDb();
  const index = db.persons.findIndex((p) => p.id === request.params.id);

  if (index === -1) {
    return response.status(404).end();
  }

  db.persons.splice(index, 1);
  writeDb(db);

  response.status(204).end();
});

app.get('/.well-known/appspecific/com.chrome.devtools.json', (request, response) => {
  response.status(204).end();
});

app.get('*', (request, response) => {
  if (request.path.startsWith('/api')) {
    return response.status(404).end();
  }

  response.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
