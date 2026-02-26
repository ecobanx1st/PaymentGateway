<?php
$ch = curl_init();
$params = array("method" => "create_address");
$params = $params;
curl_setopt($ch, CURLOPT_URL, "http://192.168.1.48:8080");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
$headers = array();
$headers[] = "Content-Type : application/json";
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$result = curl_exec($ch);
if (curl_errno($ch)) {
	echo 'Error:' . curl_error($ch);
}
curl_close($ch);
$dd= json_decode($result);
print_r($dd);
?>