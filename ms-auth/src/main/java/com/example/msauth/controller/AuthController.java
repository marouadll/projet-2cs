package com.example.msauth.controller;




import com.example.msauth.model.User;
import com.example.msauth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<User> signup(@RequestBody User user, @RequestParam String confirmPassword) {
        return ResponseEntity.ok(userService.signup(user, confirmPassword));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestParam String email, @RequestParam String password) {
        return ResponseEntity.ok(userService.login(email, password));
    }

    @PostMapping("/reset-password-request")
    public ResponseEntity<String> resetPasswordRequest(@RequestParam String email) {
        try {
            userService.resetPasswordRequest(email);
            return ResponseEntity.ok("Email de réinitialisation envoyé");
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur interne : " + e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String code, @RequestParam String newPassword) {
        try {
            userService.resetPassword(code, newPassword);
            return ResponseEntity.ok("Mot de passe réinitialisé avec succès");
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur interne : " + e.getMessage());
        }
    }

    @PostMapping("/signout")
    public ResponseEntity<String> signout(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7); // Supprime "Bearer "
            }
            userService.signout(token);
            return ResponseEntity.ok("Déconnexion réussie");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur lors de la déconnexion : " + e.getMessage());
        }
    }
}