import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(1);
  const [carDetails, setCarDetails] = useState({
    make: '',
    model: '',
    year: ''
  });
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Show initial bot message on load
  useEffect(() => {
    setMessages([{ text: 'What is the make of your car?', sender: 'bot' }]);
  }, []);

  // Reset chatbot
  const restartChat = () => {
    setMessages([{ text: 'What is the make of your car?', sender: 'bot' }]);
    setInput('');
    setStep(1);
    setCarDetails({ make: '', model: '', year: '' });
    setIsBotTyping(false);
  };

  const handleCarDetailInput = (value) => {
    if (!value.trim()) return;

    const userMsg = { text: value, sender: 'user' };

    if (step === 1) {
      setCarDetails({ ...carDetails, make: value });
      setMessages((prev) => [
        ...prev,
        userMsg,
        { text: `What is the model of your ${value}?`, sender: 'bot' }
      ]);
      setStep(2);
    } else if (step === 2) {
      setCarDetails({ ...carDetails, model: value });
      setMessages((prev) => [
        ...prev,
        userMsg,
        { text: `What is the year of your ${carDetails.make} ${value}?`, sender: 'bot' }
      ]);
      setStep(3);
    } else if (step === 3) {
      setCarDetails({ ...carDetails, year: value });
      setMessages((prev) => [
        ...prev,
        userMsg,
        { text: 'Describe the problem with your car...', sender: 'bot' }
      ]);
      setStep(4);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsBotTyping(true);

    const prompt = `I have a ${carDetails.make} ${carDetails.model} ${carDetails.year}. ${input}`;
    console.log("Sending prompt:", prompt);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        inputs: prompt
      });

      // Check if the response is successful
      console.log('Response from backend:', response);
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      const botMessage = response.data.message;
      setMessages((prev) => [...prev, { text: botMessage, sender: 'bot' }]);
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to the server. Please check if the backend is running.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessages((prev) => [
        ...prev,
        { text: errorMessage, sender: 'bot' },
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  // Fix: Use a function to handle navigation
  const navigateToHome = () => {
    window.location.href = '/';
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={
          <div className="App">
            <header className="app-header">
              <button
                type="button"
                onClick={navigateToHome}
                className="app-title-button"
              >
                AutoMate
              </button>
            </header>
            <main className="chat-container">
              <div className="chat-box">
                {messages.map((msg, i) => (
                  <div key={`${msg.sender}-${i}`} className={`message ${msg.sender}`}>
                    <strong>{msg.sender === 'user' ? 'You' : 'AutoMate'}:</strong> {msg.text}
                  </div>
                ))}
                {isBotTyping && (
                  <div className="typing-indicator">
                    <span className="dot">.</span>
                    <span className="dot">.</span>
                    <span className="dot">.</span>
                  </div>
                )}
              </div>
              <div className="input-row">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (step < 4) {
                        handleCarDetailInput(input);
                        setInput('');
                      } else {
                        sendMessage();
                      }
                    }
                  }}
                  placeholder="Type your response here..."
                />
                <button
                  type="button"
                  onClick={() => {
                    if (step < 4) {
                      handleCarDetailInput(input);
                      setInput('');
                    } else {
                      sendMessage();
                    }
                  }}
                >
                  Send
                </button>
              </div>
            </main>
            <footer className="restart-button">
              <button type="button" onClick={restartChat}>Restart Chat</button>
            </footer>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
