# Banco de Corazones — Plataforma Bancaria Cooperativa y Solidaria

Proyecto académico de simulación bancaria integral desarrollado por:
- **Valentina Leal**
- **Sergio Ramos**
- **Dana Manrique**

## Módulos del Sistema

1. **Sucursal Virtual de Asociados (`/`)**:
   - Consulta de saldos y bolsillos de ahorro.
   - Envíos de dinero entre cuentas con cálculo automático del gravamen financiero (4x1000).
   - Emisión de Pin de Retiro Rápido (OTP de 6 dígitos) para dispensador.
   - Extracto detallado de movimientos débito y crédito.

2. **Dispensador de Efectivo / Cajero (`/cajero`)**:
   - Retiro rápido sin tarjeta mediante Pin OTP de 6 dígitos o ingreso con Tarjeta + PIN de 4 dígitos.
   - Consulta de saldo en pantalla y emisión de comprobante de transacción.

3. **Dirección General / Backoffice (`/admin`)**:
   - Indicadores del Fondo Cooperativo Total y estado de cuentas.
   - Apertura de cuentas para nuevos asociados.
   - Caja de consignaciones por ventanilla.
   - Activación y bloqueo preventivo de cuentas.
   - Bitácora contable de operaciones.

## Seguridad de Credenciales

Todas las contraseñas de usuarios y los pines de cajero se almacenan cifrados en la base de datos mediante **bcrypt** (`saltRounds = 10`), garantizando que ninguna clave permanezca en texto plano.
