<?php
namespace App\Traits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Auth;
use App\Models\Wallet;
use App\Models\UserBtcAddress;
use App\Traits\Bitcoin;
use App\Models\AdminFeeWallet;
use App\Libraries\Demon;

trait BtcClass
{
	use Bitcoin;

	public function create_user_btc($uid) {
    $is_address = UserBtcAddress::where('user_id',$uid)->first();
    if(!is_object($is_address)){
      //$btc = json_decode(shell_exec('node '.base_path().'/block_btc/generate_btc.js'));
		  $btc = $this->createaddress_btc();
      $address = $btc->address;
      $publickey = Crypt::encryptString($btc->publickey);
      $wif = Crypt::encryptString($btc->wif);
      $privatekey = Crypt::encryptString($btc->privatekey);


        $btcaddress = new UserBtcAddress;
        $credential = $publickey.','.$wif.','.$privatekey;
        $btcaddress->user_id = $uid;
        $btcaddress->address = $address;
        $btcaddress->narcanru = $credential;
        $btcaddress->balance = 0.00000000;
        $btcaddress->save();
    }else{
      $address = $is_address->address;
    }

    $walletaddress = Wallet::where(['uid'=> $uid,'currency' => 'BTC'])->first();
    $balance = 0;
    if(!$walletaddress){
      $walletaddress = new Wallet;
      $walletaddress->uid = $uid;
      $walletaddress->currency = 'BTC';
    }

    $walletaddress->mukavari 		= $address;
    $walletaddress->balance 		= $walletaddress->balance + $balance;
    $walletaddress->escrow_balance  = $walletaddress->escrow_balance + $balance;
    $walletaddress->site_balance 	= $walletaddress->balance + $balance;
    $walletaddress->created_at 		= date('Y-m-d H:i:s',time());
    $walletaddress->updated_at 		= date('Y-m-d H:i:s',time());
    $walletaddress->save();

   	return $address;
	}
  public function btc_admin_address_create() {
    $btcaddress = AdminFeeWallet::where('coinname','BTC')->first();
    if(!$btcaddress){
      //$btc = json_decode(shell_exec('node '.base_path().'/block_btc/generate_btc.js'));
	    $btc = $this->createaddress_btc();
      $address = $btc->address;
      $publickey = Crypt::encryptString($btc->publickey);
      $wif = Crypt::encryptString($btc->wif);
      $privatekey = Crypt::encryptString($btc->privatekey);
      $btcaddress = new AdminFeeWallet;
      $credential = $publickey.','.$wif.','.$privatekey;
      $btcaddress->coinname = 'BTC';
      $btcaddress->network = "coin";
      $btcaddress->address = $address;
      $btcaddress->narcanru = $credential;
      $btcaddress->balance = 0.00000000;
      $btcaddress->fee = 0.0005;
      $btcaddress->save();
    }
    return $btcaddress;
  }
  public function createPaymentAddressBTC(){
    $btc = $this->createaddress_btc();
    $address = $btc->address;
    $publickey = Crypt::encryptString($btc->publickey);
    $wif = Crypt::encryptString($btc->wif);
    $privatekey = Crypt::encryptString($btc->privatekey);
    $credential = $publickey.','.$wif.','.$privatekey;
    $data['address'] = $address;
    $data['pvtkey'] = $credential;
    return $data;
  }

  function createUserBTCTransaction($uid,$amt,$fee=0.0001){
    $private = UserBtcAddress::where([['user_id', '=',$uid]])->first();
    $toaddress = $this->btc_admin_address_get();
    $fromaddress = $private->address;
    $credential = explode(',',$private->narcanru);
    if($fromaddress){
      $pvtkey = Crypt::decryptString($credential[2]);
      //$fee=0.0001;
      $send = $this->send($toaddress, $amt, $fromaddress,$pvtkey, $fee);
      return $send;
    }
    return true;
  }
  function createAdminBTCTransaction($address,$amt){
    $private = AdminFeeWallet::where('coinname','BTC')->first();
    $toaddress = $address;
    $fromaddress = $private->address;
    $credential = explode(',',$private->narcanru);
    if($fromaddress){
      $pvtkey = Crypt::decryptString($credential[2]);
      $fee=0.0001;
      $send = $this->send($toaddress, $amt, $fromaddress,$pvtkey, $fee);
      return $send;
    }
    return true;
  }
  function btc_admin_address_get(){
    $get_admin_address = AdminFeeWallet::where('coinname','BTC')->first();
    $admin_address = $get_admin_address->address;
    return $admin_address;
  }
  function getBalanceBTCAddress($address){
    $curl = curl_init();

    curl_setopt_array($curl, array(
      CURLOPT_URL => 'https://api.blockcypher.com/v1/btc/main/addrs/'.$address,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => '',
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 0,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => 'GET',
    ));

    $response = curl_exec($curl);

    curl_close($curl);
    $data = json_decode($response);
    if(isset($data->balance)){
      $balance = $this->sathositobtc($data->balance);
    }else{
      $balance = 0;
    }
    return $balance;
  }

}
