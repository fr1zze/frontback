import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setAuthData } from '../../api'

export default function LoginPage () {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })

  const setField = key => e => {
    setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      const data = await api.login(form)
      setAuthData(data.accessToken, data.refreshToken, data.user)
      navigate('/products')
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.error || 'Ошибка входа')
    }
  }

  return (
    <div className='page'>
      <main className='main'>
        <div className='container'>
          <h1 className='title'>Вход</h1>
          <form onSubmit={handleSubmit}>
            <label className='label'>
              Email
              <input className='input' type='email' value={form.email} onChange={setField('email')} />
            </label>

            <label className='label'>
              Пароль
              <input className='input' type='password' value={form.password} onChange={setField('password')} />
            </label>

            <div className='modal__footer'>
              <button type='submit' className='btn btn--primary'>Войти</button>
            </div>

            <p>Нет аккаунта? <Link to='/register'>Зарегистрироваться</Link></p>

            <p>
              Тестовые аккаунты:<br />
              admin@test.com / 123456<br />
              seller@test.com / 123456<br />
              user@test.com / 123456
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}