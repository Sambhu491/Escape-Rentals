package com.fullstack.escape_rentals.security;

// Intercepts requests, validates Bearer tokens

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        // If No JWT present
        if(authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request,response);
            return;
        }
        String token = authHeader.substring(7);

//        String jwt = null;
//
//        Cookie[] cookies = request.getCookies();
//
//        if(cookies!=null) {
//            for(Cookie cookie : cookies) {
//                if("token".equals(cookie.getName())) {
//                    jwt = cookie.getValue();
//                    break;
//                }
//            }
//        }
//
//        if(jwt == null) {
//            filterChain.doFilter(request, response);
//            return;
//        }

        try {

            String email = jwtService.extractUsername(token);
            if(email != null &&
                    SecurityContextHolder.getContext()
                            .getAuthentication() == null) {
                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(email);

                if(jwtService.isTokenValid(token,userDetails)) {

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(auth);
                }
            }
        } catch (DisabledException e){

            response.setContentType("application/json");
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);

            response.getWriter().write("""
            {
              "error":"Forbidden",
              "message":"Account disabled by administrator"
            }
            """);

            return;

        } catch (Exception e) {

            // Invalid JWT
            // Clear authentication and continue
            SecurityContextHolder.clearContext();
        }
        filterChain.doFilter(request,response);
    }
}




