import React, { useEffect, useMemo, useState } from 'react'

const emptyUser = {
  id: '',
  email: '',
  first_name: '',
  last_name: '',
  role: 'user',
  blocked: false
}

export default function UserModal ({ open, initialUser, onClose, onSubmit }) {
  const initialState = useMemo(() => {
    if (!initialUser) return emptyUser

    return {
      id: initialUser.id ?? '',
      email: initialUser.email ?? '',
      first_name: initialUser.first_name ?? '',
      last_name: initialUser.last_name ?? '',
      role: initialUser.role ?? 'user',
      blocked: Boolean(initialUser.blocked)
    }
  }, [initialUser])

  const [form, setForm] = useState(initialState)

  useEffect(() => {
    setForm(initialState)
  }, [initialState])

  if (!open) return null

  const setField = key => e => {
    const value =
      key === 'blocked' ? e.target.checked : e.target.value

    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    if (!String(form.first_name).trim()) return alert('Введите имя')
    if (!String(form.last_name).trim()) return alert('Введите фамилию')
    if (!String(form.email).trim()) return alert('Введите email')
    if (!['user', 'seller', 'admin'].includes(form.role)) {
      return alert('Некорректная роль')
    }

    onSubmit({
      id: form.id,
      email: String(form.email).trim(),
      first_name: String(form.first_name).trim(),
      last_name: String(form.last_name).trim(),
      role: form.role,
      blocked: Boolean(form.blocked)
    })
  }

  return (
    <div className='backdrop' onClick={onClose}>
      <div className='modal' onClick={e => e.stopPropagation()}>
        <div className='modal__header'>
          <div className='modal__title'>Редактировать пользователя</div>
          <button className='iconBtn' onClick={onClose} type='button'>
            ✕
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <label className='label'>
            Email
            <input
              className='input'
              value={form.email}
              onChange={setField('email')}
            />
          </label>

          <label className='label'>
            Имя
            <input
              className='input'
              value={form.first_name}
              onChange={setField('first_name')}
            />
          </label>

          <label className='label'>
            Фамилия
            <input
              className='input'
              value={form.last_name}
              onChange={setField('last_name')}
            />
          </label>

          <label className='label'>
            Роль
            <select
              className='input'
              value={form.role}
              onChange={setField('role')}
            >
              <option value='user'>user</option>
              <option value='seller'>seller</option>
              <option value='admin'>admin</option>
            </select>
          </label>

          <label className='checkboxRow'>
            <input
              type='checkbox'
              checked={form.blocked}
              onChange={setField('blocked')}
            />
            <span>Пользователь заблокирован</span>
          </label>

          <div className='modal__footer'>
            <button type='button' className='btn' onClick={onClose}>
              Отмена
            </button>
            <button type='submit' className='btn btn--primary'>
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}