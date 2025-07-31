// ✅ FULL CHATBOT FRONTEND WITH FLOATING LAUNCHER FEATURE
import { useEffect, useRef, useState } from "react";
import { FaArrowUp } from "react-icons/fa6";
import { ImEnlarge2 } from "react-icons/im";
import { IoMdClose } from "react-icons/io";
import iconImage from "../../images/icon.png";

import "../../App.css";
import Icon from "../../components/Chatbot-icon/icon";

const Home = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hey there! How can I help you today?" },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const formatMessage = (msg) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return msg.replace(
      urlRegex,
      (url) => `<a href="${url}" target="_blank">${url}</a>`
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { type: "user", text: input };
    const botMsg = {
      type: "bot",
      text: "I'm just a demo UI right now. Backend is not connected.",
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      {!isOpen && (
        <div className="chat-launcher" onClick={() => setIsOpen(true)}>
          <div className="small-minimize">
            <img src={iconImage} alt="Icon" className="minichat-icon" />
            <p className="launcher-text">Ask MLR</p>
          </div>
        </div>
      )}

      {isOpen && (
        <section className="chat-section">
          <div className="chat-container">
            <div className="chat-content">
              <div className="chat-header">
                <div className="header-content">
                  <div className="side1">
                    <Icon />
                    <h2 className="icon-text">Ask MLR</h2>
                  </div>
                  <div className="side2">
                    <div className="side-flex">
                      <div className="enlarge">
                        <ImEnlarge2 className="large-icon" />
                      </div>
                      <div className="close" onClick={() => setIsOpen(false)}>
                        <IoMdClose className="close-icon" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="chat-body">
                <div className="chat-body-content" ref={chatRef}>
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`message ${
                        msg.type === "bot" ? "bot-message" : "user-message"
                      }`}
                    >
                      {msg.type === "bot" && (
                        <img src={iconImage} alt="Icon" className="chat-icon" />
                      )}
                      <p
                        className="message-text"
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(msg.text),
                        }}
                      ></p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chatbot-footer">
                <div className="footer-content">
                  <form onSubmit={handleSubmit} className="chat-form">
                    <input
                      type="text"
                      placeholder="Ask MLR"
                      className="message-input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      required
                    />
                    <button type="submit">
                      <FaArrowUp />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
