<?php
function cronupdate($url){
    // create a new cURL resource
    $ch = curl_init();
    
    // set URL and other appropriate options
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    
    // grab URL and pass it to the browser
    curl_exec($ch);
    
    // close cURL resource, and free up system resources
    curl_close($ch);
	return true;
}
$url1 = cronupdate('https://coinbanker.sg/Btc_balance_update');
$url2 = cronupdate('https://coinbanker.sg/Eth_balance_update');
$url3 = cronupdate('https://coinbanker.sg/Xrp_balance_update');
$url4 = cronupdate('https://coinbanker.sg/Ltc_balance_update');
?>
