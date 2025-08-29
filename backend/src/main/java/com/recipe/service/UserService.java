package com.recipe.service;

import com.recipe.model.User;
import com.recipe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User createUser(String username, User.MeasurementSystem measurementPreference) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("User already exists: " + username);
        }
        
        User user = new User(username, measurementPreference);
        return userRepository.save(user);
    }

    public User getOrCreateUser(String username) {
        Optional<User> existingUser = userRepository.findByUsername(username);
        if (existingUser.isPresent()) {
            return existingUser.get();
        }
        
        // Default to Imperial for new users
        return createUser(username, User.MeasurementSystem.Imperial);
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    public boolean userExists(String username) {
        return userRepository.existsByUsername(username);
    }
}