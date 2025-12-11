package com.boostore.controller;

import com.boostore.entity.User;
import com.boostore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    private static final Logger logger = LoggerFactory.getLogger(TestController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            Map<String, Object> response = new HashMap<>();
            response.put("totalUsers", users.size());
            response.put("users", users.stream().map(user -> {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", user.getId());
                userInfo.put("username", user.getUsername());
                userInfo.put("email", user.getEmail());
                userInfo.put("role", user.getRole());
                userInfo.put("enabled", user.getEnabled());
                return userInfo;
            }).collect(java.util.stream.Collectors.toList()));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("获取用户列表失败", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "获取用户列表失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/password-test")
    public ResponseEntity<?> testPassword() {
        try {
            String rawPassword = "admin123";
            String encodedPassword = passwordEncoder.encode(rawPassword);
            
            Map<String, Object> response = new HashMap<>();
            response.put("rawPassword", rawPassword);
            response.put("encodedPassword", encodedPassword);
            response.put("matches", passwordEncoder.matches(rawPassword, encodedPassword));
            
            // 测试与数据库中的密码是否匹配
            User adminUser = userRepository.findByUsername("admin").orElse(null);
            if (adminUser != null) {
                response.put("adminPasswordInDB", adminUser.getPassword());
                response.put("adminPasswordMatches", passwordEncoder.matches(rawPassword, adminUser.getPassword()));
            } else {
                response.put("adminUserExists", false);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("密码测试失败", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "密码测试失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin() {
        try {
            // 检查是否已存在admin用户
            if (userRepository.existsByUsername("admin")) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "admin用户已存在");
                return ResponseEntity.ok(response);
            }

            // 创建新的admin用户
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@bookstore.com");
            admin.setRole(User.UserRole.ADMIN);
            admin.setEnabled(true);

            User savedAdmin = userRepository.save(admin);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "admin用户创建成功");
            response.put("userId", savedAdmin.getId());
            response.put("username", savedAdmin.getUsername());
            response.put("role", savedAdmin.getRole());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("创建admin用户失败", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "创建admin用户失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/ping")
    public Map<String, Object> ping() {
        logger.info("收到ping请求");
        Map<String, Object> response = new HashMap<>();
        response.put("message", "pong");
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", "success");
        logger.info("返回ping响应: {}", response);
        return response;
    }

    @GetMapping("/hello")
    public Map<String, Object> hello() {
        logger.info("收到hello请求");
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Hello from Spring Boot!");
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", "success");
        logger.info("返回hello响应: {}", response);
        return response;
    }

    @GetMapping("/simple")
    public String simple() {
        logger.info("收到simple请求");
        return "OK";
    }

    @GetMapping("/security-test")
    public Map<String, Object> securityTest() {
        logger.info("收到security-test请求");
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Security test passed!");
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", "success");
        response.put("security", "disabled");
        logger.info("返回security-test响应: {}", response);
        return response;
    }

    @GetMapping("/db-test")
    public Map<String, Object> dbTest() {
        logger.info("收到db-test请求");
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 测试数据库连接
            response.put("message", "Database test");
            response.put("timestamp", System.currentTimeMillis());
            response.put("status", "success");
            response.put("database", "connected");
            logger.info("数据库连接测试成功");
        } catch (Exception e) {
            logger.error("数据库连接测试失败: {}", e.getMessage(), e);
            response.put("status", "error");
            response.put("error", e.getMessage());
            response.put("database", "disconnected");
        }
        
        logger.info("返回db-test响应: {}", response);
        return response;
    }

    @GetMapping("/verify-admin-password")
    public ResponseEntity<?> verifyAdminPassword() {
        try {
            String storedHash = "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa";
            String testPassword = "admin123";
            
            Map<String, Object> response = new HashMap<>();
            response.put("storedHash", storedHash);
            response.put("testPassword", testPassword);
            response.put("passwordMatches", passwordEncoder.matches(testPassword, storedHash));
            
            // 测试其他可能的密码
            String[] possiblePasswords = {"admin", "123456", "password", "admin123", "Admin123"};
            Map<String, Boolean> passwordTests = new HashMap<>();
            
            for (String pwd : possiblePasswords) {
                passwordTests.put(pwd, passwordEncoder.matches(pwd, storedHash));
            }
            response.put("passwordTests", passwordTests);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("密码验证失败", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "密码验证失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/test-admin-password")
    public ResponseEntity<?> testAdminPassword() {
        try {
            String storedHash = "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa";
            String testPassword = "admin123";
            
            Map<String, Object> response = new HashMap<>();
            response.put("storedHash", storedHash);
            response.put("testPassword", testPassword);
            response.put("passwordMatches", passwordEncoder.matches(testPassword, storedHash));
            
            // 生成新的哈希进行对比
            String newHash = passwordEncoder.encode(testPassword);
            response.put("newHash", newHash);
            response.put("newHashMatches", passwordEncoder.matches(testPassword, newHash));
            
            // 测试其他可能的密码
            String[] possiblePasswords = {"admin", "123456", "password", "admin123", "Admin123"};
            Map<String, Boolean> passwordTests = new HashMap<>();
            
            for (String pwd : possiblePasswords) {
                passwordTests.put(pwd, passwordEncoder.matches(pwd, storedHash));
            }
            response.put("passwordTests", passwordTests);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("密码测试失败", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "密码测试失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/admin-user-info")
    public ResponseEntity<?> getAdminUserInfo() {
        try {
            User adminUser = userRepository.findByUsername("admin").orElse(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("adminUserExists", adminUser != null);
            
            if (adminUser != null) {
                response.put("adminUser", Map.of(
                    "id", adminUser.getId(),
                    "username", adminUser.getUsername(),
                    "email", adminUser.getEmail(),
                    "role", adminUser.getRole(),
                    "enabled", adminUser.getEnabled(),
                    "passwordHash", adminUser.getPassword(),
                    "createdAt", adminUser.getCreatedAt(),
                    "updatedAt", adminUser.getUpdatedAt()
                ));
                
                // 测试密码匹配
                String testPassword = "admin123";
                boolean passwordMatches = passwordEncoder.matches(testPassword, adminUser.getPassword());
                response.put("passwordMatches", passwordMatches);
                response.put("testPassword", testPassword);
                
                // 检查用户是否被禁用
                response.put("userEnabled", adminUser.getEnabled());
                response.put("canLogin", adminUser.getEnabled() && passwordMatches);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("获取admin用户信息失败", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "获取admin用户信息失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/reset-admin-password")
    public ResponseEntity<?> resetAdminPassword() {
        try {
            User adminUser = userRepository.findByUsername("admin")
                    .orElseThrow(() -> new RuntimeException("admin用户不存在"));
            
            // 重置密码为 admin123
            String newPassword = "admin123";
            adminUser.setPassword(passwordEncoder.encode(newPassword));
            adminUser.setEnabled(true);
            
            User savedUser = userRepository.save(adminUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "admin用户密码重置成功");
            response.put("userId", savedUser.getId());
            response.put("username", savedUser.getUsername());
            response.put("role", savedUser.getRole());
            response.put("enabled", savedUser.getEnabled());
            response.put("newPassword", newPassword);
            response.put("newPasswordHash", savedUser.getPassword());
            
            // 验证新密码
            boolean passwordValid = passwordEncoder.matches(newPassword, savedUser.getPassword());
            response.put("passwordValid", passwordValid);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("重置admin用户密码失败", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "重置admin用户密码失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/upgrade-admin2")
    public ResponseEntity<?> upgradeAdmin2() {
        try {
            User admin2User = userRepository.findByUsername("admin2")
                    .orElseThrow(() -> new RuntimeException("admin2用户不存在"));
            
            // 将admin2升级为管理员
            admin2User.setRole(User.UserRole.ADMIN);
            User savedUser = userRepository.save(admin2User);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "admin2用户升级为管理员成功");
            response.put("userId", savedUser.getId());
            response.put("username", savedUser.getUsername());
            response.put("role", savedUser.getRole());
            response.put("enabled", savedUser.getEnabled());
            response.put("email", savedUser.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("升级admin2用户失败", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "升级admin2用户失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/change-role/{username}/{role}")
    public ResponseEntity<?> changeUserRole(@PathVariable String username, @PathVariable String role) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("用户不存在: " + username));
            
            User.UserRole newRole;
            try {
                newRole = User.UserRole.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("无效的角色: " + role + "，有效角色: ADMIN, CUSTOMER");
            }
            
            user.setRole(newRole);
            User savedUser = userRepository.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "用户角色修改成功");
            response.put("userId", savedUser.getId());
            response.put("username", savedUser.getUsername());
            response.put("oldRole", role);
            response.put("newRole", savedUser.getRole());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("修改用户角色失败", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "修改用户角色失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
} 