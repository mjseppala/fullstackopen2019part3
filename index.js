require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
app.use(cors())
app.use(express.static('build'))
app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :requestBody'))

morgan.token('requestBody', req =>
  JSON.stringify(req.body)
)

app.get('/info', (request, response) => {
  Person.countDocuments({}).then(count => {
    const txt = `Phonebook has info for ${count} people.\n\n${new Date()}`
    response.set({
      'Content-Type': 'text/plain'
    })
    response.end(txt)
  }).catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons.map(person => person.toJSON()))
  }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))

  response.status(204).end()
})

app.post('/api/persons', (request, response, next) => {
  const person = { ...request.body }

  if (person.name === undefined) {
    return response.status(400).json({
      error: 'name missing'
    })
  }

  if (!person.number === undefined) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  const newPerson = new Person({
    name: person.name,
    number: person.number
  })

  newPerson.save().then(savedPerson => {
    response.json(savedPerson.toJSON())
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

// virheellisten pyyntöjen käsittely
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
