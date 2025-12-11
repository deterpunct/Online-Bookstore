import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Button, Modal, message, Typography, Tag, Space, Select, Empty } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, EyeOutlined, BookOutlined } from '@ant-design/icons';
import { bookAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';

const { Search } = Input;
const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;
const { Option } = Select;

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await bookAPI.getAllBooks();
      setBooks(response.data);
    } catch (error) {
      message.error('获取书籍列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value) => {
    setSearchKeyword(value);
    setLoading(true);
    try {
      if (value.trim()) {
        const response = await bookAPI.searchBooks(value);
        setBooks(response.data);
      } else {
        await fetchBooks();
      }
    } catch (error) {
      message.error('搜索失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (book) => {
    addToCart(book, 1);
    message.success('已添加到购物车');
  };

  const handleViewDetail = async (book) => {
    try {
      const response = await bookAPI.getBookById(book.id);
      setSelectedBook(response.data);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('获取书籍详情失败');
    }
  };

  const getCategoryFromTitle = (title) => {
    const techKeywords = ['Java', 'Spring', '算法', '设计模式', '计算机系统', '编程'];
    const hasTechKeyword = techKeywords.some(keyword => title.includes(keyword));
    return hasTechKeyword ? 'tech' : 'literature';
  };

  const getCategoryName = (category) => {
    switch (category) {
      case 'tech':
        return '技术类';
      case 'literature':
        return '文学类';
      default:
        return '全部';
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || getCategoryFromTitle(book.title) === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const renderBookCard = (book) => (
      <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
        <Card
            hoverable
            className="book-card-animation"
            cover={
              <div style={{ position: 'relative' }}>
                <img
                    alt={book.title}
                    src={book.coverImage || '/book.png'}
                    className="book-cover"
                    onError={(e) => {
                      e.target.src = '/book.png';
                    }}
                />
                <Tag
                    color={getCategoryFromTitle(book.title) === 'tech' ? 'blue' : 'green'}
                    className="category-tag"
                >
                  {getCategoryName(getCategoryFromTitle(book.title))}
                </Tag>
              </div>
            }
            actions={[
              <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(book)}
              >
                详情
              </Button>,
              <Button
                  type="text"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => handleAddToCart(book)}
                  disabled={book.stock <= 0}
              >
                加入购物车
              </Button>
            ]}
        >
          <Meta
              title={
                <div>
                  <Text strong style={{ fontSize: 16 }}>{book.title}</Text>
                </div>
              }
              description={
                <div>
                  <Paragraph ellipsis={{ rows: 1 }}>
                    <Text type="secondary">作者：{book.author}</Text>
                  </Paragraph>
                  <Paragraph ellipsis={{ rows: 1 }}>
                    <Text type="secondary">出版社：{book.publisher}</Text>
                  </Paragraph>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text className="price-text">
                      ¥{book.price}
                    </Text>
                    <Tag color={book.stock > 0 ? 'green' : 'red'} className="stock-tag">
                      {book.stock > 0 ? `库存：${book.stock}` : '缺货'}
                    </Tag>
                  </Space>
                </div>
              }
          />
        </Card>
      </Col>
  );

  return (
    <div>
      <div className="search-section">
        <Title level={2} className="page-title">
          <BookOutlined /> 浏览书籍
        </Title>
        
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Search
              placeholder="搜索书名或作者"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="all">全部分类</Option>
              <Option value="tech">技术类</Option>
              <Option value="literature">文学类</Option>
            </Select>
          </Col>
          <Col span={6}>
            <div className="stats-info">
              <Text type="secondary">
                共找到 {filteredBooks.length} 本书
              </Text>
            </div>
          </Col>
        </Row>
      </div>

      {loading ? (
        <div className="loading-container">
          <div>加载中...</div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="empty-state">
          <Empty
            description="没有找到相关书籍"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredBooks.map(renderBookCard)}
        </Row>
      )}

      <Modal
        title={
          <div>
            <BookOutlined /> 书籍详情
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetailModalVisible(false)}>
            返回
          </Button>,
          <Button 
            key="addToCart" 
            type="primary" 
            icon={<ShoppingCartOutlined />}
            onClick={() => {
              handleAddToCart(selectedBook);
              setDetailModalVisible(false);
            }}
            disabled={selectedBook?.stock <= 0}
          >
            加入购物车
          </Button>
        ]}
        width={700}
        className="book-detail-modal"
      >
        {selectedBook && (
            <div>
              <Row gutter={24}>
                <Col span={8}>
                  <img
                      src={selectedBook.coverImage || '/book.png'}
                      alt={selectedBook.title}
                      style={{
                        width: '100%',
                        maxWidth: 250,
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      onError={(e) => {
                        e.target.src = '/book.png';
                      }}
                  />
                  <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <Tag color={getCategoryFromTitle(selectedBook.title) === 'tech' ? 'blue' : 'green'} className="category-tag">
                      {getCategoryName(getCategoryFromTitle(selectedBook.title))}
                    </Tag>
                  </div>
                </Col>
                <Col span={16}>
                  <Title level={2}>{selectedBook.title}</Title>
                  <div className="book-info-section">
                    <Paragraph>
                      <Text strong>作者：</Text>
                      <Text>{selectedBook.author}</Text>
                    </Paragraph>
                    <Paragraph>
                      <Text strong>ISBN：</Text>
                      <Text>{selectedBook.isbn}</Text>
                    </Paragraph>
                    <Paragraph>
                      <Text strong>出版社：</Text>
                      <Text>{selectedBook.publisher}</Text>
                    </Paragraph>
                    <Paragraph>
                      <Text strong>价格：</Text>
                      <Text className="price-text">¥{selectedBook.price}</Text>
                    </Paragraph>
                    <Paragraph>
                      <Text strong>库存：</Text>
                      <Tag color={selectedBook.stock > 0 ? 'green' : 'red'} size="large" className="stock-tag">
                        {selectedBook.stock > 0 ? `${selectedBook.stock} 本` : '缺货'}
                      </Tag>
                    </Paragraph>
                  </div>
                  <div className="book-description">
                    <Text strong>简介：</Text>
                    <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                      {selectedBook.description || '暂无简介'}
                    </Paragraph>
                  </div>
                </Col>
              </Row>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default BookList; 