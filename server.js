const express = require('express');
const { getPrinters } = require('pdf-to-printer');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/printers', async (req, res) => {
  try {
    const printers = await getPrinters();
    // Map system printers to our app structure
    const mappedPrinters = printers.map((p, index) => ({
      id: `system-${index}`,
      name: p.name,
      location: 'System Port',
      status: 'online', // Assume online if detected by OS
      type: p.name.toLowerCase().includes('color') ? 'color' : 'bw',
      tonerLevel: 100,
      paperLevel: 100,
      jobCount: 0,
      ip: 'Local',
      model: p.name,
      totalPrints: 0,
      lastMaintenance: new Date().toISOString().split('T')[0]
    }));
    res.json(mappedPrinters);
  } catch (error) {
    console.error('Failed to fetch printers:', error);
    res.status(500).json({ error: 'Failed to fetch printers from OS' });
  }
});

app.listen(port, () => {
  console.log(`Printer Auditor Backend running at http://localhost:${port}`);
});
