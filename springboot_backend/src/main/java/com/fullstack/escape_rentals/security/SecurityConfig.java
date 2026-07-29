package com.fullstack.escape_rentals.security;

// Stateless route protection rules (Guest/Host/Admin)

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex ->
                        ex.authenticationEntryPoint(jwtAuthenticationEntryPoint)
                                .accessDeniedHandler(customAccessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/auth/**"
                        )
                        .permitAll()
                        .requestMatchers(
                                HttpMethod.GET,
                                "/",
                                "/api/properties",
                                "/api/properties/*",
                                "/api/properties/search",
                                "/api/categories",
                                "/api/categories/*",
                                "/api/reviews/**",
                                // Narrowly scoped on purpose: "/api/comments/**" would also
                                // have matched "/api/comments/admin", making the admin
                                // moderation listing publicly readable.
                                "/api/comments/property/*",
                                "/api/comments/*/replies",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**")
                        .permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/payments/webhook/**",
                                "/api/contact")
                        .permitAll()

                        // User endpoints
                        .requestMatchers(
                                "/api/bookings",
                                "/api/bookings/**",
                                "/api/payments/**",
                                "/api/profile/**",
                                "/api/users/**",
                                "/api/notifications/**"
                        ).hasAnyRole("USER","ADMIN","HOST")


                        // Host endpoints
                        .requestMatchers("/api/host/**")
                        .hasRole("HOST")

                        // Admin endpoints
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // Everything else
                        .anyRequest()
                        .authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}

