<?php
namespace App\Traits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Auth;
use App\Models\UsersWallet;
use App\Models\TokenAddress;
use App\Models\Commission;
use App\Models\AdminFeeWallet;
use App\Models\GasPrice;
use App\Models\UsersPaymentAddress;

trait TokenERCClass
{
	public function erctokencreate() {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.blockcypher.com/v1/eth/main/addrs?token=b3eb0a7995954a37aa80946d213f3ccb');
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

    public function create_user_erctoken($uid)
    {
        $address = TokenAddress::where('user_id',$uid)->value('address');
        if(!$address){
            $erctoken = $this->erctokencreate();
            $e_address = "0x".$erctoken->address;            
            $pvtk = Crypt::encryptString($erctoken->private);
            $pubk = Crypt::encryptString($erctoken->public);

            $ethtable = new TokenAddress;
            $ethtable->user_id      = $uid;
            $ethtable->address      = $e_address;
            $ethtable->narcanru     = $pvtk.','.$pubk;
            $ethtable->balance      = 0.00000000;
            $ethtable->created_at   = date('Y-m-d H:i:s',time()); 
            $ethtable->updated_at   = date('Y-m-d H:i:s',time());
            $ethtable->save();
        }else{
           $e_address = $address;
        }

        $exr = $this->token_address_generate($uid,$e_address);
        return $e_address;            
    }

    public function createaddress_erctoken($token,$coin_type,$invoice_id,$secret)
    {
        $erctoken = $this->erctokencreate();
        $e_address = "0x".$erctoken->address;            
        $pvtk = Crypt::encryptString($erctoken->private);
        $pubk = Crypt::encryptString($erctoken->public);
        $ethtable = new UsersPaymentAddress;
        $ethtable->coin = $token;
        $ethtable->coin_type = $coin_type;
        $ethtable->o_txid = $invoice_id;
        $ethtable->address = $e_address;
        $ethtable->narcanru = $pvtk.','.$pubk;
        $ethtable->balance = 0.00000000;
        $ethtable->secret = $secret;
        $ethtable->save();
        return $e_address;            
    }

    function token_address_generate($uid,$address){
        $coins = Commission::where('type','token')->get();
        if(count($coins) > 0){
            foreach ($coins as $token) {
                $coin = $token->source;
                UsersWallet::CreateWallet($uid, $coin, $address);
            }
        }
        return true;
    }
    function createTransactionERCToken($uid,$source,$toaddress,$eth_amount,$gasprice)
    {
        $token = Commission::where('source',$source)->first();
        $toaddress = $toaddress;
        $price = GasPrice::where('id',1)->first();
        if($source == 'USDT'){
            $gaslimit    = $price->usdtgaslimit;                                
        }else if($source == 'BUSD'){
            $gaslimit    = 100000;                                
        }else{
            $gaslimit    = $price->tokengaslimit;
        }
        $private = TokenAddress::where([['user_id', '=',$uid]])->first(); 
        $fromaddress = $private->address;
        $credential = explode(',',$private->narcanru);
        $pvk = Crypt::decryptString($credential[0]); 
		$length = strlen($pvk);
		if($length == 62){
			$pvk = '00'.$pvk;
		}
        $ch = curl_init();
        $params = array(
            "method"        => "create_rawtx_token",
            "formaddr"      => $fromaddress,
            "pvk"           => $pvk,
            "toddr"         => $toaddress,
            "amount"        => $this->convert_digits($eth_amount,$token->decimal),
            "contract"      => $token->contractaddress,
            "abiarray"      => $token->abiarray,
            "gasprice"      => $gasprice,
            "gaslimit"      => $gaslimit,
            "url"           => "https://mainnet.infura.io/v3/6157a3d40d0142c6817d57a426a4e31d"
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
    private function convert_digits($amount,$tokenDecimal=null){
        if(!empty($amount)){
            if($tokenDecimal > 0){
               $tokenDecimal = 1 + $tokenDecimal;
                $number = 1;
                $number = str_pad($number, $tokenDecimal, '0', STR_PAD_RIGHT);  
            }else{
                $number = 1;
            }         
            return $amount * $number;
        }
    }

    function AdminfeeTransaction($toaddress,$amount,$gasprice)
    {

        $AdminFeeWallet = AdminFeeWallet::where('coinname','ETH')->first();
        $fromaddress = $AdminFeeWallet->address;
        $credential = explode(',',$AdminFeeWallet->narcanru);
        $pvk = Crypt::decryptString($credential[0]);
        $ch = curl_init();
        $params = array(
            "method"        => "create_rawtx_adminfee",
            "formaddr"      => $fromaddress,
            "pvk"           => $pvk,
            "toddr"         => $toaddress,
            "amount"        => $amount,
            "gasprice"      => $gasprice,
            "url"           => "https://mainnet.infura.io/v3/6157a3d40d0142c6817d57a426a4e31d"
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

    function feeWalletTransactionToken($source,$toaddress,$eth_amount)
    {
        $token = Commission::where('source',$source)->first();
        $toaddress = $toaddress;
        $price = GasPrice::where('id',1)->first();
        $gasprice = $price->gasprice;
        if($source == 'USDT'){
            $gaslimit    = $price->usdtgaslimit;                                
        }else if($source == 'BUSD'){
            $gaslimit    = 100000;                                
        }else{
            $gaslimit    = $price->tokengaslimit;
        }
        $AdminFeeWallet = AdminFeeWallet::where('coinname','ETH')->first();
        $fromaddress = $AdminFeeWallet->address;
        $credential = explode(',',$AdminFeeWallet->narcanru);
        $pvk = Crypt::decryptString($credential[0]); 
        $length = strlen($pvk);
        if($length == 62){
            $pvk = '00'.$pvk;
        }
        $ch = curl_init();
        $params = array(
            "method"        => "create_rawtx_token",
            "formaddr"      => $fromaddress,
            "pvk"           => $pvk,
            "toddr"         => $toaddress,
            "amount"        => $this->convert_digits($eth_amount,$token->decimal),
            "contract"      => $token->contractaddress,
            "abiarray"      => $token->abiarray,
            "gasprice"      => $gasprice,
            "gaslimit"      => $gaslimit,
            "url"           => "https://mainnet.infura.io/v3/6157a3d40d0142c6817d57a426a4e31d"
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
}