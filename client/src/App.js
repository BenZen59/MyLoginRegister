import './App.css';
import { useState } from 'react';
import Axios from 'axios';

function App() {
  const [usernameReg, setUsernameReg] = useState('');
  const [passwordReg, setPasswordReg] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loginStatus, setLoginStatus] = useState('');

  const register = () => {
    Axios.post('http://localhost:3001/register', {
      username: usernameReg,
      password: passwordReg,
    }).then((response) => {
      console.log(response);
    });
  };

  const login = () => {
    Axios.post('http://localhost:3001/login', {
      username: username,
      password: password,
    }).then((response) => {
      if (response.data.message) {
        setLoginStatus(response.data.message);
      } else {
        setLoginStatus(response.data[0].username);
      }
    });
  };

  return (
    <div className='App'>
      <div className='registration'>
        <h1>Registration</h1>
        <label>Username</label>
        <input
          type='text'
          onChange={(e) => {
            setUsernameReg(e.target.value);
          }}
        />
        <label>Password</label>
        <input
          type='text'
          onChange={(e) => {
            setPasswordReg(e.target.value);
          }}
        />
        <br />
        <br />
        <button class='submit' type='submit' onClick={register}>
          Register
        </button>
      </div>
      <div className='login'>
        <h1>Login</h1>
        <label>Username</label>
        <input
          type='text'
          placeholder='Username...'
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
        <label>Password</label>
        <input
          type='password'
          placeholder='Password...'
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <br />
        <br />
        <button class='submit' type='submit' onClick={login}>
          Login
        </button>
      </div>
      <h1>{loginStatus}</h1>
    </div>
  );
}

export default App;