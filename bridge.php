<?php
error_reporting(E_ERROR | E_PARSE);
// This script is used to transport requests to the openstack server
$service_url = $_GET['url'];
$req_type = $_GET['type'];
$payload = file_get_contents('php://input');
$headers = apache_request_headers();

$new_headers = array();
foreach ($headers as $key => $val) {
	$new_headers []= $key . ":" . $val;
}
$new_headers["Content-Type"] = "application/json";

$curl = curl_init($service_url);

curl_setopt($curl, CURLINFO_HEADER_OUT, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, $new_headers);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $req_type);
//curl_setopt($curl, CURLOPT_POST, true);

if ($req_type == "POST" || $req_type == "PUT")
    curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);

$curl_response = curl_exec($curl);
if ($curl_response === false) {
    $info = curl_getinfo($curl);
    curl_close($curl);
    die('error occured during curl exec. Additioanl info: ' . var_export($info));
}


// LOG
$log = $req_type . " : " . $service_url . "\n\nHeaders:\n";
$log .= "\n\n" . print_r($headers, true) . "\n\n\n";
$log .= "\n\n" . "PAYLOAD: \n" . print_r($payload, true) . "\n\n\n";
$log .= print_r(curl_getinfo($curl,CURLINFO_HEADER_OUT), true);
$log .= "\n\nResponse\n";
$log .= $curl_response;

file_put_contents($req_type . "_" . time(), $log);

curl_close($curl);

// SEND RESPONSE BACK
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-Auth-Token");
header("Access-Control-Allow-Origin: http://localhost*");
echo $curl_response;

/*$decoded = json_decode($curl_response);
if (isset($decoded->response->status) && $decoded->response->status == 'ERROR') {
    die('error occured: ' . $decoded->response->errormessage);
}
echo 'response ok!';
var_export($decoded->response); */