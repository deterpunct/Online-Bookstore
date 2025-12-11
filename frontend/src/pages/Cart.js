import React, { useState } from 'react';
import { Card, Button, InputNumber, message, Typography, Empty, Space, Divider } from 'antd';
import { DeleteOutlined, ShoppingOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart, addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleQuantityChange = (bookId, quantity) => {
    updateQuantity(bookId, quantity);
  };

  const handleRemoveItem = (bookId) => {
    removeFromCart(bookId);
    message.success('已从购物车移除');
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      message.warning('购物车为空');
      return;
    }
    if (!user || !user.id) {
      message.error('请先登录');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        userId: user.id,
        totalAmount: getTotalPrice(),
        orderItems: cartItems.map(item => ({
          bookId: item.id,
          quantity: item.quantity,
          price: Number(item.price),
          subtotal: Number(item.price) * Number(item.quantity)
        }))
      };
      // 调用后端API创建订单
      const response = await orderAPI.createOrder(orderData);
      if (response.data) {
        clearCart();
        // 正确提取消息字符串
        const successMessage = response.data.message || '订单创建成功';
        message.success(successMessage);
        navigate('/orders');
      }
    } catch (error) {
      console.error('创建订单失败:', error);
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error('订单提交失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = () => {
    clearCart();
    message.success('购物车已清空');
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="购物车为空"
        >
          <Button type="primary" onClick={() => navigate('/books')}>
            去购物
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>购物车</Title>
        <Space>
          <Button onClick={handleClearCart} danger>
            清空购物车
          </Button>
          <Button type="primary" onClick={() => navigate('/books')}>
            继续购物
          </Button>
        </Space>
      </div>

      <Card>
        {cartItems.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={item.coverImage || '/book.png'}
                  alt={item.title}
                  style={{ width: 80, height: 120, objectFit: 'cover', marginRight: 16 }}
                  onError={(e) => {
                    e.target.src = '/book.png';
                  }}
                />
                <div>
                  <Title level={4} style={{ margin: 0 }}>{item.title}</Title>
                  <Text type="secondary">作者：{item.author}</Text>
                  <br />
                  <Text type="secondary">ISBN：{item.isbn}</Text>
                  <br />
                  <Text strong style={{ color: '#f50', fontSize: 16 }}>
                    ¥{item.price}
                  </Text>
                </div>
              </div>
            </div>
            
            <div className="cart-item-actions">
              <Button 
                type="text" 
                icon={<MinusOutlined />}
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              />
              <span style={{ minWidth: 30, textAlign: 'center' }}>
                {item.quantity}
              </span>
              <Button 
                type="text" 
                icon={<PlusOutlined />}
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
              />
              <Button 
                type="text" 
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeFromCart(item.id)}
              />
            </div>
          </div>
        ))}
        <Divider />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text strong style={{ fontSize: 16 }}>
              总计：<Text strong style={{ color: '#f50', fontSize: 20 }}>
                ¥{getTotalPrice().toFixed(2)}
              </Text>
            </Text>
          </div>
          <Button 
            type="primary" 
            size="large" 
            icon={<ShoppingOutlined />}
            loading={loading}
            onClick={handleCheckout}
          >
            结算
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Cart; 