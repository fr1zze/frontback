const express = require('express')
const { nanoid } = require('nanoid')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const app = express()
const port = 3000

const JWT_SECRET = 'super_secret_access_key'
const ACCESS_EXPIRES_IN = '15m'
const REFRESH_SECRET = 'super_secret_refresh_key'
const REFRESH_EXPIRES_IN = '7d'

const ROLES = {
  USER: 'user',
  SELLER: 'seller',
  ADMIN: 'admin'
}

console.log('THIS IS PRAC_4 BACKEND')

// ===== Swagger config =====
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Sport Shop API',
    version: '1.0.0',
    description:
      'CRUD API для товаров спортивного интернет-магазина (Практики 5-11)'
  },
  servers: [{ url: 'http://127.0.0.1:3000' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
}

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./app.js']
}

const swaggerSpec = swaggerJSDoc(swaggerOptions)

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           example: p1a2b3
 *         name:
 *           type: string
 *           example: Футбольный мяч
 *         category:
 *           type: string
 *           example: Футбол
 *         description:
 *           type: string
 *           example: Размер 5, термосклейка панелей, для тренировок и игр
 *         price:
 *           type: number
 *           example: 2499
 *         stock:
 *           type: number
 *           example: 18
 *         image:
 *           type: string
 *           example: /images/ball.jpg
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: u1a2b3
 *         email:
 *           type: string
 *           example: user@test.com
 *         first_name:
 *           type: string
 *           example: Ivan
 *         last_name:
 *           type: string
 *           example: Ivanov
 *         role:
 *           type: string
 *           enum: [user, seller, admin]
 *         blocked:
 *           type: boolean
 *           example: false
 *
 *     RegisterInput:
 *       type: object
 *       required:
 *         - email
 *         - first_name
 *         - last_name
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: newuser@test.com
 *         first_name:
 *           type: string
 *           example: Ivan
 *         last_name:
 *           type: string
 *           example: Ivanov
 *         password:
 *           type: string
 *           example: 123456
 *
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: admin@test.com
 *         password:
 *           type: string
 *           example: 123456
 *
 *     RefreshInput:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *
 *     UpdateUserInput:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: user@test.com
 *         first_name:
 *           type: string
 *           example: Ivan
 *         last_name:
 *           type: string
 *           example: Ivanov
 *         role:
 *           type: string
 *           enum: [user, seller, admin]
 *         blocked:
 *           type: boolean
 *           example: false
 */

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Управление товарами
 *   - name: Auth
 *     description: Регистрация, логин, профиль и refresh token
 *   - name: Users
 *     description: Управление пользователями (только admin)
 */

// ====== Данные ======
let products = [
  {
    id: nanoid(6),
    name: 'Футбольный мяч',
    category: 'Футбол',
    description: 'Размер 5, термосклейка панелей, для тренировок и игр',
    price: 2499,
    stock: 18,
    image: '/images/ball.jpg'
  },
  {
    id: nanoid(6),
    name: 'Бутсы',
    category: 'Футбол',
    description: 'Лёгкие бутсы для искусственного газона, хорошее сцепление',
    price: 5999,
    stock: 9,
    image: '/images/buts.jpg'
  },
  {
    id: nanoid(6),
    name: 'Бинты боксерские',
    category: 'Единоборства',
    description: 'Хлопок, фиксируют кисть и запястье, 2 шт в комплекте',
    price: 499,
    stock: 45,
    image: '/images/binti.jpg'
  },
  {
    id: nanoid(6),
    name: 'Перчатки боксерские',
    category: 'Единоборства',
    description: 'Подойдут для спаррингов, плотная набивка, фиксация липучкой',
    price: 3999,
    stock: 14,
    image: '/images/perchatki.jpg'
  },
  {
    id: nanoid(6),
    name: 'Коврик для йоги',
    category: 'Йога',
    description: 'Нескользящий, 183×61 см, комфортная толщина для суставов',
    price: 1299,
    stock: 30,
    image: '/images/kovrik.jpg'
  },
  {
    id: nanoid(6),
    name: 'Резинки для фитнеса (набор)',
    category: 'Фитнес',
    description: '5 уровней сопротивления, для тренировок дома и в зале',
    price: 799,
    stock: 60,
    image: '/images/rezinki.jpg'
  },
  {
    id: nanoid(6),
    name: 'Гантели разборные',
    category: 'Силовые тренировки',
    description: 'Набор блинов + гриф, регулировка веса под упражнения',
    price: 7499,
    stock: 7,
    image: '/images/ganteli.jpg'
  },
  {
    id: nanoid(6),
    name: 'Скакалка',
    category: 'Кардио',
    description: 'Подшипники, регулируемая длина, для интенсивных тренировок',
    price: 699,
    stock: 35,
    image: '/images/skak.jpg'
  },
  {
    id: nanoid(6),
    name: 'Фляга спортивная 750 мл',
    category: 'Аксессуары',
    description: 'Без BPA, удобный клапан, подходит для велосипеда и зала',
    price: 599,
    stock: 80,
    image: '/images/bottle.jpg'
  },
  {
    id: nanoid(6),
    name: 'Ракетка для тенниса',
    category: 'Теннис',
    description: 'Для начинающих, лёгкая, чехол в комплекте',
    price: 4999,
    stock: 11,
    image: '/images/raketka.jpg'
  }
]

