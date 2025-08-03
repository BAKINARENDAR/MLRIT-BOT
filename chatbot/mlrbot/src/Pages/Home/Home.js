import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaArrowUp } from "react-icons/fa6";
import { ImEnlarge2 } from "react-icons/im";
import { IoMdClose } from "react-icons/io";

import "../../App.css";
import Icon from "../../images/icon.png";
const Home = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hi there! How can I assist you with information about MLRIT?" },
  ]);
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const createMarkup = (htmlString) => ({ __html: htmlString });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { type: "user", text: input };
    setMessages((prev) => [...prev, userMsg, { type: "bot", text: "...", isThinking: true }]);
    setIsLoading(true);
    setInput("");

    try {
      const res = await axios.get(`http://localhost:5000/search?q=${encodeURIComponent(input)}`);
      setMessages((prev) => [...prev.slice(0, -1), { type: "bot", text: res.data.answer }]);
    } catch (error) {
      console.error("Error fetching response:", error);
      const errorText = error.response?.data?.answer || "Oops! Something went wrong on my end.";
      setMessages((prev) => [...prev.slice(0, -1), { type: "bot", text: errorText }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="chat-launcher" onClick={() => setIsOpen(true)}>
          <img src={Icon} alt="Chat Launcher Icon" className="minichat-icon" />
        </div>
      )}

      {isOpen && (
        <section className="chat-section">
          <div className="chat-container">
            <div className="chat-header">
              <div className="header-content">
                <div className="side1">
                  <img src={Icon} alt="Header Icon" className="header-icon" />
                  <h2 className="icon-text">Ask MLR</h2>
                </div>
                <div className="side2">
                  <div className="large-icon">
                    <ImEnlarge2 />
                  </div>
                  <div className="close-icon" onClick={() => setIsOpen(false)}>
                    <IoMdClose />
                  </div>
                </div>
              </div>
            </div>

            <div className="chat-body" ref={chatBodyRef}>
              <div className="chat-body-content">
                {messages.map((msg, i) => (
                  <div key={i} className={`message ${msg.type === "bot" ? "bot-message" : "user-message"}`}>
                    {msg.type === "bot" && <img src={Icon} alt="Bot Icon" className="chat-icon" />}
                    <div className="message-text">
                      {msg.isThinking ? (
                        <div className="thinking-animation">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      ) : (
                        <div dangerouslySetInnerHTML={createMarkup(msg.text)} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chatbot-footer">
              <form onSubmit={handleSubmit} className="chat-form">
                <input
                  type="text"
                  placeholder="Ask MLR"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button type="submit" disabled={isLoading || !input.trim()}>
                  <FaArrowUp />
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
