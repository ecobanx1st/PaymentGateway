<?php
namespace App\Traits;

trait Bitcoin
{
	private $ch;
	private $params;
	private $result;
	private $url_link = "https://insight.bitpay.com/api/";
	private function _call($params){
		$this->ch = curl_init();
		$this->params = $params;
		curl_setopt($this->ch, CURLOPT_URL, "http://127.0.0.1:9546");
		curl_setopt($this->ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($this->ch, CURLOPT_POST, 1);
		curl_setopt($this->ch, CURLOPT_POSTFIELDS, json_encode($this->params));
		$headers = array();
		$headers[] = "Content-Type : application/json";
		curl_setopt($this->ch, CURLOPT_HTTPHEADER, $headers);
		$this->result = curl_exec($this->ch);
		if (curl_errno($this->ch)) {
			echo 'Error:' . curl_error($this->ch);
		}
		curl_close($this->ch);

		return json_decode($this->result);
	}

	private function sathosi($amount){
		if(!empty($amount)){
			$value =  bcmul(100000000 , $amount,0);
			//dd($value);
			return intval($value);
		}
	}

	private function sathositobtc($amount){
		if($amount != 0){
			if(!empty($amount)){
				return bcdiv($amount, 100000000, 8);
			}
		} else {
			return $amount;
		}
	}

	// create address
	public function createaddress_btc(){
		$params = array("method" => "create_address");
		if(!empty($params)){
			return $this->_call($params);
		}
	}

	public function createmsigaddress(){
		$params = array("method" => "create_multisig_address");
		if(!empty($params)){
			return $this->_call($params);
		}
	}

	// send bitcoin
	/* public function send($to, $amount, $from=null,$pvtkey, $fee=null){
		$utxo = self::utxo($from);

		if(!empty($utxo)){
    		$params = array(
    			"method" => "create_rawtx",
    			"fromaddr" => $from,
    			"privatekey" => $pvtkey,
    			"toaddr" => $to,
    			"amount" => self::sathosi($amount),
    			"fee" => self::sathosi($fee),
    			"utxo" => $utxo
    		);
    		if(!empty($params)){
    			$rawtx = $this->_call($params);
    			if(!empty($rawtx)){
    				$res = $this->sendbtc($rawtx->rawtx);
					return $res;
    			}
    		}
    	}
	}

	private function sendbtc($rawtx){
		if(!empty($rawtx)){
			$url_link = $this->url_link."tx/send";
			$ch = curl_init();
			$params = array("rawtx" => $rawtx);
			curl_setopt($ch, CURLOPT_URL, $url_link);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
			curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
			curl_setopt($ch, CURLOPT_POST, 1);
			$headers = array();
			$headers[] = "Accept: application/json, text/plain";
			curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
			if(curl_errno($ch)) {
				echo $result = 'Error:' . curl_error($ch);
			} else {
				$result = curl_exec($ch);
			}
			curl_close($ch);
			return json_decode($result);
		}
	}

	 private function utxo($address){
		if(!empty($address)){
			$url_link = $this->url_link."addr/$address/utxo?noCache=1";
			return $this->cUrl1($url_link);
		}
	} */

	public function send($to_address, $amount, $from=null,$pvtkey, $fee=null){
		//amount & fee
		$amount = self::sathosi($amount);
		$amount = number_format($amount, 0, '.', '');

		$fee = self::sathosi($fee);
		$fee = number_format($fee, 0, '.', '');

		$utxo = self::utxo($from);
		$utxo_tx = array();
		$asthosi = 0;
		if(isset($utxo['unspent_outputs']) && count($utxo['unspent_outputs']) > 0)
		{
			for($i = 0; $i < count($utxo['unspent_outputs']); $i++)
			{
				$is_data = $utxo['unspent_outputs'][$i];
				$utxo_tx[$i]['txid'] = $is_data['tx_hash_big_endian'];
				$utxo_tx[$i]['address'] = $from;
				$utxo_tx[$i]['outputIndex'] = $is_data['tx_output_n'];
				//$asthosi+= $is_data['value'];
				$utxo_tx[$i]['satoshis'] = $is_data['value'];
				$utxo_tx[$i]['confirmations'] = $is_data['confirmations'];
				$utxo_tx[$i]['scriptPubKey'] = $is_data['script'];
			}
			//$utxo_tx['satoshis'] = $asthosi;
		}
		$utxo_txs = $utxo_tx;
		$prepared_utxo = json_encode($utxo_txs);

		if(!empty($utxo) && isset($utxo) && !empty($prepared_utxo)){
    		$params = array(
    			"method" => "create_rawtx",
    			"fromaddr" => $from,
    			"privatekey" => $pvtkey,
    			"toaddr" => $to_address,
    			"amount" => (int)$amount,
    			"fee" => (int)$fee,
    			"utxo" => $prepared_utxo
    		);
    		if(!empty($params)){
    			$rawtx = $this->_call($params);
    			if(!empty($rawtx)){
    				return $this->sendraw_tx($rawtx->rawtx);
    			}
    		}
    	}
	}

	private function sendraw_tx($rawtx){
		if(!empty($rawtx)){
			$btcurl = "https://api.blockcypher.com/v1/btc/main/txs/push?token=18e614dc-8c14-4f92-bb78-f413c0d39b45";
			$ch = curl_init();
			$params = json_encode(array(
				"tx" => $rawtx
			));
			curl_setopt($ch, CURLOPT_URL, $btcurl);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
			curl_setopt($ch, CURLOPT_POST, 1);
			$headers = array();
			$headers[] = "Accept: application/json, text/plain";
			curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
			if(curl_errno($ch)) {
				echo $result = 'Error:' . curl_error($ch);
			} else {
				$result = curl_exec($ch);
			}
			curl_close($ch);
			return json_decode($result);
		}
	}

	private function utxo($address){
		if(!empty($address)){
			$url = "https://blockchain.info/unspent?active=".$address;
			return $this->execCurl($url);
		}
	}

	public function tx($txid){
		if(!empty($txid)){
			$url_link = $this->url_link."tx/$txid";
			return json_decode($this->cUrl1($url_link));
		}
	}
	public function getTransactions($address, $from=null, $to=null){
		if(!empty($address)){
			$url_link = $this->url_link."txs/?address=$address";
			return json_decode($this->cUrl1($url_link));
		}
	}

	public function getBalance($address){
		if(!empty($address)){
		    $url_link = "https://chain.so/api/v2/get_address_balance/BTC/".$address;
			$balance = $this->execCurl($url_link);
			return $balance;
		}else{
			return 0;
		}
	}

	public function totalReceived($address){
		if(!empty($address)){
			$url_link = $this->url_link."addr/$address/totalReceived";
			$balance = $this->cUrl1($url_link);
			return $this->sathositobtc($balance);
		}
	}

	public function totalSent($address){
		if(!empty($address)){
			$url_link = $this->url_link."addr/$address/totalSent";
			$balance = $this->cUrl1($url_link);
			return $this->sathositobtc($balance);
		}
	}

	public function unconfirmedBalance($address){
		if(!empty($address)){
			$url_link = $this->url_link."addr/$address/unconfirmedBalance";
			$balance = $this->cUrl1($url_link);
			return $this->sathositobtc($balance);
		}
	}

	private function cUrl1($url_link){
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url_link);
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

	public function execCurl($url_link)
    {
        $ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url_link);
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
		return json_decode($result, true);
    }

}
?>
