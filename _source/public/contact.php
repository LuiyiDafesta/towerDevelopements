<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$nombre = $data['nombre'] ?? '';
$email = $data['email'] ?? '';
$telefono = $data['telefono'] ?? '';
$consulta = $data['consulta'] ?? '';
$property_title = $data['property_title'] ?? 'Propiedad';
$owner_email = $data['owner_email'] ?? 'info@towerdevelopers.com'; // Default fallback

if (empty($nombre) || empty($email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Nombre y Email son obligatorios']);
    exit;
}

$to = filter_var($owner_email, FILTER_VALIDATE_EMAIL) ? $owner_email : 'info@towerdevelopers.com';
$subject = "Nueva consulta desde web: " . $property_title;

$message = "Has recibido una nueva consulta de propiedad.\n\n";
$message .= "Propiedad: " . $property_title . "\n";
$message .= "Nombre: " . $nombre . "\n";
$message .= "Email: " . $email . "\n";
$message .= "Teléfono: " . $telefono . "\n\n";
$message .= "Consulta:\n" . $consulta . "\n";

$headers = "From: webmaster@towerdevelopers.com\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

if (mail($to, $subject, $message, $headers)) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Correo enviado exitosamente']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al enviar el correo']);
}
?>
