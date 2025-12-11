#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wangzc830209',
  database: process.env.DB_NAME || 'bookstore',
  charset: 'utf8mb4'
};

// 创建数据库连接池
let pool;

async function getConnection() {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

// 创建MCP服务器
const server = new Server(
  {
    name: 'bookstore-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 列出可用工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_books',
        description: 'Search for books by title, author, ISBN, or any keyword. Use this tool when the user asks to find, search, or look up books. Supports fuzzy search across book titles, authors, ISBNs, and descriptions. Example: When user asks "find books about Java" or "search for 三体", use this tool with keyword="Java" or keyword="三体".',
        inputSchema: {
          type: 'object',
          properties: {
            keyword: {
              type: 'string',
              description: 'Search keyword - can be part of book title, author name, ISBN, or description. Examples: "Java", "三体", "Spring", "刘慈欣"',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return, default is 10',
              default: 10,
            },
          },
          required: ['keyword'],
        },
      },
      {
        name: 'get_book_by_id',
        description: 'Get detailed information about a specific book by its ID. Use this when the user mentions a book ID or asks for details of a specific book by ID. Returns complete book information including title, author, price, stock, description, etc.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'The unique ID of the book (e.g., 1, 2, 3)',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'get_books_by_author',
        description: 'Find all books by a specific author. Use this when the user asks for books by a particular author, like "books by 刘慈欣" or "find all books written by Bruce Eckel". Supports partial author name matching.',
        inputSchema: {
          type: 'object',
          properties: {
            author: {
              type: 'string',
              description: 'Author name (can be partial match). Examples: "刘慈欣", "Bruce Eckel", "余华"',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return, default is 20',
              default: 20,
            },
          },
          required: ['author'],
        },
      },
      {
        name: 'get_books_by_price_range',
        description: 'Find books within a specific price range. Use this when the user asks for books in a certain price range, like "books under 100 yuan" or "books between 50 and 100".',
        inputSchema: {
          type: 'object',
          properties: {
            minPrice: {
              type: 'number',
              description: 'Minimum price (e.g., 0, 50, 100)',
            },
            maxPrice: {
              type: 'number',
              description: 'Maximum price (e.g., 100, 200, 500)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return, default is 20',
              default: 20,
            },
          },
          required: ['minPrice', 'maxPrice'],
        },
      },
      {
        name: 'get_all_books',
        description: 'Get a list of all books in the database. Use this when the user asks to see all books, browse the catalog, or list all available books. Supports pagination with limit and offset parameters.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of books to return, default is 50',
              default: 50,
            },
            offset: {
              type: 'number',
              description: 'Number of records to skip for pagination, default is 0',
              default: 0,
            },
          },
        },
      },
    ],
  };
});

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const connection = await getConnection();

    switch (name) {
      case 'search_books': {
        const { keyword, limit = 10 } = args || {};
        
        // 验证keyword
        if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: '搜索关键词不能为空',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
        
        const searchPattern = `%${keyword.trim()}%`;
        const limitInt = parseInt(limit, 10) || 10;
        
        if (isNaN(limitInt) || limitInt < 1) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: 'limit参数必须是大于0的整数',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
        
        // 确保limit是Number类型，并验证
        const limitNum = Number(limitInt);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
          throw new Error(`Invalid limit value: ${limitInt}`);
        }
        
        // 使用字符串插值处理LIMIT，因为MySQL2对LIMIT参数绑定可能有兼容性问题
        const [rows] = await connection.execute(
          `SELECT id, title, author, isbn, description, cover_image, price, stock, publisher, created_at, updated_at 
           FROM books 
           WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ? OR description LIKE ?
           ORDER BY title
           LIMIT ${limitNum}`,
          [searchPattern, searchPattern, searchPattern, searchPattern]
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                count: rows.length,
                books: rows.map(book => ({
                  id: book.id,
                  title: book.title,
                  author: book.author,
                  isbn: book.isbn,
                  description: book.description,
                  coverImage: book.cover_image,
                  price: parseFloat(book.price),
                  stock: book.stock,
                  publisher: book.publisher,
                  createdAt: book.created_at,
                  updatedAt: book.updated_at,
                })),
              }, null, 2),
            },
          ],
        };
      }

      case 'get_book_by_id': {
        const { id } = args || {};
        
        if (id === undefined || id === null) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: '图书ID不能为空',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
        
        const idInt = parseInt(id, 10);
        
        if (isNaN(idInt) || idInt < 1) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: `无效的图书ID: ${id}，必须是大于0的整数`,
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
        
        // 确保id是Number类型
        const idNum = Number(idInt);
        const [rows] = await connection.execute(
          `SELECT id, title, author, isbn, description, cover_image, price, stock, publisher, created_at, updated_at 
           FROM books 
           WHERE id = ?`,
          [idNum]
        );

        if (rows.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: `未找到ID为 ${id} 的图书`,
                }, null, 2),
              },
            ],
            isError: true,
          };
        }

        const book = rows[0];
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                book: {
                  id: book.id,
                  title: book.title,
                  author: book.author,
                  isbn: book.isbn,
                  description: book.description,
                  coverImage: book.cover_image,
                  price: parseFloat(book.price),
                  stock: book.stock,
                  publisher: book.publisher,
                  createdAt: book.created_at,
                  updatedAt: book.updated_at,
                },
              }, null, 2),
            },
          ],
        };
      }

      case 'get_books_by_author': {
        const { author, limit = 20 } = args || {};
        
        // 验证author
        if (!author || typeof author !== 'string' || author.trim() === '') {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: '作者姓名不能为空',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
        
        const authorPattern = `%${author.trim()}%`;
        const limitInt = parseInt(limit, 10) || 20;
        
        if (isNaN(limitInt) || limitInt < 1) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: 'limit参数必须是大于0的整数',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
        
        // 确保limit是Number类型，并验证
        const limitNum = Number(limitInt);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
          throw new Error(`Invalid limit value: ${limitInt}`);
        }
        
        // 使用字符串插值处理LIMIT
        const [rows] = await connection.execute(
          `SELECT id, title, author, isbn, description, cover_image, price, stock, publisher, created_at, updated_at 
           FROM books 
           WHERE author LIKE ?
           ORDER BY title
           LIMIT ${limitNum}`,
          [authorPattern]
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                count: rows.length,
                author: author,
                books: rows.map(book => ({
                  id: book.id,
                  title: book.title,
                  author: book.author,
                  isbn: book.isbn,
                  description: book.description,
                  coverImage: book.cover_image,
                  price: parseFloat(book.price),
                  stock: book.stock,
                  publisher: book.publisher,
                  createdAt: book.created_at,
                  updatedAt: book.updated_at,
                })),
              }, null, 2),
            },
          ],
        };
      }

      case 'get_books_by_price_range': {
        const { minPrice, maxPrice, limit = 20 } = args || {};
        
        // 验证价格参数
        const minPriceNum = parseFloat(minPrice);
        const maxPriceNum = parseFloat(maxPrice);
        
        if (isNaN(minPriceNum) || isNaN(maxPriceNum)) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: 'minPrice和maxPrice必须是有效的数字',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
        
        if (minPriceNum < 0 || maxPriceNum < 0) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: '价格不能为负数',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
        
        if (minPriceNum > maxPriceNum) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: '最低价格不能大于最高价格',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
        
        const limitInt = parseInt(limit, 10) || 20;
        
        if (isNaN(limitInt) || limitInt < 1) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: 'limit参数必须是大于0的整数',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
        
        // 确保所有参数都是Number类型，并验证
        const limitNum = Number(limitInt);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
          throw new Error(`Invalid limit value: ${limitInt}`);
        }
        
        // 使用字符串插值处理LIMIT
        const [rows] = await connection.execute(
          `SELECT id, title, author, isbn, description, cover_image, price, stock, publisher, created_at, updated_at 
           FROM books 
           WHERE price >= ? AND price <= ?
           ORDER BY price ASC
           LIMIT ${limitNum}`,
          [Number(minPriceNum), Number(maxPriceNum)]
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                count: rows.length,
                priceRange: {
                  min: minPrice,
                  max: maxPrice,
                },
                books: rows.map(book => ({
                  id: book.id,
                  title: book.title,
                  author: book.author,
                  isbn: book.isbn,
                  description: book.description,
                  coverImage: book.cover_image,
                  price: parseFloat(book.price),
                  stock: book.stock,
                  publisher: book.publisher,
                  createdAt: book.created_at,
                  updatedAt: book.updated_at,
                })),
              }, null, 2),
            },
          ],
        };
      }

      case 'get_all_books': {
        const { limit = 50, offset = 0 } = args || {};
        
        // 确保limit和offset是整数类型
        const limitInt = parseInt(limit, 10) || 50;
        const offsetInt = parseInt(offset, 10) || 0;
        
        // 验证参数
        if (isNaN(limitInt) || limitInt < 1) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: 'limit参数必须是大于0的整数',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
        
        if (isNaN(offsetInt) || offsetInt < 0) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: 'offset参数必须是非负整数',
                }, null, 2),
              },
            ],
            isError: true,
          };
        }
        
        // 确保limit和offset都是Number类型，并验证
        const limitNum = Number(limitInt);
        const offsetNum = Number(offsetInt);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
          throw new Error(`Invalid limit value: ${limitInt}`);
        }
        if (isNaN(offsetNum) || offsetNum < 0) {
          throw new Error(`Invalid offset value: ${offsetInt}`);
        }
        
        // 使用字符串插值处理LIMIT和OFFSET，因为MySQL2对这两个参数绑定可能有兼容性问题
        const [rows] = await connection.execute(
          `SELECT id, title, author, isbn, description, cover_image, price, stock, publisher, created_at, updated_at 
           FROM books 
           ORDER BY id
           LIMIT ${limitNum} OFFSET ${offsetNum}`
        );

        const [countRows] = await connection.execute(
          `SELECT COUNT(*) as total FROM books`
        );
        const total = countRows[0].total;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                total: total,
                count: rows.length,
                offset: offset,
                books: rows.map(book => ({
                  id: book.id,
                  title: book.title,
                  author: book.author,
                  isbn: book.isbn,
                  description: book.description,
                  coverImage: book.cover_image,
                  price: parseFloat(book.price),
                  stock: book.stock,
                  publisher: book.publisher,
                  createdAt: book.created_at,
                  updatedAt: book.updated_at,
                })),
              }, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                message: `未知的工具: ${name}`,
              }, null, 2),
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            stack: error.stack,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Bookstore MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});

