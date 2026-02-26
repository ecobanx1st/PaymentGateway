<?php
namespace App\Traits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Auth;
use App\Models\UserWallet;
use App\Models\UserXrpAddress;
use App\Models\AdminFeeWallet;

trait XrpClass
{
    public function create_user_xrp($id)
   	{
        $ethtable = AdminFeeWallet::where('coinname','XRP')->first();
        $useraddress = $ethtable->address;
        //$useraddress = 'rfxGeNgt423yfLCneEMj1pY5yLvw81jmyG';
   	    $xrpaddress = UserXrpAddress::where('user_id',$id)->first();
        if(!$xrpaddress){
            //$AdminAddress= 'Enixr';            
            $number = $this->generateBarcodeNumber();
            $xrpaddress = new UserXrpAddress;
            $xrpaddress->user_id = $id;
            $xrpaddress->address =  $useraddress;
            $xrpaddress->narcanru = $number;
            $xrpaddress->xrp_tag = $number;
            $xrpaddress->balance = 0.00000000;
            $xrpaddress->save();
        }
        
        $number = $xrpaddress->narcanru;
        $walletaddress = UserWallet::on('mysql2')->where(['uid'=> $id,'currency' => 'XRP'])->first();
        if(!$walletaddress){  
            $walletaddress = new UserWallet; 
            $walletaddress->setConnection('mysql2');
            $walletaddress->uid = $id;
            $walletaddress->currency = 'XRP';
        }
            $balance = 0;
            $margin = 0;
            $walletaddress->mukavari = $useraddress; 
            $walletaddress->payment_id = $number; 
            $walletaddress->balance     = $walletaddress->balance + $balance;
            $walletaddress->escrow_balance      = $walletaddress->escrow_balance + $balance;  
            $walletaddress->site_balance  = $walletaddress->balance + $balance;
            $walletaddress->created_at    = date('Y-m-d H:i:s',time()); 
            $walletaddress->updated_at    = date('Y-m-d H:i:s',time());  
            $walletaddress->save();
        
        return $useraddress;    
   	}

    public function barcodeNumberExists($number) {
        return UserXrpAddress::where('narcanru',$number)->exists();
    }
    public function generateBarcodeNumber() {
        $number = mt_rand(100000, 999999); // better than rand()
        // call the same function if the barcode exists already
        if ($this->barcodeNumberExists($number)) {
            return $this->generateBarcodeNumber();
        }
        // otherwise, it's valid and can be used
        return $number;
    }
    public function xrp_admin_address_create()
    {
        $xrpaddress = AdminFeeWallet::where('coinname','XRP')->first();
        if(!$xrpaddress){
          $data = json_decode(shell_exec('node '.base_path().'/block_xrp/index.js'));
          $address = $data->address;
          $privatekey = Crypt::encryptString($data->secret);
          $xrpaddress = new AdminFeeWallet;
          $credential = $privatekey;
          $xrpaddress->coinname = "XRP";
          $xrpaddress->network = "coin";
          $xrpaddress->address = $address;
          $xrpaddress->narcanru = $credential;
          $xrpaddress->fee = 0.0005;
          $xrpaddress->balance = 0.00000000;
          $xrpaddress->save();
        }
        return  $xrpaddress;  
    
    }

    function cUrl_xrp($url) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            $result = 'Error:' . curl_error($ch);
        }
        curl_close($ch);
        return json_decode($result, true);
    }

    function xrpbalanceupdate($address){
        $url = 'https://data.ripple.com/v2/accounts/'.$address.'/balances?currency=XRP';    
        $data = self::cUrl_xrp($url);
        $balance =0;
        if($data['result']=='success'){
            $balance= $data['balances'][0]['value'];
        }
        return $balance;
    }   
 
}