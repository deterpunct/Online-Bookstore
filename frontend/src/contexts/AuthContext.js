import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const AuthContext = createContext();{/*createcontext 生成对象后。里面自带一个provider用来传递给usecontext（）时其具体的值*/}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


//
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);//用户具体信息
  const [token, setToken] = useState(localStorage.getItem('token'));//凭证
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);
  //token变化时重新执行



  const fetchCurrentUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/current`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setUser(response.data);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 如果是401或403错误，说明token无效，清除token
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };



  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        username,
        password
      }, { withCredentials: true });
      const { token: newToken, user } = response.data; // 期待后端返回用户信息
      setToken(newToken);
      localStorage.setItem('token', newToken);//储存到浏览器本地，网络刷新后仍能读取
      if (user) {
        setUser(user); // 直接设置用户信息
        console.log('✅ 登录成功，用户信息:', user);
      } else {
        // 如果后端没有返回用户信息，再调用 fetchCurrentUser
        await fetchCurrentUser();
      }
      return { success: true };
    } catch (error) {
      console.error('登录失败:', error);
      return {
        success: false,
        error: error.response?.data?.error || '登录失败'
      };
    }
  };



  const register = async (userData) => {
    console.log('开始注册请求，数据:', userData);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/register`, userData);
      console.log('注册成功，响应:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('注册失败，详细错误:', error);
      console.error('错误响应:', error.response);
      console.error('错误状态:', error.response?.status);
      console.error('错误数据:', error.response?.data);

      let errorMessage = '注册失败';

      if (error.response) {
        // 服务器返回了错误响应
        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 400) {
          errorMessage = '请求参数错误';
        } else if (error.response.status === 409) {
          errorMessage = '用户名或邮箱已存在';
        } else if (error.response.status === 500) {
          errorMessage = '服务器内部错误';
        } else {
          errorMessage = `服务器错误 (${error.response.status})`;
        }
      } else if (error.request) {
        // 请求已发出但没有收到响应
        errorMessage = '无法连接到服务器，请检查网络连接';
      } else {
        // 其他错误
        errorMessage = error.message || '未知错误';
      }

      return {
        success: false,
        error: errorMessage,
        details: {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        }
      };
    }
  };


  const logout = async () => {
    try {
      // 调用后端登出接口
      await axios.post(`${API_BASE_URL}/api/users/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.log('后端登出失败，继续前端清除:', error);
    } finally {
      // 完全清除所有状态
      setUser(null);
      setToken(null);
      setLoading(false); // 重置loading状态
      localStorage.removeItem('token');

      console.log('前端状态已完全清除');

      // 强制跳转到登录页并刷新
      window.location.href = '/login';
      window.location.reload(); // 强制刷新清除所有状态
    }
  };



  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};