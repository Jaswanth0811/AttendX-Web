"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.setFallback = exports.isFallback = exports.query = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let pool = null;
exports.pool = pool;
let useFallback = false;
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
    try {
        exports.pool = pool = new pg_1.Pool({
            connectionString: dbUrl,
            connectionTimeoutMillis: 3000, // Fail quickly if host not reachable
        });
        // Simple test query
        pool.query('SELECT 1')
            .then(() => {
            console.log('Database: Connected to PostgreSQL successfully.');
            useFallback = false;
        })
            .catch((err) => {
            console.warn('Database: PostgreSQL connection failed. Using in-memory fallback store.');
            console.warn('Reason:', err.message);
            useFallback = true;
        });
    }
    catch (err) {
        console.warn('Database: Failed to initialize PostgreSQL pool. Using in-memory fallback store.');
        console.warn('Error:', err.message);
        useFallback = true;
    }
}
else {
    console.log('Database: No DATABASE_URL provided. Running in in-memory fallback mode.');
    useFallback = true;
}
const query = async (text, params) => {
    if (useFallback || !pool) {
        throw new Error('Database is in fallback mode. Direct queries not available.');
    }
    return pool.query(text, params);
};
exports.query = query;
const isFallback = () => useFallback;
exports.isFallback = isFallback;
const setFallback = (value) => { useFallback = value; };
exports.setFallback = setFallback;
