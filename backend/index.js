require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const path = require("path");
const YAML = require("yamljs");
const swaggerUi = require("swagger-ui-express");

const PORT = process.env.PORT || 8080;
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ORIGIN, methods: ['GET','POST','PUT','DELETE','PATCH'] }
});

app.set('io', io);

app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Load OpenAPI (point to your file path)
const openapiDoc = YAML.load(path.join(__dirname, "openapi.yaml"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDoc, {
  swaggerOptions: { persistAuthorization: true }
}));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

server.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
