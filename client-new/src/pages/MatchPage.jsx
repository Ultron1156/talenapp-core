import React, { useState } from 'react';

export default function MatchPage({ onMatch }) {
  const [language, setLanguage] = useState('');
  const [country, setCountry] = useState('');
  const [gender, setGender] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [noMatch, setNoMatch] = useState(false);

  const handleMatch = async () => {
    setIsMatching(true);
    setNoMatch(false);

    try {
      // DÜZELTME: Port 5000 -> 8081 olarak değiştirildi
      const res = await fetch('${import.meta.env.VITE_API_URL}/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, country, gender }),
      });

      const data = await res.json();

      if (data.matchFound) {
        onMatch(data.user); // eşleşen kullanıcı bilgilerini ilet
      } else {
        setNoMatch(true);
      }

    } catch (err) {
      console.error('Matching error:', err);
    }

    setIsMatching(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: '30px auto', padding: 20, border: '1px solid #ccc', borderRadius: 10 }}>
      <h2>Find a Chat Partner</h2>

      <div>
        <label>Language:</label>
        <input value={language} onChange={e => setLanguage(e.target.value)} />
      </div>

      <div>
        <label>Country:</label>
        <input value={country} onChange={e => setCountry(e.target.value)} />
      </div>

      <div>
        <label>Gender:</label>
        <select value={gender} onChange={e => setGender(e.target.value)}>
          <option value="">Any</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </div>

      <button onClick={handleMatch} disabled={isMatching} style={{ marginTop: 10 }}>
        {isMatching ? 'Matching...' : 'Start Matching'}
      </button>

      {noMatch && <p style={{ color: 'red' }}>No suitable user found. Try again later.</p>}
    </div>
  );
}