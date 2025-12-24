<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $payload): void {
  http_response_code($status);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function log_error(string $message): void {
  $logDir = __DIR__ . '/../data/logs';
  if (!is_dir($logDir)) {
    @mkdir($logDir, 0755, true);
  }
  $logFile = $logDir . '/lead.log';
  $timestamp = date('c');
  @file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND);
}

function sanitize_string(?string $value): string {
  $value = $value ?? '';
  $value = trim($value);
  $value = str_replace(["\r", "\n", "\t"], ' ', $value);
  return mb_substr($value, 0, 200);
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method !== 'POST') {
  respond(405, ['ok' => false, 'error' => 'Método no permitido']);
}

$rawInput = file_get_contents('php://input');
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$payload = [];

if (stripos($contentType, 'application/json') !== false && $rawInput) {
  $decoded = json_decode($rawInput, true);
  if (is_array($decoded)) {
    $payload = $decoded;
  }
} else {
  $payload = $_POST;
}

$honeypot = $payload['website'] ?? $payload['hp'] ?? '';
if (!empty($honeypot)) {
  respond(400, ['ok' => false, 'error' => 'Solicitud inválida']);
}

$name = sanitize_string($payload['name'] ?? '');
$city = sanitize_string($payload['city'] ?? '');
$email = sanitize_string($payload['email'] ?? '');
$phone = sanitize_string($payload['phone'] ?? '');

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  respond(422, ['ok' => false, 'error' => 'Email inválido']);
}

$utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
$utmValues = [];
foreach ($utmKeys as $key) {
  $utmValues[$key] = sanitize_string($payload[$key] ?? '');
}

$timestamp = date('c');
$ip = $_SERVER['REMOTE_ADDR'] ?? '';

$csvDir = __DIR__ . '/../data';
if (!is_dir($csvDir)) {
  if (!@mkdir($csvDir, 0755, true)) {
    log_error('No se pudo crear directorio data');
    respond(500, ['ok' => false, 'error' => 'Error interno']);
  }
}

$csvFile = $csvDir . '/leads.csv';
$isNew = !file_exists($csvFile);

$headers = ['timestamp', 'ip', 'name', 'city', 'email', 'phone', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
$row = [
  $timestamp,
  $ip,
  $name,
  $city,
  $email,
  $phone,
  $utmValues['utm_source'],
  $utmValues['utm_medium'],
  $utmValues['utm_campaign'],
  $utmValues['utm_term'],
  $utmValues['utm_content'],
];

$handle = @fopen($csvFile, 'a');
if ($handle === false) {
  log_error('No se pudo abrir leads.csv para escritura');
  respond(500, ['ok' => false, 'error' => 'Error interno']);
}

if ($isNew) {
  fputcsv($handle, $headers);
}

fputcsv($handle, $row);

fclose($handle);

respond(200, ['ok' => true]);
