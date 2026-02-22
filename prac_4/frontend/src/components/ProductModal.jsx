import React, { useEffect, useMemo, useState } from 'react'

const emptyProduct = {
  id: '',
  name: '',
  category: '',
  description: '',
  price: '',
  stock: ''
}

export default function ProductModal ({
  open,
  mode,
  initialProduct,
  onClose,
  onSubmit
}) {
  const isEdit = mode === 'edit'

  const initialState = useMemo(() => {
    if (isEdit && initialProduct) {
      return {
        id: initialProduct.id,
        name: initialProduct.name ?? '',
        category: initialProduct.category ?? '',
        description: initialProduct.description ?? '',
        price: initialProduct.price ?? '',
        stock: initialProduct.stock ?? ''
      }
    }
    return emptyProduct
  }, [isEdit, initialProduct])

  const [form, setForm] = useState(initialState)

  useEffect(() => {
    setForm(initialState)
  }, [initialState])

  if (!open) return null

  const setField = key => e => {
    setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  const validate = () => {
    const name = String(form.name).trim()
    const category = String(form.category).trim()
    const description = String(form.description).trim()
    const price = Number(form.price)
    const stock = Number(form.stock)

    if (!name) return 'Введите название'
    if (!category) return 'Введите категорию'
    if (!description) return 'Введите описание'
    if (!Number.isFinite(price) || price < 0)
      return 'Цена должна быть числом ≥ 0'
    if (!Number.isFinite(stock) || stock < 0)
      return 'Количество на складе должно быть числом ≥ 0'

    return null
  }

  const handleSubmit = () => {
    const err = validate()
    if (err) {
      alert(err)
      return
    }

    const payload = {
      ...(isEdit ? { id: form.id } : {}),
      name: String(form.name).trim(),
      category: String(form.category).trim(),
      description: String(form.description).trim(),
      price: Number(form.price),
      stock: Number(form.stock)
    }

    onSubmit(payload)
  }

  return (
    <div className='backdrop' onClick={onClose}>
      <div className='modal' onClick={e => e.stopPropagation()}>
        <div className='modal__header'>
          <div className='modal__title'>
            {isEdit ? 'Редактировать товар' : 'Добавить товар'}
          </div>
          <button className='iconBtn' onClick={onClose}>
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
            Название
            <input
              className='input'
              value={form.name}
              onChange={setField('name')}
            />
          </label>

          <label className='label'>
            Категория
            <input
              className='input'
              value={form.category}
              onChange={setField('category')}
            />
          </label>

          <label className='label'>
            Описание
            <textarea
              className='input'
              value={form.description}
              onChange={setField('description')}
            />
          </label>

          <label className='label'>
            Цена (₽)
            <input
              className='input'
              type='number'
              value={form.price}
              onChange={setField('price')}
            />
          </label>

          <label className='label'>
            На складе (шт.)
            <input
              className='input'
              type='number'
              value={form.stock}
              onChange={setField('stock')}
            />
          </label>

          <div className='modal__footer'>
            <button type='button' className='btn' onClick={onClose}>
              Отмена
            </button>
            <button type='submit' className='btn btn--primary'>
              {isEdit ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
