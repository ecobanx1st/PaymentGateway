<?php
namespace App\Traits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Auth;
use App\User;
use App\Models\UserWallet;
use App\Models\EthAdminAddress;
use App\Models\UserEthAddressTable;
use App\UserEthTransaction;
use App\EthAdminTransaction;
use App\Models\UserEthAddress;
use App\Models\Cryptotransaction;
use App\Models\BlockAddress;
use App\UsersPaymentAddress;


trait EthClass
{
	public function ethcreate() {
		$ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.blockcypher.com/v1/eth/main/addrs');
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
     function ethUserTransactions($uid){
        $address = UserWallet::getAddress($uid,'ETH');
        if($address){        
            //$url = "http://api.etherscan.io/api?module=account&action=txlist&address=".$address."&startblock=0&endblock=99999999&sort=asc";
            $url = "http://ropsten.etherscan.io/api?module=account&action=txlist&address=".$address."&startblock=0&endblock=99999999&sort=asc";
            $balance = $this->cUrlss($url);
            $count = count($balance['result']);
            if($count > 0)
            {
               $result_data = $balance['result'];
                //return $count;
                for($i = 0; $i < $count; $i++)
                {
                    $data     = $result_data[$i];
                    $txid     = $data['hash'];
                    $confirm  = $data['confirmations'];
                    $from     = $data['from'];
                    $to       = $data['to'];               
                    $time     = date('Y-m-d H:i:s',$data['timeStamp']);               
                    $total    = self::weitoeth($data['value']);
                    $order_no = TransactionString().$uid;
                    $amount   = ncMul($total,1,8);
                    Cryptotransaction::createTransaction($uid,'ETH',$txid,$from,$to,$amount,$confirm,$time);
                }
            }
            return $address;
        }
        return true;
    }

    public function create_user_eth($id)
    {
        $ethaddress = $this->ethcreate();
        $ethtable = new UserEthAddress;
        $ethtable->user_id = $id;
        $ethtable->address = "0x".$ethaddress->address;
        $pvtk = Crypt::encryptString($ethaddress->private);
        $pubk = Crypt::encryptString($ethaddress->public);
        $ethtable->narcanru = $pvtk.','.$pubk;
        $ethtable->balance = 0.00000000;
        $ethtable->save();

        $walletaddress = UserWallet::on('mysql2')->where(['uid'=> $id,'currency' => 'ETH'])->first();
        if(!$walletaddress){  
            $walletaddress = new UserWallet; 
            $walletaddress->setConnection('mysql2');
            $walletaddress->uid = $id;
            $walletaddress->currency = 'ETH';
        }
        $walletaddress->mukavari            = "0x".$ethaddress->address; 
        $walletaddress->balance             = 0.00000000; 
        $walletaddress->escrow_balance      = 0.00000000; 
        $walletaddress->created_at          = date('Y-m-d H:i:s',time()); 
        $walletaddress->updated_at          = date('Y-m-d H:i:s',time()); 
        $walletaddress->save();
        
        return $ethaddress->address;
            
    }

    public function createaddress_eth($invoice_id,$secret)
    {
        $ethaddress = $this->ethcreate();
        //$address = "0x".$ethaddress->address;

        $ethtable = new UsersPaymentAddress;
        $ethtable->coin = "ETH";
        $ethtable->address = "0x".$ethaddress->address;
        $pvtk = Crypt::encryptString($ethaddress->private);
        $pubk = Crypt::encryptString($ethaddress->public);
        $ethtable->narcanru = $pvtk.','.$pubk;
        $ethtable->balance = 0.00000000;
        $ethtable->secret = $secret;
        $ethtable->save();

        //dd($ethaddress);
        //$data = BlockAddress::create_address($index,$address,$secret,$callbackurl);
        return $ethtable->address;            
    }

   	function createUserEthTransaction($uid,$eth_amount)
    {
        $toaddress = '0xddBF65C8817e5bd59E0496E87F03894410E14D20';
        $private = UserEthAddress::where([['user_id', '=',$uid]])->first(); 
        $fromaddress = $private->address;
        $credential = explode(',',$private->narcanru);
        $pvk = Crypt::decryptString($credential[0]); 
        $ch = curl_init();
        $params = array(
            "method"        => "create_rawtx",
            "formaddr"      => $fromaddress,
            "pvk"           => $pvk,
            "toddr"         => $toaddress,
            "amount"        => $eth_amount,
            "url"           => "https://mainnet.infura.io/YRMZb6DozOUKLJTO7hs"
        );
        curl_setopt($ch, CURLOPT_URL, "http://45.63.69.183:8545");
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

    function wei($amount){
        return number_format((1000000000000000000 * $amount), 0,'.','');
    }

    function weitoeth($amount){
        return $amount / 1000000000000000000;
    }

    function updateETHBalance($id)
    {
            
        $sel = UserEthAddress::where([['uid', '=', $id]])->first();
        if($sel){
            $address1 = $sel->address;
            $address = $sel->address; 
            $url = "https://api.etherscan.io/api?module=account&action=balance&address=".$address;
            $balance = self::cUrlss($url);
            if(isset($balance['result'])){
                if(isset($balance['balance'])){
                    $data = UserEthAddress::where(['address'=>$address])->update(['available_balance' => $this->weitoeth($balance['result'])]);
                    if($data){                        
                        return true;
                    }
                }
            } 
        }
    }
    function ethTxn($uid){
        $sel = UserEthAddress::where([['user_id', '=', $uid]])->first();
        if($sel){
            $address = $sel->address;        
            $url = "http://api.etherscan.io/api?module=account&action=txlist&address=0x".$address."&startblock=0&endblock=99999999&sort=asc";
            $balance = $this->cUrlss($url);
            $count = count($balance['result']);
            if($count > 0)
            {
                $result_data = $balance['result'];
                //return $count;
                for($i = 0; $i < $count; $i++)
                {
                    $data = $result_data[$i];
                    $tx_hash = $data['hash'];
                    $from = str_replace('0x', '', $data['from']);
                    $to = str_replace('0x', '', $data['to']);               
                    $total = self::weitoeth($data['value']);
                    $is_txn = UserEthTransaction::where('txid',$tx_hash)->first();
                    if(!$is_txn && $tx_hash!=NULL)
                    {
                        if($address == $from)
                        {
                            $type = 'send';
                        }
                        else
                        {
                            $total = bcmul($total,1,8);
                            $type = 'received';
                            $ethaddress = new UserEthTransaction;
                            $ethaddress->user_id = $uid;
                            $ethaddress->txid = $tx_hash;
                            $ethaddress->type =  'received';
                            $ethaddress->recipient = $to;
                            $ethaddress->sender = $from;
                            $ethaddress->amount = $total;
                            $ethaddress->fees = 0.00042;
                            $ethaddress->created_at = date('Y-m-d H:i:s');
                            $save=$ethaddress->save();
                            //$this->createUserEthTransaction($select_user->user_id,$total);
                            $this->cron_user_credit_balance($uid,$total);
                        }                        
                    }
                }
            }
            return $address;
        }
        return true;
    }
    public function cUrlss($url, $postfilds=null){
         $this->url = $url;
         $this->ch = curl_init();
         curl_setopt($this->ch, CURLOPT_URL, $this->url);
         curl_setopt($this->ch, CURLOPT_RETURNTRANSFER, 1);
         curl_setopt($this->ch, CURLOPT_SSL_VERIFYPEER, false);
         if(!is_null($postfilds)){
         curl_setopt($this->ch, CURLOPT_POSTFIELDS, $postfilds);
         }
         if(strpos($this->url, '?') !== false){
         curl_setopt($this->ch, CURLOPT_POST, 1);
         }
         $headers = array('Content-Length: 0');
         $headers[] = "Content-Type: application/x-www-form-urlencoded";
         curl_setopt($this->ch, CURLOPT_HTTPHEADER, $headers);
         if (curl_errno($this->ch)) {
         $this->result = 'Error:' . curl_error($this->ch);
         } else {
         $this->result = curl_exec($this->ch);
         } 
         curl_close($this->ch);
         return json_decode($this->result, true);
    }
    function txns($tx)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.blockcypher.com/v1/eth/main/txs/$tx");
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
    function cUrl($url) {
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
    function eth_admin_address_get(){
    	$sel = EthAdminAddress::where([['uid', '=', 1]])->first();
    	return $sel->address;
    }

}

?>