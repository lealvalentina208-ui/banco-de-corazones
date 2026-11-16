const express = require('express');
const session = require('express-session');
require('dotenv').config();

const accesoRutas = require('./src/routes/authRoutes');
const asociadosRutas = require('./src/routes/usuarioRoutes');
const dispensadorRutas = require('./src/routes/cajeroRoutes');
const gerenciaRutas = require('./src/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3060;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    name: 'corazones.sid',
    secret: process.env.SESSION_SECRET || 'clave_secreta_banco_corazones_vsd',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 3
    }
}));

// Endpoints principales de Banco de Corazones
app.use('/api/auth', accesoRutas);
app.use('/api/usuario', asociadosRutas);
app.use('/api/banca', asociadosRutas);
app.use('/api/cajero', dispensadorRutas);
app.use('/api/admin', gerenciaRutas);

app.use((err, req, res, next) => {
    console.error('[BancoCorazones Error]:', err);
    res.status(500).json({ error: 'Error interno en el servicio de Banco de Corazones.' });
});

app.listen(PORT, () => {
    console.log(`[Banco de Corazones] API activa en puerto ${PORT} — Valentina Leal, Sergio Ramos, Dana Manrique`);
});
