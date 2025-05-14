<?php

header("Access-Control-Allow-Origin: *");

$requestMethod = $_SERVER['REQUEST_METHOD'];

switch ($requestMethod) {
    case 'OPTIONS':
        header("Access-Control-Allow-Methods: POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type");
        exit;
    case 'POST':
        $input = file_get_contents('php://input');
        $params = json_decode($input);
        if (isset($params->website) && !empty($params->website)) {
            http_response_code(400);
            echo json_encode(['error' => 'Spam detected – Honeypot field is filled']);
            exit;
        }
        if (
            !isset($params->email) || !filter_var($params->email, FILTER_VALIDATE_EMAIL) ||
            !isset($params->name) || empty(trim($params->name)) ||
            !isset($params->message) || empty(trim($params->message)) ||
            !isset($params->agreedToTerms) || $params->agreedToTerms !== true
        ) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input or consent not given']);
            exit;
        }
        $email = htmlspecialchars(trim($params->email));
        $name = htmlspecialchars(trim($params->name));
        $messageContent = nl2br(htmlspecialchars(strip_tags(trim($params->message))));
        $agreedToTerms = 'Ja';
        $recipient = 'buisness@heistermann-solutions.de';
        $subject = "Neue Kontaktanfrage von $name";
        $messageBody = "
            <html>
                <body>
                    <p><strong>Von:</strong> $name &lt;$email&gt;</p>
                    <p><strong>Nachricht:</strong><br>$messageContent</p>
                    <p><strong>Datenschutzerklärung akzeptiert:</strong> $agreedToTerms</p>
                </body>
            </html>
        ";
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=utf-8',
            'From: noreply@heistermann-solutions.de',
            "Reply-To: $email"
        ];
        $success = mail($recipient, $subject, $messageBody, implode("\r\n", $headers));
        if ($success) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Mail sending failed']);
        }
        break;
    default:
        header("Allow: POST", true, 405);
        exit;
}


