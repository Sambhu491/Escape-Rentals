package com.fullstack.escape_rentals.notification.gmail;


//import com.google.api.services.gmail.GmailScopes;
//import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
//import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
//import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
//import java.util.Collections;
//import com.google.api.client.util.store.FileDataStoreFactory;
//import java.io.File;
//import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
//import java.io.InputStream;
//import java.io.InputStreamReader;

import com.google.api.client.auth.oauth2.Credential;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.gmail.Gmail;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.api.services.gmail.model.Message;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import java.io.ByteArrayOutputStream;
import java.util.Properties;
import java.util.Base64;

@Service
public class GmailService {

    private static final String APPLICATION_NAME = "Escape Rentals";
    private static final JacksonFactory JSON_FACTORY =
            JacksonFactory.getDefaultInstance();

    private final String clientId;
    private final String clientSecret;
    private final String refreshToken;

    public GmailService(
            @Value("${google.client-id}") String clientId,
            @Value("${google.client-secret}") String clientSecret,
            @Value("${google.refresh-token}") String refreshToken) {

        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.refreshToken = refreshToken;
    }

    public Gmail gmailClient() throws Exception {

        if (clientId.isBlank() || clientSecret.isBlank() || refreshToken.isBlank()) {
            throw new IllegalStateException("Google OAuth credentials are missing.");
        }

        var httpTransport = GoogleNetHttpTransport.newTrustedTransport();

        Credential credential =
                new Credential.Builder(
                        com.google.api.client.auth.oauth2.BearerToken.authorizationHeaderAccessMethod())
                        .setTransport(httpTransport)
                        .setJsonFactory(JSON_FACTORY)
                        .setTokenServerUrl(
                                new com.google.api.client.http.GenericUrl(
                                        "https://oauth2.googleapis.com/token"))
                        .setClientAuthentication(
                                new com.google.api.client.auth.oauth2.ClientParametersAuthentication(
                                        clientId,
                                        clientSecret))
                        .build();

        credential.setRefreshToken(refreshToken);

        boolean refreshed = credential.refreshToken();

        if (!refreshed) {
            throw new IllegalStateException("Unable to refresh Gmail access token.");
        }

        if (credential.getAccessToken() == null) {
            throw new IllegalStateException("Google did not return an access token.");
        }

        return new Gmail.Builder(
                httpTransport,
                JSON_FACTORY,
                credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    public void sendEmail(String to, String subject, String body) throws Exception {

        Gmail service = gmailClient();

        Session session = Session.getDefaultInstance(new Properties(), null);

        MimeMessage email = new MimeMessage(session);

        email.setFrom("me");
        email.addRecipients(jakarta.mail.Message.RecipientType.TO, to);
        email.setSubject(subject);
        email.setContent(body, "text/html; charset=utf-8");

        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        email.writeTo(buffer);

        String encodedEmail = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(buffer.toByteArray());

        Message message = new Message();
        message.setRaw(encodedEmail);

        service.users()
                .messages()
                .send("me", message)
                .execute();
    }
}