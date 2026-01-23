<?php
// Simple lead capture endpoint for Bariátrica Natural landing
header('Content-Type: application/json; charset=utf-8');

$CONFIG = [
  'webhook_url' => '', // opcional: ej. n8n/zapier
  'crm' => [
    'provider' => '', // 'brevo' recomendado; 'hubspot' opción enterprise
    'hubspot' => [
      'api_key' => '',
      'list_id' => '',
      'endpoint' => 'https://api.hubapi.com/contacts/v1/contact/'
    ],
    'brevo' => [
      'api_key' => '', // BREVO_API_KEY
      'list_id' => '', // LIST_ID
      'endpoint' => 'https://api.brevo.com/v3/contacts'
    ]
  ]
];

function respond_json($payload, $code = 200){
  http_response_code($code);
  echo json_encode($payload);
  exit;
}

function log_error_msg($msg){
  $dirLogs = __DIR__ . '/../data/logs';
  if(!is_dir($dirLogs)){
    @mkdir($dirLogs, 0755, true);
  }
  $file = $dirLogs . '/lead_errors.log';
  $line = '[' . date('c') . '] ' . $msg . "\n";
  if($fp = @fopen($file, 'a')){
    if(flock($fp, LOCK_EX)){
      fwrite($fp, $line);
      flock($fp, LOCK_UN);
    }
    fclose($fp);
  }
}

if($_SERVER['REQUEST_METHOD'] !== 'POST'){
  respond_json(['ok' => false, 'message' => 'Método no permitido'], 405);
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

function normalize_email($value){
  return strtolower(trim((string)$value));
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

function send_webhook($url, $body){
  if(!$url) return true;
  $opts = [
    'http' => [
      'method'  => 'POST',
      'header'  => "Content-Type: application/json\r\n",
      'content' => json_encode($body)
    ]
  ];
  $context  = stream_context_create($opts);
  $result = @file_get_contents($url, false, $context);
  return $result !== false;
}

function send_crm($config, $lead, $segment){
  if(empty($config['provider'])){
    return true;
  }
  $provider = strtolower($config['provider']);
  if($provider === 'hubspot'){
    $api = $config['hubspot'];
    if(empty($api['api_key']) || empty($api['endpoint'])){
      return true;
    }
    $url = $api['endpoint'] . '?hapikey=' . urlencode($api['api_key']);
    $body = [
      'properties' => [
        ['property'=>'email','value'=>$lead['email']],
        ['property'=>'firstname','value'=>$lead['name']],
        ['property'=>'city','value'=>$lead['city']],
        ['property'=>'phone','value'=>$lead['phone']],
        ['property'=>'segment','value'=>$segment]
      ]
    ];
    if(!empty($api['list_id'])){
      $body['listIds'] = [ (int)$api['list_id'] ];
    }
    $opts = [
      'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content'=> json_encode($body)
      ]
    ];
    $ctx = stream_context_create($opts);
    $res = @file_get_contents($url, false, $ctx);
    return $res !== false;
  }
  if($provider === 'brevo'){
    $api = $config['brevo'];
    if(empty($api['api_key']) || empty($api['endpoint'])){
      return true;
    }
    $body = [
      'email' => $lead['email'],
      'attributes' => [
        'FIRSTNAME' => $lead['name'],
        'CITY' => $lead['city'],
        'PHONE' => $lead['phone'],
        'SEGMENT' => $segment
      ]
    ];
    if(!empty($api['list_id'])){
      $body['listIds'] = [ (int)$api['list_id'] ];
    }
    $opts = [
      'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\napi-key: ".$api['api_key']."\r\n",
        'content'=> json_encode($body)
      ]
    ];
    $ctx = stream_context_create($opts);
    $res = @file_get_contents($api['endpoint'], false, $ctx);
    return $res !== false;
  }
  return true;
}

function send_welcome_email_placeholder($config, $lead, $segment){
  // Placeholder: implement SMTP/API call if credentials están disponibles.
  return true;
}

$fields = [
  'name' => clean_str($payload['name'] ?? '', 120),
  'city' => clean_str($payload['city'] ?? '', 120),
  'email' => clean_str($payload['email'] ?? '', 160),
  'phone' => clean_str($payload['phone'] ?? '', 40)
];
$segment = clean_str($payload['segment'] ?? ($payload['lead_type'] ?? 'consumo'), 40);
$segment = $segment ?: 'consumo';
$honeypot = clean_str($payload['website'] ?? ($payload['hp'] ?? ''), 40);

if($honeypot !== ''){
  respond_json(['ok' => false, 'message' => 'Error de validación'], 400);
}

$action = strtolower(clean_str($payload['action'] ?? '', 20));
if($action === ''){
  $action = 'upsert';
}

$emailNormalized = normalize_email($fields['email']);

