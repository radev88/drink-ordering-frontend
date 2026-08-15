import { useEffect, useState } from "react";

type Order = {
  id: string;
  customer_name: string;
  drink_id: number;
  drink_name: string;
  drink_price: number;
  selections: Record<string, string>;
  special_instructions: string;
  status: string;
};

type OrderTrackingProps = {
  order: Order;
  onNewOrder: () => void;
};


function OrderTracking({
  order,
  onNewOrder,
}: OrderTrackingProps) {

  const [currentOrder, setCurrentOrder] =
    useState<Order>(order);



  useEffect(() => {

    const websocket =
      new WebSocket(
        "ws://localhost:8000/ws/bartender"
      );


    websocket.onopen = () => {
      console.log(
        "Order tracking WebSocket connected"
      );
    };


    websocket.onmessage = (event) => {

      const message =
        JSON.parse(event.data);


      if (
        message.type ===
        "order_status_updated"
      ) {

        const updatedOrder =
          message.order;


        if (
          updatedOrder.id === currentOrder.id
        ) {

          setCurrentOrder(updatedOrder);

        }

      }

    };


    websocket.onerror = () => {

      console.error(
        "Order tracking WebSocket error"
      );

    };


    websocket.onclose = () => {

      console.log(
        "Order tracking WebSocket disconnected"
      );

    };


    return () => {

      websocket.close();

    };


  }, [currentOrder.id]);



  const renderCurrentStatus = () => {

    switch (currentOrder.status) {


      case "pending":

        return (
          <div className="current-status-box">

            <h2>
              ✅ Order Received
            </h2>

            <p>
              Your bartender has received
              your request.
            </p>

          </div>
        );



      case "preparing":

        return (
          <div className="current-status-box">

            <h2>
              🍹 Preparing Your Drink
            </h2>

            <p>
              Your bartender is making
              your drink now.
            </p>

          </div>
        );



      case "ready":

        return (
          <div className="current-status-box">

            <h2>
              🎉 Your Drink is Ready!
            </h2>

            <p>
              Come pick up your drink.
            </p>

          </div>
        );



      case "completed":

        return (
          <div className="current-status-box">

            <h2>
              🍹 Enjoy Your Drink!
            </h2>

            <p>
              Your order has been completed.
            </p>

          </div>
        );



      default:

        return null;

    }

  };



  return (

    <div className="order-tracking">


      <div className="tracking-header">

        <h1>
          Order Status
        </h1>


        <p>
          Order #
          {currentOrder.id.slice(0, 6)}
        </p>

      </div>




      <div className="tracking-drink">

        <h2>
          {currentOrder.drink_name}
        </h2>


        <p>
          For {currentOrder.customer_name}
        </p>


        <strong>
          $
          {currentOrder.drink_price.toFixed(2)}
        </strong>

      </div>





      <div className="current-status">

        {renderCurrentStatus()}

      </div>





      <div className="tracking-details">


        <h3>
          Your Selections
        </h3>



        {Object.entries(
          currentOrder.selections
        ).map(([key, value]) => (

          <div
            className="tracking-selection"
            key={key}
          >

            <span>
              {key}
            </span>


            <strong>
              {value}
            </strong>


          </div>

        ))}




        {currentOrder.special_instructions && (

          <div className="tracking-instructions">


            <strong>
              Special Instructions
            </strong>


            <p>
              {currentOrder.special_instructions}
            </p>


          </div>

        )}


      </div>





      {currentOrder.status ===
        "completed" && (

        <button
          className="new-order-button"
          onClick={onNewOrder}
        >

          Order Another Drink

        </button>

      )}



    </div>

  );

}


export default OrderTracking;