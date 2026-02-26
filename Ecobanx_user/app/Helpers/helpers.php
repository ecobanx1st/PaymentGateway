<?php
    function display_format($number,$digit=8,$format=NULL){
        if($format ==""){
            $twocoin = sprintf('%.'.$digit.'f',$number);
        }elseif($format==0){
            $twocoin = number_format($number,$digit);
        }elseif($format==1){
            $twocoin = number_format($number,$digit, '.', ',');
        }else{
            $twocoin = number_format($number,$digit,",",".");
        }
        return $twocoin;
    }
    
    function ncAdd($value1,$value2,$digit=8){
        //$value = bcadd(sprintf('%.10f',$value1), sprintf('%.10f',$value2), $digit);
        $value = number_format($value1 + $value2,$digit, '.', '');
        return $value;
    }
    function ncSub($value1,$value2,$digit=8){
        $value = bcsub(sprintf('%.10f',$value1), sprintf('%.10f',$value2), $digit);
        //$value = number_format($value1 - $value2,$digit, '.', '');
        return $value;
    }
    function ncMul($value1,$value2,$digit=8){
        //$value = bcmul(sprintf('%.10f',$value1), sprintf('%.10f',$value2), $digit);
        $value = number_format($value1 * $value2,$digit, '.', '');
        return $value;
    }
    
    function ncDiv($value1,$value2,$digit=8){
        //$value = bcdiv(sprintf('%.10f',$value1), sprintf('%.10f',$value2), $digit);
        $value = number_format($value1 / $value2,$digit, '.', '');
        return $value;
    }
    function imgvalidaion($img)
    {
        $myfile = fopen($img, "r") or die("Unable to open file!");
        $value = fread($myfile,filesize($img));
        if (strpos($value, "<?php") !== false) {
            $img = 0;
        } 
        elseif (strpos($value, "<?=") !== false){
            $img = 0;
        }
        elseif (strpos($value, "eval") !== false) {
            $img = 0;
        }
        elseif (strpos($value,"<script") !== false) {
            $img = 0;
        }else{
            $img=1;
        }
        fclose($myfile);
        return $img;
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
        //Lower case everything
        $string = strtolower($string);
        //Make alphanumeric (removes all other characters)
        $string = preg_replace("/[^a-z0-9_\s-]/", "", $string);
        //Clean up multiple dashes or whitespaces
        $string = preg_replace("/[\s-]+/", " ", $string);
        //Convert whitespaces and underscore to dash
        $string = preg_replace("/[\s_]/", "-", $string);
        return $string;
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
    function humanTiming($time)
    {
        $time = time() - $time; // to get the time since that moment
        $time = ($time<1)? 1 : $time;
        $tokens = array (
            31536000 => 'year',
            2592000 => 'month',
            604800 => 'week',
            86400 => 'day',
            3600 => 'hour',
            60 => 'min',
            1 => 'sec'
        );

        foreach ($tokens as $unit => $text) {
            if ($time < $unit) continue;
            $numberOfUnits = floor($time / $unit);
            return $numberOfUnits.' '.$text.(($numberOfUnits>1)?'s':'');
        }

    }
    function get_client_ip() {
        $ipaddress = '';
        if (getenv('HTTP_CLIENT_IP')) {
        $ipaddress = getenv('HTTP_CLIENT_IP');
        } else if (getenv('HTTP_X_FORWARDED_FOR')) {
        $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
        } else if (getenv('HTTP_X_FORWARDED')) {
        $ipaddress = getenv('HTTP_X_FORWARDED');
        } else if (getenv('HTTP_FORWARDED_FOR')) {
        $ipaddress = getenv('HTTP_FORWARDED_FOR');
        } else if (getenv('HTTP_FORWARDED')) {
        $ipaddress = getenv('HTTP_FORWARDED');
        } else if (getenv('REMOTE_ADDR')) {
        $ipaddress = getenv('REMOTE_ADDR');
        } else {
        $ipaddress = 'UNKNOWN';
        }

        return $ipaddress;
    }

    function ExactBrowserName() 
    {

        $ExactBrowserNameUA = $_SERVER['HTTP_USER_AGENT'];

        if (strpos(strtolower($ExactBrowserNameUA), "safari/") and strpos(strtolower($ExactBrowserNameUA), "opr/")) {
        // OPERA
        $ExactBrowserNameBR = "Opera";
        } elseIf (strpos(strtolower($ExactBrowserNameUA), "safari/") and strpos(strtolower($ExactBrowserNameUA), "chrome/")) {
        // CHROME
        $ExactBrowserNameBR = "Chrome";
        } elseIf (strpos(strtolower($ExactBrowserNameUA), "msie")) {
        // INTERNET EXPLORER
        $ExactBrowserNameBR = "Internet Explorer";
        } elseIf (strpos(strtolower($ExactBrowserNameUA), "firefox/")) {
        // FIREFOX
        $ExactBrowserNameBR = "Firefox";
        } elseIf (strpos(strtolower($ExactBrowserNameUA), "safari/") and strpos(strtolower($ExactBrowserNameUA), "opr/") == false and strpos(strtolower($ExactBrowserNameUA), "chrome/") == false) {
        // SAFARI
        $ExactBrowserNameBR = "Safari";
        } else {
        // OUT OF DATA
        $ExactBrowserNameBR = "OUT OF DATA";
        };

    return $ExactBrowserNameBR;
    }
    function getLocationInfoByIp() 
    {
        $ip = $_SERVER['REMOTE_ADDR'];
        $url = "http://www.geoplugin.net/php.gp?ip=" . $ip;
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL, $url);
        $result = curl_exec($ch);
        curl_close($ch);
        //  $result = json_encode($result, true);

        $resultdata = unserialize($result);
        $results['city'] = $resultdata['geoplugin_city'];
        $results['country'] = $resultdata['geoplugin_countryName'];
        $results['ip'] = $ip;
        $results['currency'] = $resultdata['geoplugin_currencyCode'];

        return $results;
    }

    function keygenerate(){
        $key = md5(microtime().rand());
        return $key;
    }

    function pvtgenerate(){
        $activation = md5(uniqid(rand(), true));
        return $activation;
    }
?>