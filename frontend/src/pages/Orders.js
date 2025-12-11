import React, { useState, useEffect } from 'react';
import { 
  Table, 
  message, 
  Typography, 
  Tag,
  Empty,
  Card,
  Row,
  Col,
  Statistic,
  Input,
  DatePicker,
  Button,
  Space,
  Select
} from 'antd';
import { OrderedListOutlined, DollarOutlined, ShoppingOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI } from '../services/api';
import moment from 'moment';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalAmount: 0,
    totalItems: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchKeyword, dateRange, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // 根据用户角色获取不同的订单数据
      const response = user?.role === 'ADMIN' 
        ? await orderAPI.getAllyOrders()
        : await orderAPI.getUserOrders();
      
      setOrders(response.data);
      
      // 计算统计信息
      const totalOrders = response.data.length;
      const totalAmount = response.data.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
      const totalItems = response.data.reduce((sum, order) => 
        sum + (order.orderItems ? order.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0) : 0), 0
      );
      
      setStatistics({ totalOrders, totalAmount, totalItems });
    } catch (error) {
      console.error('获取订单列表失败:', error);
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // 按关键词搜索（书籍名称）
    if (searchKeyword) {
      filtered = filtered.filter(order => 
        order.orderItems && order.orderItems.some(item => 
          item.bookTitle && item.bookTitle.toLowerCase().includes(searchKeyword.toLowerCase())
        )
      );
    }

    // 按时间范围过滤
    if (dateRange && dateRange.length === 2) {
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      filtered = filtered.filter(order => {
        const orderDate = moment(order.createdAt);
        return orderDate.isBetween(startDate, endDate, 'day', '[]');
      });
    }

    // 按状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleSearch = (value) => {
    setSearchKeyword(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const clearFilters = () => {
    setSearchKeyword('');
    setDateRange(null);
    setStatusFilter('all');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'PENDING':
        return 'orange';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED':
        return '已完成';
      case 'PENDING':
        return '待处理';
      case 'CANCELLED':
        return '已取消';
      default:
        return status;
    }
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    ...(user?.role === 'ADMIN' ? [{
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (username) => username || '未知用户',
    }] : []),
    {
      title: '订单内容',
      key: 'items',
      render: (_, record) => (
          <div>
            {record.orderItems && record.orderItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <img
                      src={item.bookCoverImage || '/book.png'}
                      alt={item.bookTitle}
                      style={{
                        width: 40,
                        height: 60,
                        objectFit: 'cover',
                        marginRight: 8,
                        borderRadius: 4
                      }}
                      onError={(e) => {
                        e.target.src = '/book.png';
                      }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{item.bookTitle}</div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      {item.bookAuthor} x{item.quantity}
                    </div>
                  </div>
                </div>
            ))}
          </div>
      ),
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `¥${parseFloat(amount).toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
      ),
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div>
      <Title level={2}>
        {user?.role === 'ADMIN' ? '订单管理' : '我的订单'}
      </Title>
      
      {/* 搜索和过滤区域 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Search
              placeholder="搜索书籍名称"
              allowClear
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              value={dateRange}
              onChange={handleDateRangeChange}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              style={{ width: '100%' }}
            >
              <Option value="all">全部状态</Option>
              <Option value="PENDING">待处理</Option>
              <Option value="COMPLETED">已完成</Option>
              <Option value="CANCELLED">已取消</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button onClick={clearFilters} icon={<FilterOutlined />}>
              清除筛选
            </Button>
          </Col>
          <Col span={4}>
            <div style={{ textAlign: 'right' }}>
              <Text type="secondary">
                共找到 {filteredOrders.length} 条订单
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
      
      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总订单数"
              value={statistics.totalOrders}
              prefix={<OrderedListOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="总消费金额"
              value={statistics.totalAmount}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="购买书籍总数"
              value={statistics.totalItems}
              prefix={<ShoppingOutlined />}
              suffix="本"
            />
          </Card>
        </Col>
      </Row>

      {filteredOrders.length === 0 ? (
        <Empty
          description={loading ? "加载中..." : "暂无订单"}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            defaultPageSize: 10,
            pageSizeOptions: ['10', '20', '50'],
          }}
        />
      )}
    </div>
  );
};

export default Orders; 