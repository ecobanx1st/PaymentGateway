<?php
namespace App\Traits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

use Auth;
use App\User;
use App\Wallet;
use App\Models\Wallet;
use App\Models\UserLtcAddress;
use App\Models\UserLtcAddressTable;
use App\Models\LtcAdminAddress;
use App\UserLtcTransaction;
use App\LtcAdminTransaction;
use App\Traits\Litecoin;
use App\Models\Cryptotransaction;
use App\Models\AdminFeeWallet;

trait LtcClass
{
    use Litecoin;

    public function create_user_ltc($uid) {
      $ltcaddress = UserLtcAddress::where('user_id',$uid)->first();
      if(!$ltcaddress){
        //$ltc = json_decode(shell_exec('node '.base_path().'/block_ltc/generate_ltc.js'));
		$params = array("method" => "create_address");
		$ltc = $this->getLocalNodeLTC($params);
        $address    = $ltc->address;
        $publickey  = Crypt::encryptString($ltc->publickey);
        $wif        = Crypt::encryptString($ltc->wif);
        $privatekey = Crypt::encryptString($ltc->privatekey);
        $ltcaddress = new UserLtcAddress;
        $credential = $publickey.','.$wif.','.$privatekey;
        $ltcaddress->user_id    = $uid;
        $ltcaddress->address    = $address;
        $ltcaddress->narcanru   = $credential;
        $ltcaddress->balance    = 0.00000000;
        $ltcaddress->created_at = date('Y-m-d H:i:s',time()); 
        $ltcaddress->updated_at = date('Y-m-d H:i:s',time());
        $ltcaddress->save();
      }

      $address = $ltcaddress->address;
      $walletaddress = Wallet::where(['uid'=> $uid,'currency' => 'LTC'])->first();
      $balance = 0;
		if(!$walletaddress){
		  $walletaddress = new Wallet; 
		  $walletaddress->uid = $uid;
		  $walletaddress->currency = 'LTC';
		}

		$walletaddress->mukavari 		= $address; 
		$walletaddress->balance 		= $walletaddress->balance + $balance;
		$walletaddress->escrow_balance      = $walletaddress->escrow_balance + $balance;  
		$walletaddress->site_balance 	= $walletaddress->balance + $balance;
		$walletaddress->created_at 		= date('Y-m-d H:i:s',time()); 
		$walletaddress->updated_at 		= date('Y-m-d H:i:s',time()); 
		$walletaddress->save();
      return $address;
    }

  public function ltc_admin_address_create() {
    $ltcaddress = AdminFeeWallet::where('coinname','LTC')->first();
    if(!$ltcaddress){
      $btc = json_decode(shell_exec('node '.base_path().'/block_ltc/generate_ltc.js'));
      $address = $btc->address;
      $publickey = Crypt::encryptString($btc->publickey);
      $wif = Crypt::encryptString($btc->wif);
      $privatekey = Crypt::encryptString($btc->privatekey);
      $ltcaddress = new AdminFeeWallet;
      $credential = $publickey.','.$wif.','.$privatekey;
      $ltcaddress->coinname = "LTC";
      $ltcaddress->network = "coin";
      $ltcaddress->address = $address;
      $ltcaddress->narcanru = $credential;
      $ltcaddress->fee = 0.0005;
      $ltcaddress->balance = 0.00000000;
      $ltcaddress->save();
    }else{
      $address = $ltcaddress->address;
    }    
    return $ltcaddress;
  }
   public  function ltcUserTransactions($uid)
  {
    $useraddress = Wallet::getAddress($uid,'LTC');
    if($useraddress){
      $url = 'https://test-insight.litecore.io/api/txs/?address='.$useraddress;
      $tran = json_decode(crul($url));
      if($tran){
        if(count($tran->txs) > 0){
          foreach($tran->txs as $addr){
            $order_no   = TransactionString().$uid;
            $txid       = $addr->txid;
            $sender     = $addr->vin[0]->addr;
            $confirm    = $addr->confirmations;
            $fees       = $addr->fees;
            $time       = $addr->time;
            foreach ($addr->vout as $vout) {
              if(in_array($useraddress , $vout->scriptPubKey->addresses)){
                $receiver = $useraddress;
                $amount = $vout->value;
                break;
              }                 
            }
            if($receiver == $useraddress)
            {
              Cryptotransaction::createTransaction($uid,'LTC',$txid,$sender,$receiver,$amount,$confirm,$time);
            }
          }
        }
        return true;
      }
      return "No transaction";
    }else{
      return "No address";
    }
    
  }
  public  function ltcAdminTransactions()
  {
    $addr = LtcAdminAddress::where('id', 1)->first();
    if($addr){
      $tran = $this->getTransactions($addr->address);
      if(!empty($tran)){
        foreach($tran->txs as $transaction)
        {
          $txid = $transaction->txid;
          $from = $transaction->vin[0]->addr;
          $amount = $transaction->vout[0]->value;
          $recive_address = $addr->address;
          $time = $transaction->time;
          $confirm = $transaction->confirmations;
          if($from){
            $is_txn = LtcAdminTransaction::where('txid',$txid)->first();
            if(!$is_txn){
              $userLtcTransaction = new LtcAdminTransaction;
              $userLtcTransaction->uid = 1;
              $userLtcTransaction->type = 'received';
              $userLtcTransaction->recipient = $recive_address;
              $userLtcTransaction->sender = $from;
              $userLtcTransaction->amount = $amount;
              $userLtcTransaction->confirmations = $confirm;
              $userLtcTransaction->txid = $txid;
              $userLtcTransaction->created_at = $time;
              $userLtcTransaction->save();
              return "Balance updated!";
            }
          }

        }
      }
      return true;
        
    }else{
      return "No address";
    }
    
  }

