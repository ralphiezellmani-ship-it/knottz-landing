export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, email, dueDate } = req.body || {};
  if (!email) {
    res.status(400).json({ error: 'Missing email' });
    return;
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;
  if (!apiKey || !listId) {
    res.status(500).json({ error: 'Missing server config' });
    return;
  }

  const firstName = (name || '').split(' ')[0] || '';
  const lastName = (name || '').split(' ').slice(1).join(' ') || '';

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          DUE_DATE: dueDate || '',
        },
        listIds: [Number(listId)],
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      res.status(400).json({ error: 'Brevo error', detail: text });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}
