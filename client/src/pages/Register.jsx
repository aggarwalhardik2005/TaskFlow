import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Please fill in all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register(name, email, password, role);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card slide-up">
        <div className="auth-header">
          <div className="auth-logo">T</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Get started with TaskFlow today</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="register-name" type="text" className="form-input" placeholder="John Doe"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="register-email" type="email" className="form-input" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input id="register-password" type="password" className="form-input" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input id="register-confirm" type="password" className="form-input" placeholder="••••••••"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select id="register-role" className="form-select" value={role} onChange={e => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button id="register-submit" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <span className="auth-link" onClick={() => navigate('/login')}>Sign In</span>
        </div>
      </div>
    </div>
  );
}
