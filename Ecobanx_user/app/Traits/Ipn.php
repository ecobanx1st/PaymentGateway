<?php
namespace App\Traits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Auth;
use App\Models\OrderTransaction;
use App\Models\Ipnhistory;
use App\Models\MerchantSetting;
use App\User;
use App\Models\UsersWallet;
use App\Models\UserMerchant;
use App\Mail\IpnVerification;
use Mail;

trait Ipn 
{
	public function curl_call($params)
	{
    	$ipnurl = $params['ipn_url'];
		$postdata = http_build_query($params);

		$curl = curl_init();
		curl_setopt_array($curl, array(
			CURLOPT_URL 			=> $ipnurl,
			CURLOPT_RETURNTRANSFER 	=> true,
			CURLOPT_ENCODING 		=> "",
			CURLOPT_MAXREDIRS 		=> 10,
			CURLOPT_TIMEOUT 		=> 0,
			CURLOPT_FOLLOWLOCATION 	=> true,
			CURLOPT_HTTP_VERSION 	=> CURL_HTTP_VERSION_1_1,
			CURLOPT_CUSTOMREQUEST 	=> "POST",
			CURLOPT_POSTFIELDS 		=> $params,
			CURLOPT_HTTPHEADER 		=> array(
				"Accept: multipart/form-data",
				"Content-Type: multipart/form-data"
			),
		));
		$response = curl_exec($curl);
		curl_close($curl);
		return $response;
	}

 	public function OrderTrans()
	{ 
		$trans_ipn = OrderTransaction::where('order_count', '=' , 0)->get();
		foreach ($trans_ipn as $key => $value) 
		{
			$status				= $value->status;
			$status_text		= $value->status_text;
			$txn_id				= $value->txn_id;
			$currency1			= $value->currency1;
			$currency2			= $value->currency2;
			$amount1 			= $value->amount1;
			$amount2			= $value->amount2;
			$subtotal			= $value->subtotal;
			$shipping			= $value->shipping;
			$tax				= $value->tax;
			$fee				= $value->fee;
			$net				= $value->net;
			$item_amount		= $value->item_amount;
			$item_name			= $value->item_name;
			$item_desc			= $value->item_desc;
			$item_number		= $value->item_number;
			$invoice			= $value->invoice;
			$custom             = $value->custom;
			$on1				= $value->on1;
			$ov1				= $value->ov1;
			$on2				= $value->on2;
			$ov2				= $value->ov2;
			$send_tx			= $value->extra;
			$received_amount	= $value->received_amount;
			$received_confirms	= $value->received_confirms;
			$uid				= $value->uid;
			$oid				= $value->id;
            $merchnat_api = MerchantSetting::where('uid',$uid)->first();
            if($merchnat_api){
				$ipn_url= $merchnat_api->ipn_url;
				$ipn_secret= $merchnat_api->ipn_secret;
            }else{
               $ipn_url=$value->ipn_url;
               $ipn_secret= "";
            }
            $mid = UserMerchant::getmerchant($uid);
			$post_hmac = "merchant=".$mid."&txn_id=".$txn_id."&amount1=".$amount1."&amount2=".$amount2."&currency1=".$currency1."&currency2=".$currency2."&status=".$status;  
			$hmac = hash_hmac("sha512", $post_hmac, trim($ipn_secret));
			$params = array(
				"status" 			=> $status,
				"status_text" 		=> $status_text,
				"txn_id" 			=> $txn_id,
				"currency1" 		=> $currency1,
				"currency2" 		=> $currency2,
				"amount1" 			=> $amount1,
				"amount2" 			=> $amount2,
				"subtotal" 			=> $subtotal,
				"shipping" 			=> $shipping,
				"tax" 				=> $tax,
				"fee" 				=> $fee,
				"net" 				=> $net,
				"item_amount" 		=> $item_amount,
				"item_name" 		=> $item_name,
				"item_desc" 		=> $item_desc,
				"item_number" 		=> $item_number,
				"invoice" 			=> $invoice,
				"custom" 			=> $custom,
				"on1" 				=> $on1,
				"ov1" 				=> $ov1,
				"on2" 				=> $on2,
				"ov2" 				=> $ov2,
				"send_tx" 			=> $send_tx,
				"received_amount" 	=> $received_amount,
				"received_confirms" => $received_confirms,
				"ipn_url" 			=> $ipn_url,
				"ipn_secret" 		=> $ipn_secret,
				"merchant" 			=> $mid,
				"ipn_mode" 			=> 'hmac',
				"HTTP_HMAC" 		=> $hmac,
			);
			if(!empty($params)){
				$rawtx = $this->curl_call($params);
				if($rawtx){
					$status ="Success";
				}else{
					$status ="Failure";
				}
				$ipn = Ipnhistory::Insert($uid,$oid,$txn_id,$status,$ipn_url,$rawtx);
				$ordernoupdate = OrderTransaction::OrderUpdateTrans($oid);
			}
		}	   
	}

