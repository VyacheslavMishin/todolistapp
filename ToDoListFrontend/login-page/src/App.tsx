import './App.scss'
import googleIcon from '/icons/google-icon.svg'

import { useCallback, useEffect, useState } from 'react';

function App() {
  const [greeting, setGreeting] = useState('');

  const updateGreeting = useCallback(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 4 && currentHour < 12) {
      setGreeting('Доброе утро!');
    } else if (currentHour >= 12 && currentHour < 17) {
      setGreeting('Добрый день!');
    } else if (currentHour >= 17 && currentHour < 24) {
      setGreeting('Добрый вечер!');
    } else {
      setGreeting('Доброй ночи!');
    }
  }, []);

  useEffect(() => {
    updateGreeting();

    const intervalId = setInterval(updateGreeting, 60000);

    return () => clearInterval(intervalId);
  }, [updateGreeting]);

  const handleLoginClick = () => {
    window.location.href = '/login-google';
  };

  return (
    <div className="container">
      <h1 className="title">Real time todo list</h1>
      <h2 className="greeting">{greeting}</h2>
      <button className="login-button" onClick={handleLoginClick}>
        <img src={googleIcon} alt="Google Icon" className="icon" />
        Войти
      </button>
    </div>
  );
}

export default App
