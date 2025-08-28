import React, { useState, useEffect, useRef } from "react";
import { FiSend } from "react-icons/fi";
import { FaRobot } from "react-icons/fa";
import { BiUser } from "react-icons/bi";
import { BsEmojiSmile } from "react-icons/bs";

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now(),
        text: "Thanks for your message! I'm an AI assistant here to help you. 😊",
        sender: "ai",
      };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      <div className="flex-1 overflow-y-auto mb-4 bg-white rounded-lg shadow-md p-4" ref={chatContainerRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}
            >
              <div className="flex items-center mb-1">
                {message.sender === "user" ? (
                  <BiUser className="mr-2" />
                ) : (
                  <FaRobot className="mr-2" />
                )}
                <span className="font-semibold">
                  {message.sender === "user" ? "You" : "AI Assistant"}
                </span>
              </div>
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center">
                <FaRobot className="mr-2" />
                <span className="font-semibold">AI Assistant</span>
              </div>
              <p>Typing...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
      </div>
      <div className="flex items-center bg-white rounded-lg shadow-md">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 p-4 rounded-l-lg focus:outline-none"
          aria-label="Type your message"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white p-4 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Send message"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;