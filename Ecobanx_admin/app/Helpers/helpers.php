<?php

function user($id) {
$user = App\User::on('mysql2')->where('id',$id)->first();
return $user;
}

function username($id) {
$user = App\User::on('mysql2')->where('id',$id)->first();
if($user){
return $user->name;
}else{
return false;
}
}

function country() {
$countries = App\Models\Countries::on('mysql2')->get();
return $countries;
}

function display_format($number,$digit=8,$format=NULL){
if($format ==""){
$twocoin = sprintf('%.'.$digit.'f',$number);
}elseif($format==0){
$twocoin = number_format($number,$digit);
}else{
$twocoin = number_format($number,$digit,",",".");
}
return $twocoin;
}

function currency($type) {
$currency = 'BTC';	
return $currency;
}

function bank($id) {
$bank = App\Models\Bank::on('mysql2')->where('id',$id)->first(); 	
return $bank;
}

function Usercarddetails($id) {
$bank = App\Models\Usercarddetails::on('mysql2')->where('id',$id)->first(); 	
return $bank;
}

function list_coin(){
$coins = App\Models\Commission::on('mysql2')->get();	
return $coins;
}

function ncAdd($value1,$value2,$digit=8){
$value = bcadd(sprintf('%.10f',$value1), sprintf('%.10f',$value2), $digit);
return $value;
}

function ncSub($value1,$value2,$digit=8){
$value = bcsub(sprintf('%.10f',$value1), sprintf('%.10f',$value2), $digit);
return $value;
}

function ncMul($value1,$value2,$digit=8){
$value = bcmul(sprintf('%.10f',$value1), sprintf('%.10f',$value2), $digit);
return $value;
}

function ncDiv($value1,$value2,$digit=8){
$value = bcdiv(sprintf('%.10f',$value1), sprintf('%.10f',$value2), $digit);
return $value;
}

function ticketcount(){
$ticketcount = App\Models\Supportchat::on('mysql2')->where('admin_status',0)->count();
return $ticketcount;
}

function crul($url){
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$headers = array();
$headers[] = "Accept: application/json, text/plain";
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
if (curl_errno($ch)) {
echo $result = 'Error:' . curl_error($ch);
} else {
$result = curl_exec($ch);
}
curl_close($ch);
return $result;
}

function TransactionString($length = 15) {
$str = "";
$characters = array_merge(range('A','Z'), range('a','z'), range('0','9'));
$max = count($characters) - 1;
for ($i = 0; $i < $length; $i++) {
$rand = mt_rand(0, $max);
$str .= $characters[$rand];
}
return $str;
}
function seoUrl($string) {
    $string = strtolower($string);
    $string = preg_replace("/[^a-z0-9_\s-]/", "", $string);
    $string = preg_replace("/[\s-]+/", " ", $string);
    $string = preg_replace("/[\s_]/", "-", $string);
    return $string;
}

function weitoeth($amount){
    if($amount > 0){
        return $amount / 1000000000000000000;
    }else{
        return 0;
    }        
}


function weitousdt($amount,$tokenDecimal=null){
    if($amount == 0){
        return 0;
    }
    if($amount > 0){
        if($tokenDecimal){
            if($tokenDecimal > 0){
               $tokenDecimal = 1 + $tokenDecimal;
                $number = 1;
                $number = str_pad($number, $tokenDecimal, '0', STR_PAD_RIGHT);  
            }else{
                $number = 1;
            }         
            return $amount / $number;
        }else{
            return $amount / 1;
        }
    }else{
        return 0;
    }    
}