let users = [
  {
    id: nanoid(6),
    email: 'admin@test.com',
    first_name: 'Admin',
    last_name: 'Root',
    role: ROLES.ADMIN,
    blocked: false,
    passwordHash: bcrypt.hashSync('123456', 10)
  },
  {
    id: nanoid(6),
    email: 'seller@test.com',
    first_name: 'Seller',
    last_name: 'Shop',
    role: ROLES.SELLER,
    blocked: false,
    passwordHash: bcrypt.hashSync('123456', 10)
  },
  {
    id: nanoid(6),
    email: 'user@test.com',
    first_name: 'User',
    last_name: 'Client',
    role: ROLES.USER,
    blocked: false,
    passwordHash: bcrypt.hashSync('123456', 10)
  }
]

let refreshTokens = []

// ====== Middleware ======
app.use(express.json())

app.use(
  cors({
    origin: ['http://127.0.0.1:3001', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get('/__check', (req, res) => {
  res.send('OK: swagger build is running')
})

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(
      `[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`
    )
    if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
      console.log('Body:', req.body)
    }
  })
  next()
})

// ====== Helpers ======
function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    blocked: user.blocked
  }
}

function findProductOr404(id, res) {
  const product = products.find(p => p.id == id)
  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return null
  }
  return product
}

function findUserByEmail(email) {
  return users.find(
    u => u.email.toLowerCase() === String(email).trim().toLowerCase()
  )
}

function findUserByIdOr404(id, res) {
  const user = users.find(u => u.id === id)
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return null
  }
  return user
}

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  )
}

function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  )
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      error: 'Missing or invalid Authorization header'
    })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = users.find(u => u.id === payload.sub)

    if (!user || user.blocked) {
      return res.status(401).json({ error: 'User not found or blocked' })
    }

    req.user = {
      sub: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    }
    next()
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid or expired token'
    })
  }
}

function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' })
    }
    next()
  }
}

// ====== AUTH ======

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Регистрация пользователя (guest)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Пользователь зарегистрирован
 *       400:
 *         description: Некорректные данные
 *       409:
 *         description: Email уже существует
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, first_name, last_name, password } = req.body

    if (!email || !first_name || !last_name || !password) {
      return res.status(400).json({
        error: 'email, first_name, last_name and password are required'
      })
    }

    if (findUserByEmail(email)) {
      return res.status(409).json({
        error: 'User with this email already exists'
      })
    }

    const passwordHash = await bcrypt.hash(String(password), 10)

    const newUser = {
      id: nanoid(6),
      email: String(email).trim(),
      first_name: String(first_name).trim(),
      last_name: String(last_name).trim(),
      role: ROLES.USER,
      blocked: false,
      passwordHash
    }

    users.push(newUser)
    res.status(201).json(sanitizeUser(newUser))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Вход пользователя (guest)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Успешный вход
 *       400:
 *         description: Email и пароль обязательны
 *       401:
 *         description: Неверный email или пароль
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'email and password are required'
      })
    }

    const user = findUserByEmail(email)
    if (!user || user.blocked) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash)
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const accessToken = signAccessToken(user)
    const refreshToken = signRefreshToken(user)

    refreshTokens.push({
      token: refreshToken,
      userId: user.id
    })

    res.json({
      accessToken,
      refreshToken,
      user: sanitizeUser(user)
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Login failed' })
  }
})

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Обновить access token по refresh token (guest)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshInput'
 *     responses:
 *       200:
 *         description: Новая пара токенов
 *       401:
 *         description: Refresh token не передан
 *       403:
 *         description: Refresh token недействителен
 */
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token is required' })
  }

  const stored = refreshTokens.find(rt => rt.token === refreshToken)
  if (!stored) {
    return res.status(403).json({ error: 'Refresh token not recognized' })
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET)
    const user = users.find(u => u.id === payload.sub)

    if (!user || user.blocked) {
      return res.status(401).json({ error: 'User not found or blocked' })
    }

    refreshTokens = refreshTokens.filter(rt => rt.token !== refreshToken)

    const newAccessToken = signAccessToken(user)
    const newRefreshToken = signRefreshToken(user)

    refreshTokens.push({
      token: newRefreshToken,
      userId: user.id
    })

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: sanitizeUser(user)
    })
  } catch (err) {
    refreshTokens = refreshTokens.filter(rt => rt.token !== refreshToken)
    return res.status(403).json({ error: 'Invalid or expired refresh token' })
  }
})

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Получить текущего пользователя (user/seller/admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Текущий пользователь
 *       401:
 *         description: Нет токена или токен недействителен
 */
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.sub)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json(sanitizeUser(user))
})

