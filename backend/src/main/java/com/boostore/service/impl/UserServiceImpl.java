package com.boostore.service.impl;

import com.boostore.dto.LoginRequest;
import com.boostore.dto.RegisterRequest;
import com.boostore.service.impl.SessionTimerService;
import com.boostore.dto.UserDto;
import com.boostore.entity.User;
import com.boostore.repository.UserRepository;
import com.boostore.service.UserService;
import com.boostore.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SessionTimerService sessionTimerService;

    private Collection<? extends GrantedAuthority> getAuthorities(User.UserRole role) {
        // 使用 role.name() 来获取枚举的字符串表示
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public UserDto register(RegisterRequest request) {
        logger.info("开始注册用户: {}", request.getUsername());
        
        try {
            // 检查数据库连接
            logger.info("检查数据库连接...");
            try {
                userRepository.count(); // 简单的数据库连接测试
                logger.info("数据库连接正常");
            } catch (Exception e) {
                logger.error("数据库连接失败: {}", e.getMessage(), e);
                throw new RuntimeException("数据库连接失败，请检查数据库服务是否启动");
            }
            
            // 检查密码一致性
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                logger.error("密码不一致: {} != {}", request.getPassword(), request.getConfirmPassword());
                throw new RuntimeException("两次输入的密码不一致");
            }

            // 检查用户名是否已存在
            logger.info("检查用户名是否已存在: {}", request.getUsername());
            if (existsByUsername(request.getUsername())) {
                logger.error("用户名已存在: {}", request.getUsername());
                throw new RuntimeException("用户名已存在");
            }

            // 检查邮箱是否已存在
            logger.info("检查邮箱是否已存在: {}", request.getEmail());
            if (existsByEmail(request.getEmail())) {
                logger.error("邮箱已存在: {}", request.getEmail());
                throw new RuntimeException("邮箱已存在");
            }

            // 创建新用户
            logger.info("创建新用户对象...");
            User user = new User();
            user.setUsername(request.getUsername());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setEmail(request.getEmail());
            user.setRole(User.UserRole.CUSTOMER);
            user.setEnabled(true);

            logger.info("准备保存用户到数据库: {}", user.getUsername());
            
            // 保存到数据库
            User savedUser = userRepository.save(user);
            
            logger.info("用户注册成功，ID: {}, 用户名: {}", savedUser.getId(), savedUser.getUsername());
            
            return convertToDto(savedUser);
        } catch (RuntimeException e) {
            logger.error("注册失败 (RuntimeException): {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("注册失败 (Exception): {}", e.getMessage(), e);
            throw new RuntimeException("注册过程中发生未知错误: " + e.getMessage());
        }
    }

    @Override
    public String login(LoginRequest request) {
        logger.info("开始登录验证: 用户名={}", request.getUsername());

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    logger.error("用户不存在: {}", request.getUsername());
                    return new RuntimeException("用户名或密码错误");
                });

        logger.info("找到用户: ID={}, 用户名={}, 角色={}, 启用状态={}",
                user.getId(), user.getUsername(), user.getRole(), user.getEnabled());

        if (!user.getEnabled()) {
            logger.error("用户已被禁用: {}", user.getUsername());
            throw new RuntimeException("您的账号已经被禁用");
        }

        logger.info("开始验证密码...");
        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        logger.info("密码验证结果: {}", passwordMatches);

        if (!passwordMatches) {
            logger.error("密码验证失败: 用户名={}", request.getUsername());
            throw new RuntimeException("用户名或密码错误");
        }

        logger.info("登录成功，生成JWT token: 用户名={}", user.getUsername());

        // 添加详细的调试信息
        System.out.println("=== 开始启动计时器 ===");
        System.out.println("SessionTimerService 实例: " + (sessionTimerService != null ? "非空" : "NULL"));

        if (sessionTimerService != null) {
            System.out.println("当前 Session ID: " + sessionTimerService.getCurrentSessionId());
            System.out.println("启动前计时器状态: " + (sessionTimerService.isTimerRunning() ? "运行中" : "未运行"));
        }

        // 启动计时器
        sessionTimerService.startTimer();

        // 验证启动结果
        if (sessionTimerService != null) {
            System.out.println("启动后计时器状态: " + (sessionTimerService.isTimerRunning() ? "运行中" : "未运行"));
            System.out.println("登录时间: " + sessionTimerService.getLoginTime());
            System.out.println("=== 计时器启动完成 ===");
        }

        return jwtUtil.generateToken(user.getUsername());
    }

    @Override
    public UserDto getCurrentUser() {
        String username = getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return convertToDto(user);
    }

    // 安全地获取当前用户名
    private String getCurrentUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
    }

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto updateUserStatus(Long userId, Boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        user.setEnabled(enabled);
        User savedUser = userRepository.save(user);
        return convertToDto(savedUser);
    }

    @Override
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return convertToDto(user);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public long count() {
        return userRepository.count();
    }

    private UserDto convertToDto(User user) {
        return new UserDto(user);
    }
} 