	public function ResentOrderTrans($id){
		//$ids    = \Hashids::decode($id);
		$value  = OrderTransaction::where(['id' => $id])->first();
		if(is_object($value))
		{
			$status             = $value->status;
			$status_text        = $value->status_text;
			$txn_id             = $value->txn_id;
			$currency1          = $value->currency1;
			$currency2          = $value->currency2;
			$amount1            = $value->amount1;
			$amount2            = $value->amount2;
			$subtotal           = $value->subtotal;
			$shipping           = $value->shipping;
			$tax                = $value->tax;
			$fee                = $value->fee;
			$net                = $value->net;
			$item_amount        = $value->item_amount;
			$item_name          = $value->item_name;
			$item_desc          = $value->item_desc;
			$item_number        = $value->item_number;
			$invoice            = $value->invoice;
			$custom             = $value->custom;
			$on1                = $value->on1;
			$ov1                = $value->ov1;
			$on2                = $value->on2;
			$ov2                = $value->ov2;
			$send_tx            = $value->extra;
			$received_amount    = $value->received_amount;
			$received_confirms  = $value->received_confirms;
			$ipn_url            = $value->ipn_url;
			$uid                = $value->uid;
			$updateid           = $value->id;
			$count              = $value->order_count;

			$merchnat_api = MerchantSetting::where('uid',$uid)->first();
			if($merchnat_api){
				$ipn_url    = $merchnat_api->ipn_url;
				$ipn_secret = $merchnat_api->ipn_secret;
			}else{
				$ipn_url=$value->ipn_url;
				$ipn_secret= "";
			}
			$mid = UserMerchant::getmerchant($uid);
			$post_hmac = "merchant=".$mid."&txn_id=".$txn_id."&amount1=".$amount1."&amount2=".$amount2."&currency1=".$currency1."&currency2=".$currency2."&status=".$status;	
			$hmac = hash_hmac("sha512", $post_hmac, trim($ipn_secret));
			$params = array(
				"status"            => $status,
				"status_text"       => $status_text,
				"txn_id"            => $txn_id,
				"currency1"         => $currency1,
				"currency2"         => $currency2,
				"amount1"           => $amount1,
				"amount2"           => $amount2,
				"subtotal"          => $subtotal,
				"shipping"          => $shipping,
				"tax"               => $tax,
				"fee"               => $fee,
				"net"               => $net,
				"item_amount"       => $item_amount,
				"item_name"         => $item_name,
				"item_desc"         => $item_desc,
				"item_number"       => $item_number,
				"invoice"           => $invoice,
				"custom"            => $custom,
				"on1"               => $on1,
				"ov1"               => $ov1,
				"on2"               => $on2,
				"ov2"               => $ov2,
				"send_tx"           => $send_tx,
				"received_amount"   => $received_amount,
				"received_confirms" => $received_confirms,
				"ipn_url" 			=> $ipn_url,
				"ipn_secret" 		=> $ipn_secret,
				"merchant" 			=> $mid,
				"ipn_mode" 			=> 'hmac',
				"HTTP_HMAC" 		=> $hmac,
			);
			if(!empty($params)){
				$rawtx = $this->curl_call($params);
				if($rawtx){
					$status ="Success";
				}else{
					$status ="Failure";
				}
				$updatecount = $count + 1;
				$value->order_count =  $updatecount;
				$value->save();
				$ipn = Ipnhistory::Update_ipn($updateid,$uid,$txn_id,$status,$ipn_url,$rawtx);
				$ordernoupdate = OrderTransaction::OrderUpdateTrans($txn_id);
			}
		}else{
			return redirect('/login-ipn')->with('error_msg', 'Something went wrong!');
		}
		return redirect('/login-ipn')->with('sucess_msg', 'Updated Successfully!');
	}



