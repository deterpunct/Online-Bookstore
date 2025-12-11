#!/usr/bin/env node

/**
 * MCP服务器调试工具
 * 用于测试MCP服务器是否能正常启动和响应
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 MCP服务器调试工具\n');
console.log('='.repeat(50));

// 测试1: 检查文件是否存在
console.log('\n[测试1] 检查MCP服务器文件...');
import { existsSync } from 'fs';
const serverPath = join(__dirname, 'index.js');
if (existsSync(serverPath)) {
  console.log('✅ MCP服务器文件存在:', serverPath);
} else {
  console.error('❌ MCP服务器文件不存在:', serverPath);
  process.exit(1);
}

// 测试2: 尝试启动MCP服务器
console.log('\n[测试2] 尝试启动MCP服务器...');
console.log('注意: MCP服务器通过stdio通信，如果看到"Bookstore MCP Server running on stdio"说明启动成功\n');

const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: __dirname
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  // MCP服务器通常输出到stderr
});

server.stderr.on('data', (data) => {
  const text = data.toString();
  errorOutput += text;
  if (text.includes('running')) {
    console.log('✅ MCP服务器启动成功！');
    console.log('   输出:', text.trim());
  }
});

server.on('error', (error) => {
  console.error('❌ 启动MCP服务器时出错:', error.message);
  console.error('\n可能的原因:');
  console.error('1. Node.js未正确安装');
  console.error('2. 依赖包未安装 (运行 npm install)');
  console.error('3. 代码语法错误');
  process.exit(1);
});

// 测试3: 发送MCP初始化请求
setTimeout(() => {
  console.log('\n[测试3] 发送MCP初始化请求...');
  
  // MCP协议初始化请求
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'debug-tool',
        version: '1.0.0'
      }
    }
  };
  
  server.stdin.write(JSON.stringify(initRequest) + '\n');
  
  setTimeout(() => {
    // 测试4: 列出工具
    console.log('\n[测试4] 请求工具列表...');
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list'
    };
    
    server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
    
    setTimeout(() => {
      console.log('\n[测试5] 检查输出...');
      if (output || errorOutput) {
        console.log('✅ 收到服务器响应');
        if (output) {
          console.log('   stdout:', output.substring(0, 200));
        }
        if (errorOutput) {
          console.log('   stderr:', errorOutput.substring(0, 200));
        }
      } else {
        console.log('⚠️  未收到服务器响应（这可能是正常的，MCP服务器可能只在收到有效请求时响应）');
      }
      
      console.log('\n' + '='.repeat(50));
      console.log('\n📋 诊断总结:');
      console.log('1. 如果看到"running on stdio"，说明服务器启动成功');
      console.log('2. 如果看到错误信息，请检查上面的错误提示');
      console.log('3. 在Cherry Studio中配置时，确保使用绝对路径');
      console.log('\n💡 提示: MCP服务器通过stdio通信，不会在控制台输出太多信息');
      console.log('   如果服务器能启动（看到"running"消息），通常说明配置正确');
      
      server.kill();
      process.exit(0);
    }, 1000);
  }, 500);
}, 500);

// 超时保护
setTimeout(() => {
  console.log('\n⏱️  测试超时');
  server.kill();
  process.exit(0);
}, 5000);

