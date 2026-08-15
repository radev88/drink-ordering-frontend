import {
  useEffect,
  useRef,
  useState,
} from "react";

import "./Bartender.css";

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

function Bartender() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newOrderIds, setNewOrderIds] =
    useState<string[]>([]);

  const [soundEnabled, setSoundEnabled] =
    useState(false);

  const notificationSound =
    useRef<HTMLAudioElement | null>(null);

  /*
   * =========================================
   * INITIALIZE SOUND
   * =========================================
   */

  useEffect(() => {
    notificationSound.current = new Audio(
      "/sounds/new-order.mp3"
    );

    notificationSound.current.volume = 0.7;
    notificationSound.current.preload = "auto";
  }, []);

  /*
   * =========================================
   * ENABLE SOUND
   * =========================================
   */

  const enableSound = async () => {
    if (!notificationSound.current) {
      return;
    }

    try {
      notificationSound.current.currentTime = 0;

      await notificationSound.current.play();

      notificationSound.current.pause();
      notificationSound.current.currentTime = 0;

      setSoundEnabled(true);

      console.log(
        "Notification sound enabled"
      );
    } catch (error) {
      console.error(
        "Unable to enable notification sound:",
        error
      );
    }
  };

  /*
   * =========================================
   * PLAY NOTIFICATION
   * =========================================
   */

  const playNotificationSound = () => {
    if (
      !soundEnabled ||
      !notificationSound.current
    ) {
      return;
    }

    notificationSound.current.currentTime = 0;

    notificationSound.current
      .play()
      .catch((error) => {
        console.error(
          "Notification sound failed:",
          error
        );
      });
  };

  /*
   * =========================================
   * LOAD EXISTING ORDERS
   * =========================================
   */

  useEffect(() => {
    fetch(
      "http://localhost:8000/bartender/orders"
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to fetch orders"
          );
        }

        return response.json();
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load orders.");
        setLoading(false);
      });
  }, []);

  /*
   * =========================================
   * WEBSOCKET
   * =========================================
   */

  useEffect(() => {
    const websocket = new WebSocket(
      "ws://localhost:8000/ws/bartender"
    );

    websocket.onopen = () => {
      console.log(
        "Bartender WebSocket connected"
      );
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      /*
       * NEW ORDER
       */

      if (!message.type) {
        const newOrder: Order = message;

        // Play bell
        playNotificationSound();

        // Add order
        setOrders((currentOrders) => {
          const alreadyExists =
            currentOrders.some(
              (order) =>
                order.id === newOrder.id
            );

          if (alreadyExists) {
            return currentOrders;
          }

          return [
            newOrder,
            ...currentOrders,
          ];
        });

        // Highlight new order
        setNewOrderIds((currentIds) => [
          ...currentIds,
          newOrder.id,
        ]);

        // Remove highlight after 10 seconds
        setTimeout(() => {
          setNewOrderIds((currentIds) =>
            currentIds.filter(
              (id) => id !== newOrder.id
            )
          );
        }, 10000);

        return;
      }

      /*
       * ORDER STATUS UPDATE
       */

      if (
        message.type ===
        "order_status_updated"
      ) {
        const updatedOrder: Order =
          message.order;

        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === updatedOrder.id
              ? updatedOrder
              : order
          )
        );

        setNewOrderIds((currentIds) =>
          currentIds.filter(
            (id) =>
              id !== updatedOrder.id
          )
        );
      }
    };

    websocket.onerror = () => {
      console.error(
        "Bartender WebSocket error"
      );
    };

    websocket.onclose = () => {
      console.log(
        "Bartender WebSocket disconnected"
      );
    };

    return () => {
      websocket.close();
    };
  }, [soundEnabled]);

  /*
   * =========================================
   * UPDATE ORDER STATUS
   * =========================================
   */

  const updateOrderStatus = async (
    orderId: string,
    status: string
  ) => {
    try {
      const response = await fetch(
        `http://localhost:8000/bartender/orders/${orderId}/status?status=${status}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update order"
        );
      }

      const updatedOrder =
        await response.json();

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id
            ? updatedOrder
            : order
        )
      );

      setNewOrderIds((currentIds) =>
        currentIds.filter(
          (id) =>
            id !== updatedOrder.id
        )
      );
    } catch (error) {
      console.error(error);

      alert(
        "Unable to update order status."
      );
    }
  };

  /*
   * =========================================
   * ORDER COUNTS
   * =========================================
   */

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "pending"
  );

  const preparingOrders = orders.filter(
    (order) =>
      order.status === "preparing"
  );

  const readyOrders = orders.filter(
    (order) =>
      order.status === "ready"
  );

  const completedOrders = orders.filter(
    (order) =>
      order.status === "completed"
  );

  /*
   * =========================================
   * LOADING
   * =========================================
   */

  if (loading) {
    return (
      <div className="bartender-page">
        <h1>Bartender Orders</h1>

        <p>
          Loading orders...
        </p>
      </div>
    );
  }

  /*
   * =========================================
   * ERROR
   * =========================================
   */

  if (error) {
    return (
      <div className="bartender-page">
        <h1>Bartender Orders</h1>

        <p>
          {error}
        </p>
      </div>
    );
  }

  /*
   * =========================================
   * DASHBOARD
   * =========================================
   */

  return (
    <div className="bartender-page">

      <header className="bartender-header">

        <div>
          <h1>
            Bartender Orders
          </h1>

          <p>
            Incoming drink requests
          </p>
        </div>

        <div className="order-count">
          {orders.length} Orders
        </div>

      </header>


      {/* =====================================
          SOUND CONTROL
      ===================================== */}

      <div className="sound-control">

        {soundEnabled ? (

          <div className="sound-enabled">
            🔔 Notifications enabled
          </div>

        ) : (

          <button
            className="enable-sound-button"
            onClick={enableSound}
          >
            🔔 Enable Order Notifications
          </button>

        )}

      </div>


      {/* =====================================
          SUMMARY
      ===================================== */}

      <div className="order-summary">

        <div className="summary-card pending-summary">

          <span>
            Pending
          </span>

          <strong>
            {pendingOrders.length}
          </strong>

        </div>


        <div className="summary-card preparing-summary">

          <span>
            Preparing
          </span>

          <strong>
            {preparingOrders.length}
          </strong>

        </div>


        <div className="summary-card ready-summary">

          <span>
            Ready
          </span>

          <strong>
            {readyOrders.length}
          </strong>

        </div>


        <div className="summary-card completed-summary">

          <span>
            Completed
          </span>

          <strong>
            {completedOrders.length}
          </strong>

        </div>

      </div>


      {/* =====================================
          ORDERS
      ===================================== */}

      {orders.length === 0 ? (

        <div className="empty-orders">

          <h2>
            No orders yet
          </h2>

          <p>
            New drink requests will
            appear here.
          </p>

        </div>

      ) : (

        <div className="orders-grid">

          {orders.map((order) => {

            const isNew =
              newOrderIds.includes(
                order.id
              );

            return (

              <div
                className={`order-card ${
                  isNew
                    ? "new-order"
                    : ""
                }`}
                key={order.id}
              >

                {isNew && (

                  <div className="new-order-badge">

                    🔔 NEW ORDER

                  </div>

                )}


                <div className="order-card-header">

                  <div>

                    <h2>
                      {order.drink_name}
                    </h2>

                    <p>
                      {order.customer_name}
                    </p>

                  </div>

                  <span
                    className={`status ${order.status}`}
                  >
                    {order.status}
                  </span>

                </div>


                <div className="order-details">

                  {Object.entries(
                    order.selections
                  ).map(
                    ([key, value]) => (

                      <div
                        className="selection"
                        key={key}
                      >

                        <span>
                          {key}
                        </span>

                        <strong>
                          {value}
                        </strong>

                      </div>

                    )
                  )}

                </div>


                {order.special_instructions && (

                  <div className="special-instructions">

                    <strong>
                      Special Instructions
                    </strong>

                    <p>
                      {
                        order.special_instructions
                      }
                    </p>

                  </div>

                )}


                <div className="order-footer">

                  <span>
                    $
                    {order.drink_price.toFixed(
                      2
                    )}
                  </span>

                  <span>
                    Order #
                    {order.id.slice(
                      0,
                      6
                    )}
                  </span>

                </div>


                <div className="order-actions">

                  {order.status ===
                    "pending" && (

                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order.id,
                          "preparing"
                        )
                      }
                    >
                      Start Preparing
                    </button>

                  )}


                  {order.status ===
                    "preparing" && (

                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order.id,
                          "ready"
                        )
                      }
                    >
                      Mark Ready
                    </button>

                  )}


                  {order.status ===
                    "ready" && (

                    <button
                      onClick={() =>
                        updateOrderStatus(
                          order.id,
                          "completed"
                        )
                      }
                    >
                      Complete Order
                    </button>

                  )}


                  {order.status ===
                    "completed" && (

                    <div className="completed-label">
                      Order Completed
                    </div>

                  )}

                </div>

              </div>

            );
          })}

        </div>

      )}

    </div>
  );
}

export default Bartender;