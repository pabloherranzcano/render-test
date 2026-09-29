// 1. Configuración de entorno
require('dotenv').config();

// 2. Imports
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const Person = require('./models/person');
const mongoose = require('mongoose');

// 3. Constantes y conexión
const app = express();
const PORT = process.env.PORT || 3001;
const distPath = path.join(__dirname, 'dist');
const url = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);
mongoose.connect(url);

// 4. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(distPath));
morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : '';
});

// Log format (tiny) including the body for POST requests
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body'),
);

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then((count) => {
      response.send(
        `<p>Phonebook has info for ${count} people</p>
        <p>${new Date()}</p>`,
      );
    })
    .catch((error) => next(error));
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: 'Name is required',
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'Number is required',
    });
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number,
    id: Math.random().toString(16).slice(2),
  });

  newPerson
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  if (!name) {
    return response.status(400).json({
      error: 'Name is required',
    });
  }

  if (!number) {
    return response.status(400).json({
      error: 'Number is required',
    });
  }

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    {
      returnDocument: 'after',
      runValidators: true,
      context: 'query',
    },
  )
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch((error) => next(error));
});

app.get(
  '/.well-known/appspecific/com.chrome.devtools.json',
  (request, response) => {
    response.status(204).end();
  },
);

// 6. Fallback y errores
app.use((request, response, next) => {
  if (
    request.path.startsWith('/api') ||
    request.path.startsWith('/.well-known')
  ) {
    return next();
  }

  response.sendFile(path.join(distPath, 'index.html'));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'Invalid person ID' });
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

// 7. Arrancar el servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
