<?php
namespace App\Traits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;

use App\Traits\Trc;
use App\Traits\Tron;

use App\TokenTransaction;
use App\Mail\AcceptDepositEmail;
use App\User;
use App\Models\UserTrxAddress;
use App\Models\Wallet;
use App\Models\Commission;
use App\Models\AdminFeeWallet;
use App\Models\CryptoTransactions;
use App\FeeWalletTransaction;
use App\Models\Transaction;
use App\Models\UsersPaymentAddress;
use App\Models\OrderTransaction;


trait TrcClass 
{
	use Trc,Tron;
	public function createTrcAddress($user)
    {
        $is_address = UserTrxAddress::where('user_id',$user)->first();
        if(!$is_address){
            $eth = $this->trc_user_address_create();
            $address = $eth['address'];
            $publickey = Crypt::encrypt($eth['hexAddress']);
            $privatekey = Crypt::encrypt($eth['privateKey']);

            if($eth['hexAddress'] != NULL && $eth['hexAddress'] != '' && $eth['privateKey'] != NULL && $eth['privateKey'] != '')
            {
                $ethaddress = new UserTrxAddress();
                $ethaddress->user_id = $user;
                $ethaddress->address = $address;
                $ethaddress->hex_address = $eth['hexAddress'];
                $ethaddress->narcanru = $publickey.','.$privatekey;
                $ethaddress->balance = 0.00000000;
                $ethaddress->save();
            }
        } else {
            $address = $is_address->address;
        }
        $exr = $this->walletTRXToken($user,$address);
        $exr = $this->trxtoken_address_generate($user,$address);
        return $address; 
    }
    public function createPaymentAddressTRX(){
        $eth = $this->trc_user_address_create();
        $address = $eth['address'];
        $publickey = Crypt::encrypt($eth['hexAddress']);
        $privatekey = Crypt::encrypt($eth['privateKey']);
        $credential =  $publickey.','.$privatekey;  
        $data['address'] = $address;
        $data['pvtkey'] = $credential;
        return $data;
    }
    public function walletTRXToken($uid,$address)
    {
        $symbol = 'TRX';
        $walletaddress = Wallet::where(['uid'=> $uid,'currency' => $symbol])->first();        
        $balance = 0;
        if(!$walletaddress){  
            $walletaddress = new Wallet; 
            $walletaddress->uid = $uid;
            $walletaddress->currency = $symbol;
        }

        $walletaddress->mukavari            = $address; 
        $walletaddress->balance             = $walletaddress->balance + $balance ; 
        $walletaddress->escrow_balance      = $walletaddress->escrow_balance + $balance;  
        $walletaddress->site_balance        = $walletaddress->balance + $balance ; 
        $walletaddress->created_at          = date('Y-m-d H:i:s',time()); 
        $walletaddress->updated_at          = date('Y-m-d H:i:s',time()); 
        $walletaddress->save();
        return  $address;
    }
    function trxtoken_address_generate($uid,$address){
        $coins = Commission::where('type','trxtoken')->get();
        if(count($coins) > 0){
            foreach ($coins as $token) {
                $coin = $token->source;
                $walletaddress = Wallet::where(['uid'=> $uid,'currency' => $coin])->first();
                $balance = 0;
                $escrow = 0;
                if(!$walletaddress){  
                    $walletaddress = new Wallet; 
                    $walletaddress->uid        = $uid;
                    $walletaddress->currency   = $coin;
                    $walletaddress->created_at = date('Y-m-d H:i:s',time()); 
                }
                $walletaddress->mukavari       = $address; 
                $walletaddress->balance        = $walletaddress->balance + $balance; 
                $walletaddress->escrow_balance = $walletaddress->escrow_balance + $escrow; 
                $walletaddress->site_balance   = $walletaddress->balance + $balance; 
                $walletaddress->updated_at     = date('Y-m-d H:i:s',time()); 
                $walletaddress->save();
            }
        }
        return true;
    }
    public function trx_admin_address_create() {
        $btcaddress = AdminFeeWallet::where('coinname','TRX')->first();
        if(!$btcaddress){
            $eth = $this->trc_user_address_create();
            $address = $eth['address'];
            $publickey = Crypt::encrypt($eth['hexAddress']);
            $privatekey = Crypt::encrypt($eth['privateKey']);
            if($eth['hexAddress'] != NULL && $eth['hexAddress'] != '' && $eth['privateKey'] != NULL && $eth['privateKey'] != '')
            {
                $btcaddress = new AdminFeeWallet;
                $btcaddress->coinname = 'TRX';
                $btcaddress->network = "coin";
                $btcaddress->address = $address;
                $btcaddress->hex_address = $eth['hexAddress'];
                $btcaddress->narcanru = $publickey.','.$privatekey;
                $btcaddress->balance = 0.00000000;
                $btcaddress->fee = 0.0005;
                $btcaddress->save();
            }else{
                dd($eth);
            }
        }
        return $btcaddress;
    }

