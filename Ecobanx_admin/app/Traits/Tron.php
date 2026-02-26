<?php
namespace App\Traits;

trait Tron 
{	
	// create address
	public function user_address_create(){
		$ch = curl_init();
		$params = array(
			"method" => "get_trx_address"
		);
		curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:8646");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
		$headers = array();
		$headers[] = "Content-Type : application/json";
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		$result = curl_exec($ch);
		if (curl_errno($ch)) {
		    echo 'Error:' . curl_error($ch);
		}
		curl_close($ch);
		return json_decode($result, true);
	}

	public function trx_exec_addr_cUrl($url){
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, "POST");
        curl_setopt($ch, CURLOPT_POST, 1);
		if (curl_errno($ch)) {
			$result = 'Error:' . curl_error($ch);
		} else {
			$result = curl_exec($ch);
		}
		curl_close($ch);
		return json_decode($result, true);
	}
	
	public function getTrxBalance($address)
	{
		$ch = curl_init();
		$params = array(
			"address" => $address
		);
		curl_setopt($ch, CURLOPT_URL, "https://api.trongrid.io/wallet/getaccount");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
		$headers = array();
		$headers[] = "Content-Type : application/json";
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		$result = curl_exec($ch);
		if (curl_errno($ch)) {
		    echo 'Error:' . curl_error($ch);
		}
		curl_close($ch);
		//dd($result);
		return json_decode($result, true);
	}

	public function sendTrxWebTransaction($toAddress, $pvtk, $amount)
	{
		$ch = curl_init();
		$params = array(
			"method" => "send_trxtn",
			"pvtk" => $pvtk,
			"to_address" => $toAddress,
			"amount" => display_format($amount,0)
		);
		//dd($params);
		curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:8646");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
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

	public function getBlanceTRXNode($toAddress)
	{
		$ch = curl_init();
		$params = array(
			"method" => "get_trx_balance",
			"address" => $toAddress
		);
		//dd($params);
		curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:8646");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
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

	public function sendTrc10WebTransaction($toAddress, $pvtk, $amount,$tokenid)
	{
		$ch = curl_init();
		$params = array(
			"method" => "send_trx10",
			"pvtk" => $pvtk,
			"to_address" => $toAddress,
			"tokenID" => $tokenid,
			"amount" => display_format($amount,0)
		);
		//dd($params);
		curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:8646");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
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

	public function getTrxTransaction($address)
	{
		$curl = curl_init();
		curl_setopt_array($curl, array(
		  CURLOPT_URL => "https://api.trongrid.io/v1/accounts/".$address."/transactions",
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
		return json_decode($response, true);

	}

	public function getHexFormat($address)
	{
	    $ch = curl_init();
		$params = array(
			"method" => "get_hex",
			"address" => $address
		);
		curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:8646");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
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

	public function getHextoAddressFormat($address)
	{
	    $ch = curl_init();
		$params = array(
			"method" => "get_hextoaddress",
			"address" => $address
		);
		curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:8646");
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
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
	
	public function convertTrx($amount)
	{
		return $amount / 1000000;
	}

	public function convertTrxAmount($amount)
	{
		return $amount * 1000000;
	}
}
?>