<?php
namespace App\Traits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Auth;
use App\Models\UserWallet;
use App\Models\UserDashAddress;
use App\Models\User;
use App\Models\CryptoTransactions;
use App\Models\Tanippatta_Panappais;
use App\Libraries\Demon;

trait DashClass
{
	public function dashcreate() {
		$ch = curl_init();
        //curl_setopt($ch, CURLOPT_URL, 'https://api.blockcypher.com/v1/dash/main/addrs');
        $tokenblock = "0f9d5906bc704aa4bf8d217571d0132d";
		curl_setopt($ch, CURLOPT_URL, 'https://api.blockcypher.com/v1/dash/main/addrs'.'?token='.$tokenblock);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, "POST");
        curl_setopt($ch, CURLOPT_POST, 1);
        $headers = array();
        $headers[] = 'Content-Type: application/x-www-form-urlencoded';
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
        }
        curl_close ($ch);
		return json_decode($result);
	}
	public function create_user_dash($uid)
   	{
        $dashaddress = UserDashAddress::where('user_id',$uid)->first();
        if(!$dashaddress){
            $address_gen = $this->dashcreate();
            $pvtk 	= Crypt::encryptString($address_gen->private);
            $pubk 	= Crypt::encryptString($address_gen->public);
            $wif  	= Crypt::encryptString($address_gen->wif);
            $address = $address_gen->address;

            $dashaddress = new UserDashAddress;
            $dashaddress->user_id    = $uid;
            $dashaddress->address    = $address;
            $dashaddress->narcanru   = $pvtk.','.$pubk.','.$wif;
            $dashaddress->balance    = 0.00000000;
            $dashaddress->save();
        }
        $address = $dashaddress->address;
        $walletaddress = UserWallet::on('mysql2')->where(['uid'=> $uid,'currency' => 'DASH'])->first();
        
        if(!$walletaddress){  
            $walletaddress = new UserWallet; 
            $walletaddress->setConnection('mysql2');
            $walletaddress->uid = $uid;
            $walletaddress->currency 			= 'DASH'; 
            $walletaddress->balance             = 0.00000000; 
            $walletaddress->escrow_balance      = 0.00000000; 
            $walletaddress->site_balance        = 0.00000000; 
            $walletaddress->vilimpu_camanilai   = 0.00000000;
            $walletaddress->created_at          = date('Y-m-d H:i:s',time());
        }
        $walletaddress->mukavari 	= $address; 
        $walletaddress->updated_at 	= date('Y-m-d H:i:s',time()); 
        $walletaddress->save();        
        return $address;            
    }
    public function getBalanceDash($address)
	{
	    $url = "https://api.blockcypher.com/v1/dash/main/addrs/".$address."/balance";
	    $balance = $this->cUrlDash($url);
	    return $balance;
	}
	public function convertdash($amount){
	    return $amount / 100000000;
	}
	public function convert_new_dash($amount){
	    return $amount * 100000000;
	}
	public function cUrlDash($url, $postfilds=null)
	{
	    $url = $url;
	    $ch = curl_init();
	    curl_setopt($ch, CURLOPT_URL, $url);
	    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	    if(!is_null($postfilds)){
	        curl_setopt($ch, CURLOPT_POSTFIELDS, $postfilds);
	    }
	    if(strpos($url, '?') !== false){
	        curl_setopt($ch, CURLOPT_POST, 1);
	    }
	    $headers = array('Content-Length: 0');
	    $headers[] = "Content-Type: application/x-www-form-urlencoded";
	    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	    if (curl_errno($ch)) {
	        $result = 'Error:' . curl_error($ch);
	    } else {
	        $result = curl_exec($ch);
	    } 
	    curl_close($ch);
	    return json_decode($result, true);
	}
	public function get_receivedTransaction($token='0f9d5906bc704aa4bf8d217571d0132d'){
		$users = UserDashAddress::get();
		if(count($users) > 0){            
            foreach ($users as $user) {
                $uid = $user->user_id;
                $useraddress = $user->address;
                $url = 'https://api.blockcypher.com/v1/dash/main/addrs/'.$useraddress;
			    $send = $this->cUrlDash($url);
			    if($send['final_balance'] < 0 || $send['final_balance'] == 0)
		        {            	
		            return true;
		        }else{
		        	$uncofirm_count = $send['unconfirmed_n_tx'];
		            $cofirm_count = count($send['txrefs']);
		            $final_balance = $this->convertdash($send['final_balance']);
		            $update_balance = UserDashAddress::where(['id' => $user->id])->update(['balance' => $final_balance,'updated_at' => date('Y-m-d H:i:s',time())]);
		            if($update_balance)
		            {
		                if($uncofirm_count > 0)
		                {
		                    for($i = 0; $i <= $uncofirm_count; $i++)
		                    {
		                        $tx_hash = $send['unconfirmed_txrefs'][$i]['tx_hash'];
		                        if($tx_hash)
		                        {
		                            $transaction = $this->txnsDash($tx_hash);
		                            $sender = $transaction['inputs']['0']['addresses']['0'];
		                            $receiver = $transaction['outputs']['0']['addresses']['0'];
		                            $fees = $this->convertdash($transaction['fees']);
		                            $total = $this->convertdash($transaction['outputs']['0']['value']);
		                            $select_user = UserDashAddress::where('address', $receiver)->first();
		                            if($select_user)
		                            {
		                            	$is_txn = CryptoTransactions::where('txid',$tx_hash)->first();
		                                if(!$is_txn)
		                                {
		                                   
		                                }
		                            }
		                        }
		                    }
		                }
		                if($cofirm_count > 0)
		                {
		                    for($i = 0; $i < $cofirm_count; $i++)
		                    {
		                        $tx_hash = $send['txrefs'][$i]['tx_hash'];
		                        if($tx_hash)
		                        {
		                            $transaction = $this->txnsDash($tx_hash);
		                            
		                            $sender = $transaction['inputs']['0']['addresses']['0'];
		                            $receiver = $transaction['outputs']['0']['addresses']['0'];
		                            $fees = $this->convertdash($transaction['fees']);
		                            $total = $this->convertdash($transaction['outputs']['0']['value']);
		                            $confirmations = $transaction['confirmations'];
		                            $time     = date('Y-m-d H:i:s',strtotime($transaction['received']));
		                            if($sender != $useraddress){
		                            
			                            if($receiver == $useraddress)
			                            {
			                                $is_txn = CryptoTransactions::where('txid',$tx_hash)->first();
			                                if(!$is_txn)
			                                {
			                                	CryptoTransactions::createTransaction($uid,'DASH',$tx_hash,$sender,$receiver,$total,$confirmations,$time);
			                                	return true;                                    
			                                }else{
			                                	return false;
			                                }
			                            }
		                        	}
		                        }
		                    }
		                }
		            }
		        }
            }
        }
	    
	}

	public function checktrans(){
		$users = UserDashAddress::get();
        if(count($users) > 0){            
            foreach ($users as $user) {
                $uid = $user->user_id;
                echo $useraddress = $user->address;
                if($useraddress){
                    $url = 'https://sochain.com/api/v2/address/DASH/'.$useraddress;
                    $tran = $this->cruldashh($url);
                    dd($tran);
                    if($tran)
                    {
                        
                    }
                }
				sleep(2); // this should halt for 2 seconds for every loop
            }
        }
	}
	public function cruldashh($url){
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		$result = curl_exec($ch);
		if (curl_errno($ch)) {
		    echo 'Error:' . curl_error($ch);
		}
		curl_close($ch);
		return $result;
	}
	public function txnsDash($tx)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.blockcypher.com/v1/dash/main/txs/$tx");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $headers = array();
        $headers[] = "Content-Type: application/x-www-form-urlencoded";
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
        }   
        curl_close($ch);
        $send = json_decode($result, true);
        return $send;
    }
    
    public function createUserDashTransaction($uid,$amount){
    	$users = UserDashAddress::where('user_id',$uid)->first();
    	if($users){
    		$tokenblock		= "0f9d5906bc704aa4bf8d217571d0132d";
    		$fromaddress 	= $users->address;
    		$toaddress   	= "XwDiCXdexLQzp8ZXq7GkbkU3QzBS6NQTne";
    		$credential 	= explode(',',$users->narcanru);
        	$pvk 			= Crypt::decryptString($credential[0]);
        	$pbky 			= Crypt::decryptString($credential[1]);
    		$dash_amount 	= $this->convert_new_dash($amount);
		    $ch = curl_init();
		    curl_setopt($ch, CURLOPT_URL, "https://api.blockcypher.com/v1/dash/main/txs/new?token=".$tokenblock);
		    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		    curl_setopt($ch, CURLOPT_POSTFIELDS, "{\"inputs\":[{\"addresses\": [\"$fromaddress\"]}],\"outputs\":[{\"addresses\": [\"$toaddress\"], \"value\": $dash_amount}]}");
		    curl_setopt($ch, CURLOPT_POST, 1);
		    $headers = array();
		    $headers[] = "Content-Type: application/x-www-form-urlencoded";
		    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		    $result = curl_exec($ch);
		    if (curl_errno($ch)) {
		        echo 'Error:' . curl_error($ch);
		    }
		    curl_close($ch);
		    $send = json_decode($result);

		    if(isset($send->errors))
		    {
		        return false;
		    }
		    elseif(isset($send->error))
		    {
		        return false;
		    }
		    elseif(isset($send->tx))
		    {
		        $privatekey = $pvk;
		        $publickey = $pbky;
		        $data = rtrim($result,"}");
		        $tosign_count = count($send->tosign);
		        $outputs = '';
		        $pubkeys = '';
		        for($i = 0; $i < $tosign_count; $i++)
		        {
		            $tosign = $send->tosign[$i];
		            $output = shell_exec(base_path()."/btcutils/signer/signer $tosign $privatekey 2>&1");
		            $outputs .= '"'.trim($output).'",';
		            $pubkeys .= '"'.$publickey.'",';
		        }				
		        $outputs = trim($outputs, ", ");
		        $pubkeys = trim($pubkeys, ", ");
		        $tx = $data.', "pubkeys" : ['.$pubkeys.'], "signatures" : ['.$outputs.' ] } ';
		        $data = $this->sendTransactionDash($tx, $tokenblock);
		        if(isset($data->error))
		        {
		            return false;
		        }
		        elseif(isset($data->tx))
		        {
		            $hash = $data->tx->hash;
		            if(isset($hash) && !is_null($hash))
		            {
		                return $hash;
		            }
		            else
		            {
		                return false;
		            }
		        }
		    }
    	}    	
    }

    
    public function createAdminDashTransaction($address,$amount){

	    $private = Tanippatta_Panappais::where([['coin_name', '=','DASH']])->first();

    	if($private){

    		$tokenblock		= "0f9d5906bc704aa4bf8d217571d0132d";

			$toaddress = $address;
			$fromaddress = $private->address;
			$credential = explode(',',$private->narcanru);
        	$pbky 			= Crypt::decryptString($credential[0]);
    		$pvk 			= Crypt::decryptString($credential[2]);
    		$dash_amount 	= $this->convert_new_dash($amount);
		    $ch = curl_init();
		    curl_setopt($ch, CURLOPT_URL, "https://api.blockcypher.com/v1/dash/main/txs/new?token=".$tokenblock);
		    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		    curl_setopt($ch, CURLOPT_POSTFIELDS, "{\"inputs\":[{\"addresses\": [\"$fromaddress\"]}],\"outputs\":[{\"addresses\": [\"$toaddress\"], \"value\": $dash_amount}]}");
		    curl_setopt($ch, CURLOPT_POST, 1);
		    $headers = array();
		    $headers[] = "Content-Type: application/x-www-form-urlencoded";
		    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		    $result = curl_exec($ch);
		    if (curl_errno($ch)) {
		        echo 'Error:' . curl_error($ch);
		    }
		    curl_close($ch);
		    $send = json_decode($result);

		    if(isset($send->errors))
		    {
		        return false;
		    }
		    elseif(isset($send->error))
		    {
		        return false;
		    }
		    elseif(isset($send->tx))
		    {
		        $privatekey = $pvk;
		        $publickey = $pbky;
		        $data = rtrim($result,"}");
		        $tosign_count = count($send->tosign);
		        $outputs = '';
		        $pubkeys = '';
		        for($i = 0; $i < $tosign_count; $i++)
		        {
		            $tosign = $send->tosign[$i];
		            $output = shell_exec(base_path()."/btcutils/signer/signer $tosign $privatekey 2>&1");
		            $outputs .= '"'.trim($output).'",';
		            $pubkeys .= '"'.$publickey.'",';
		        }				
		        $outputs = trim($outputs, ", ");
		        $pubkeys = trim($pubkeys, ", ");
		        $tx = $data.', "pubkeys" : ['.$pubkeys.'], "signatures" : ['.$outputs.' ] } ';
		        $data = $this->sendTransactionDash($tx, $tokenblock);
		        if(isset($data->error))
		        {
		            return false;
		        }
		        elseif(isset($data->tx))
		        {
		            $hash = $data->tx->hash;
		            if(isset($hash) && !is_null($hash))
		            {
		                return $hash;
		            }
		            else
		            {
		                return false;
		            }
		        }
		    }
    	}    	
    }

    public function sendTransactionDash($tx, $tokenblock)
	{
	    $ch = curl_init();
	    curl_setopt($ch, CURLOPT_URL, "https://api.blockcypher.com/v1/dash/main/txs/send?token=".$tokenblock);
	    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	    curl_setopt($ch, CURLOPT_POSTFIELDS, $tx);
	    curl_setopt($ch, CURLOPT_POST, 1);
	    $headers = array();
	    $headers[] = "Content-Type: application/x-www-form-urlencoded";
	    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	    $result = curl_exec($ch);
	    if (curl_errno($ch)) {
	        echo 'Error:' . curl_error($ch);
	    }
	    curl_close($ch);
	    return json_decode($result);
	}
}