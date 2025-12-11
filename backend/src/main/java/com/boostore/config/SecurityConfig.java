package com.boostore.config;

import com.boostore.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                // 启用 CORS 并禁用 CSRF
                .cors().and()
                .csrf().disable()

                // Session 管理
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .and()

                // 授权配置
                .authorizeRequests()
                // 首先允许所有 OPTIONS 请求（CORS 预检）
                .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // 公开接口 - 按方法明确指定
                .antMatchers(HttpMethod.POST, "/api/users/login").permitAll()
                .antMatchers(HttpMethod.POST, "/api/users/register").permitAll()
                .antMatchers(HttpMethod.POST, "/api/users/logout").permitAll()  // 明确允许登出
                .antMatchers(HttpMethod.GET, "/api/users/test").permitAll()
                .antMatchers(HttpMethod.GET, "/api/users/health").permitAll()
                .antMatchers(HttpMethod.GET, "/api/users/check-username").permitAll()
                .antMatchers(HttpMethod.GET, "/api/users/check-email").permitAll()

                // 其他公开路径
                .antMatchers("/api/auth/**").permitAll()
                .antMatchers("/api/test/**").permitAll()
                .antMatchers("/api/books/**").permitAll()
                .antMatchers("/api/statistics/**").permitAll()

                // 需要认证的接口
                .antMatchers("/api/users/current").authenticated()
                .antMatchers("/api/orders/**").authenticated()

                // 管理员接口
                .antMatchers("/api/users").hasRole("ADMIN")
                .antMatchers("/api/users/*/status").hasRole("ADMIN")

                // 其他所有请求需要认证
                .anyRequest().authenticated()
                .and()

                // 添加请求日志过滤器（用于调试）
                .addFilterBefore(new RequestLoggingFilter(), UsernamePasswordAuthenticationFilter.class)

                // 添加 JWT 过滤器
                .addFilterBefore(new JwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 允许的来源
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));

        // 允许的方法
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));

        // 允许的头部
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "X-Requested-With", "Accept",
                "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"
        ));

        // 允许凭证
        configuration.setAllowCredentials(true);

        // 预检请求缓存时间
        configuration.setMaxAge(3600L);

        // 暴露的头部
        configuration.setExposedHeaders(Arrays.asList(
                "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"
        ));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * JWT 认证过滤器
     */
    public class JwtAuthenticationFilter extends OncePerRequestFilter {

        // 定义不需要 JWT 验证的路径
        private static final List<String> EXCLUDED_PATHS = Arrays.asList(
                "/api/users/login",
                "/api/users/register",
                "/api/users/logout",
                "/api/users/test",
                "/api/users/health",
                "/api/users/check-username",
                "/api/users/check-email"
        );

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
                throws ServletException, IOException {

            String path = request.getServletPath();
            String method = request.getMethod();

            // 允许 OPTIONS 请求通过（CORS 预检）
            if ("OPTIONS".equalsIgnoreCase(method)) {
                System.out.println("✅ 允许 OPTIONS 预检请求: " + path);
                chain.doFilter(request, response);
                return;
            }

            System.out.println("=== JWT 过滤器 ===");
            System.out.println("路径: " + path);
            System.out.println("方法: " + method);
            System.out.println("是否排除: " + isExcludedPath(path));

            // 检查是否为排除路径
            if (isExcludedPath(path)) {
                System.out.println("✅ 跳过 JWT 验证: " + path);
                chain.doFilter(request, response);
                return;
            }

            System.out.println("🔐 进行 JWT 验证: " + path);

            final String authorizationHeader = request.getHeader("Authorization");

            String username = null;
            String jwt = null;

            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                jwt = authorizationHeader.substring(7);
                username = jwtUtil.extractUsername(jwt);
                System.out.println("JWT 用户: " + username);
            } else {
                System.out.println("无 Authorization header 或格式不正确");
            }

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    usernamePasswordAuthenticationToken
                            .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                    System.out.println("✅ JWT 验证成功");
                } else {
                    System.out.println("❌ JWT 验证失败");
                }
            }

            chain.doFilter(request, response);
        }

        private boolean isExcludedPath(String path) {
            // 精确匹配排除路径
            return EXCLUDED_PATHS.contains(path);
        }
    }

    /**
     * 请求日志过滤器 - 用于调试
     */
    private static class RequestLoggingFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                throws ServletException, IOException {

            String method = request.getMethod();
            String path = request.getServletPath();
            String query = request.getQueryString();

            System.out.println("=== Security 请求日志 ===");
            System.out.println("方法: " + method);
            System.out.println("路径: " + path);
            System.out.println("查询: " + (query != null ? query : "无"));
            System.out.println("来源: " + request.getHeader("Origin"));

            // 特别检查登出请求和 OPTIONS 请求
            if ("POST".equals(method) && "/api/users/logout".equals(path)) {
                System.out.println("🎯 检测到登出请求！");
                System.out.println("Cookies:");
                Cookie[] cookies = request.getCookies();
                if (cookies != null) {
                    for (Cookie cookie : cookies) {
                        System.out.println("  " + cookie.getName() + ": " + cookie.getValue());
                    }
                } else {
                    System.out.println("  无Cookies");
                }
            } else if ("OPTIONS".equals(method)) {
                System.out.println("🔄 检测到 OPTIONS 预检请求");
            }

            System.out.println("========================");

            filterChain.doFilter(request, response);
        }
    }
}