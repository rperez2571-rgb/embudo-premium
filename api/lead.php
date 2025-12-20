<?php
// Simple lead capture endpoint for Bariátrica Natural landing
header('Content-Type: application/json; charset=utf-8');

function respond($ok, $message, $code = 200){
  http_response_code($code);
  echo json_encode(['ok' => $ok, 'message' => $message]);
  exit;
}

if($_SERVER['REQUEST_METHOD'] !== 'POST'){
  respond(false, 'Método no permitido', 405);
}

$raw = file_get_contents('php://input');
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$payload = [];

if(stripos($contentType, 'application/json') !== false){
  $payload = json_decode($raw, true) ?? [];
}else{
  $payload = $_POST;
  if(empty($payload) && $raw){
    parse_str($raw, $payload);
  }
}

function clean_str($value, $limit = 160){
  $value = trim((string)$value);
  if(function_exists('mb_substr')){
    if(mb_strlen($value) > $limit){
      $value = mb_substr($value, 0, $limit);
    }
  }else{
    if(strlen($value) > $limit){
      $value = substr($value, 0, $limit);
    }
  }
  return $value;
}

function csv_safe($value){
  $value = preg_replace('/[\r\n]+/', ' ', (string)$value);
  if($value === ''){
    return '';
  }
  if(preg_match('/^[=+\-@]/', $value)){
    $value = "'" . $value;
  }
  return $value;
}

$fields = [
  'name' => clean_str($payload['name'] ?? '', 120),
  'city' => clean_str($payload['city'] ?? '', 120),
  'email' => clean_str($payload['email'] ?? '', 160),
  'phone' => clean_str($payload['phone'] ?? '', 40)
];
$honeypot = clean_str($payload['website'] ?? ($payload['hp'] ?? ''), 40);

if($honeypot !== ''){
  respond(false, 'Error de validación', 400);
}

foreach($fields as $key => $value){
  if($value === ''){
    respond(false, 'Completa todos los campos', 422);
  }
}

if(!filter_var($fields['email'], FILTER_VALIDATE_EMAIL)){
  respond(false, 'Email inválido', 422);
}

$digits = preg_replace('/\D+/', '', $fields['phone']);
if(strlen($digits) < 7 || strlen($digits) > 20){
  respond(false, 'Teléfono inválido', 422);
}

$fieldsSafe = array_map('csv_safe', $fields);

$dir = __DIR__ . '/../data';
if(!is_dir($dir) && !mkdir($dir, 0755, true)){
  respond(false, 'No se pudo preparar almacenamiento', 500);
}

$file = $dir . '/leads.csv';
$fileExisted = file_exists($file);
$fp = @fopen($file, 'a');
if(!$fp){
  respond(false, 'No se pudo guardar', 500);
}

if(!flock($fp, LOCK_EX)){
  fclose($fp);
  respond(false, 'No se pudo guardar', 500);
}

if(!$fileExisted){
  fputcsv($fp, ['timestamp', 'name', 'city', 'email', 'phone']);
}

fputcsv($fp, [date('c'), $fieldsSafe['name'], $fieldsSafe['city'], $fieldsSafe['email'], $fieldsSafe['phone']]);
flock($fp, LOCK_UN);
fclose($fp);

// Placeholder para integraciones futuras (email/webhook)
// TODO: agregar aquí envío de notificación o webhook si se necesita.

respond(true, 'Gracias, recibido');
