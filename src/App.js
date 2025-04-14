import { useState } from 'react';
import './App.css';

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

  // Reset the chatbot to the initial state
  const restartChat = () => {
    setMessages([]);
    setInput('');
    setStep(1);
    setCarDetails({ make: '', model: '', year: '' });
    setIsBotTyping(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { text: input, sender: 'user' }];
    setMessages(newMessages);
    setInput('');

    // Simulate bot typing (delay)
    setIsBotTyping(true);

    // Handle conversation flow with delay for bot typing animation
    setTimeout(() => {
      if (step === 1) {
        setCarDetails(prev => ({ ...prev, make: input }));
        setStep(2);
        setMessages(prev => [
          ...prev,
          { text: `What is the model of your ${input}?`, sender: 'bot' }
        ]);
      } else if (step === 2) {
        setCarDetails(prev => ({ ...prev, model: input }));
        setStep(3);
        setMessages(prev => [
          ...prev,
          { text: `What is the year of your ${carDetails.make} ${input}?`, sender: 'bot' }
        ]);
      } else if (step === 3) {
        setCarDetails(prev => ({ ...prev, year: input }));
        setStep(4);
        setMessages(prev => [
          ...prev,
          { text: `Got it! What seems to be the problem with your ${carDetails.year} ${carDetails.make} ${carDetails.model}?`, sender: 'bot' }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { text: `You said: "${input}". Let me check...`, sender: 'bot' }
        ]);
      }

      // Simulate bot typing finishing
      setIsBotTyping(false);
    }, 1500);  // Simulate bot thinking time (1.5 seconds)
  };

  return (
    <div className="App">
      <h1>AutoMate</h1>
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            <strong>{msg.sender === 'user' ? 'You' : 'AutoMate'}:</strong> {msg.text}
          </div>
        ))}

        {/* Typing animation */}
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
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={step === 1 ? "What is the make of your car?" :
                      step === 2 ? `What is the model of your ${carDetails.make}?` :
                      step === 3 ? `What is the year of your ${carDetails.make} ${carDetails.model}?` :
                      "Describe the problem with your car..."}
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      {/* Restart Button */}
      <div className="restart-button">
        <button onClick={restartChat}>Restart Chat</button>
      </div>
    </div>
  );
}

export default App;




