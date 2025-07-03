const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Limitar peticiones para prevenir DDoS/brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por IP
  message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde'
});

// Configurar headers de seguridad con Helmet
const helmetConfig = helmet();

// Prevenir ataques XSS
const xssClean = xss();

// Prevenir inyección NoSQL
const mongoSanitizeConfig = mongoSanitize({
  replaceWith: '_'
});

// Prevenir parameter pollution
const hppConfig = hpp();

module.exports = [
  limiter,
  helmetConfig,
  xssClean,
  mongoSanitizeConfig,
  hppConfig
];