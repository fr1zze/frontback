const express = require('express')
const { nanoid } = require('nanoid')
const cors = require('cors')

const app = express()
const port = 3000

console.log('THIS IS PRAC_4 BACKEND')

// ====== Данные (10 товаров) ======
let products = [
  {
    id: nanoid(6),
    name: 'Футбольный мяч Pro Match',
    category: 'Футбол',
    description: 'Размер 5, термосклейка панелей, для тренировок и игр',
    price: 2499,
    stock: 18
  },
  {
    id: nanoid(6),
    name: 'Бутсы Speed Runner',
    category: 'Футбол',
    description: 'Лёгкие бутсы для искусственного газона, хорошее сцепление',
    price: 5999,
    stock: 9
  },
  {
    id: nanoid(6),
    name: 'Бинты боксерские 3 м',
    category: 'Единоборства',
    description: 'Хлопок, фиксируют кисть и запястье, 2 шт в комплекте',
    price: 499,
    stock: 45
  },
  {
    id: nanoid(6),
    name: 'Перчатки боксерские 12 oz',
    category: 'Единоборства',
    description: 'Подойдут для спаррингов, плотная набивка, фиксация липучкой',
    price: 3999,
    stock: 14
  },
  {
    id: nanoid(6),
    name: 'Коврик для йоги 6 мм',
    category: 'Йога',
    description: 'Нескользящий, 183×61 см, комфортная толщина для суставов',
    price: 1299,
    stock: 30
  },
  {
    id: nanoid(6),
    name: 'Резинки для фитнеса (набор)',
    category: 'Фитнес',
    description: '5 уровней сопротивления, для тренировок дома и в зале',
    price: 799,
    stock: 60
  },
  {
    id: nanoid(6),
    name: 'Гантели разборные 20 кг',
    category: 'Силовые тренировки',
    description: 'Набор блинов + гриф, регулировка веса под упражнения',
    price: 7499,
    stock: 7
  },
  {
    id: nanoid(6),
    name: 'Скакалка скоростная',
    category: 'Кардио',
    description: 'Подшипники, регулируемая длина, для интенсивных тренировок',
    price: 699,
    stock: 35
  },
  {
    id: nanoid(6),
    name: 'Фляга спортивная 750 мл',
    category: 'Аксессуары',
    description: 'Без BPA, удобный клапан, подходит для велосипеда и зала',
    price: 599,
    stock: 80
  },
  {
    id: nanoid(6),
    name: 'Ракетка для тенниса Start',
    category: 'Теннис',
    description: 'Для начинающих, лёгкая, чехол в комплекте',
    price: 4999,
    stock: 11
  }
]

// ====== Middleware ======
app.use(express.json())

app.use(cors({
  origin: ['http://127.0.0.1:3001', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Логирование
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`)
    if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
      console.log('Body:', req.body)
    }
  })
  next()
})

// ====== Helper ======
function findProductOr404(id, res) {
  const product = products.find(p => p.id == id)
  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return null
  }
  return product
}

// ====== CRUD ======

// CREATE
app.post('/api/products', (req, res) => {
  const { name, category, description, price, stock } = req.body

  const newProduct = {
    id: nanoid(6),
    name: String(name).trim(),
    category: String(category).trim(),
    description: String(description).trim(),
    price: Number(price),
    stock: Number(stock)
  }

  products.push(newProduct)
  res.status(201).json(newProduct)
})

// READ ALL
app.get('/api/products', (req, res) => {
  res.json(products)
})

// READ ONE
app.get('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res)
  if (!product) return
  res.json(product)
})

// UPDATE
app.patch('/api/products/:id', (req, res) => {
  const product = findProductOr404(req.params.id, res)
  if (!product) return

  const { name, category, description, price, stock } = req.body

  if (
    name === undefined &&
    category === undefined &&
    description === undefined &&
    price === undefined &&
    stock === undefined
  ) {
    return res.status(400).json({ error: 'Nothing to update' })
  }

  if (name !== undefined) product.name = String(name).trim()
  if (category !== undefined) product.category = String(category).trim()
  if (description !== undefined) product.description = String(description).trim()
  if (price !== undefined) product.price = Number(price)
  if (stock !== undefined) product.stock = Number(stock)

  res.json(product)
})

// DELETE
app.delete('/api/products/:id', (req, res) => {
  const exists = products.some(p => p.id === req.params.id)
  if (!exists) {
    return res.status(404).json({ error: 'Product not found' })
  }

  products = products.filter(p => p.id !== req.params.id)
  res.status(204).send()
})

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ====== Start ======
app.listen(port, () => {
  console.log(`Сервер запущен на http://127.0.0.1:${port}`)
})