	public function IpnOrderInformation($orderid,$ipnurl,$secret=NULL)
	{
		$value = OrderTransaction::where(['txn_id' => $orderid])->first();
		if(is_object($value))
		{
			$status				= $value->status;
			$status_text		= $value->status_text;
			$txn_id				= $value->txn_id;
			$currency1			= $value->currency1;
			$currency2			= $value->currency2;
			$amount1			= $value->amount1;
			$amount2			= $value->amount2;
			$subtotal			= $value->subtotal;
			$shipping			= $value->shipping;
			$tax				= $value->tax;
			$fee				= $value->fee;
			$net				= $value->net;
			$item_amount		= $value->item_amount;
			$item_name			= $value->item_name;
			$item_desc			= $value->item_desc;
			$item_number		= $value->item_number;
			$invoice			= $value->invoice;
			$custom				= $value->custom;
			$on1				= $value->on1;
			$ov1				= $value->ov1;
			$on2				= $value->on2;
			$ov2				= $value->ov2;
			$send_tx			= $value->extra;
			$received_amount	= $value->received_amount;
			$received_confirms	= $value->received_confirms;
			$ipn_url			= $value->ipn_url;
			$uid				= $value->uid;
			$updateid			= $value->id;
			
            $merchnat_api = $this->MerchantSettingIpn($uid);
            if($merchnat_api){
                $ipn_url	= $merchnat_api->ipn_url;
                $ipn_secret = $merchnat_api->ipn_secret;
            }else{
                $ipn_url	= $value->ipn_url;
                $ipn_secret	= "";
            }

			$mid = UserMerchant::getmerchant($uid);
			$post_hmac = "merchant=".$mid."&txn_id=".$txn_id."&amount1=".$amount1."&amount2=".$amount2."&currency1=".$currency1."&currency2=".$currency2."&status=".$status;	
			$hmac = hash_hmac("sha512", $post_hmac, trim($ipn_secret));

			$params = array(
				"status" 			=> $status,
				"status_text" 		=> $status_text,
				"txn_id" 			=> $txn_id,
				"currency1" 		=> $currency1,
				"currency2" 		=> $currency2,
				"amount1" 			=> $amount1,
				"amount2" 			=> $amount2,
				"subtotal" 			=> $subtotal,
				"shipping" 			=> $shipping,
				"tax" 				=> $tax,
				"fee" 				=> $fee,
				"net" 				=> $net,
				"item_amount" 		=> $item_amount,
				"item_name" 		=> $item_name,
				"item_desc" 		=> $item_desc,
				"item_number" 		=> $item_number,
				"invoice" 			=> $invoice,
				"custom" 			=> $custom,
				"on1" 				=> $on1,
				"ov1" 				=> $ov1,
				"on2" 				=> $on2,
				"ov2" 				=> $ov2,
				"send_tx" 			=> $send_tx,
				"received_amount" 	=> $received_amount,
				"received_confirms" => $received_confirms,
				"ipn_url" 			=> $ipn_url,
				"ipn_secret" 		=> $ipn_secret,
				"merchant" 			=> $mid,
				"ipn_mode" 			=> 'hmac',
				"HTTP_HMAC" 		=> $hmac,
			);


            if(!empty($params)){
                $rawtx = $this->curl_call($params);
                if($rawtx){
                    $status ="Success";
                }else{
                    $status ="Failure";
                }
				$ipn = Ipnhistory::Update_ipn($updateid,$uid,$txn_id,$status,$ipn_url,$rawtx);
				$ordernoupdate = OrderTransaction::OrderUpdateTrans($oid);
				$profile = UsersProfile::getData($uid);
				if($profile){
					if($profile->optional_mail == 1){
						$user = User::where('id', $uid)->first();
						//$this->sendEmailIpn($user);
					}
				}
				return redirect('/login-ipn')->with('sucess_msg', 'Updated Successfully!');                  
            }
		}else{
			return redirect('/login-ipn')->with('error_msg', 'Something went wrong!'); 
		} 
	}

	public function sendEmailIpn($thisUser,$subject,$message)
	{
		try {
			Mail::to($thisUser['email'])->send(new IpnVerification($subject,$message));
		} catch (Exception $e){
			dd($e);
		}
	}

	public function MerchantSettingIpn($uid)
	{
		$ipncheck = MerchantSetting::where('uid',$uid)->first();
		if($ipncheck){
			$result['ipn_url'] = $ipncheck->ipn_url;
			$result['ipn_secret'] = $ipncheck->ipn_secret;
		}else{
			$result['ipn_url'] ='';
			$result['ipn_secret'] = '';
		}
		return $result;
	}

	public function OrderTransactionIpn($uid)
	{
		$order = OrderTransaction::where('uid',$uid)->first();
		if($order){
			$result['ipn_url'] = $order->ipn_url;
			$result['ipn_secret'] = '';
		}else{
			$result['ipn_url'] ='';
			$result['ipn_secret'] = '';
		}
		return $result;

	}

	public function BlockchainBalanceUpdate()
	{
        $guid = 'd10f98f8-c8bb-42d8-a15e-1b9110007d93';
        $pwd = 'naIJapayment@$%!55';
        $wallet =UsersWallet::get();
        foreach ($wallet as $key => $value) {     
			$uid =$value->uid;
			$address =$value->mukavari;
			$block_balance = $this->balance_curl($guid,$pwd,$address);
			$price =$block_balance['balance'];
			$userbalance = UsersWallet::where(['uid'=>$uid,'mukavari', '=', $address])->first();
			if($userbalance){
				$userbalance->balance = bcadd($userbalance->balance,$price,8);
			}
			else{
				$userbalance->balance = $price;
			}
			$userbalance->save();
			return true;
        }

	}

	public function balance_curl($guid,$pwd,$address)
	{
		$ch = curl_init();
       $url ="http://localhost:3000/merchant/$guid/address_balance?password=$pwd,&address=$address";
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, "{\"id\":\"curltext\",\"method\":\"getbalance\",\"params\":{\"funded\":true}}");
        curl_setopt($ch, CURLOPT_POST, 1);

        $headers = array();
        $headers[] = "Content-Type: application/x-www-form-urlencoded";
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $result = curl_exec($ch);
        if (curl_errno($ch)) {
        echo 'Error:' . curl_error($ch);
        }
        curl_close ($ch);
        $result =  json_decode($response, true);

        return $result;
	}
}
?>