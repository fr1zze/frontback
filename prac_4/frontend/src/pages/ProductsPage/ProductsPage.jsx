import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './UsersPage.scss'
import ProductsList from '../../components/ProductsList'
import ProductModal from '../../components/ProductModal'
import { api, clearTokens, getCurrentUser } from '../../api'

export default function ProductsPage () {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editingProduct, setEditingProduct] = useState(null)
  const [currentUser, setCurrentUser] = useState(getCurrentUser())

  const canCreate = ['seller', 'admin'].includes(currentUser?.role)
  const canEdit = ['seller', 'admin'].includes(currentUser?.role)
  const canDelete = currentUser?.role === 'admin'

  useEffect(() => {
    loadMe()
    loadProducts()
  }, [])

  const loadMe = async () => {
    try {
      const me = await api.me()
      setCurrentUser(me)
      localStorage.setItem('currentUser', JSON.stringify(me))
    } catch (err) {
      console.error(err)
      clearTokens()
      navigate('/login')
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await api.getProducts()
      setProducts(data)
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.error || 'Ошибка загрузки товаров')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    if (!canCreate) return alert('Недостаточно прав')
    setModalMode('create')
    setEditingProduct(null)
    setModalOpen(true)
  }

  const openEdit = product => {
    if (!canEdit) return alert('Недостаточно прав')
    setModalMode('edit')
    setEditingProduct(product)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingProduct(null)
  }

  const handleDelete = async id => {
    if (!canDelete) return alert('Удаление доступно только администратору')
    const ok = window.confirm('Удалить товар?')
    if (!ok) return

    try {
      await api.deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.error || 'Ошибка удаления товара')
    }
  }

  const handleSubmitModal = async payload => {
    try {
      if (modalMode === 'create') {
        const newProduct = await api.createProduct(payload)
        setProducts(prev => [...prev, newProduct])
      } else {
        const updatedProduct = await api.updateProduct(payload.id, payload)
        setProducts(prev =>
          prev.map(p => (p.id === payload.id ? updatedProduct : p))
        )
      }
      closeModal()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.error || 'Ошибка сохранения товара')
    }
  }

  const handleLogout = () => {
    clearTokens()
    navigate('/login')
  }

  return (
    <div className='page'>
      <header className='header'>
        <div className='header__inner'>
          <div className='brand'>Sport Shop</div>
          <div className='header__right header__right--actions'>
            {currentUser
              ? `${currentUser.first_name} ${currentUser.last_name} (${currentUser.role})`
              : 'Загрузка...'}
            {currentUser?.role === 'admin' && (
              <Link to='/users' className='btn btn--ghost navBtn'>
                Пользователи
              </Link>
            )}
            <button className='btn btn--ghost' onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className='main'>
        <div className='container'>
          <div className='toolbar'>
            <h1 className='title'>Товары</h1>
            {canCreate && (
              <button className='btn btn--primary' onClick={openCreate}>
                + Добавить товар
              </button>
            )}
          </div>

          {loading ? (
            <div className='empty'>Загрузка...</div>
          ) : (
            <ProductsList
              products={products}
              onEdit={openEdit}
              onDelete={handleDelete}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          )}
        </div>
      </main>

      <footer className='footer'>
        <div className='footer__inner'>
          © {new Date().getFullYear()} Sport Shop
        </div>
      </footer>

      <ProductModal
        open={modalOpen}
        mode={modalMode}
        initialProduct={editingProduct}
        onClose={closeModal}
        onSubmit={handleSubmitModal}
      />
    </div>
  )
}