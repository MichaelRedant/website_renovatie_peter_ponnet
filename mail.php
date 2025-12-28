<?php
declare(strict_types=1);

// Basic PHP mail handler with honeypot and length limits
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}

// Honeypot field: if filled, drop silently
$honeypot = $_POST['website'] ?? '';
if (!empty($honeypot)) {
    http_response_code(200);
    exit('OK');
}

// Collect and sanitize inputs
$nameRaw = trim($_POST['name'] ?? '');
$contactRaw = trim($_POST['contact'] ?? '');
$messageRaw = trim($_POST['message'] ?? '');

// Simple validation
if ($nameRaw === '' || $contactRaw === '' || $messageRaw === '') {
    header('Location: contact.html?status=fail');
    exit();
}

// Length guards
$name = mb_substr($nameRaw, 0, 100);
$contact = mb_substr($contactRaw, 0, 120);
$message = mb_substr($messageRaw, 0, 2000);

// Optionally detect email in contact field
$replyEmail = filter_var($contact, FILTER_VALIDATE_EMAIL) ?: null;

// Build mail
$to = 'michael@xinudesign.be';
$subject = 'Nieuwe aanvraag via website (Peter Ponnet)';
$bodyLines = [
    "Naam: {$name}",
    "Contact: {$contact}",
    "Bericht:",
    $message,
    '',
    '---',
    'Verzonden vanaf het contactformulier.'
];
$body = implode("\n", $bodyLines);

$headers = [];
$headers[] = 'From: Renovatie Peter Ponnet <no-reply@renovatie-peter-ponnet.be>';
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=utf-8';
$headers[] = 'X-Mailer: PHP/' . phpversion();
if ($replyEmail) {
    $headers[] = 'Reply-To: ' . $replyEmail;
}

// Try to send
$success = mail($to, $subject, $body, implode("\r\n", $headers));

if ($success) {
    header('Location: contact.html?status=ok');
    exit();
}

header('Location: contact.html?status=fail');
exit();
