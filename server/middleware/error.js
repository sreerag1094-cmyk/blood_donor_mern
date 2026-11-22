export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` })
}

export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || err.statusCode || 500
  let message = err.message || 'Server error'

  if (err.name === 'ValidationError') {
    status = 400
    message = Object.values(err.errors).map((e) => e.message).join(', ')
  } else if (err.name === 'CastError') {
    status = 400
    message = 'Invalid id'
  } else if (err.code === 11000) {
    status = 409
    message = 'Duplicate value: that record already exists'
  }

  if (status === 500) console.error(err)
  res.status(status).json({ message })
}
