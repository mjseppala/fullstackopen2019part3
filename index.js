const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :requestBody'))

morgan.token('requestBody', req =>
  JSON.stringify(req.body)
)

let persons = [
  {
    id: 1,
    name: "Jalka Pallo",
    number: "040-123456"
  },
  {
    id: 2,
    name: "Kauko Putki",
    number: "040-666666"
  },
  {
    id: 3,
    name: "Janis Petke",
    number: "040-555555"
  },
  {
    id: 4,
    name: "Joulu Pukki",
    number: "050-555555"
  }
]


app.get('/info', (req, res) => {
  const txt = `Phonebook has info for ${persons.length} people.\n\n${new Date()}`
  res.end(txt)
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const person = { ...request.body }

  if (!person.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }

  if (!person.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  if (persons.find(p => p.name.toUpperCase() === person.name.toUpperCase())) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  person.id = Math.floor(Math.random() * Math.floor(99999999))

  persons = persons.concat(person)

  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
