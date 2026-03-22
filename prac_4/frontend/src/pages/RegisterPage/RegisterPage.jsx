import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api'

export default function RegisterPage () {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: ''
  })

  const setField = key => e => {
    setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      await api.register(form)
      alert('Регистрация успешна. Теперь войдите.')
      navigate('/login')
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.error || 'Ошибка регистрации')
    }
  }

  return (
    <div className='page'>
      <main className='main'>
        <div className='container'>
          <h1 className='title'>Регистрация</h1>

          <form onSubmit={handleSubmit}>
            <label className='label'>
              Email
              <input
                className='input'
                type='email'
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
              Пароль
              <input
                className='input'
                type='password'
                value={form.password}
                onChange={setField('password')}
              />
            </label>

            <div className='modal__footer'>
              <button type='submit' className='btn btn--primary'>
                Зарегистрироваться
              </button>
            </div>

            <p>
              Уже есть аккаунт? <Link to='/login'>Войти</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}