#!/usr/bin/env node

/**
 * 测试MCP工具调用
 * 模拟Cherry Studio调用工具的过程
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 测试MCP工具调用\n');
console.log('='.repeat(60));

const serverPath = join(__dirname, 'index.js');

// 启动MCP服务器
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: __dirname
});

let serverOutput = '';
let serverError = '';

server.stdout.on('data', (data) => {
  serverOutput += data.toString();
});

server.stderr.on('data', (data) => {
  const text = data.toString();
  serverError += text;
  if (text.includes('running')) {
    console.log('✅ MCP服务器已启动\n');
  }
});

server.on('error', (error) => {
  console.error('❌ 启动服务器失败:', error.message);
  process.exit(1);
});

// 等待服务器启动
setTimeout(() => {
  testToolCalls();
}, 1000);

function sendRequest(request) {
  return new Promise((resolve, reject) => {
    let responseData = '';
    let errorData = '';
    
    const timeout = setTimeout(() => {
      reject(new Error('请求超时'));
    }, 5000);
    
    const dataHandler = (data) => {
      const text = data.toString();
      responseData += text;
      // 尝试解析JSON响应
      const lines = text.split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.id === request.id) {
            clearTimeout(timeout);
            resolve(json);
            return;
          }
        } catch (e) {
          // 不是JSON，继续
        }
      }
    };
    
    server.stdout.on('data', dataHandler);
    server.stderr.on('data', (data) => {
      errorData += data.toString();
    });
    
    // 发送请求
    server.stdin.write(JSON.stringify(request) + '\n');
    
    // 如果5秒内没有响应，清理监听器
    setTimeout(() => {
      server.stdout.removeListener('data', dataHandler);
      if (responseData) {
        clearTimeout(timeout);
        resolve({ raw: responseData });
      }
    }, 5000);
  });
}

async function testToolCalls() {
  try {
    // 测试1: 初始化
    console.log('[测试1] 初始化MCP连接...');
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    };
    
    try {
      const initResponse = await sendRequest(initRequest);
      console.log('✅ 初始化成功\n');
    } catch (error) {
      console.log('⚠️  初始化响应:', error.message);
    }
    
    // 测试2: 列出工具
    console.log('[测试2] 列出可用工具...');
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list'
    };
    
    try {
      const toolsResponse = await sendRequest(listToolsRequest);
      if (toolsResponse.result && toolsResponse.result.tools) {
        console.log(`✅ 找到 ${toolsResponse.result.tools.length} 个工具:`);
        toolsResponse.result.tools.forEach(tool => {
          console.log(`   - ${tool.name}: ${tool.description.substring(0, 50)}...`);
        });
        console.log('');
      } else {
        console.log('⚠️  工具列表响应格式异常');
        console.log('   响应:', JSON.stringify(toolsResponse, null, 2));
      }
    } catch (error) {
      console.log('❌ 获取工具列表失败:', error.message);
    }
    
    // 测试3: 调用search_books工具
    console.log('[测试3] 测试 search_books 工具...');
    const searchRequest = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'search_books',
        arguments: {
          keyword: '三体',
          limit: 5
        }
      }
    };
    
    try {
      const searchResponse = await sendRequest(searchRequest);
      if (searchResponse.result) {
        console.log('✅ 工具调用成功');
        if (searchResponse.result.content && searchResponse.result.content[0]) {
          const content = searchResponse.result.content[0].text;
          try {
            const data = JSON.parse(content);
            if (data.success && data.books) {
              console.log(`   找到 ${data.count} 本书:`);
              data.books.forEach(book => {
                console.log(`   - ${book.title} (${book.author}) - ¥${book.price}`);
              });
            } else {
              console.log('   ⚠️  返回数据格式异常');
              console.log('   数据:', content.substring(0, 200));
            }
          } catch (e) {
            console.log('   ⚠️  无法解析返回内容');
            console.log('   内容:', content.substring(0, 200));
          }
        } else {
          console.log('   ⚠️  响应中没有内容');
          console.log('   响应:', JSON.stringify(searchResponse, null, 2));
        }
      } else if (searchResponse.error) {
        console.log('❌ 工具调用失败');
        console.log('   错误:', searchResponse.error.message);
        console.log('   详情:', JSON.stringify(searchResponse.error, null, 2));
      } else {
        console.log('⚠️  响应格式异常');
        console.log('   响应:', JSON.stringify(searchResponse, null, 2));
      }
    } catch (error) {
      console.log('❌ 工具调用异常:', error.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📋 测试总结:');
    console.log('如果工具调用成功，说明MCP服务器工作正常');
    console.log('如果失败，请检查:');
    console.log('1. 数据库连接是否正常 (运行 npm test)');
    console.log('2. 数据库是否有数据');
    console.log('3. 查看上面的错误信息');
    
    server.kill();
    process.exit(0);
    
  } catch (error) {
    console.error('测试过程出错:', error);
    server.kill();
    process.exit(1);
  }
}

// 超时保护
setTimeout(() => {
  console.log('\n⏱️  测试超时');
  server.kill();
  process.exit(0);
}, 15000);

