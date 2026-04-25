import { useState, useEffect } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10}$/;

export function validateField(name, value) {
  switch (name) {
    case 'name':     return value.trim() ? '' : 'Name is required';
    case 'email':    return EMAIL_RE.test(value) ? '' : 'Invalid email address';
    case 'phone':    return PHONE_RE.test(value.replace(/\D/g, '')) ? '' : '10-digit phone required';
    case 'category': return value ? '' : 'Please select a category';
    default:         return '';
  }
}

export function validate(fields) {
  return Object.keys(fields).every(
    key => validateField(key, fields[key]) === ''
  );
}

const EMPTY_FIELDS = { name: '', email: '', phone: '', category: '' };

function SignupForm() {
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState('READY');
  const [signups, setSignups] = useState([]);
  const [filterCat, setFilterCat] = useState('ALL');

  useEffect(() => {
    fetch('http://localhost:3001/signups')
      .then(r => r.json())
      .then(setSignups)
      .catch(console.error);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveStatus('SAVING');
    try {
      const res = await fetch('http://localhost:3001/signups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error('Server error');
      const saved = await res.json();
      setSignups(prev => [...prev, saved]);
      setFields(EMPTY_FIELDS);
      setFieldErrors({});
      setSaveStatus('SUCCESS');
    } catch {
      setSaveStatus('ERROR');
    }
  }

  async function handleFilter(e) {
    const cat = e.target.value;
    setFilterCat(cat);
    const url = cat === 'ALL'
      ? 'http://localhost:3001/signups'
      : `http://localhost:3001/signups?category=${cat}`;
    const data = await fetch(url).then(r => r.json());
    setSignups(data);
  }

  return (
    <div>
      <h2>Sign Up</h2>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div>
          <label>Name</label>
          <input
            name="name"
            value={fields.name}
            onChange={handleChange}
            placeholder="Full Name"
          />
          {fieldErrors.name && (
            <span style={{ color: 'red', fontSize: '0.8rem' }}>
              {fieldErrors.name}
            </span>
          )}
        </div>

        {/* Email */}
        <div>
          <label>Email</label>
          <input
            name="email"
            value={fields.email}
            onChange={handleChange}
            placeholder="email@example.com"
          />
          {fieldErrors.email && (
            <span style={{ color: 'red', fontSize: '0.8rem' }}>
              {fieldErrors.email}
            </span>
          )}
        </div>

        {/* Phone */}
        <div>
          <label>Phone</label>
          <input
            name="phone"
            value={fields.phone}
            onChange={handleChange}
            placeholder="10-digit phone number"
          />
          {fieldErrors.phone && (
            <span style={{ color: 'red', fontSize: '0.8rem' }}>
              {fieldErrors.phone}
            </span>
          )}
        </div>

        {/* Category */}
        <div>
          <label>Category</label>
          <select
            name="category"
            value={fields.category}
            onChange={handleChange}
          >
            <option value="">-- Select a Category --</option>
            <option value="color">Favorite Color</option>
            <option value="nfl">NFL Team</option>
            <option value="college">College</option>
          </select>
          {fieldErrors.category && (
            <span style={{ color: 'red', fontSize: '0.8rem' }}>
              {fieldErrors.category}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={!validate(fields) || saveStatus === 'SAVING'}
        >
          {saveStatus === 'SAVING' ? 'Saving…' : 'Submit'}
        </button>
      </form>

      {saveStatus === 'SAVING'  && <p>⏳ Saving your signup...</p>}
      {saveStatus === 'SUCCESS' && <p style={{ color: 'green' }}>✅ Saved!</p>}
      {saveStatus === 'ERROR'   && <p style={{ color: 'red' }}>❌ Save failed. Try again.</p>}

      {/* Signup List */}
      <hr />
      <h3>Signups</h3>

      <div>
        <label>Filter by Category: </label>
        <select value={filterCat} onChange={handleFilter}>
          <option value="ALL">All Categories</option>
          <option value="color">Favorite Color</option>
          <option value="nfl">NFL Team</option>
          <option value="college">College</option>
        </select>
      </div>

      <ul>
        {signups.map(s => (
          <li key={s.id}>
            <strong>{s.name}</strong> — {s.email} — {s.phone} — {s.category}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SignupForm;