#!/usr/bin/env node

/**
 * 快速检查脚本
 * 检查MCP服务器配置和连接状态
 */

import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 MCP服务器快速检查工具\n');
console.log('='.repeat(60));

let allChecksPassed = true;

// 检查1: Node.js版本
console.log('\n[1/7] 检查Node.js版本...');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
  console.log(`   ✅ Node.js已安装: ${nodeVersion}`);
  const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
  if (majorVersion < 18) {
    console.log(`   ⚠️  警告: 推荐使用Node.js 18或更高版本`);
  }
} catch (error) {
  console.log('   ❌ Node.js未安装或不在PATH中');
  allChecksPassed = false;
}

// 检查2: 依赖包
console.log('\n[2/7] 检查依赖包...');
try {
  const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  console.log(`   ✅ 找到 ${dependencies.length} 个依赖包:`);
  dependencies.forEach(dep => {
    try {
      const depPath = join(__dirname, 'node_modules', dep);
      if (existsSync(depPath)) {
        console.log(`      ✅ ${dep}`);
      } else {
        console.log(`      ❌ ${dep} (未安装)`);
        allChecksPassed = false;
      }
    } catch (e) {
      console.log(`      ❌ ${dep} (检查失败)`);
    }
  });
} catch (error) {
  console.log('   ❌ 无法读取package.json');
  allChecksPassed = false;
}

// 检查3: MCP服务器文件
console.log('\n[3/7] 检查MCP服务器文件...');
const serverFile = join(__dirname, 'index.js');
if (existsSync(serverFile)) {
  console.log(`   ✅ MCP服务器文件存在: ${serverFile}`);
} else {
  console.log(`   ❌ MCP服务器文件不存在: ${serverFile}`);
  allChecksPassed = false;
}

// 检查4: .env文件
console.log('\n[4/7] 检查环境变量配置...');
const envFile = join(__dirname, '.env');
if (existsSync(envFile)) {
  console.log(`   ✅ .env文件存在`);
  try {
    const envContent = readFileSync(envFile, 'utf-8');
    const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
    if (missingVars.length === 0) {
      console.log(`   ✅ 所有必需的环境变量都已配置`);
    } else {
      console.log(`   ⚠️  缺少环境变量: ${missingVars.join(', ')}`);
    }
  } catch (error) {
    console.log(`   ⚠️  无法读取.env文件`);
  }
} else {
  console.log(`   ⚠️  .env文件不存在（将使用默认配置或Cherry Studio配置中的环境变量）`);
}

// 检查5: 数据库连接
console.log('\n[5/7] 测试数据库连接...');
try {
  execSync('npm test', { 
    cwd: __dirname, 
    stdio: 'pipe',
    timeout: 5000 
  });
  console.log('   ✅ 数据库连接成功');
} catch (error) {
  console.log('   ❌ 数据库连接失败');
  console.log('      请检查:');
  console.log('      - MySQL服务是否运行');
  console.log('      - .env文件中的数据库配置是否正确');
  console.log('      - 数据库和表是否已创建');
  allChecksPassed = false;
}

// 检查6: MCP服务器能否启动
console.log('\n[6/7] 测试MCP服务器启动...');
try {
  const server = execSync('node index.js', {
    cwd: __dirname,
    input: '',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 2000
  });
  console.log('   ✅ MCP服务器可以启动');
} catch (error) {
  // 超时是正常的，因为MCP服务器会一直运行
  if (error.signal === 'SIGTERM' || error.code === null) {
    console.log('   ✅ MCP服务器可以启动（超时是正常的）');
  } else {
    const errorOutput = error.stderr?.toString() || error.message;
    if (errorOutput.includes('running on stdio')) {
      console.log('   ✅ MCP服务器可以启动');
    } else {
      console.log('   ❌ MCP服务器启动失败');
      console.log(`      错误: ${errorOutput.substring(0, 100)}`);
      allChecksPassed = false;
    }
  }
}

// 检查7: Cherry Studio配置提示
console.log('\n[7/7] Cherry Studio配置检查...');
console.log('   📋 请手动检查以下配置:');
console.log('');
console.log('   1. 找到Cherry Studio配置文件:');
console.log('      Windows: %APPDATA%\\Cherry Studio\\config.json');
console.log('      macOS:   ~/Library/Application Support/Cherry Studio/config.json');
console.log('      Linux:   ~/.config/cherry-studio/config.json');
console.log('');
console.log('   2. 确保配置文件中包含:');
console.log('      {');
console.log('        "mcpServers": {');
console.log('          "bookstore": {');
console.log('            "command": "node",');
console.log(`            "args": ["${serverFile.replace(/\\/g, '/')}"],`);
console.log('            "env": { ... }');
console.log('          }');
console.log('        }');
console.log('      }');
console.log('');
console.log('   3. 重要提示:');
console.log('      - 使用绝对路径（如上所示）');
console.log('      - 确保JSON格式正确');
console.log('      - 保存后完全重启Cherry Studio');

// 总结
console.log('\n' + '='.repeat(60));
if (allChecksPassed) {
  console.log('\n✅ 所有基本检查通过！');
  console.log('\n💡 下一步:');
  console.log('   1. 在Cherry Studio中配置MCP服务器（参考上面的配置）');
  console.log('   2. 重启Cherry Studio');
  console.log('   3. 在对话中测试: "帮我找一下三体这本书的信息"');
  console.log('\n📖 详细文档:');
  console.log('   - CHECK_CONNECTION.md - 如何检查连接状态');
  console.log('   - TROUBLESHOOTING.md - 故障排除指南');
} else {
  console.log('\n⚠️  发现一些问题，请根据上面的提示进行修复');
  console.log('\n📖 查看详细故障排除指南: TROUBLESHOOTING.md');
}
console.log('');

