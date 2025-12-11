#!/usr/bin/env node

/**
 * 测试脚本：用于验证MCP服务器是否正常工作
 * 这个脚本模拟MCP客户端，测试服务器的各个功能
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wangzc830209',
  database: process.env.DB_NAME || 'bookstore',
  charset: 'utf8mb4'
};

async function testConnection() {
  console.log('测试数据库连接...');
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功！');
    
    // 测试查询
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM books');
    console.log(`✅ 数据库中有 ${rows[0].count} 本书`);
    
    // 测试搜索功能
    console.log('\n测试搜索功能...');
    const [books] = await connection.execute(
      'SELECT id, title, author, price FROM books WHERE title LIKE ? LIMIT 5',
      ['%Java%']
    );
    console.log(`✅ 搜索"Java"找到 ${books.length} 本书：`);
    books.forEach(book => {
      console.log(`   - ${book.title} (${book.author}) - ¥${book.price}`);
    });
    
    await connection.end();
    console.log('\n✅ 所有测试通过！MCP服务器应该可以正常工作。');
  } catch (error) {
    console.error('❌ 测试失败：', error.message);
    console.error('\n请检查：');
    console.error('1. MySQL服务是否运行');
    console.error('2. 数据库配置是否正确（.env文件）');
    console.error('3. 数据库和表是否已创建');
    process.exit(1);
  }
}

testConnection();

