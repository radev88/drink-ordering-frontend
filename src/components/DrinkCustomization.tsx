import { useState } from 'react'
import type { Drink } from '../data/drinks'
import type { Order } from '../types/order'

interface DrinkCustomizationProps {
  drink: Drink
  onBack: () => void
  onOrderCreated: (order: Order) => void
}

interface ApiOrderResponse {
  id: string
  customer_name: string
  drink_id: number
  drink_name: string
  drink_price: number
  selections: Record<string, string>
  special_instructions: string
  status: 'pending' | 'preparing' | 'ready' | 'completed'
}

function DrinkCustomization({
  drink,
  onBack,
  onOrderCreated,
}: DrinkCustomizationProps) {
  const [selections, setSelections] = useState<
    Record<string, string>
  >({})

  const [customerName, setCustomerName] = useState('')

  const [specialInstructions, setSpecialInstructions] =
    useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSelectionChange = (
    optionName: string,
    choice: string,
  ) => {
    setSelections((currentSelections) => ({
      ...currentSelections,
      [optionName]: choice,
    }))
  }

  const handleCreateOrder = async () => {
    if (!customerName.trim()) {
      alert('Please enter your name.')
      return
    }

    const missingOption = drink.options.find(
      (option) => !selections[option.name],
    )

    if (missingOption) {
      alert(
        `Please select an option for ${missingOption.name}.`,
      )
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(
        'http://localhost:8000/orders',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer_name: customerName.trim(),
            drink_id: drink.id,
            drink_name: drink.name,
            drink_price: drink.price,
            selections,
            special_instructions:
              specialInstructions.trim(),
          }),
        },
      )

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`,
        )
      }

      const apiOrder: ApiOrderResponse =
        await response.json()

      const order: Order = {
        id: apiOrder.id,
        customerName: apiOrder.customer_name,
        drink: drink,
        selections: apiOrder.selections,
        specialInstructions:
          apiOrder.special_instructions,
        status: apiOrder.status,
        createdAt: new Date().toISOString(),
      }

      onOrderCreated(order)
    } catch (error) {
      console.error('Order submission failed:', error)

      alert(
        'There was a problem submitting your order. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="customization">
      <button onClick={onBack}>
        ← Back to Menu
      </button>

      <h2>{drink.name}</h2>

      <p>{drink.description}</p>

      <h3>${drink.price.toFixed(2)}</h3>

      {drink.options.map((option) => (
        <div
          key={option.name}
          className="customization-option"
        >
          <h3>{option.name}</h3>

          {option.choices.map((choice) => (
            <label key={choice}>
              <input
                type="radio"
                name={option.name}
                value={choice}
                checked={
                  selections[option.name] === choice
                }
                onChange={() =>
                  handleSelectionChange(
                    option.name,
                    choice,
                  )
                }
              />

              {choice}
            </label>
          ))}
        </div>
      ))}

      <div className="customer-information">
        <h3>Your Information</h3>

        <label>
          Name

          <input
            type="text"
            value={customerName}
            onChange={(event) =>
              setCustomerName(event.target.value)
            }
            placeholder="Enter your name"
          />
        </label>

        <label>
          Special Instructions

          <textarea
            value={specialInstructions}
            onChange={(event) =>
              setSpecialInstructions(
                event.target.value,
              )
            }
            placeholder="Anything else the bartender should know?"
            rows={4}
          />
        </label>
      </div>

      <button
        onClick={handleCreateOrder}
        disabled={isSubmitting}
      >
        {isSubmitting
          ? 'Sending Order...'
          : 'Add to Order'}
      </button>
    </div>
  )
}

export default DrinkCustomization