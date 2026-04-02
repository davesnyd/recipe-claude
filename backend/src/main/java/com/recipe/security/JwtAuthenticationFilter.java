package com.recipe.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        System.out.println("JwtAuthenticationFilter: Processing " + method + " " + requestURI);
        
        try {
            String jwt = getJwtFromRequest(request);
            System.out.println("JwtAuthenticationFilter: JWT from request: " + (jwt != null ? jwt.substring(0, Math.min(50, jwt.length())) + "..." : "null"));

            if (StringUtils.hasText(jwt)) {
                System.out.println("JwtAuthenticationFilter: JWT present, validating...");
                boolean isValid = tokenProvider.validateToken(jwt);
                System.out.println("JwtAuthenticationFilter: JWT validation result: " + isValid);
                
                if (isValid) {
                    String username = tokenProvider.getUsernameFromToken(jwt);
                    System.out.println("JwtAuthenticationFilter: Username from token: " + username);

                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(username, null, new ArrayList<>());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("JwtAuthenticationFilter: Authentication set in security context");
                } else {
                    System.out.println("JwtAuthenticationFilter: Invalid JWT token");
                }
            } else {
                System.out.println("JwtAuthenticationFilter: No JWT token found in request");
            }
        } catch (Exception ex) {
            System.out.println("JwtAuthenticationFilter: Exception occurred: " + ex.getMessage());
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}