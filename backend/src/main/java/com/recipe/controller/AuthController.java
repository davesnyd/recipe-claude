package com.recipe.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.recipe.model.User;
import com.recipe.security.JwtTokenProvider;
import com.recipe.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AuthController {

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    @PostMapping("/google")
    public ResponseEntity<Map<String, Object>> authenticateGoogle(@RequestBody Map<String, String> request) {
        System.out.println("AuthController: /auth/google endpoint called");
        System.out.println("AuthController: Request body: " + request);
        System.out.println("AuthController: Google Client ID configured: " + googleClientId);
        
        try {
            String idTokenString = request.get("idToken");
            System.out.println("AuthController: Extracted idToken: " + (idTokenString != null ? idTokenString.substring(0, Math.min(50, idTokenString.length())) + "..." : "null"));
            
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();

                // Get or create user
                User user = userService.getOrCreateUser(email);

                // Create authentication token
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                    email, null, Collections.emptyList());
                String jwt = tokenProvider.generateToken(authentication);

                Map<String, Object> response = new HashMap<>();
                response.put("token", jwt);
                
                // Create a simplified user object to avoid serialization issues
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("username", user.getUsername());
                userMap.put("userId", user.getUserId());
                userMap.put("measurementPreference", user.getMeasurementPreference());
                
                response.put("user", userMap);
                
                System.out.println("AuthController: Successfully prepared response with token and user data");

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid ID token"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Authentication failed: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.getUserByUsername(username).orElse(null);
        if (user != null) {
            // Create a simplified user object to avoid serialization issues
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("username", user.getUsername());
            userMap.put("userId", user.getUserId());
            userMap.put("measurementPreference", user.getMeasurementPreference());
            
            return ResponseEntity.ok(userMap);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/me")
    public ResponseEntity<Map<String, Object>> updateCurrentUser(@RequestBody Map<String, String> userUpdate, Authentication authentication) {
        String username = authentication.getName();
        User user = userService.getUserByUsername(username).orElse(null);
        if (user != null) {
            String measurementPref = userUpdate.get("measurementPreference");
            if (measurementPref != null) {
                user.setMeasurementPreference(User.MeasurementSystem.valueOf(measurementPref));
            }
            User updatedUser = userService.updateUser(user);
            
            // Create a simplified user object to avoid serialization issues
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("username", updatedUser.getUsername());
            userMap.put("userId", updatedUser.getUserId());
            userMap.put("measurementPreference", updatedUser.getMeasurementPreference());
            
            return ResponseEntity.ok(userMap);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}