    public function createFeeTrcAddress($user)
    {
        $is_address = AdminFeeWallet::where('user_id',$user)->first();
        if(!$is_address){
            $eth = $this->trc_user_address_create();
            $address = $eth['address'];
            $publickey = Crypt::encrypt($eth['hexAddress']);
            $privatekey = Crypt::encrypt($eth['privateKey']);

            if($eth['hexAddress'] != NULL && $eth['hexAddress'] != '' && $eth['privateKey'] != NULL && $eth['privateKey'] != '')
            {
                $ethaddress = new AdminFeeWallet();
                $ethaddress->user_id = $user;
                $ethaddress->mugavari = $address;
                $ethaddress->narcanru = $publickey.','.$privatekey;
                $ethaddress->balance = 0.00000000;
                $ethaddress->trx_balance = 0.00000000;
                $ethaddress->status = 0;
                $ethaddress->active = 1;
                $ethaddress->save();
            }
        }
        return true;
    }
	public function UpdateTransaction($uid,$remark='Deposit'){
        $is_address = UserTrxAddress::where('user_id',$uid)->first();
		if($is_address){
        $address = $is_address->mugavari;
		$balance = $this->tr10trans($address);        
        
       
        if(isset($balance['data']))
        {
            $count = count($balance['data']);
            if($count > 0)
            {
                $is_hex = $this->getHexFormat($address);
                $result_data = $balance['data'];
				
                for($i = 0; $i < $count; $i++)
                {

                    $data = $result_data[$i];
                    $tx_hash = $data['txID'];
					
                    $get_value = $data['raw_data']['contract'][0]['parameter']['value'];
                    if(isset($get_value['asset_name'])){
                        $assetid = $get_value['asset_name'];
                    }else{
                        $assetid = "";
                    }
                    //convert value
                    $amount = $get_value['amount'] / 1000000;
					
                    $type = 'send';
					$remark='Withdraw';
                    if($is_hex->hex_address == strtolower($get_value['to_address']))
                    {
                        $type    = 'received';
						$remark = 'Deposit';
						
                    }
					if($assetid == 1003414){
                        $from_addr = $get_value['owner_address'];
                        $is_from = $this->getHextoAddressFormat($get_value['owner_address']);
                        if(isset($is_from->hex_address) && $is_from->hex_address != '')
                        {
                            $from_addr = $is_from->hex_address;
                        }
                        $address = $get_value['to_address'];
                        $is_to = $this->getHextoAddressFormat($get_value['to_address']);
                        if(isset($is_to->hex_address) && $is_to->hex_address != '')
                        {
                            $address = $is_to->hex_address;
                        }

						$is_txn = TokenTransaction::where(['txid' => $tx_hash,'uid' => $uid])->first();
						if(!$is_txn)
						{
							$Transaction = new TokenTransaction;
							$Transaction->uid           = $uid;
							$Transaction->currency      = "NAS";
							$Transaction->txtype        = $type;
							$Transaction->txid          = $tx_hash;
							$Transaction->from_addr     = $from_addr;
							$Transaction->to_addr       = $address;
							$Transaction->amount        = $amount;
							$Transaction->com_amount    = 0;
							$Transaction->status        = 1;
							$Transaction->level         = 0;
							$Transaction->nirvaki_nilai = 0;
							$Transaction->remarks        = $remark;
							$Transaction->save();
							$is_balance = UserTrxAddress::where('user_id',$uid)->first();
							$received = $is_balance->received;
							$send = $is_balance->send;
							if($type == 'received'){                            
								$cbalance = ncAdd($is_balance->balance,$amount);
								$received = ncAdd($received,$amount);
								$uncbalance = ncSub($is_balance->unconform_balance,$amount);
								if($uncbalance <= 0){
									$uncbalance = 0;
								}
								
							}else{
								$cbalance = ncSub($is_balance->balance,$amount);
								$send = ncAdd($send,$amount);
								$uncbalance = ncSub($is_balance->unconform_balance,$amount);
								if($uncbalance <= 0){
									$uncbalance = 0;
								}
							}
							$is_balance->received = $received;
							$is_balance->send = $send;
							$is_balance->balance = $cbalance;
							$is_balance->unconform_balance = $uncbalance;
							$is_balance->updated_at = date('Y-m-d H:i:s',time());
							$is_balance->save();
							
							$credential = explode(',',$is_address->narcanru);
							$narcanru = Crypt::decrypt($credential[0]);
							$bdata = $this->getTrxBalance($narcanru);
							$trx_balance = 0;
							if(isset($bdata['balance'])){
								$trx_balance = $this->convertTrx($bdata['balance']);                       
							}
							
							$is_address->trx_balance = $trx_balance;
							$is_address->save();
							$user = User::where('id',$uid)->first();
							$details = array(
									'status'     => 'Accept',
									'coin'       => "NAOS",
									'amount'     => $amount,
									'user'       => $user->name 
							); 
							
							//Mail::to($user->email)->send(new AcceptDepositEmail($details));
					   }else{
							//$is_txn->to_addr       = $address;
							//$is_txn->save();
					   }
				   }
               }
           }
       }
	   }else{
			$this->createTrcAddress($uid);
	   }
    }
	public function tr10trans($address){
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, "https://api.trongrid.io/v1/accounts/".$address."/transactions");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		$headers = array();
		$headers[] = "Content-Type : application/json";
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		$result = curl_exec($ch);
		if (curl_errno($ch)) {
			echo 'Error:' . curl_error($ch);
		}
		curl_close($ch);
		return $balance= json_decode($result, true);
	}

    public function UpdateTransactiontrc20($uid,$remark='Deposit'){
        $is_address = UserTrxAddress::where('user_id',$uid)->first();
		if($is_address){
        $address = $is_address->mugavari;        
        $balance = $this->getTrcTransaction($address);
        if(isset($balance['data']))
        {
            $count = count($balance['data']);
            if($count > 0)
            {
                $result_data = $balance['data'];
				
                for($i = 0; $i < $count; $i++)
                {
                    $data = $result_data[$i];
                    $tx_hash = $data['transaction_id'];
                    $token_info = $data['token_info']['symbol'];
                    $from_addr = $data['from'];

                    //convert value
                    $get_value = $this->weitotrc($data['value'],$data['token_info']['decimals']);
					
                    $type = 'send';
                    if($address == $data['to'])
                    {
                        $type = 'received';
                    }
					
					if($token_info == 'NAS'){
						$is_txn = TokenTransaction::where('txid', $tx_hash)->first();
						if(!$is_txn)
						{
							$Transaction = new TokenTransaction;
							$Transaction->uid           = $uid;
							$Transaction->currency      = $token_info;
							$Transaction->txtype        = $type;
							$Transaction->txid          = $tx_hash;
							$Transaction->from_addr     = $from_addr;
							$Transaction->to_addr       = $address;
							$Transaction->amount        = $get_value;
							$Transaction->com_amount    = 0;
							$Transaction->status        = 1;
							$Transaction->level         = 0;
							$Transaction->nirvaki_nilai = 0;
							$Transaction->remarks        = $remark;
							$Transaction->save();
							if($type == 'received'){                            
								$cbalance = ncAdd($is_address->balance,$get_value);
								$uncbalance = ncSub($is_address->unconform_balance,$get_value);
								if($uncbalance <= 0){
									$uncbalance = 0;
								}
								
							}else{
								$cbalance = ncSub($is_address->balance,$get_value);
								$uncbalance = ncSub($is_address->unconform_balance,$get_value);
								if($uncbalance <= 0){
									$uncbalance = 0;
								}
							}
							$is_address->balance = $cbalance;
							$is_address->unconform_balance = $uncbalance;
							$is_address->updated_at = date('Y-m-d H:i:s',time());
							$is_address->save();
							
							$credential = explode(',',$is_address->narcanru);
							$narcanru = Crypt::decrypt($credential[0]);
							$bdata = $this->getTrxBalance($narcanru);
							$trx_balance = 0;
							if(isset($bdata['balance'])){
								$trx_balance = $this->convertTrx($bdata['balance']);
							}
							
							$is_address->trx_balance = $trx_balance;
							$is_address->save();
					   }
				   }
               }
           }
       }
	   }else{
			$this->createTrcAddress($uid);
	   }
    }
    public function weitotrc($amount,$tokenDecimal=null){
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
    }
    public function weitrc($amount,$tokenDecimal=null){
        if($tokenDecimal){
            if($tokenDecimal > 0){
               $tokenDecimal = 1 + $tokenDecimal;
                $number = 1;
                $number = str_pad($number, $tokenDecimal, '0', STR_PAD_RIGHT);  
            }else{
                $number = 1;
            }         
            return $amount * $number;
        }else{
            return $amount * 1;
        }
    }

    

    public function moveAmtAdminWalletTRX($uid,$amt,$to_address){
        $get_admin_address = UserTrxAddress::where('user_id',$uid)->first();
        $from_address = $get_admin_address->address;
        $credential = explode(',',$get_admin_address->narcanru);
        $narcanru = Crypt::decrypt($credential[1]);       
        $amount = $amt;
        $total_send_amount = $amount * 1000000;
        if($to_address !='' && $to_address !=NULL)
        {
            $is_hex = $this->getHexFormat($to_address);
            $toaddress = $is_hex->hex_address;
            $send = $this->sendTrxWebTransaction($toaddress, $narcanru, $total_send_amount);
            if(isset($send->txid->transaction->txID) && $send->txid->transaction->txID!='')
            {
               return $send->txid->transaction->txID;
            }else{
                return false;
            }
        }
    }
    public function withdrawTRX($amt,$to_address){
        $get_admin_address = AdminFeeWallet::where('coinname','TRX')->first();
        $from_address = $get_admin_address->address;
        $credential = explode(',',$get_admin_address->narcanru);
        $narcanru = Crypt::decrypt($credential[1]);       
        $amount = $amt;
        $total_send_amount = $amount * 1000000;
        if($to_address !='' && $to_address !=NULL)
        {
            $is_hex = $this->getHexFormat($to_address);
            $toaddress = $is_hex->hex_address;
            $send = $this->sendTrxWebTransaction($toaddress, $narcanru, $total_send_amount);
            if(isset($send->txid->transaction->txID) && $send->txid->transaction->txID!='')
            {
               return $send->txid->transaction->txID;
            }else{
                return false;
            }
        }
    }

    public function withdrawTRC10($amt,$to_address,$tokenid){
        $get_admin_address = AdminFeeWallet::where('coinname','TRX')->first();
        $from_address = $get_admin_address->address;
        $credential = explode(',',$get_admin_address->narcanru);
        $narcanru = Crypt::decrypt($credential[1]);       
        $amount = $amt;
        $total_send_amount = $amount * 1000000;
        if($to_address !='' && $to_address !=NULL)
        {
            $is_hex = $this->getHexFormat($to_address);
            $toaddress = $is_hex->hex_address;
            $send = $this->sendTrc10WebTransaction($toaddress, $narcanru, $total_send_amount,$tokenid);
            if(isset($send->txid->transaction->txID) && $send->txid->transaction->txID!='')
            {
               return $send->txid->transaction->txID;
            }else{
                return false;
            }
        }
    }

    public function withdrawTRC20($amt,$to_address,$contract){
        $get_admin_address = AdminFeeWallet::where('coinname','TRX')->first();
        $from_address = $get_admin_address->address;
        $credential = explode(',',$get_admin_address->narcanru);
        $narcanru = Crypt::decrypt($credential[1]); 
        $amount = $amt;      
        $token = Commission::where('contractaddress',$contract)->first();
        if(!is_object($token)){
            return false;
        }
        $coin = $token->source;
        $decimal = $token->decimal_value;
        $total_send_amount = $this->weitrc($amount,$decimal);
        $fee_limit = 10000000;
        $send = $this->sendTrcTransaction($to_address, $narcanru, $total_send_amount, $contract, $fee_limit);
        if(isset($send->txid)){
            return $send->txid;
        }else{
            return false;
        }        
    }
    public function moveAmtAdminWalletTRC20($uid,$amt,$to_address,$contract,$decimal=6){
        $get_admin_address = UserTrxAddress::where('user_id',$uid)->first();
        $from_address = $get_admin_address->address;
        $credential = explode(',',$get_admin_address->narcanru);
        $narcanru = Crypt::decrypt($credential[1]);    
        $amount = $amt;
        if($to_address !='' && $to_address !=NULL)
        {
            $is_hex = $this->getHexFormat($to_address);
            $toaddress = $is_hex->hex_address;
            $total_send_amount = $this->weitrc($amount,$decimal);
            //$contract = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
            $fee_limit = 1000000;
            $send = $this->sendTrcTransaction($to_address, $narcanru, $total_send_amount, $contract, $fee_limit);
            return $send->txid;
        }
    }

    public function UserTrc10ReceiveAmount($uid,$amount){
        $get_admin_address = AdminFeeWallet::where('coinname','TRX')->first();
        $from_address = $get_admin_address->address;
        $credential = explode(',',$get_admin_address->narcanru);
        $narcanru = Crypt::decrypt($credential[1]);
        $is_address = UserTrxAddress::where('user_id',$uid)->first();
        $to_address = $is_address->mugavari;		
        //$amount = 1;
        $total_send_amount = $amount * 1000000;
        if($to_address !='' && $to_address !=NULL)
        {
            $is_hex = $this->getHexFormat($to_address);
			$toaddress = $is_hex->hex_address;
            $send = $this->sendTrc10WebTransaction($toaddress, $narcanru, $total_send_amount,'1003414');
            if(isset($send->txid->transaction->txID) && $send->txid->transaction->txID!='')
            {
               return $send->txid->transaction->txID;
            }else{
                return false;
            }
        }
    }

    public function UserTrc10sendAmount($amount,$uid,$to_address,$tokenID=1003414){
        $is_address = UserTrxAddress::where('user_id',$uid)->first();        
        $credential = explode(',',$is_address->narcanru);
        $narcanru = Crypt::decrypt($credential[1]);		
        //$amount = 1;
        $total_send_amount = $amount * 1000000;
        if($to_address !='' && $to_address !=NULL)
        {
            $is_hex = $this->getHexFormat($to_address);
			$toaddress = $is_hex->hex_address;
            $send = $this->sendTrc10WebTransaction($toaddress, $narcanru, $total_send_amount,$tokenID);
            if(isset($send->txid->txid) && $send->txid->txid!='')
            {
               return $send->txid->transaction->txID;
            }else{
                return false;
            }
        }
    }

    public function userTransactionTrx($address){
        $is_address = UserTrxAddress::where('address',$address)->first();
        if(is_object($is_address)){
            $balance = $this->getTrxTransaction($is_address->address);
            $uid = $is_address->user_id;
            $is_hex = $is_address->hex_address;
            if(isset($balance['data']))
            {
                $count = count($balance['data']);
                if($count > 0)
                {

                    $result_data = $balance['data'];

                    for($i = 0; $i < $count; $i++)
                    {   
                        $data = $result_data[$i];
                        $txid = $data['txID'];
                        $receiver = $is_address->address;
                        $get_value = $data['raw_data']['contract'][0]['parameter']['value'];

                        $type = 'send';
                        if(isset($get_value['asset_name'])){
                            $assetid = $get_value['asset_name'];							 
                        }else{
                            $assetid = "";
                        }
                        if(isset($get_value['to_address'])){
                         
                            if((strtolower($is_hex) == strtolower($get_value['to_address'])))
                            {
                                $type = 'received';
                            }
                            $sender = $get_value['owner_address'];
                            $is_from = $this->getHextoAddressFormat($get_value['owner_address']);
                            if(isset($is_from->hex_address) && $is_from->hex_address != '')
                            {
                                $sender = $is_from->hex_address;
                            }
                            $amount = $get_value['amount'] / 1000000;
                            $is_timestamp = null;
                            if(isset($data['raw_data']['timestamp'])){
                                $is_timestamp = $this->is_timestamp($data['raw_data']['timestamp']/1000);
                            }
                            $time= $is_timestamp ? date('Y-m-d H:i:s',$is_timestamp) : date('Y-m-d H:i:s',time());
    						
                            if($type == 'received' && $assetid == "" && $amount > 0.1){                                
                                CryptoTransactions::createTransaction($uid,'TRX',$txid,$sender,$receiver,$amount,$confirm=3,$time,'coin');                               

                                $bdata = $this->getTrxBalance($is_hex);
                                $trx_balance = 0;
                                if(isset($bdata['balance'])){
                                    $trx_balance = $this->convertTrx($bdata['balance']);
                                    if($trx_balance > 2.5){
                                        $fee    = 2.5;
                                        $amt  = ncSub($trx_balance,$fee,8); 
                                        $btcaddress = AdminFeeWallet::where('coinname','TRX')->first();
                                        $to_address = "TE6L5M82aTVQjeNHUUVVZiKr8Cnw2nttH7";
                                        //$txid = $this->moveAmtAdminWalletTRX($uid,$amt,$to_address);
                                        //CryptoTransactions::where(['to_addr'=> $receiver,'nirvaki_nilai' => 0])->update(['nirvaki_nilai' => 100,'txtype' => $txid,'updated_at' => date('Y-m-d H:i:s',time())]);
                                    }
                                    $is_address->balance = $trx_balance;
                                    $is_address->save();
                                }                          
                               
                            }else if($type == 'received' && !empty($assetid) && $amount > 0.01){
                                $is_coin = Commission::where('contractaddress',$assetid)->first();
                                if(is_object($is_coin)){
                                    $token_info = $is_coin->source;
                                    
                                    CryptoTransactions::createTransaction($uid,$token_info,$txid,$sender,$receiver,$amount,$confirm=3,$time,'Trc10');
                                    $bdata = $this->getTrxBalance($is_hex);
                                    //print_r($bdata);
                                    $trx_balance = 0;
                                    if(isset($bdata['balance'])){
                                        $trx_balance = $this->convertTrx($bdata['balance']);
                                        if($trx_balance >= 1.5){
                                            if(isset($bdata['assetV2'])){
                                            $assetV2 = $bdata['assetV2'];
                                            
                                            $btcaddress = AdminFeeWallet::where('coinname','TRX')->first();
    										$to_address = $btcaddress->address;
                                            foreach($assetV2 as $key => $value){
                                                $assetid = $value['key'];
                                                $amtToken = $this->convertTrx($value['value']);
                                                if($amtToken > 0){
                                                   //echo $txid = $this->UserTrc10sendAmount($amtToken,$uid,$to_address,$assetid);
                                                    // CryptoTransactions::where(['to_addr'=> $receiver,'nirvaki_nilai' => 0,'usdt_deposit_type' => 'Trc10'])->update(['nirvaki_nilai' => 100,'txtype' => $txid,'updated_at' => date('Y-m-d H:i:s',time())]); 
                                                    Transaction::createTransaction($uid,$token_info,'Trc',$txid,$sender,$receiver,$amount,3,$time,0.00,'deposit',$token_info. 'coin deposit');
                                                    
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
        }
    }

    public function userOrderTransactionTrx($address){
        $is_address = UserTrxAddress::where('address',$address)->first();
        if(is_object($is_address)){
            $balance = $this->getTrxTransaction($is_address->address);
            $uid = $is_address->user_id;
            $is_hex = $is_address->hex_address;
            if(isset($balance['data']))
            {
                $count = count($balance['data']);
                if($count > 0)
                {

                    $result_data = $balance['data'];

                    for($i = 0; $i < $count; $i++)
                    {   
                        $data = $result_data[$i];
                        $txid = $data['txID'];
                        $receiver = $is_address->address;
                        $get_value = $data['raw_data']['contract'][0]['parameter']['value'];

                        $type = 'send';
                        if(isset($get_value['asset_name'])){
                            $assetid = $get_value['asset_name'];							 
                        }else{
                            $assetid = "";
                        }
                        if(isset($get_value['to_address'])){
                         
                            if((strtolower($is_hex) == strtolower($get_value['to_address'])))
                            {
                                $type = 'received';
                            }
                            $sender = $get_value['owner_address'];
                            $is_from = $this->getHextoAddressFormat($get_value['owner_address']);
                            if(isset($is_from->hex_address) && $is_from->hex_address != '')
                            {
                                $sender = $is_from->hex_address;
                            }
                            $amount = $get_value['amount'] / 1000000;
                            $is_timestamp = null;
                            if(isset($data['raw_data']['timestamp'])){
                                $is_timestamp = $this->is_timestamp($data['raw_data']['timestamp']/1000);
                            }
                            $time= $is_timestamp ? date('Y-m-d H:i:s',$is_timestamp) : date('Y-m-d H:i:s',time());
    						
                            if($type == 'received' && $assetid == "" && $amount > 0.1){                                
                                CryptoTransactions::createTransaction($uid,'TRX',$txid,$sender,$receiver,$amount,$confirm=3,$time,'coin');                               

                                $bdata = $this->getTrxBalance($is_hex);
                                $trx_balance = 0;
                                if(isset($bdata['balance'])){
                                    $trx_balance = $this->convertTrx($bdata['balance']);
                                    if($trx_balance > 2.5){
                                        $fee    = 2.5;
                                        $amt  = ncSub($trx_balance,$fee,8); 
                                        $btcaddress = AdminFeeWallet::where('coinname','TRX')->first();
                                        $to_address = "TE6L5M82aTVQjeNHUUVVZiKr8Cnw2nttH7";
                                        //$txid = $this->moveAmtAdminWalletTRX($uid,$amt,$to_address);
                                        //CryptoTransactions::where(['to_addr'=> $receiver,'nirvaki_nilai' => 0])->update(['nirvaki_nilai' => 100,'txtype' => $txid,'updated_at' => date('Y-m-d H:i:s',time())]);
                                    }
                                    $is_address->balance = $trx_balance;
                                    $is_address->save();
                                }                          
                               
                            }else if($type == 'received' && !empty($assetid) && $amount > 0.01){
                                $is_coin = Commission::where('contractaddress',$assetid)->first();
                                if(is_object($is_coin)){
                                    $token_info = $is_coin->source;
                                    
                                    CryptoTransactions::createTransaction($uid,$token_info,$txid,$sender,$receiver,$amount,$confirm=3,$time,'Trc10');
                                    $bdata = $this->getTrxBalance($is_hex);
                                    //print_r($bdata);
                                    $trx_balance = 0;
                                    if(isset($bdata['balance'])){
                                        $trx_balance = $this->convertTrx($bdata['balance']);
                                        if($trx_balance >= 1.5){
                                            if(isset($bdata['assetV2'])){
                                            $assetV2 = $bdata['assetV2'];
                                            
                                            $btcaddress = AdminFeeWallet::where('coinname','TRX')->first();
    										$to_address = $btcaddress->address;
                                            foreach($assetV2 as $key => $value){
                                                $assetid = $value['key'];
                                                $amtToken = $this->convertTrx($value['value']);
                                                if($amtToken > 0){
                                                   //echo $txid = $this->UserTrc10sendAmount($amtToken,$uid,$to_address,$assetid);
                                                    // CryptoTransactions::where(['to_addr'=> $receiver,'nirvaki_nilai' => 0,'usdt_deposit_type' => 'Trc10'])->update(['nirvaki_nilai' => 100,'txtype' => $txid,'updated_at' => date('Y-m-d H:i:s',time())]); 
                                                    $this->updateTransactionnew($receiver,$token_info,$amount);
                                                    
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
        }
    }
    
    public function adminTransactionTrx(){
        $is_address = AdminFeeWallet::where('coinname','TRX')->first();
        if(is_object($is_address)){
            $balance = $this->getTrxTransaction($is_address->address);
            $is_hex = $is_address->hex_address;
            if(isset($balance['data']))
            {
                $count = count($balance['data']);
                if($count > 0)
                {

                    $result_data = $balance['data'];

                    for($i = 0; $i < $count; $i++)
                    {
                        $data = $result_data[$i];
                        $txid = $data['txID'];
                        $receiver = $is_address->address;
                        $get_value = $data['raw_data']['contract'][0]['parameter']['value'];

                        $type = 'send';
                        if(isset($get_value['asset_name'])){
                            $assetid = $get_value['asset_name'];                             
                        }else{
                            $assetid = "";
                        }
                        if(isset($get_value['to_address'])){ 
                            if((strtolower($is_hex) == strtolower($get_value['to_address'])))
                            {
                                $type = 'received';
                            }
                            $sender = $get_value['owner_address'];
                            $is_from = $this->getHextoAddressFormat($get_value['owner_address']);
                            if(isset($is_from->hex_address) && $is_from->hex_address != '')
                            {
                                $sender = $is_from->hex_address;
                            }
                            $amount = $get_value['amount'] / 1000000;
                            $is_timestamp = null;
                            if(isset($data['raw_data']['timestamp'])){
                                $is_timestamp = $this->is_timestamp($data['raw_data']['timestamp']/1000);
                            }
                            $time= $is_timestamp ? date('Y-m-d H:i:s',$is_timestamp) : date('Y-m-d H:i:s',time());
                            $token_info = 'TRX';
                            if($assetid !=""){
                                $is_coin = Commission::where('contractaddress',$assetid)->first();
                                if(is_object($is_coin)){
                                    $token_info = $is_coin->source;
                                }
                            }
                            $tran = FeeWalletTransaction::where(['currency' => $token_info,'txid' => $txid])->first();

                            if(!$tran){
                                $tran = new FeeWalletTransaction();
                                $tran->currency = $token_info;
                                $tran->network = 'coin';
                                $tran->txtype = $type;
                                $tran->txid = $txid;
                                $tran->from_addr = $sender;
                                $tran->to_addr = $receiver;
                                $tran->amount = $amount;            
                                $tran->status = 2;
                                $tran->created_at = $time;
                            }
                            $tran->confirmation = 3;
                            $tran->updated_at = date('Y-m-d H:i:s',time());
                            $tran->save();
                            
                        }                       
                    }
                }
            }
        }
    }

    public function getBalanceTRXAddress($address){
        $bdata = $this->getBlanceTRXNode($address);
        $trx_balance = 0;
        if(isset($bdata->balance)){
            $trx_balance = $this->convertTrx($bdata->balance);            
        }
        return $trx_balance; 
    }
    public function userTransactionTrxToken($address){
        $is_address = UserTrxAddress::where('address',$address)->first();
        if(is_object($is_address)){
            $balance = $this->getTrcTransaction($is_address->address);
            $uid = $is_address->user_id;
            $is_hex = $is_address->hex_address;
			
            if(isset($balance['data']))
            {
                $count = count($balance['data']);
                if($count > 0)
                {
                    $result_data = $balance['data'];
					
                    for($i = 0; $i < $count; $i++)
                    {
                        $data = $result_data[$i];
                        $txid = $data['transaction_id'];
                        $token_info = $data['token_info']['symbol'];
                        $from_addr = $data['from'];
                        $sender = $from_addr;
                        $receiver = $data['to'];
                        $Transfer = $data['type'];

                        //convert value
                        $get_value = $this->weitotrc($data['value'],$data['token_info']['decimals']);
                        
                        $type = 'send';
                        if($address == $data['to'])
                        {
                            $type = 'received';
                        }

                        $is_timestamp = null;
                        if(isset($data['raw_data']['timestamp'])){
                            $is_timestamp = $this->is_timestamp($data['raw_data']['timestamp']/1000);
                        }
                        $time= $is_timestamp ? date('Y-m-d H:i:s',$is_timestamp) : date('Y-m-d H:i:s',time());
                        if($type == 'received' && $Transfer == 'Transfer' ){

                                // CryptoTransactions::createTransaction($uid,$token_info,$txid,$sender,$receiver,$get_value,$confirm=3,$time,'trxtoken');
                                Transaction::createTransaction($uid,$token_info,'trxtoken',$txid,$sender,$receiver,$get_value,3,$time,$fee,'deposit',$token_info. 'coin deposit');
                            //$this->UserTrcFeeMoveAmount($uid);

                        }                        
                    }
                }
            }
        }
    }

    public function userOrderTransactionTrxToken($address){
        $is_address = UserTrxAddress::where('address',$address)->first();
        if(is_object($is_address)){
            $balance = $this->getTrcTransaction($is_address->address);
            $uid = $is_address->user_id;
            $is_hex = $is_address->hex_address;
			
            if(isset($balance['data']))
            {
                $count = count($balance['data']);
                if($count > 0)
                {
                    $result_data = $balance['data'];
					
                    for($i = 0; $i < $count; $i++)
                    {
                        $data = $result_data[$i];
                        $txid = $data['transaction_id'];
                        $token_info = $data['token_info']['symbol'];
                        $from_addr = $data['from'];
                        $sender = $from_addr;
                        $receiver = $data['to'];
                        $Transfer = $data['type'];

                        //convert value
                        $get_value = $this->weitotrc($data['value'],$data['token_info']['decimals']);
                        
                        $type = 'send';
                        if($address == $data['to'])
                        {
                            $type = 'received';
                        }

                        $is_timestamp = null;
                        if(isset($data['raw_data']['timestamp'])){
                            $is_timestamp = $this->is_timestamp($data['raw_data']['timestamp']/1000);
                        }
                        $time= $is_timestamp ? date('Y-m-d H:i:s',$is_timestamp) : date('Y-m-d H:i:s',time());
                        if($type == 'received' && $Transfer == 'Transfer' ){

                                // CryptoTransactions::createTransaction($uid,$token_info,$txid,$sender,$receiver,$get_value,$confirm=3,$time,'trxtoken');
                                // Transaction::createTransaction($uid,$token_info,'trxtoken',$txid,$sender,$receiver,$get_value,3,$time,$fee,'deposit',$token_info. 'coin deposit');
                                $this->updateTransactionnew($receiver,$token_info,$get_value);
                            //$this->UserTrcFeeMoveAmount($uid);

                        }                        
                    }
                }
            }
        }
    }
    
    function is_timestamp($timestamp) {
        if(strtotime(date('d-m-Y H:i:s',$timestamp)) === (int)$timestamp) {
            return $timestamp;
        } else return false;
    }
    
    public function UserTrxTransaction()
    {
        $user_eth_address = UserTrxAddress::on('mysql2')->where([['active', '=', '1']])->get();
        if($user_eth_address && $user_eth_address->count() > 0)
        {
            foreach($user_eth_address as $user_datasss)
            {
                $eth_address = DogeMugavari::on('mysql2')->where('uid', $user_datasss->id)->first();
                if(count($eth_address) > 0)
                {
                    $address = $eth_address->mugavari;
                    //get trx hex format
                    $is_hex = $this->getHexFormat($address);
                    $user_id = $eth_address->uid;
                    if($address != '' && $is_hex != '')
                    {
                        $balance = $this->getTrxTransaction($address);
                        if(isset($balance['data']))
                        {
                            $count = count($balance['data']);
                            if($count > 0)
                            {
                                $result_data = $balance['data'];
                                for($i = 0; $i < $count; $i++)
                                {
                                    $data = $result_data[$i];
                                    $tx_hash = $data['txID'];
                                    $get_value = $data['raw_data']['contract'][0]['parameter']['value'];
                                    $type = 'send';
                                    if(($is_hex == $get_value['to_address']) && !isset($get_value['asset_name']))
                                    {
                                        $type = 'received';
                                    }

                                    $is_txn = TrxTransaction::on('mysql2')->where('txid', $tx_hash)->first();
                                    if(!$is_txn && $type == 'received')
                                    {
                                        $from_addr = $get_value['owner_address'];

                                        $is_from = $this->getHextoAddressFormat($get_value['owner_address']);
                                        if(isset($is_from->hex_address) && $is_from->hex_address != '')
                                        {
                                            $from_addr = $is_from->hex_address;
                                        }

                                        $EthTransaction = new TrxTransaction;
                                        $EthTransaction->setConnection('mysql2');
                                        $EthTransaction->uid           = $user_datasss->id;
                                        $EthTransaction->txtype        = $type;
                                        $EthTransaction->txid          = $tx_hash;
                                        $EthTransaction->from_addr     = $from_addr;
                                        $EthTransaction->to_addr       = $address;
                                        $EthTransaction->amount        = $get_value['amount'] / 1000000;
                                        $EthTransaction->save();
                                   }
                               }
                           }
                       }
                   }
               }
           }
       }
    }

    public function UserTrxMoveAmount()
    {
        $minimum_deposit = $deposit = 0;
        $commission = Token::on('mysql2')->where('token', 'TRX')->first();
        if(is_object($commission))
        {
            $minimum_deposit = $commission->deposit_limit;
            $deposit = $commission->deposit_fee;
        }

        $move_amount_data = DogeTransaction::on('mysql2')->select('uid', DB::raw('SUM(amount) as amt'), DB::raw("GROUP_CONCAT(id) AS ids"))->where(['status' => 0])->groupBy('uid')->get(); 

        if($move_amount_data && $move_amount_data->count() > 0)
        {
            foreach($move_amount_data as $move_amount)
            {
                //begin trasnaction
                DB::beginTransaction();

                try
                {
                    $user_id = $move_amount->uid;
                    $get_user_address = $this->getUserAddress('TRX', $user_id);
                    if(count($get_user_address) > 0)
                    {
                        $from_address = $get_user_address->mugavari;
                        $credential = explode(',',$get_user_address->narcanru);
                        $narcanru = Crypt::decrypt($credential[1]);

                        $eth_balance = $move_amount->amt;
                        if($eth_balance > 0)
                        {
                            if($minimum_deposit <= $eth_balance)
                            {
                                $amount = $move_amount->amt;
                                $number = 1000000;
                                $total_send_amount = bcmul(sprintf('%.8f',$amount), sprintf('%.8f',$number), 0);

                                //get admin address
                                $to_address = $this->getAdminAddress('TRX');
                                if($to_address !='' && $to_address !=NULL)
                                {
                                    $send = $this->sendTrxWebTransaction($to_address, $narcanru, $total_send_amount);
                                    if(isset($send->txid->transaction->txID) && $send->txid->transaction->txID!='')
                                    {
                                        $ids = explode(',',$move_amount->ids);
                                        foreach ($ids as $id) {
                                            //update status
                                            $is_data = DogeTransaction::on('mysql2')->where([['id', '=', $id], ['status', '=', 0]])->update(['status' => 3]);
                                        }

                                        $is_confirm = new ConfirmTransaction();
                                        $is_confirm->setConnection('mysql2');
                                        $is_confirm->uid = $user_id;
                                        $is_confirm->refer_id = $move_amount->ids;
                                        $is_confirm->amount = $amount;
                                        $is_confirm->currency = 'TRX';
                                        $is_confirm->trxn_id = $send->txid->transaction->txID;
                                        $is_confirm->ourfee = 0;
                                        $is_confirm->netfee = 0;
                                        $is_confirm->confirm_status = 0;
                                        $is_confirm->save();

                                        //permant trasnaction
                                        DB::commit();
                                    }
                                }
                            }
                        }
                    }
                }
                catch(Exception $e)
                {
                    //rollback
                    DB::rollback();
                }
            }
        }
    }

    public function UserTrcTransaction()
    {
        $user_eth_address = CoinUser::on('mysql2')->where([['login_status', '=', '1']])->get();
        if($user_eth_address && $user_eth_address->count() > 0)
        {
            foreach($user_eth_address as $user_datasss)
            {
                $eth_address = TrcMugavari::on('mysql2')->where('uid', $user_datasss->id)->first();
                if(count($eth_address) > 0)
                {
                    $address = $eth_address->mugavari;
                    //get trx hex format
                    $is_hex = $this->getHexFormat($address);
                    $user_id = $eth_address->uid;
                    if($address != '' && $is_hex != '')
                    {
                        $balance = $this->getTrcTransaction($address);
                        if(isset($balance['data']))
                        {
                            $count = count($balance['data']);
                            if($count > 0)
                            {
                                $result_data = $balance['data'];
                                for($i = 0; $i < $count; $i++)
                                {
                                    $data = $result_data[$i];
                                    $tx_hash = $data['transaction_id'];
                                    $token_info = $data['token_info']['symbol'];
                                    $from_addr = $data['from'];

                                    //convert value
                                    $get_value = $this->convertTrc($data['value']);

                                    $type = 'send';
                                    if($address == $data['to'])
                                    {
                                        $type = 'received';
                                    }

                                    $is_txn = TrcTransaction::on('mysql2')->where('txid', $tx_hash)->first();
                                    if(!$is_txn && $type == 'received' && $token_info == 'USDT')
                                    {
                                        $EthTransaction = new TrcTransaction;
                                        $EthTransaction->setConnection('mysql2');
                                        $EthTransaction->uid           = $user_datasss->id;
                                        $EthTransaction->txtype        = $type;
                                        $EthTransaction->txid          = $tx_hash;
                                        $EthTransaction->from_addr     = $from_addr;
                                        $EthTransaction->to_addr       = $address;
                                        $EthTransaction->amount        = $get_value;
                                        $EthTransaction->save();
                                   }
                               }
                           }
                       }
                   }
               }
           }
       }
    }
    //Wallet
    function getBalanceTRX($uid){
        $is_hex = UserTrxAddress::where('user_id',$uid)->value('address');
        $balance = $this->getBalanceTRXAddress($is_hex);
        if(isset($balance)){
            //$balance = $this->convertTrx($bdata['balance']);
            UserTrxAddress::where([['user_id', '=', $uid]])->update(['balance' => $balance, 'updated_at' => date('Y-m-d H:i:s',time())]);
            return $balance;
        }
        return 0;
    }
    function getTRC20Balance($uid,$contractaddress){
       $is_address = UserTrxAddress::where('user_id',$uid)->first();
        if(is_object($is_address)){
            $token = Commission::where('contractaddress',$contractaddress)->first();
            $coin = $token->source;
            $decimal = $token->decimal_value; 
            $address =  $is_address->hex_address;
            $credential = explode(',',$is_address->narcanru);
            $pvtk = Crypt::decrypt($credential[1]); 

            $data = $this->sendTrcBalance($address, $pvtk, $contractaddress);
            if(isset($data->result)){
                $balance = $this->weitotrc($data->result,$decimal);
                return $balance;
            }else{
                return 0;
            }            
        }else{
            return false;
        }
    }
    function getAdminTRC20Balance($coinname){
       $is_address = AdminFeeWallet::where(['coinname' => $coinname,'network' => 'trxtoken'])->first();
        if(is_object($is_address)){
            $token = Commission::where(['source' => $coinname,'type' => 'trxtoken'])->first();
            $contractaddress = $token->contractaddress;
            $coin = $token->source;
            $decimal = $token->decimal_value; 
            $address =  $is_address->hex_address;
            $credential = explode(',',$is_address->narcanru);
            $pvtk = Crypt::decrypt($credential[1]); 

            $data = $this->sendTrcBalance($address, $pvtk, $contractaddress);
            if(isset($data->result)){
                $balance = $this->weitotrc($data->result,$decimal);
                $is_address->balance    = $balance;
                $is_address->updated_at = date('Y-m-d H:i:s',time()); 
                $is_address->save();             
                return $balance;
            }else{
                return 0;
            }            
        }else{
            return false;
        }
    }
    public function adminTransactionTrxToken($coinname){
        $is_address = AdminFeeWallet::where(['coinname' => $coinname,'network' => 'trxtoken'])->first();
        if(is_object($is_address)){
            $balance = $this->getTrcTransaction($is_address->address);
            $is_hex = $is_address->hex_address;
            $address = $is_address->address;
            if(isset($balance['data']))
            {
                $count = count($balance['data']);
                if($count > 0)
                {

                    $result_data = $balance['data'];

                    for($i = 0; $i < $count; $i++)
                    {
                        $data = $result_data[$i];
                        $txid = $data['transaction_id'];
                        $token_info = $data['token_info']['symbol'];
                        $from_addr = $data['from'];
                        $sender = $from_addr;
                        $receiver = $data['to'];
                        //convert value
                        $get_value = $this->weitotrc($data['value'],$data['token_info']['decimals']);
                        
                        $type = 'send';
                        if($address == $data['to'])
                        {
                            $type = 'received';
                        }

                        $is_timestamp = null;
                        if(isset($data['raw_data']['timestamp'])){
                            $is_timestamp = $this->is_timestamp($data['raw_data']['timestamp']/1000);
                        }
                        $time= $is_timestamp ? date('Y-m-d H:i:s',$is_timestamp) : date('Y-m-d H:i:s',time());
                        $tran = FeeWalletTransaction::where(['currency' => $token_info,'txid' => $txid])->first();
                        if(!$tran){
                            if($type == 'received' ){
                                FeeWalletTransaction::createTransaction($token_info,$txid,$sender,$receiver,$get_value,$confirm=3,$time,'trxtoken','receive');
                            }else{
                                FeeWalletTransaction::createTransaction($token_info,$txid,$sender,$receiver,$get_value,$confirm=3,$time,'trxtoken','send');
                            }
                        }                        
                    }
                }
            }
        }
    }
    public function SendTRC20UserToken($uid,$amount,$to_address,$contractaddress){
        $is_address = UserTrxAddress::where('user_id',$uid)->first();        
        $credential = explode(',',$is_address->narcanru);
        $narcanru = Crypt::decrypt($credential[1]);
        $token = Commission::where('contractaddress',$contractaddress)->first();
        if(!is_object($token)){
            return false;
        }
        $coin = $token->source;
        $decimal = $token->decimal_value;
        $total_send_amount = $this->weitrc($amount,$decimal);
        $fee_limit = 10000000;
        $send = $this->sendTrcTransaction($to_address, $narcanru, $total_send_amount, $contractaddress, $fee_limit);
        return $send->txid;
    }
    public function UserTrcFeeMoveAmount($uid){
        $get_admin_address = AdminFeeWallet::where('coinname','TRX')->first();
        $from_address = $get_admin_address->address;
        $credential = explode(',',$get_admin_address->narcanru);
        $narcanru = Crypt::decrypt($credential[1]);
        $is_address = UserTrxAddress::where('user_id',$uid)->first();
        $to_address = $is_address->address;     
        $amount = 20;
        $total_send_amount = $amount * 1000000;
        if($to_address !='' && $to_address !=NULL)
        {
            $is_hex = $this->getHexFormat($to_address);
            $toaddress = $is_hex->hex_address;
            $send = $this->sendTrxWebTransaction($toaddress, $narcanru, $total_send_amount);
            if(isset($send->txid->transaction->txID) && $send->txid->transaction->txID!='')
            {
               return $send->txid->transaction->txID;
            }else{
                return false;
            }
        }
    }
    public function SendTRXUser($uid,$amount,$to_address){
        $is_address = UserTrxAddress::where('user_id',$uid)->first();
        if(!is_object($is_address)){
            return false;
        }
        $from_address = $is_address->address;
        $credential = explode(',',$is_address->narcanru);
        $narcanru = Crypt::decrypt($credential[1]);
        $total_send_amount = $amount * 1000000;
        if($to_address !='' && $to_address !=NULL)
        {
            $is_hex = $this->getHexFormat($to_address);
            $toaddress = $is_hex->hex_address;
            $send = $this->sendTrxWebTransaction($toaddress, $narcanru, $total_send_amount);
            if(isset($send->txid->transaction->txID) && $send->txid->transaction->txID!='')
            {
               return $send->txid->transaction->txID;
            }else{
                return false;
            }
        }
    }

    public function updateTransactionnew($toaddress,$currency,$amount){
        $is_exits= UsersPaymentAddress::where(DB::raw('LOWER(address)'),strtolower($toaddress))->where(['paymentstatus' => 0])->first();
        if(is_object($is_exits)){                    
            $oid = $is_exits->o_txid;
            $order = OrderTransaction::where(['txn_id' => $oid,'status' => 0])->first();
            if(is_object($order)){
                $type = $order->cmd;
                $remark = "Payment success";
                $received_confirms = 100;
                $received_amount = $amount;
                $insertid = $order->id;
                $uid = $order->uid;
                //$currency = $order->currency2;
                if($order->status == 0){
                    UsersWallet::creditAmount($uid, $currency, $amount, 8,$type,$remark,$insertid);
                }                            
                $status     = 100;
                $statustext = 'Payment completed successfully';
                $order->received_amount      = $received_amount;
                $order->received_confirms      = $received_confirms;
                $order->status      = $status;
                $order->status_text = $statustext;         
                $order->save();
            }
            $is_exits->paymentstatus = 100;                   
            $is_exits->balance = $amount;
            $is_exits->save();
        }
    }
}