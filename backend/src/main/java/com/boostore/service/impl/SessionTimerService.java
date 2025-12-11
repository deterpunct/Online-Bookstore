package com.boostore.service.impl;

import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Service;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Duration;
import java.time.LocalDateTime;
import javax.servlet.http.HttpSession;

@Service
@Scope(value = WebApplicationContext.SCOPE_SESSION, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class SessionTimerService {

    private LocalDateTime loginTime;
    private LocalDateTime logoutTime;
    private boolean isTimerRunning = false;
    private String sessionId;

    public SessionTimerService() {
        // 获取当前session ID
        ServletRequestAttributes attr = (ServletRequestAttributes)
                RequestContextHolder.currentRequestAttributes();
        HttpSession session = attr.getRequest().getSession(true);
        this.sessionId = session.getId();
        System.out.println("SessionTimerService created for session: " + this.sessionId);
    }

    /**
     * 初始化并开始计时器
     */
    /**
     * 初始化并开始计时器
     */
    public void startTimer() {
        System.out.println("=== SessionTimerService.startTimer() 调用 ===");
        System.out.println("当前 Session ID: " + this.sessionId);
        System.out.println("调用前 isTimerRunning: " + this.isTimerRunning);

        this.loginTime = LocalDateTime.now();
        this.isTimerRunning = true;

        System.out.println("调用后 isTimerRunning: " + this.isTimerRunning);
        System.out.println("登录时间设置: " + this.loginTime);
        System.out.println("计时器开始 - Session: " + sessionId + ", Time: " + loginTime);
        System.out.println("=== startTimer() 完成 ===");
    }

    /**
     * 停止计时器并返回计时值
     * @return 格式化的计时时间字符串
     */
    public String stopTimer() {
        if (!isTimerRunning) {
            return "计时器未运行 - Session: " + sessionId;
        }

        this.logoutTime = LocalDateTime.now();
        this.isTimerRunning = false;

        Duration duration = Duration.between(loginTime, logoutTime);
        String sessionDuration = formatDuration(duration);

        System.out.println("计时器结束 - Session: " + sessionId);
        System.out.println("登录时间: " + loginTime);
        System.out.println("登出时间: " + logoutTime);
        System.out.println("会话时长: " + sessionDuration);

        return sessionDuration;
    }

    /**
     * 格式化持续时间
     */
    private String formatDuration(Duration duration) {
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        long seconds = duration.toSecondsPart();

        if (hours > 0) {
            return String.format("%d小时%d分钟%d秒", hours, minutes, seconds);
        } else if (minutes > 0) {
            return String.format("%d分钟%d秒", minutes, seconds);
        } else {
            return String.format("%d秒", seconds);
        }
    }

    /**
     * 获取当前session ID
     */
    public String getCurrentSessionId() {
        return this.sessionId;
    }

    public boolean isTimerRunning() {
        return isTimerRunning;
    }

    public LocalDateTime getLoginTime() {
        return loginTime;
    }
}