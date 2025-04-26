// import oracleDB from 'oracledb';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
// import e from 'express';
// export const connectDB = async () => {
//     try{
//         const connection = await oracleDB.getConnection({
//             user: "user",
//             password: "password123",
//             connectString: "localhost:1521/orclpdb"
//         })
//     }
// }

let pool;

const connectDB = async () => {
    try {
      if(!pool){
        pool = await mysql.createPool({
          host: 'localhost',
          user: 'root',
          password: process.env.DB_PASSWORD,
          database: 'test',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        });
      }
  
      // console.log('✅ Connected to MySQL database via Pool!');
      return pool;
    } catch (err) {
      console.error('❌ MySQL Connection Error:', err);
      throw err;
    }
  };

export default connectDB;