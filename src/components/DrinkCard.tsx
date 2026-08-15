interface DrinkCardProps {
  name: string
  description: string
  price: number
  onOrder: () => void
}

function DrinkCard({
  name,
  description,
  price,
  onOrder,
}: DrinkCardProps) {
  return (
    <div className="drink-card">
      <div className="drink-card-content">
        <h2>{name}</h2>

        <p>{description}</p>

        <span className="drink-price">
          ${price.toFixed(2)}
        </span>
      </div>

      <button onClick={onOrder}>
        Order
      </button>
    </div>
  )
}

export default DrinkCard