  function update_ltc_balance($addr){
      return $this->getBalance($addr);
  }


  function cron_userltc_credit_balance($uid,$amount){
    $currency ='LTC';
    $userbalance = Wallet::where([['uid', '=', $uid], ['currency', '=',$currency]])->first();
    if($userbalance) {
      $total = bcadd($amount, $userbalance->balance,8);
      Wallet::where([['uid', '=', $uid], ['currency', '=', $currency]])->update(['balance' => $total], ['updated_at' => date('Y-m-d H:i:s',time())]);
    } else {
      Wallet::insert(['uid' => $uid, 'currency' => $currency, 'balance' => $amount, 'created_at' => date('Y-m-d H:i:s',time()), 'updated_at' => date('Y-m-d H:i:s',time())]);
    }
      return  true;
    }
  function update_all_user_ltc_transaction(){
    $select_user = UserltcAddress::get();
    if($select_user)
    {
      foreach($select_user as $list){       
        $this->ltcUserTransactions($list->user_id);    
      }           
      return true;
    }

  }
  function createUserLtcTransaction($uid,$amt){
    $private = UserltcAddress::where([['user_id', '=',$uid]])->first();
    $toaddress = $this->ltc_admin_address_get();
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
  function createAdminLtcTransaction($address,$amt){
    $private = AdminFeeWallet::where('coinname','LTC')->first();
    $toaddress = $address;
    $fromaddress = $private->address;
    $credential = explode(',',$private->narcanru);
    if($fromaddress){
      $pvtkey = Crypt::decryptString($credential[2]);
      $fee=0.0001;
      $this->send($toaddress, $amt, $fromaddress,$pvtkey, $fee);
      return "Successfully transferred!";
    }
    return true;
  }
  function ltc_admin_address_get(){
    $get_admin_address = AdminFeeWallet::where('coinname','LTC')->first();
    $admin_address = $get_admin_address->address;
    return $admin_address;
  }
  function userbalance_ltc($uid){
    $currency ='LTC';
    $private = UserltcAddress::where([['user_id', '=',$uid]])->first();
    if($private){
      $address = $private->address;
      $balance = $this->getBalance($address);
      UserltcAddress::where(['user_id'=> $uid])->update(['balance' => $balance, 'updated_at' => date('Y-m-d H:i:s',time())]);
    }
    return true;
  }
  function Adminbalance_ltc(){
    $private = LtcAdminAddress::where([['id', '=',1]])->first();
    if($private){
      $address = $private->address;
      $balance = $this->getBalance($address);
      UserltcAddress::where(['id'=> 1])->update(['balance' => $balance, 'updated_at' => date('Y-m-d H:i:s',time())]);
    }
    return true;
  }
	function getLocalNodeLTC($params){
	$curl = curl_init();
	$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:8086");
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
		return json_decode($result);
	}
}