// src/config/bankConfig.js
// Configuración centralizada de la entidad bancaria (desacopla reglas específicas del núcleo)
module.exports = {
    entityName: 'Banco de Corazones',
    sessionCookieName: 'corazones.sid',
    requireAdmin2FA: false,
    accountPrefixes: {
        ahorros: '7001',
        corriente: '7002',
    },
    defaultTransferConcept: 'Envío Banco de Corazones',
    defaultConsignacionConcept: 'Consignación en Caja — Banco de Corazones',
};
