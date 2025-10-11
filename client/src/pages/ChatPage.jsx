import React, { useState, useEffect, useRef } from "react";

const predefinedMessages = [
  "Track My Order",
  "Return or Refund",
  "Payment Help",
  "Delivery Information",
  "Contact Support",
];

export default function HelpDeskPage({ userId }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hello! Welcome to our Help Desk. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [activeView, setActiveView] = useState("chat"); // chat | return | contact | orderDetails
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeView]);

  const sendBotMessage = (text) => {
    setMessages((prev) => [...prev, { sender: "bot", text }]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");
    handleBotResponse(input);
  };

  const handleBotResponse = async (query) => {
    const q = query.toLowerCase();
    switch (q) {
      case "track my order":
        await fetchUserOrders();
        break;
      case "return or refund":
        setActiveView("return");
        break;
      case "contact support":
        setActiveView("contact");
        break;
      case "payment help":
        sendBotMessage(
          "💳 Payments may take 3–5 days to reflect. For urgent issues, email payments@yourstore.com."
        );
        break;
      case "delivery information":
        sendBotMessage("🚚 Most orders are delivered within 3–5 business days.");
        break;
      default:
        sendBotMessage("Please select a quick option below 👇");
        break;
    }
  };

  const fetchUserOrders = async () => {
    try {
      const res = await fetch(`/api/orders/user/${userId}`);
      const data = await res.json();
      if (!data.length) {
        sendBotMessage("You have no recent orders 🛍️");
      } else {
        setUserOrders(data);
        sendBotMessage("Here are your recent orders. Click one to see details 👇");
        setActiveView("chat");
      }
    } catch (err) {
      sendBotMessage("⚠️ Error fetching orders. Please try again later.");
    }
  };

  const fetchProductDetails = async (productId) => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const product = await res.json();
      setSelectedOrder(product);
      setActiveView("orderDetails");
    } catch {
      sendBotMessage("Unable to load product details. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      <div className="flex flex-col w-[360px] h-[520px] bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white py-3 px-4 font-semibold text-lg flex justify-between items-center">
          <span>Help Desk</span>
        </div>

        {/* Messages Panel */}
        <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-2 rounded-xl max-w-[75%] text-sm whitespace-pre-line
                  ${msg.sender === "user" ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-200 text-gray-900 rounded-bl-none"}`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Orders List */}
          {userOrders.length > 0 &&
            userOrders.map((o) => (
              <button
                key={o._id}
                onClick={() => fetchProductDetails(o.productId)}
                className="block w-full text-left text-sm p-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
              >
                Order #{o._id.slice(-6)} – {o.productName}
              </button>
            ))}

          <div ref={chatEndRef}></div>
        </div>

        {/* Input */}
        <div className="border-t p-2 bg-gray-100 flex">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 rounded-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring focus:ring-blue-300"
          />
          <button
            onClick={handleSend}
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Send
          </button>
        </div>

        {/* Quick Reply Buttons */}
        <div className="p-2 border-t bg-gray-50 flex flex-wrap gap-2">
          {predefinedMessages.map((q, i) => (
            <button
              key={i}
              onClick={() => handleBotResponse(q)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Right Panel for Return/Contact/Order Details */}
        {activeView !== "chat" && (
          <div className="absolute top-0 right-0 w-[380px] h-[520px] p-3 bg-white shadow-xl overflow-y-auto">
            {activeView === "return" && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-blue-700">Return & Refund Policy</h2>
                <p>
                  We accept returns within 7 days of delivery for unused, unopened
                  products. Refunds processed to the original payment method within 5–7 days.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Items damaged during delivery are eligible for free replacement.</li>
                  <li>Refunds initiated after product inspection.</li>
                  <li>Contact support@yourstore.com for help.</li>
                </ul>
              </div>
            )}

            {activeView === "contact" && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-blue-700">Contact Support</h2>
                <p>Email: support@yourstore.com</p>
                <p>Phone: +91-9876543210</p>
                <p>Address: 123 Market Street, Delhi</p>
              </div>
            )}

            {activeView === "orderDetails" && selectedOrder && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-blue-700">Order Details</h2>
                <img
                  src={`${process.env.REACT_APP_BACKEND_SERVER}/${selectedOrder.pic?.[0]}`}
                  alt={selectedOrder.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <p><b>{selectedOrder.name}</b></p>
                <p>Price: ₹{selectedOrder.finalPrice}</p>
                <p>Status: {selectedOrder.status || "Processing"}</p>
                <p>Expected Delivery: {selectedOrder.expectedDelivery || "N/A"}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
