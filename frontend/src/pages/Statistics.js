import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  DatePicker, 
  Button, 
  Typography, 
  Table,
  Statistic,
  message,
  Tabs
} from 'antd';
import { BarChartOutlined, DollarOutlined, ShoppingOutlined, UserOutlined, BookOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { statisticsAPI } from '../services/api';
import moment from 'moment';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const Statistics = () => {
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookSales, setBookSales] = useState([]);
  const [userConsumption, setUserConsumption] = useState([]);
  const [userStatistics, setUserStatistics] = useState([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    avgOrderValue: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    // 默认显示最近30天的数据
    const endDate = moment();
    const startDate = moment().subtract(30, 'days');
    setDateRange([startDate, endDate]);
  }, []);

  useEffect(() => {
    if (dateRange) {
      fetchStatistics();
    }
  }, [dateRange]);

  const fetchStatistics = async () => {
    if (!dateRange || dateRange.length !== 2) {
      message.warning('请选择时间范围');
      return;
    }

    setLoading(true);
    try {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');

      if (user?.role === 'ADMIN') {
        // 管理员获取所有统计数据
        const [salesResponse, consumptionResponse] = await Promise.all([
          statisticsAPI.getBookSales(startDate, endDate),
          statisticsAPI.getUserConsumption(startDate, endDate)
        ]);

        setBookSales(salesResponse.data || []);
        setUserConsumption(consumptionResponse.data || []);
      } else {
        // 顾客获取个人统计数据
        const userStatsResponse = await statisticsAPI.getUserStatistics(startDate, endDate);
        setUserStatistics(userStatsResponse.data || []);
      }

      // 计算汇总信息
      calculateSummary();
    } catch (error) {
      console.error('获取统计数据失败:', error);
      message.error('获取统计数据失败');
      
      // 使用模拟数据作为备用
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockBookSales = [
      { bookTitle: 'Java编程思想', author: 'Bruce Eckel', salesCount: 15, totalAmount: 1620.00 },
      { bookTitle: 'Spring实战', author: 'Craig Walls', salesCount: 12, totalAmount: 1068.00 },
      { bookTitle: '算法导论', author: 'Thomas H.Cormen', salesCount: 8, totalAmount: 1024.00 },
      { bookTitle: '设计模式', author: 'Erich Gamma', salesCount: 10, totalAmount: 790.00 },
      { bookTitle: '深入理解计算机系统', author: 'Randal E. Bryant', salesCount: 6, totalAmount: 834.00 }
    ];
    
    const mockUserConsumption = [
      { username: 'user1', totalAmount: 450.00, orderCount: 3 },
      { username: 'user2', totalAmount: 320.00, orderCount: 2 },
      { username: 'user3', totalAmount: 280.00, orderCount: 2 },
      { username: 'user4', totalAmount: 200.00, orderCount: 1 },
      { username: 'user5', totalAmount: 180.00, orderCount: 1 }
    ];

    const mockUserStatistics = [
      { bookTitle: 'Java编程思想', quantity: 3, totalAmount: 324.00 },
      { bookTitle: 'Spring实战', quantity: 2, totalAmount: 178.00 },
      { bookTitle: '算法导论', quantity: 1, totalAmount: 128.00 }
    ];
    
    setBookSales(mockBookSales);
    setUserConsumption(mockUserConsumption);
    setUserStatistics(mockUserStatistics);
  };

  const calculateSummary = () => {
    let totalSales = 0;
    let totalOrders = 0;
    let totalUsers = 0;

    if (user?.role === 'ADMIN') {
      totalSales = bookSales.reduce((sum, book) => sum + book.totalAmount, 0);
      totalOrders = userConsumption.reduce((sum, user) => sum + user.orderCount, 0);
      totalUsers = userConsumption.length;
    } else {
      totalSales = userStatistics.reduce((sum, book) => sum + book.totalAmount, 0);
      totalOrders = userStatistics.length;
      totalUsers = 1;
    }

    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    setSummary({ totalSales, totalOrders, totalUsers, avgOrderValue });
  };

  const bookSalesColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: '书名',
      dataIndex: 'bookTitle',
      key: 'bookTitle',
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '销量',
      dataIndex: 'salesCount',
      key: 'salesCount',
      sorter: (a, b) => a.salesCount - b.salesCount,
    },
    {
      title: '销售额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `¥${amount.toFixed(2)}`,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
  ];

  const userConsumptionColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '消费金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `¥${amount.toFixed(2)}`,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: '订单数',
      dataIndex: 'orderCount',
      key: 'orderCount',
      sorter: (a, b) => a.orderCount - b.orderCount,
    },
  ];

  const userStatisticsColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: '书名',
      dataIndex: 'bookTitle',
      key: 'bookTitle',
    },
    {
      title: '购买数量',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: '消费金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `¥${amount.toFixed(2)}`,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
  ];

  return (
    <div>
      <Title level={2}>统计分析</Title>
      
      {/* 时间范围选择 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col>
            <span>选择时间范围：</span>
          </Col>
          <Col>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="YYYY-MM-DD"
            />
          </Col>
          <Col>
            <Button type="primary" onClick={fetchStatistics} loading={loading}>
              查询
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 汇总统计 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总销售额"
              value={summary.totalSales}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={summary.totalOrders}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={user?.role === 'ADMIN' ? '活跃用户数' : '购买书籍种类'}
              value={summary.totalUsers}
              prefix={user?.role === 'ADMIN' ? <UserOutlined /> : <BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均订单金额"
              value={summary.avgOrderValue}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      {/* 详细统计 */}
      <Tabs defaultActiveKey={user?.role === 'ADMIN' ? 'bookSales' : 'userStats'}>
        {user?.role === 'ADMIN' ? (
          <>
            <TabPane tab="热销榜" key="bookSales">
              <Card title="书籍销量排行榜">
                <Table
                  columns={bookSalesColumns}
                  dataSource={bookSales}
                  rowKey="bookTitle"
                  loading={loading}
                  pagination={false}
                />
              </Card>
            </TabPane>
            <TabPane tab="消费榜" key="userConsumption">
              <Card title="用户消费排行榜">
                <Table
                  columns={userConsumptionColumns}
                  dataSource={userConsumption}
                  rowKey="username"
                  loading={loading}
                  pagination={false}
                />
              </Card>
            </TabPane>
          </>
        ) : (
          <TabPane tab="我的购买统计" key="userStats">
            <Card title="我的购买记录">
              <Table
                columns={userStatisticsColumns}
                dataSource={userStatistics}
                rowKey="bookTitle"
                loading={loading}
                pagination={false}
              />
            </Card>
          </TabPane>
        )}
      </Tabs>
    </div>
  );
};

export default Statistics; 