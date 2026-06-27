const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Client-side HTML Routing fallbacks
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

app.get('/account', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'account.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/order/:orderId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'order-detail.html'));
});

app.get('/payment/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'payment-success.html'));
});

app.get('/payment/failed', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'payment-failed.html'));
});

// Fallback for SPA-like routes or any other unrecognized pages to go to 404/index
app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => {
  console.log(`Burning Pixel Web Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
});
