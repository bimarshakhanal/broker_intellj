'use client';

import { useState } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <>
      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FaRobot className="text-xl" />
              <h3 className="font-semibold">Broker Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 rounded-full p-1 transition"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="flex flex-col space-y-3">
              {/* Bot Message */}
              <div className="flex items-start space-x-2">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <FaRobot className="text-sm" />
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm max-w-[70%]">
                  <p className="text-sm text-gray-800">
                    Hello! I'm your Broker Assistant. How can I help you today?
                  </p>
                </div>
              </div>

              {/* Example User Message */}
              <div className="flex items-start space-x-2 justify-end">
                <div className="bg-blue-500 text-white rounded-lg p-3 shadow-sm max-w-[70%]">
                  <p className="text-sm">
                    This is a placeholder message
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    // TODO: Handle send message
                    setMessage('');
                  }
                }}
              />
              <button
                onClick={() => {
                  // TODO: Handle send message
                  setMessage('');
                }}
                className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition flex items-center justify-center"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50"
      >
        {isOpen ? (
          <FaTimes className="text-2xl" />
        ) : (
          <FaRobot className="text-2xl" />
        )}
      </button>
    </>
  );
}
