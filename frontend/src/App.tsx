import { useEffect, useState } from 'react';

interface Message {
  id: number;
  text: string;
  created_at: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/messages/')
      .then((response) => response.json())
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error while loading data', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>App working</h1>
      <h2>Data from database</h2>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>
            <strong>{msg.text}</strong> 
            <br/>
            <small>{new Date(msg.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;