import React from 'react'

export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className='card'>
      <div className='card__top'>
        <div>
          <div className='card__title'>{product.name}</div>
          <div className='card__meta'>{product.category}</div>
        </div>

        <div className='card__actions'>
          <button className='btn btn--ghost' onClick={() => onEdit(product)}>
            Редактировать
          </button>
          <button className='btn btn--danger' onClick={() => onDelete(product.id)}>
            Удалить
          </button>
        </div>
      </div>

      <div className='card__desc'>{product.description}</div>

      <div className='card__bottom'>
        <div className='badge'>Цена: {product.price} ₽</div>
        <div className='badge'>На складе: {product.stock} шт.</div>
      </div>
    </div>
  )
}