import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const { Title } = Typography;
const API_BASE_URL = 'http://localhost:8080';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { register } = useAuth();
  const navigate = useNavigate();

  // 测试API连接
  const testApiConnection = async () => {
    try {
      console.log('测试API连接...');
      
      // 测试简单的ping接口
      const pingResponse = await axios.get(`${API_BASE_URL}/api/test/ping`);
      console.log('Ping接口成功:', pingResponse.data);
      
      // 测试hello接口
      const helloResponse = await axios.get(`${API_BASE_URL}/api/test/hello`);
      console.log('Hello接口成功:', helloResponse.data);
      
      // 测试安全配置
      const securityResponse = await axios.get(`${API_BASE_URL}/api/test/security-test`);
      console.log('安全测试接口成功:', securityResponse.data);
      
      // 测试用户测试接口
      const userTestResponse = await axios.get(`${API_BASE_URL}/api/users/test`);
      console.log('用户测试接口成功:', userTestResponse.data);
      
      message.success('所有API连接正常！');
    } catch (error) {
      console.error('API连接失败:', error);
      console.error('错误详情:', {
        状态码: error.response?.status,
        状态文本: error.response?.statusText,
        错误数据: error.response?.data,
        错误消息: error.message
      });
      
      let errorMessage = 'API连接失败';
      if (error.response) {
        errorMessage += ` (${error.response.status}: ${error.response.statusText})`;
        if (error.response.data && error.response.data.error) {
          errorMessage += ` - ${error.response.data.error}`;
        }
      } else if (error.request) {
        errorMessage += ' - 无法连接到服务器';
      } else {
        errorMessage += ` - ${error.message}`;
      }
      
      message.error(errorMessage);
    }
  };

  // 在浏览器中直接打开API链接
  const openApiInBrowser = () => {
    window.open(`${API_BASE_URL}/api/test/ping`, '_blank');
    window.open(`${API_BASE_URL}/api/test/hello`, '_blank');
    window.open(`${API_BASE_URL}/api/users/test`, '_blank');
  };

  // 测试所有API
  const testAllApis = async () => {
    const apis = [
      { name: 'Ping API', url: `${API_BASE_URL}/api/test/ping` },
      { name: 'Hello API', url: `${API_BASE_URL}/api/test/hello` },
      { name: 'Security Test API', url: `${API_BASE_URL}/api/test/security-test` },
      { name: 'Database Test API', url: `${API_BASE_URL}/api/test/db-test` },
      { name: 'User Test API', url: `${API_BASE_URL}/api/users/test` },
      { name: 'Books API', url: `${API_BASE_URL}/api/books` },
      { name: 'User Health API', url: `${API_BASE_URL}/api/users/health` }
    ];

    for (const api of apis) {
      try {
        console.log(`测试 ${api.name}...`);
        const response = await axios.get(api.url);
        console.log(`${api.name} 成功:`, response.data);
        message.success(`${api.name} 正常`);
      } catch (error) {
        console.error(`${api.name} 失败:`, error);
        message.error(`${api.name} 失败: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      }
    }
  };

  // 测试书籍API
  const testBookApi = async () => {
    try {
      console.log('测试书籍API...');
      const response = await axios.get(`${API_BASE_URL}/api/books`);
      console.log('书籍API成功:', response.data);
      message.success(`书籍API正常，共${response.data.length}本书`);
    } catch (error) {
      console.error('书籍API失败:', error);
      message.error(`书籍API失败: ${error.response?.status} - ${error.message}`);
    }
  };

  // 直接测试用户注册API
  const testUserRegisterApi = async () => {
    try {
      console.log('直接测试用户注册API...');
      const testData = {
        username: 'testuser',
        password: '123456',
        confirmPassword: '123456',
        email: 'test@example.com'
      };
      const response = await axios.post(`${API_BASE_URL}/api/users/register`, testData);
      console.log('用户注册API成功:', response.data);
      message.success('用户注册API正常');
    } catch (error) {
      console.error('用户注册API失败:', error);
      console.error('错误详情:', {
        状态码: error.response?.status,
        状态文本: error.response?.statusText,
        错误数据: error.response?.data,
        错误消息: error.message
      });
      message.error(`用户注册API失败: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }
  };

  const onFinish = async (values) => {
    console.log('表单提交数据:', values);
    
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致！');
      return;
    }

    setLoading(true);
    try {
      console.log('调用注册API...');
      const result = await register({
        username: values.username,
        password: values.password,
        confirmPassword: values.confirmPassword,
        email: values.email
      });
      
      console.log('注册结果:', result);
      
      if (result.success) {
        message.success('注册成功！请登录');
        navigate('/login');
      } else {
        console.error('注册失败详情:', result.details);
        message.error(`注册失败: ${result.error}`);
        
        // 显示详细错误信息（仅在开发环境）
        if (process.env.NODE_ENV === 'development' && result.details) {
          console.error('详细错误信息:', {
            状态码: result.details.status,
            错误数据: result.details.data,
            错误消息: result.details.message
          });
        }
      }
    } catch (error) {
      console.error('注册过程中发生异常:', error);
      message.error('注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>在线书店</Title>
          <Title level={4} type="secondary">用户注册</Title>
        </div>
        
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名！' },
              { min: 2, message: '用户名至少2个字符！' },
              { max: 50, message: '用户名最多50个字符！' },
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱！' },
              { type: 'email', message: '请输入有效的邮箱地址！' },
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="邮箱" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码！' },
              { min: 6, message: '密码至少6个字符！' },
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码" 
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            rules={[
              { required: true, message: '请确认密码！' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致！'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="确认密码" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: '100%' }}
            >
              注册
            </Button>
          </Form.Item>

          <Form.Item>
            <Button 
              type="default" 
              onClick={testApiConnection}
              style={{ width: '100%' }}
            >
              测试API连接
            </Button>
          </Form.Item>

          <Form.Item>
            <Button 
              type="default" 
              onClick={openApiInBrowser}
              style={{ width: '100%' }}
            >
              在浏览器中打开API链接
            </Button>
          </Form.Item>

          <Form.Item>
            <Button 
              type="default" 
              onClick={testAllApis}
              style={{ width: '100%' }}
            >
              测试所有API
            </Button>
          </Form.Item>

          <Form.Item>
            <Button 
              type="default" 
              onClick={testBookApi}
              style={{ width: '100%' }}
            >
              测试书籍API
            </Button>
          </Form.Item>

          <Form.Item>
            <Button 
              type="default" 
              onClick={testUserRegisterApi}
              style={{ width: '100%' }}
            >
              直接测试用户注册API
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            已有账号？ <Link to="/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register; 