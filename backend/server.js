// server.js — Banco de Corazones API
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
require('dotenv').config();

const {
    securityHeaders,
    decryptRequestBody,
    antiSqlInjectionGuard,
} = require('./src/middlewares/security');

const accesoRutas = require('./src/routes/authRoutes');
const asociadosRutas = require('./src/routes/usuarioRoutes');
const dispensadorRutas = require('./src/routes/cajeroRoutes');
const gerenciaRutas = require('./src/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3060;
const FALLBACK_SECRET = crypto.randomBytes(32).toString('hex');

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(securityHeaders);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(decryptRequestBody);
app.use(antiSqlInjectionGuard);

app.use(session({
    name: 'corazones.sid',
    secret: process.env.SESSION_SECRET || FALLBACK_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: 'auto',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 3,
    },
}));

app.use('/api/auth', accesoRutas);
app.use('/api/usuario', asociadosRutas);
app.use('/api/banca', asociadosRutas);
app.use('/api/cajero', dispensadorRutas);
app.use('/api/admin', gerenciaRutas);

app.use((err, req, res, next) => {
    console.error('[BancoCorazones Error]:', err.message);
    res.status(err.statusCode || 500).json({ error: 'Ocurrió un error al procesar la solicitud bancaria.' });
});

app.listen(PORT, () => {
    console.log(`[Banco de Corazones] API segura activa en puerto ${PORT}`);
});