// ====== USERS (admin only) ======

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Получить список пользователей (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *       401:
 *         description: Нет токена
 *       403:
 *         description: Нет прав
 */
app.get('/api/users', authMiddleware, roleMiddleware([ROLES.ADMIN]), (req, res) => {
  res.json(users.map(sanitizeUser))
})

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Получить пользователя по id (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Пользователь найден
 *       401:
 *         description: Нет токена
 *       403:
 *         description: Нет прав
 *       404:
 *         description: Пользователь не найден
 */
app.get('/api/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), (req, res) => {
  const user = findUserByIdOr404(req.params.id, res)
  if (!user) return
  res.json(sanitizeUser(user))
})

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Обновить пользователя (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserInput'
 *     responses:
 *       200:
 *         description: Пользователь обновлён
 *       401:
 *         description: Нет токена
 *       403:
 *         description: Нет прав
 *       404:
 *         description: Пользователь не найден
 */
app.put('/api/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), (req, res) => {
  const user = findUserByIdOr404(req.params.id, res)
  if (!user) return

  const { email, first_name, last_name, role, blocked } = req.body

  if (email !== undefined) user.email = String(email).trim()
  if (first_name !== undefined) user.first_name = String(first_name).trim()
  if (last_name !== undefined) user.last_name = String(last_name).trim()
  if (role !== undefined && Object.values(ROLES).includes(role)) user.role = role
  if (blocked !== undefined) user.blocked = Boolean(blocked)

  res.json(sanitizeUser(user))
})

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Заблокировать пользователя (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Пользователь заблокирован
 *       401:
 *         description: Нет токена
 *       403:
 *         description: Нет прав
 *       404:
 *         description: Пользователь не найден
 */
app.delete('/api/users/:id', authMiddleware, roleMiddleware([ROLES.ADMIN]), (req, res) => {
  const user = findUserByIdOr404(req.params.id, res)
  if (!user) return

  user.blocked = true
  refreshTokens = refreshTokens.filter(rt => rt.userId !== user.id)

  res.json({ message: 'User blocked', user: sanitizeUser(user) })
})

// ====== PRODUCTS ======

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Создать новый товар (seller/admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Товар создан
 *       401:
 *         description: Нет токена
 *       403:
 *         description: Нет прав
 */
app.post(
  '/api/products',
  authMiddleware,
  roleMiddleware([ROLES.SELLER, ROLES.ADMIN]),
  (req, res) => {
    const { name, category, description, price, stock, image } = req.body

    const newProduct = {
      id: nanoid(6),
      name: String(name).trim(),
      category: String(category).trim(),
      description: String(description).trim(),
      price: Number(price),
      stock: Number(stock),
      image: String(image || '').trim()
    }

    products.push(newProduct)
    res.status(201).json(newProduct)
  }
)

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Получить список товаров (user/seller/admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список товаров
 *       401:
 *         description: Нет токена
 *       403:
 *         description: Нет прав
 */
app.get(
  '/api/products',
  authMiddleware,
  roleMiddleware([ROLES.USER, ROLES.SELLER, ROLES.ADMIN]),
  (req, res) => {
    res.json(products)
  }
)

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Получить товар по id (user/seller/admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар найден
 *       401:
 *         description: Нет токена
 *       403:
 *         description: Нет прав
 *       404:
 *         description: Товар не найден
 */
app.get(
  '/api/products/:id',
  authMiddleware,
  roleMiddleware([ROLES.USER, ROLES.SELLER, ROLES.ADMIN]),
  (req, res) => {
    const product = findProductOr404(req.params.id, res)
    if (!product) return
    res.json(product)
  }
)

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Полностью обновить товар (seller/admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Товар обновлён
 *       401:
 *         description: Нет токена
 *       403:
 *         description: Нет прав
 *       404:
 *         description: Товар не найден
 */
app.put(
  '/api/products/:id',
  authMiddleware,
  roleMiddleware([ROLES.SELLER, ROLES.ADMIN]),
  (req, res) => {
    const product = findProductOr404(req.params.id, res)
    if (!product) return

    const { name, category, description, price, stock, image } = req.body

    product.name = String(name).trim()
    product.category = String(category).trim()
    product.description = String(description).trim()
    product.price = Number(price)
    product.stock = Number(stock)
    product.image = String(image || '').trim()

    res.json(product)
  }
)

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Удалить товар (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Товар удалён
 *       401:
 *         description: Нет токена
 *       403:
 *         description: Нет прав
 *       404:
 *         description: Товар не найден
 */
app.delete(
  '/api/products/:id',
  authMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  (req, res) => {
    const exists = products.some(p => p.id === req.params.id)
    if (!exists) {
      return res.status(404).json({ error: 'Product not found' })
    }

    products = products.filter(p => p.id !== req.params.id)
    res.status(204).send()
  }
)

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(port, () => {
  console.log(`Сервер запущен на http://127.0.0.1:${port}`)
  console.log(`Swagger: http://127.0.0.1:${port}/api-docs`)
})