if($action === 'check'){
  if($emailNormalized === '' || !filter_var($emailNormalized, FILTER_VALIDATE_EMAIL)){
    respond_json(['ok' => false, 'message' => 'Email inválido'], 422);
  }

  $dir = __DIR__ . '/../data';
  $file = $dir . '/leads.csv';
  if(!file_exists($file)){
    respond_json(['ok' => true, 'exists' => false]);
  }
  $fp = @fopen($file, 'r');
  if(!$fp){
    respond_json(['ok' => false, 'message' => 'No se pudo leer'], 500);
  }
  $exists = false;
  if(flock($fp, LOCK_SH)){
    $header = fgetcsv($fp);
    $emailIndex = 3;
    if(is_array($header)){
      foreach($header as $idx => $col){
        if(strtolower(trim($col)) === 'email'){
          $emailIndex = $idx;
          break;
        }
      }
    }
    while(($row = fgetcsv($fp)) !== false){
      if(isset($row[$emailIndex]) && normalize_email($row[$emailIndex]) === $emailNormalized){
        $exists = true;
        break;
      }
    }
    flock($fp, LOCK_UN);
  }
  fclose($fp);
  respond_json(['ok' => true, 'exists' => $exists]);
}

if($action !== 'upsert'){
  respond_json(['ok' => false, 'message' => 'Acción inválida'], 400);
}

if($fields['name'] === ''){
  $firstName = clean_str($payload['first_name'] ?? '', 80);
  $lastName = clean_str($payload['last_name'] ?? '', 80);
  $fields['name'] = trim($firstName . ' ' . $lastName);
}

foreach($fields as $key => $value){
  if($value === ''){
    respond_json(['ok' => false, 'message' => 'Completa todos los campos'], 422);
  }
}

if(!filter_var($emailNormalized, FILTER_VALIDATE_EMAIL)){
  respond_json(['ok' => false, 'message' => 'Email inválido'], 422);
}

$digits = preg_replace('/\D+/', '', $fields['phone']);
if(strlen($digits) < 7 || strlen($digits) > 20){
  respond_json(['ok' => false, 'message' => 'Teléfono inválido'], 422);
}

$fields['email'] = $emailNormalized;
$fieldsSafe = array_map('csv_safe', $fields);

$dir = __DIR__ . '/../data';
if(!is_dir($dir) && !mkdir($dir, 0755, true)){
  respond_json(['ok' => false, 'message' => 'No se pudo preparar almacenamiento'], 500);
}

$file = $dir . '/leads.csv';
$fp = @fopen($file, 'c+');
if(!$fp){
  respond_json(['ok' => false, 'message' => 'No se pudo guardar'], 500);
}

if(!flock($fp, LOCK_EX)){
  fclose($fp);
  respond_json(['ok' => false, 'message' => 'No se pudo guardar'], 500);
}

rewind($fp);
$header = fgetcsv($fp);
$emailIndex = 3;
$hasHeader = is_array($header) && count($header) >= 4;
if($hasHeader){
  foreach($header as $idx => $col){
    if(strtolower(trim($col)) === 'email'){
      $emailIndex = $idx;
      break;
    }
  }
} else {
  $header = ['timestamp', 'name', 'city', 'email', 'phone', 'segment'];
}

$exists = false;
while(($row = fgetcsv($fp)) !== false){
  if(isset($row[$emailIndex]) && normalize_email($row[$emailIndex]) === $emailNormalized){
    $exists = true;
    break;
  }
}

if(!$hasHeader){
  rewind($fp);
  fputcsv($fp, $header);
}

if($exists){
  flock($fp, LOCK_UN);
  fclose($fp);
  respond_json(['ok' => true, 'status' => 'exists']);
}

fseek($fp, 0, SEEK_END);
fputcsv($fp, [date('c'), $fieldsSafe['name'], $fieldsSafe['city'], $fieldsSafe['email'], $fieldsSafe['phone'], $segment]);
flock($fp, LOCK_UN);
fclose($fp);

$leadPayload = [
  'name' => $fieldsSafe['name'],
  'city' => $fieldsSafe['city'],
  'email' => $fieldsSafe['email'],
  'phone' => $fieldsSafe['phone'],
  'segment' => $segment,
  'ts' => date('c')
];

if(!send_webhook($CONFIG['webhook_url'], $leadPayload)){
  log_error_msg('Webhook failed for ' . $fieldsSafe['email']);
}
if(!send_crm($CONFIG['crm'], $leadPayload, $segment)){
  log_error_msg('CRM sync failed for ' . $fieldsSafe['email']);
}
if(!send_welcome_email_placeholder($CONFIG, $leadPayload, $segment)){
  log_error_msg('Welcome email failed for ' . $fieldsSafe['email']);
}

respond_json(['ok' => true, 'status' => 'created']);
