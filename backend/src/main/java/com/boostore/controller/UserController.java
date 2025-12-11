package com.boostore.controller;

import com.boostore.dto.LoginRequest;
import com.boostore.entity.User;
import com.boostore.repository.UserRepository;
import com.boostore.service.impl.SessionTimerService;
import com.boostore.dto.RegisterRequest;
import com.boostore.dto.UserDto;
import com.boostore.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private SessionTimerService sessionTimerService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        logger.info("收到注册请求: 用户名={}, 邮箱={}", request.getUsername(), request.getEmail());
        
        try {
            // 验证请求数据
            logger.info("验证请求数据...");
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                throw new RuntimeException("用户名不能为空");
            }
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                throw new RuntimeException("邮箱不能为空");
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                throw new RuntimeException("密码不能为空");
            }
            
            logger.info("请求数据验证通过，开始注册...");
            UserDto user = userService.register(request);
            logger.info("注册成功: 用户ID={}, 用户名={}", user.getId(), user.getUsername());
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            logger.error("注册失败 (RuntimeException): {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("type", "validation_error");
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            logger.error("注册失败 (Exception): {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "服务器内部错误: " + e.getMessage());
            error.put("type", "server_error");
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        System.out.println("=== Controller Login 开始 ===");
        System.out.println("请求 Session ID: " + (session != null ? session.getId() : "null"));

        try {
            // 先在 Controller 层启动计时器（确保有 Session 上下文）
            System.out.println("🟢 在 Controller 层启动计时器");
            sessionTimerService.startTimer();

            // 然后调用 Service 登录逻辑
            String token = userService.login(request);

            // 直接从数据库获取用户信息
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("用户不存在"));

            UserDto userDto = convertToDto(user);

            // 获取计时器信息
            String timerStatus = sessionTimerService.isTimerRunning() ? "运行中" : "未运行";
            String sessionId = sessionTimerService.getCurrentSessionId();
            LocalDateTime loginTime = sessionTimerService.getLoginTime();

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", userDto);
            response.put("sessionInfo", Map.of(
                    "sessionId", sessionId,
                    "timerStatus", timerStatus,
                    "loginTime", loginTime,
                    "message", "会话计时器已启动"
            ));

            System.out.println("✅ 登录成功: " + userDto.getUsername());
            System.out.println("⏰ 计时器状态: " + timerStatus);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ 登录失败: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
// 添加转换方法
    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name()); // 将枚举转换为字符串
        dto.setEnabled(user.getEnabled());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }

    @GetMapping("/debug-timer")
    public ResponseEntity<?> debugTimer(HttpSession session) {
        System.out.println("=== 调试计时器 ===");
        System.out.println("请求 Session ID: " + (session != null ? session.getId() : "null"));

        Map<String, Object> response = new HashMap<>();

        if (sessionTimerService != null) {
            response.put("sessionTimerService", "已注入");
            response.put("currentSessionId", sessionTimerService.getCurrentSessionId());
            response.put("isTimerRunning", sessionTimerService.isTimerRunning());
            response.put("loginTime", sessionTimerService.getLoginTime());
            response.put("sessionIdMatch", session != null &&
                    session.getId().equals(sessionTimerService.getCurrentSessionId()));
        } else {
            response.put("sessionTimerService", "未注入");
        }

        response.put("requestSessionId", session != null ? session.getId() : "null");
        response.put("timestamp", LocalDateTime.now().toString());

        return ResponseEntity.ok(response);
    }


    @GetMapping("/current")
    public ResponseEntity<?> getCurrentUser() {
        try {
            UserDto user = userService.getCurrentUser();
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId, @RequestParam Boolean enabled) {
        try {
            UserDto user = userService.updateUserStatus(userId, enabled);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/check-username")
    public ResponseEntity<Map<String, Boolean>> checkUsername(@RequestParam String username) {
        boolean exists = userService.existsByUsername(username);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "测试接口正常工作");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session, HttpServletRequest request) {
        System.out.println("=== 登出控制器开始 ===");

        Map<String, Object> response = new HashMap<>();

        try {
            System.out.println("停止计时器...");
            String sessionDuration = sessionTimerService.stopTimer();
            System.out.println("会话时长: " + sessionDuration);

            if (session != null) {
                session.invalidate();
            }

            // 返回完整的会话信息
            response.put("success", true);
            response.put("message", "登出成功");
            response.put("sessionDuration", sessionDuration);
            response.put("logoutTime", LocalDateTime.now().toString());
            response.put("log", "计时器结束 - 会话时长: " + sessionDuration);

            System.out.println("=== 登出控制器完成 ===");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("登出错误: " + e.getMessage());
            response.put("success", false);
            response.put("message", "登出失败: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        try {
            long userCount = userService.count();
            Map<String, Object> response = new HashMap<>();
            response.put("status", "healthy");
            response.put("database", "connected");
            response.put("userCount", userCount);
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("健康检查失败: {}", e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "unhealthy");
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(500).body(response);
        }
    }
} 