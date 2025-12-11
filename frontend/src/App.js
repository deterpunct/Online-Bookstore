import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import 'antd/dist/antd.css';

import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import BookList from './pages/BookList';
import BookManagement from './pages/BookManagement';
import UserManagement from './pages/UserManagement';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Statistics from './pages/Statistics';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// 加载组件
function LoadingSpinner() {
  return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
  );
}


// 创建一个受保护的路由组件
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // 如果正在加载，显示加载状态
  if (loading) {
    return <LoadingSpinner />;
  }

  // 如果用户未登录，重定向到登录页
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}



// 已登录用户访问登录/注册页时重定向到主页
function PublicRoute({ children }) {
  const { user, loading } = useAuth();{/*把当前状态的user和loading拿来分析*/}

  // 如果正在加载，显示加载状态
  if (loading) {
    return <LoadingSpinner />;
  }

  // 如果用户已登录，重定向到主页
  if (user) {
    return <Navigate to="/books" replace />;
  }

  return children;
}




// 应用内容组件
function AppContent() {
  return (
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>{/*outlet中填写以下子路由*/}
          <Route index element={<Navigate to="/books" replace />} />
          <Route path="books" element={<BookList />} />
          <Route path="book-management" element={<BookManagement />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="cart" element={<Cart />} />
          <Route path="orders" element={<Orders />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>
        {/* 默认路由重定向到登录页 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  );
}

function App() {
  return (
      <ConfigProvider locale={zhCN}>
        <AuthProvider>{/*Authcontext 中定义其作用*/}
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ConfigProvider>
  );
}

export default App;