import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../ProductsPage/UsersPage.scss'
import { api, clearTokens } from '../../api'
import UserModal from '../../components/UserModal'

export default function UsersPage () {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await api.getUsers()
      setUsers(data)
    } catch (err) {
      console.error(err)
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        clearTokens()
        navigate('/login')
      } else {
        alert(err?.response?.data?.error || 'Ошибка загрузки пользователей')
      }
    } finally {
      setLoading(false)
    }
  }

  const openEdit = user => {
    setEditingUser(user)
    setModalOpen(true)
  }

  const closeModal = () => {
    setEditingUser(null)
    setModalOpen(false)
  }

  const handleSubmitUser = async payload => {
    try {
      const updated = await api.updateUser(payload.id, {
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        role: payload.role,
        blocked: payload.blocked
      })

      setUsers(prev => prev.map(u => (u.id === payload.id ? updated : u)))
      closeModal()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.error || 'Ошибка обновления пользователя')
    }
  }

  const handleToggleBlock = async user => {
    try {
      const updated = await api.updateUser(user.id, {
        blocked: !user.blocked
      })

      setUsers(prev => prev.map(u => (u.id === user.id ? updated : u)))
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.error || 'Ошибка изменения статуса')
    }
  }

  return (
    <div className='page'>
      <header className='header'>
        <div className='header__inner'>
          <div className='brand'>Управление пользователями</div>
          <div className='header__right header__right--actions'>
            <Link to='/products' className='btn btn--ghost navBtn'>
              К товарам
            </Link>
          </div>
        </div>
      </header>

      <main className='main'>
        <div className='container'>
          <div className='toolbar'>
            <h1 className='title'>Пользователи</h1>
          </div>

          {loading ? (
            <div className='empty'>Загрузка...</div>
          ) : (
            <div className='grid'>
              {users.map(user => (
                <div className='card' key={user.id}>
                  <div className='card__title'>
                    {user.first_name} {user.last_name}
                  </div>

                  <div className='card__desc'>{user.email}</div>

                  <div className='card__bottom'>
                    <div className='badge'>Роль: {user.role}</div>
                    <div className='badge'>
                      {user.blocked ? 'Заблокирован' : 'Активен'}
                    </div>
                  </div>

                  <div className='card__actions'>
                    <button
                      className='btn btn--ghost'
                      onClick={() => openEdit(user)}
                    >
                      Изменить
                    </button>

                    <button
                      className={user.blocked ? 'btn btn--primary' : 'btn btn--danger'}
                      onClick={() => handleToggleBlock(user)}
                    >
                      {user.blocked ? 'Разблокировать' : 'Заблокировать'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <UserModal
        open={modalOpen}
        initialUser={editingUser}
        onClose={closeModal}
        onSubmit={handleSubmitUser}
      />
    </div>
  )
}