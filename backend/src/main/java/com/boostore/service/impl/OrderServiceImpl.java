package com.boostore.service.impl;

import com.boostore.dto.OrderDto;
import com.boostore.dto.OrderItemDto;
import com.boostore.entity.Book;
import com.boostore.entity.Order;
import com.boostore.entity.OrderItem;
import com.boostore.entity.User;
import com.boostore.repository.BookRepository;
import com.boostore.repository.OrderRepository;
import com.boostore.repository.UserRepository;
import com.boostore.service.OrderService;
import com.boostore.service.KafkaControllerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.kafka.core.KafkaTemplate;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private KafkaControllerService kafkaControllerService;



    public Order pack_order(OrderDto orderDto){
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 创建订单
        Order order = new Order();
        order.setUser(user); // 这会自动设置 userId
        order.setTotalAmount(orderDto.getTotalAmount());
        order.setStatus(Order.OrderStatus.COMPLETED);

        // 创建订单项
        List<OrderItem> orderItems = orderDto.getOrderItems().stream()
                .map(itemDto -> {
                    Book book = bookRepository.findById(itemDto.getBookId())
                            .orElseThrow(() -> new RuntimeException("书籍不存在: " + itemDto.getBookId()));

                    // 检查库存
                    if (book.getStock() < itemDto.getQuantity()) {
                        throw new RuntimeException("书籍《" + book.getTitle() + "》库存不足");
                    }

                    // 更新库存
                    book.setStock(book.getStock() - itemDto.getQuantity());
                    bookRepository.save(book);

                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(order);
                    orderItem.setBook(book);
                    orderItem.setQuantity(itemDto.getQuantity());
                    orderItem.setPrice(itemDto.getPrice());
                    orderItem.setSubtotal(itemDto.getSubtotal());

                    return orderItem;
                })
                .collect(Collectors.toList());

        order.setOrderItems(orderItems);
        return order;
    }

    @Transactional
    public OrderDto save_order_mysql(Order order) {
        // 从 Kafka 反序列化后，User 对象可能是 detached 状态
        // 需要根据 userId 重新加载为 managed entity
        Long userId = null;
        
        // 优先从 userId 字段获取
        if (order.getUserId() != null) {
            userId = order.getUserId();
        }
        // 如果 userId 字段为空，尝试从 User 对象获取
        else if (order.getUser() != null && order.getUser().getId() != null) {
            userId = order.getUser().getId();
        }
        
        // 将 userId 赋值给 final 变量，以便在 lambda 中使用
        final Long finalUserId = userId;
        if (finalUserId != null) {
            // 重新加载 User 对象，确保它是 managed entity
            User user = userRepository.findById(finalUserId)
                    .orElseThrow(() -> new RuntimeException("用户不存在: " + finalUserId));
            order.setUser(user);
        } else {
            throw new RuntimeException("订单缺少用户信息 - userId字段: " + order.getUserId() + ", user对象: " + (order.getUser() != null ? order.getUser().getId() : "null"));
        }
        
        // 先保存 Order（不包含 OrderItems），这样会生成 ID
        List<OrderItem> orderItems = order.getOrderItems();
        order.setOrderItems(null); // 临时移除 OrderItems
        
        // 使用 saveAndFlush 确保 Order 立即持久化并获得 ID
        Order savedOrder = orderRepository.saveAndFlush(order);
        
        // 将 OrderItems 关联到已保存的 Order
        if (orderItems != null && !orderItems.isEmpty()) {
            for (OrderItem item : orderItems) {
                item.setOrder(savedOrder);
            }
            savedOrder.setOrderItems(orderItems);
            // 再次保存以级联保存 OrderItems
            savedOrder = orderRepository.save(savedOrder);
        }
        
        return new OrderDto(savedOrder);
    }

    @Override
    public List<OrderDto> getUserOrders() {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        return orderRepository.findByUserId(user.getId()).stream()
                .map(OrderDto::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(OrderDto::new)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        // 检查权限：只有订单所有者或管理员可以查看
        String username = getCurrentUsername();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        if (!order.getUser().getId().equals(currentUser.getId()) &&
                !currentUser.getRole().equals(User.UserRole.ADMIN)) {
            throw new RuntimeException("没有权限查看此订单");
        }

        return new OrderDto(order);
    }

    @Override
    @Transactional
    public OrderDto updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在"));

        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(orderStatus);
            Order savedOrder = orderRepository.save(order);
            return new OrderDto(savedOrder);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("无效的订单状态: " + status);
        }
    }

    // 安全地获取当前用户名
    private String getCurrentUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        System.out.println("DEBUG: Principal type: " + (principal != null ? principal.getClass().getName() : "null"));
        System.out.println("DEBUG: Principal value: " + principal);

        if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            System.out.println("DEBUG: Username from UserDetails: " + username);
            return username;
        } else {
            String username = principal.toString();
            System.out.println("DEBUG: Username from String: " + username);
            return username;
        }
    }
} 