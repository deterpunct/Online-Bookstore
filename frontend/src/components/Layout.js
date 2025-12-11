import React from 'react';
import {Layout as AntLayout, Menu, Button, Dropdown, Avatar, Space, Tag, message} from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOutlined, 
  UserOutlined, 
  ShoppingCartOutlined, 
  OrderedListOutlined,
  BarChartOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import axios from "axios";

const { Header, Content, Sider } = AntLayout;

const Layout = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        加载中...
      </div>
    );
  }

  // 如果用户未登录，重定向到登录页
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = async () => {
    console.log('🎯 handleLogout 函数开始执行');

    try {
      console.log('📡 发送登出请求到 /api/users/logout');

      const response = await axios.post('http://localhost:8080/api/users/logout', {}, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });

      console.log('✅ 收到响应，状态码:', response.status);
      console.log('📦 登出响应数据:', response.data);

      // 调用 AuthContext 的 logout 函数来更新状态
      console.log('🔄 调用 AuthContext logout 函数');
      logout(); // 这里调用 AuthContext 的 logout

      console.log('⏰ 等待3秒后跳转...');
      setTimeout(() => {
        console.log('🔄 现在跳转到登录页');
        window.location.href = '/login';
      }, 3000);

      return response.data;

    } catch (error) {
      console.error('❌ 登出请求失败:', error);

      // 即使后端失败，也要调用前端的 logout
      console.log('🔄 调用 AuthContext logout 函数（错误情况）');
      logout(); // 确保前端状态更新

      console.log('⏰ 等待3秒后跳转（错误情况）...');
      setTimeout(() => {
        console.log('🔄 现在跳转到登录页（错误情况）');
        window.location.href = '/login';
      }, 3000);

      return {
        success: false,
        message: '网络请求失败'
      };
    }
  };



  const userMenu = (
      <Menu onClick={({ key }) => {
        console.log('🖱️ 菜单项被点击，key:', key);

        if (key === 'logout') {
          console.log('🚀 准备调用 handleLogout');
          handleLogout();
          console.log('✅ handleLogout 调用完成');
        } else if (key === 'profile') {
          console.log('📋 跳转到个人资料');
        }
      }}>
        <Menu.Item key="profile" icon={<UserOutlined />}>
          个人资料
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout" icon={<LogoutOutlined />}>
          退出登录
        </Menu.Item>
      </Menu>
  );

  const getMenuItems = () => {
    const items = [
      {
        key: '/books',
        icon: <BookOutlined />,
        label: '浏览书籍',
      },
    ];

    // 只有普通用户才显示购物车
    if (user?.role !== 'ADMIN') {
      items.push({
        key: '/cart',
        icon: <ShoppingCartOutlined />,
        label: '购物车',
      });
    }

    items.push({
      key: '/orders',
      icon: <OrderedListOutlined />,
      label: user?.role === 'ADMIN' ? '订单管理' : '我的订单',
    });

    // 管理员菜单
    if (user?.role === 'ADMIN') {
      items.push(
          {
            key: '/book-management',
            icon: <SettingOutlined />,
            label: '书籍管理',
          },
          {
            key: '/user-management',
            icon: <UserOutlined />,
            label: '用户管理',
          },
          {
            key: '/statistics',
            icon: <BarChartOutlined />,
            label: '统计分析',
          }
      );
    } else {
      // 顾客可以查看个人统计
      items.push({
        key: '/statistics',
        icon: <BarChartOutlined />,
        label: '我的统计',
      });
    }

    return items;
  };

  return (
    <CartProvider>
      <AntLayout style={{ minHeight: '100vh' }}>
        <Header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: '#001529'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="logo" />
            <h1 style={{ color: 'white', margin: 0, marginLeft: 16 }}>
              在线书店
            </h1>
          </div>
          
          <Space>
            <span style={{ color: 'white' }}>
              欢迎，{user?.username}
              {user?.role === 'ADMIN' && (
                <Tag color="red" style={{ marginLeft: 8 }}>管理员</Tag>
              )}
            </span>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Avatar 
                icon={<UserOutlined />} 
                style={{ cursor: 'pointer' }}
              />
            </Dropdown>
          </Space>
        </Header>
        
        <AntLayout>
          <Sider width={200} style={{ background: '#fff' }}>
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              style={{ height: '100%', borderRight: 0 }}
              items={getMenuItems()}
              onClick={handleMenuClick}
            />
          </Sider>
          
          <AntLayout style={{ padding: '0 24px 24px' }}>
            <Content
              style={{
                background: '#fff',
                padding: 24,
                margin: 0,
                minHeight: 280,
              }}
            >
              <Outlet />
            </Content>
          </AntLayout>
        </AntLayout>
      </AntLayout>
    </CartProvider>
  );
};

export default Layout; 