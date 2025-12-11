-- 创建数据库
CREATE DATABASE IF NOT EXISTS bookstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bookstore;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('ADMIN', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建书籍表
CREATE TABLE IF NOT EXISTS books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    cover_image VARCHAR(500) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    publisher VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建订单项表
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

-- 插入管理员用户 (密码: admin123)
INSERT INTO users (username, password, email, role, enabled) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'admin@bookstore.com', 'ADMIN', true);

-- 插入测试用户 (密码: user123)
INSERT INTO users (username, password, email, role, enabled) VALUES 
('user', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'user@bookstore.com', 'CUSTOMER', true);

-- 插入示例书籍
INSERT INTO books (title, author, isbn, description, cover_image, price, stock, publisher) VALUES 
-- 技术类书籍
('Java编程思想', 'Bruce Eckel', '9787111213826', 'Java编程的经典著作，深入浅出地介绍了Java编程的核心概念和高级特性。本书涵盖了面向对象编程、异常处理、多线程、网络编程等Java编程的重要主题。', 'https://img3.doubanio.com/view/subject/l/public/s27237850.jpg', 108.00, 50, '机械工业出版社'),
('Spring实战', 'Craig Walls', '9787115417305', 'Spring框架的实战指南，涵盖了Spring Boot、Spring Security等核心组件。本书通过实际项目案例，详细讲解了Spring框架的使用方法和最佳实践。', 'https://img2.doubanio.com/view/subject/l/public/s29418322.jpg', 89.00, 30, '人民邮电出版社'),
('算法导论', 'Thomas H.Cormen', '9787111187776', '计算机算法的经典教材，涵盖了各种重要的算法和数据结构。本书是计算机科学领域的权威教材，适合算法学习和研究。', 'https://img1.doubanio.com/view/subject/l/public/s1959967.jpg', 128.00, 25, '机械工业出版社'),
('设计模式', 'Erich Gamma', '9787111075752', '软件开发中常用的23种设计模式，是面向对象设计的经典参考。本书详细介绍了每种设计模式的使用场景和实现方法。', 'https://img2.doubanio.com/view/subject/l/public/s1074361.jpg', 79.00, 40, '机械工业出版社'),
('深入理解计算机系统', 'Randal E. Bryant', '9787111321330', '从程序员的角度理解计算机系统，涵盖硬件、操作系统、编译器等。本书帮助读者建立对计算机系统的全面认识。', 'https://img3.doubanio.com/view/subject/l/public/s29195878.jpg', 139.00, 35, '机械工业出版社'),

-- 文学类书籍
('百年孤独', '加西亚·马尔克斯', '9787544253994', '魔幻现实主义文学的代表作，讲述了布恩迪亚家族七代人的传奇故事。本书融合了拉丁美洲的历史与现实，是一部具有世界影响力的文学巨著。', 'https://img2.doubanio.com/view/subject/l/public/s6384944.jpg', 55.00, 60, '南海出版公司'),
('活着', '余华', '9787506365437', '一部描写中国农村生活的现实主义小说，讲述了福贵的人生故事。本书深刻反映了中国社会的变迁和普通人的命运。', 'https://img1.doubanio.com/view/subject/l/public/s27279654.jpg', 35.00, 80, '作家出版社'),
('红楼梦', '曹雪芹', '9787020002207', '中国古典四大名著之一，描写了贾宝玉和林黛玉的爱情悲剧。本书是中国古典文学的巅峰之作，具有极高的文学价值和历史价值。', 'https://img3.doubanio.com/view/subject/l/public/s1070959.jpg', 59.80, 45, '人民文学出版社'),
('三体', '刘慈欣', '9787536692930', '中国科幻文学的代表作，讲述了地球文明与三体文明的星际冲突。本书获得了世界科幻文学最高奖项雨果奖。', 'https://img1.doubanio.com/view/subject/l/public/s2768378.jpg', 68.00, 55, '重庆出版社'),
('白鹿原', '陈忠实', '9787544253995', '一部描写陕西关中平原农村生活的长篇小说，展现了从清末到建国初期半个世纪的历史变迁。', 'https://img2.doubanio.com/view/subject/l/public/s24514468.jpg', 45.00, 40, '人民文学出版社'),
('平凡的世界', '路遥', '9787530216781', '一部描写中国农村青年奋斗历程的现实主义小说，展现了普通人在时代变迁中的命运和追求。', 'https://img1.doubanio.com/view/subject/l/public/s27237850.jpg', 88.00, 65, '北京十月文艺出版社'),
('围城', '钱钟书', '9787020024759', '一部讽刺小说，描写了方鸿渐的人生经历，深刻揭示了人性的弱点和社会的荒诞。', 'https://img3.doubanio.com/view/subject/l/public/s1070222.jpg', 39.00, 50, '人民文学出版社'),
('边城', '沈从文', '9787020008784', '一部描写湘西风土人情的乡土小说，讲述了翠翠和傩送的爱情故事，展现了湘西的美丽风光和淳朴民风。', 'https://img2.doubanio.com/view/subject/l/public/s1595553.jpg', 25.00, 70, '人民文学出版社'),
('骆驼祥子', '老舍', '9787020008739', '一部描写北京人力车夫祥子悲惨命运的小说，深刻反映了旧中国社会的黑暗和底层人民的苦难。', 'https://img1.doubanio.com/view/subject/l/public/s1070959.jpg', 28.00, 55, '人民文学出版社'),
('呐喊', '鲁迅', '9787020008722', '鲁迅的第一部小说集，收录了《狂人日记》、《孔乙己》、《药》等经典作品，深刻揭露了封建社会的黑暗。', 'https://img3.doubanio.com/view/subject/l/public/s1070959.jpg', 32.00, 60, '人民文学出版社'),
('城南旧事', '林海音', '9787020008746', '一部描写北京城南生活的自传体小说，通过小英子的视角展现了老北京的风土人情。', 'https://img2.doubanio.com/view/subject/l/public/s1595553.jpg', 30.00, 45, '人民文学出版社'),
('茶馆', '老舍', '9787020008753', '一部三幕话剧，通过茶馆的兴衰反映了中国社会的变迁，是老舍戏剧创作的代表作。', 'https://img1.doubanio.com/view/subject/l/public/s1070959.jpg', 26.00, 50, '人民文学出版社'),
('雷雨', '曹禺', '9787020008760', '一部四幕话剧，描写了周、鲁两个家庭的悲剧，深刻揭示了封建家庭的罪恶。', 'https://img3.doubanio.com/view/subject/l/public/s1070959.jpg', 24.00, 40, '人民文学出版社'),
('家', '巴金', '9787020008777', '《激流三部曲》的第一部，描写了高家封建大家庭的没落过程，展现了青年一代的觉醒和反抗。', 'https://img2.doubanio.com/view/subject/l/public/s1070959.jpg', 36.00, 55, '人民文学出版社'); 