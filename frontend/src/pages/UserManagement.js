import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  message, 
  Space, 
  Switch,
  Typography,
  Tag,
  Card,
  Row,
  Col,
  Input,
  Statistic
} from 'antd';
import { UserOutlined, SearchOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { userAPI } from '../services/api';

const { Title } = Typography;
const { Search } = Input;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    customerUsers: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applySearch();
  }, [users, searchKeyword]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
      
      // 计算统计信息
      const totalUsers = response.data.length;
      const activeUsers = response.data.filter(user => user.enabled).length;
      const adminUsers = response.data.filter(user => user.role === 'ADMIN').length;
      const customerUsers = response.data.filter(user => user.role === 'CUSTOMER').length;
      
      setStatistics({ totalUsers, activeUsers, adminUsers, customerUsers });
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    if (!searchKeyword.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user => 
      (user.username && user.username.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchKeyword.toLowerCase()))
    );
    setFilteredUsers(filtered);
  };

  const handleSearch = (value) => {
    setSearchKeyword(value);
  };

  const handleStatusChange = async (userId, enabled) => {
    try {
      await userAPI.updateUserStatus(userId, enabled);
      message.success(`用户${enabled ? '启用' : '禁用'}成功`);
      fetchUsers(); // 重新获取用户列表以更新统计信息
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>
          {role === 'ADMIN' ? '管理员' : '顾客'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled, record) => (
        <Space>
          <Switch
            checked={enabled}
            onChange={(checked) => handleStatusChange(record.id, checked)}
            checkedChildren={<UnlockOutlined />}
            unCheckedChildren={<LockOutlined />}
          />
          <Tag color={enabled ? 'green' : 'red'}>
            {enabled ? '启用' : '禁用'}
          </Tag>
        </Space>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '最后更新',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div>
      <Title level={2}>用户管理</Title>
      
      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={statistics.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={statistics.activeUsers}
              prefix={<UnlockOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="管理员"
              value={statistics.adminUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="顾客"
              value={statistics.customerUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索区域 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Search
              placeholder="搜索用户名或邮箱"
              allowClear
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#666' }}>
                共找到 {filteredUsers.length} 个用户
              </span>
            </div>
          </Col>
        </Row>
      </Card>
      
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />
    </div>
  );
};

export default UserManagement; 