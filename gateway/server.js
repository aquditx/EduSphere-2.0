const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());

// Microservices
const AUTH_SERVICE = "http://localhost:5000";
const PROGRESS_SERVICE = "http://localhost:5001";

// Routes
app.use('/api/auth', createProxyMiddleware({
    target: AUTH_SERVICE,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '' }
}));

app.use('/api/progress', createProxyMiddleware({
  target: PROGRESS_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/progress': '' }
}));

app.listen(8000, () => {
    console.log("Gateway running on port 8000");
});