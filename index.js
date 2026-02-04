const express = require('express');
const app = express();
const cors = require('cors')

app.use(cors())
app.use(express.json());
app.use(express.static('dist'))

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger);

let notes = [
  {
    id: 1,
    content: 'HTML is easy',
    important: true,
  },
  {
    id: 2,
    content: 'Browser can execute only JavaScript',
    important: false,
  },
  {
    id: 3,
    content: 'GET and POST are the most important methods of HTTP protocol',
    important: true,
  },
];
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (request, response) => {
  response.json(notes);
});

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id);
  const note = notes.find((note) => note.id === id);

  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
});

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const note = {
    content: body.content,
    important: Boolean(body.important) || false,
    id: generateId(),
  }

  notes = notes.concat(note)

  response.json(note)
})

app.put('/api/notes/:id', (request, response) => {
  const id = request.params.id;
  const body = request.body;

  // Validar que el contenido esté presente
  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    });
  }

  // Buscar la nota por id
  const noteIndex = notes.findIndex(note => note.id === id);
  if (noteIndex === -1) {
    return response.status(404).json({
      error: 'note not found'
    });
  }

  // Actualizar la nota existente
  const updatedNote = {
    ...notes[noteIndex],  // Mantener campos existentes como id
    content: body.content,
    important: Boolean(body.important) || false,
  };

  // Reemplazar en el array
  notes[noteIndex] = updatedNote;

  response.json(updatedNote);
});

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id);
  notes = notes.filter((note) => note.id !== id);

  response.status(204).end();
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
