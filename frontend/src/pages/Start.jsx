import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import '../css/Start.css';

export default function Start() {
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const form = e.target;
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    try {
      await login(email, password);
      navigate('/select-role');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    if (!name || !email || !password) {
      setError('Name, email and password are required');
      setSubmitting(false);
      return;
    }
    try {
      await signup(name, email, password);
      navigate('/select-role');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="start-page">
      <div className="start-card">
        <h1>Art Marketplace</h1>
        <p className="sub">Welcome to ArtVerse</p>
        {error && <div className="start-error">{error}</div>}
        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div>
              <label htmlFor="login_email">Email</label>
              <input id="login_email" name="email" type="email" required />
            </div>
            <div>
              <label htmlFor="login_password">Password</label>
              <input id="login_password" name="password" type="password" required />
            </div>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Logging in…' : 'Log In'}
            </button>
            <div className="toggle-link">
              Don’t have an account?{' '}
              <button type="button" className="link-btn" onClick={() => setMode('signup')}>
                Sign up here
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div>
              <label htmlFor="signup_name">Full Name</label>
              <input id="signup_name" name="name" type="text" required />
            </div>
            <div>
              <label htmlFor="signup_email">Email</label>
              <input id="signup_email" name="email" type="email" required />
            </div>
            <div>
              <label htmlFor="signup_password">Password</label>
              <input id="signup_password" name="password" type="password" minLength={6} required />
            </div>
            <button type="submit" className="btn-alt" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Account'}
            </button>
            <div className="toggle-link">
              Already have an account?{' '}
              <button type="button" className="link-btn" onClick={() => setMode('login')}>
                Log in here
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
