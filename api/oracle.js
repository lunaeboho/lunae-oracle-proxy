export default async function handler(req, res) {
  const allowedOrigins = [
    'https://lunaeboho.com',
    'https://www.lunaeboho.com',
    'http://localhost:9292'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const GUMLOOP_API_KEY = process.env.GUMLOOP_API_KEY;
    const GUMLOOP_USER_ID = process.env.GUMLOOP_USER_ID;
    const GUMLOOP_SAVED_ITEM_ID = process.env.GUMLOOP_SAVED_ITEM_ID;
    
    if (!GUMLOOP_API_KEY || !GUMLOOP_USER_ID || !GUMLOOP_SAVED_ITEM_ID) {
      console.error('Missing environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const { name, email, birthdate, birthtime, birthplace, focus } = req.body;
    
    if (!name || !email || !birthdate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const gumloopUrl = `https://api.gumloop.com/api/v1/start_pipeline?user_id=${GUMLOOP_USER_ID}&saved_item_id=${GUMLOOP_SAVED_ITEM_ID}&api_key=${GUMLOOP_API_KEY}`;
    
    const response = await fetch(gumloopUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        birthdate,
        birthtime,
        birthplace,
        focus,
        source: 'lunae-oracle',
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gumloop API error:', errorText);
      throw new Error('Gumloop API error');
    }
    
    const data = await response.json();
    
    return res.status(200).json({ 
      success: true,
      message: 'Oracle reading sent successfully'
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Failed to send oracle reading' 
    });
  }
}
