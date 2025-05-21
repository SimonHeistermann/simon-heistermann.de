<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$requestMethod = $_SERVER['REQUEST_METHOD'];

switch ($requestMethod) {
    case 'OPTIONS':
        header("Access-Control-Allow-Methods: POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type");
        exit;
    case 'POST':
        try {
            $input = file_get_contents('php://input');
            if (empty($input)) {
                throw new Exception('Keine Daten empfangen');
            }
            $params = json_decode($input);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Ungültiges JSON-Format: ' . json_last_error_msg());
            }
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
                throw new Exception('Ungültige Eingabedaten oder Zustimmung nicht erteilt');
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
                throw new Exception('E-Mail konnte nicht gesendet werden');
            }
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
    default:
        header("Allow: POST", true, 405);
        echo json_encode(['error' => 'Methode nicht erlaubt']);
        exit;
}


