package com.example.msauth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Envoie un email avec un code de réinitialisation de mot de passe.
     * @param to Adresse email du destinataire
     * @param code Code à 6 chiffres à envoyer
     */
    public void sendResetPasswordEmail(String to, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Réinitialisation de votre mot de passe");
            message.setText("Bonjour,\n\n" +
                    "Vous avez demandé à réinitialiser votre mot de passe. " +
                    "Utilisez le code suivant pour procéder :\n\n" +
                    "Code : " + code + "\n\n" +
                    "Ce code est valide pendant 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.\n\n" +
                    "Cordialement,\nL'équipe Auth Service");
            mailSender.send(message);
            System.out.println("Email envoyé avec succès à : " + to);
        } catch (MailException e) {
            System.out.println("Erreur lors de l'envoi de l'email : " + e.getMessage());
            throw new RuntimeException("Échec de l'envoi de l'email : " + e.getMessage());
        }
    }
}