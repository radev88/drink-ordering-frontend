import { useEffect, useState } from 'react'
import './App.css'

import DrinkCard from './components/DrinkCard'
import DrinkCustomization from './components/DrinkCustomization'
import OrderTracking from './components/OrderTracking'

import Bartender from './pages/Bartender'

import { drinks, type Drink } from './data/drinks'

import type { Order } from './types/order'


function App() {

  const [selectedDrink, setSelectedDrink] =
    useState<Drink | null>(null)

  const [completedOrder, setCompletedOrder] =
    useState<Order | null>(null)


  const isBartenderPage =
    window.location.pathname === '/bartender'


  /*
  ==========================================
  CUSTOMER ORDER STATUS WEBSOCKET
  ==========================================
  */

  useEffect(() => {

    if (!completedOrder) {
      return
    }


    const websocket =
      new WebSocket(
        'ws://localhost:8000/ws/bartender'
      )


    websocket.onopen = () => {

      console.log(
        'Customer WebSocket connected'
      )

    }


    websocket.onmessage = (event) => {

      const message =
        JSON.parse(event.data)


      if (
        message.type !==
        'order_status_updated'
      ) {
        return
      }


      const updatedOrder =
        message.order


      if (
        updatedOrder.id !==
        completedOrder.id
      ) {
        return
      }


      setCompletedOrder(
        (currentOrder) => {

          if (!currentOrder) {
            return currentOrder
          }


          return {
            ...currentOrder,
            status:
              updatedOrder.status
          }

        }
      )

    }


    websocket.onerror = () => {

      console.error(
        'Customer WebSocket error'
      )

    }


    websocket.onclose = () => {

      console.log(
        'Customer WebSocket disconnected'
      )

    }


    return () => {

      websocket.close()

    }


  }, [completedOrder?.id])



  /*
  ==========================================
  ORDER CREATED
  ==========================================
  */

  const handleOrderCreated = (
    order: Order
  ) => {

    setCompletedOrder(order)

    setSelectedDrink(null)

  }



  /*
  ==========================================
  NEW ORDER
  ==========================================
  */

  const handleStartNewOrder = () => {

    setCompletedOrder(null)

    setSelectedDrink(null)

  }



  /*
  ==========================================
  BARTENDER ROUTE
  ==========================================
  */

  if (isBartenderPage) {

    return <Bartender />

  }



  /*
  ==========================================
  CUSTOMER TRACKING
  ==========================================
  */

  if (completedOrder) {

    return (

      <div className="app">

        <OrderTracking

          order={{

            id:
              completedOrder.id,


            customer_name:
              completedOrder.customerName,


            drink_id:
              completedOrder.drink.id,


            drink_name:
              completedOrder.drink.name,


            drink_price:
              completedOrder.drink.price,


            selections:
              completedOrder.selections,


            special_instructions:
              completedOrder.specialInstructions,


            status:
              completedOrder.status

          }}


          onNewOrder={
            handleStartNewOrder
          }

        />

      </div>

    )

  }



  /*
  ==========================================
  DRINK CUSTOMIZATION
  ==========================================
  */

  if (selectedDrink) {

    return (

      <div className="app">

        <DrinkCustomization

          drink={selectedDrink}


          onBack={() =>
            setSelectedDrink(null)
          }


          onOrderCreated={
            handleOrderCreated
          }

        />

      </div>

    )

  }



  /*
  ==========================================
  DRINK MENU
  ==========================================
  */

  return (

    <div className="app">

      <h1>
        🍹 Drink Menu
      </h1>


      <p>
        Select your drink
      </p>



      <div className="drink-list">


        {drinks.map((drink) => (

          <DrinkCard

            key={drink.id}


            name={
              drink.name
            }


            description={
              drink.description
            }


            price={
              drink.price
            }


            onOrder={() =>
              setSelectedDrink(drink)
            }

          />

        ))}


      </div>


    </div>

  )

}


export default App