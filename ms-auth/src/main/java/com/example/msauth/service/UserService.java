package com.example.msauth.service;


import com.example.msauth.model.User;
import com.example.msauth.repository.UserRepository;
import com.example.msauth.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.example.msauth.util.JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // Inscription d'un nouvel utilisateur
    public User signup(User user, String confirmPassword) {
        if (!user.getPassword().equals(confirmPassword)) {
            throw new RuntimeException("Les mots de passe ne correspondent pas");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // Connexion d'un utilisateur
    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        return jwtUtil.generateToken(email);
    }

    // Générer un code à 6 chiffres
    private String generateResetCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // Génère un nombre entre 100000 et 999999
        return String.valueOf(code);
    }

    // Demande de réinitialisation avec code
    public void resetPasswordRequest(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        String resetCode = generateResetCode();
        user.setResetPasswordToken(resetCode); // Stocke le code dans le même champ
        user.setResetPasswordExpires(System.currentTimeMillis() + 3600000); // Expire dans 1 heure
        userRepository.save(user);

        System.out.println("Code généré : " + resetCode); // Pour débogage
        emailService.sendResetPasswordEmail(email, resetCode);
    }

    // Réinitialisation avec code
    public void resetPassword(String code, String newPassword) {
        User user = userRepository.findByResetPasswordToken(code)
                .orElseThrow(() -> new RuntimeException("Code invalide"));

        if (user.getResetPasswordExpires() < System.currentTimeMillis()) {
            throw new RuntimeException("Code expiré");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null); // Réinitialise le code
        user.setResetPasswordExpires(null); // Réinitialise l'expiration
        userRepository.save(user);
    }
    public void signout(String token) {
        // Optionnel : Ajouter une logique pour invalider le token (ex. liste noire)
        System.out.println("Déconnexion pour le token : " + token);
        // Dans une implémentation stateless, rien n'est fait côté serveur
    }
}