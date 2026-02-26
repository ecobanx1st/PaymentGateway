<?php
namespace App\Traits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Auth;
use App\Models\Wallet;
use App\Models\UserEvmAddress;
use App\Models\Commission;
use App\Models\CryptoTransactions;
use App\Models\AdminFeeWallet;
use App\Models\GasPrice;
use App\FeeWalletTransaction;

trait EvmClass
{
    public function evmcreate() {
        $tokenAPI = "c34d2593437645129fe7a278ca6c9a6f";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.blockcypher.com/v1/eth/main/addrs?token='.$tokenAPI);
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

    public function evmNodeAddresscreate() {
        $eth = json_decode(shell_exec('node '.base_path().'/block_eth/generate_eth.js'));
		if(empty($eth)){
			$params = array(
				"method"        => "getNewAddress",
				"chainId"       => 137,
				"url"           => "https://polygon-rpc.com"
			);
			$eth = $this->evmCall($params);
		}
		return $eth;
    }

    public function evmCall($params){
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:8545");
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

    public function getEVMDetails($network){
        if($network == 'ETH'){
            $data['apiKey'] =  \Config::get('app.ETH_API_Key');
            $data['rpcUrl'] = "https://mainnet.infura.io/v3/29d73d14ccef442c876cedd8b4015bcc";
            $data['networkUrl'] = "http://api.etherscan.io";
            $data['coinSymbol'] = "ETH";
            $data['coinType'] = "ethcoin";
            $data['tokenType'] = "erctoken";
            $data['chainId'] = 1;
        }elseif ($network == 'BNB') {
            $data['apiKey'] =  \Config::get('app.BNB_API_Key');
            $data['rpcUrl'] = "https://bsc-dataseed.binance.org/";
            $data['networkUrl'] = "https://api.bscscan.com";
            $data['coinSymbol'] = "BNB";
            $data['coinType'] = "bnbcoin";
            $data['tokenType'] = "bsctoken";
            $data['chainId'] = 56;
        }elseif ($network == 'MATIC') {
            $data['apiKey'] =  \Config::get('app.MATIC_API_Key');
            $data['rpcUrl'] = "https://polygon-rpc.com";
            $data['coinSymbol'] = "MATIC";
            $data['coinType'] = "maticcoin";
            $data['tokenType'] = "polytoken";
            $data['networkUrl'] = "https://api.polygonscan.com";
            $data['chainId'] = 137;
        }elseif ($network == 'WFI') {
            $data['apiKey'] =  null;
            $data['rpcUrl'] = "https://api.wficoin.io";
            $data['coinSymbol'] = "WFI";
            $data['coinType'] = "wficoin";
            $data['tokenType'] = "wfitoken";
            $data['networkUrl'] = "https://api.wficoin.io";
            $data['chainId'] = 3050;
        }
        return $data;
    }
   
    public function create_user_evm($id)
    {
        $address = UserEvmAddress::where('user_id',$id)->value('address');
        if(!$address){
            $ethaddress = $this->evmcreate();
            if(isset($ethaddress->address)){
                $e_address = "0x".$ethaddress->address;
                $ethtable = new UserEvmAddress;
                $ethtable->user_id = $id;
                $ethtable->address = "0x".$ethaddress->address;
                $pvtk = Crypt::encryptString($ethaddress->private);
                $pubk = Crypt::encryptString($ethaddress->public);
                $ethtable->narcanru = $pvtk.','.$pubk;
                $ethtable->balance = 0.00000000;
                $ethtable->save();
            }else {
                $ethaddress = $this->evmNodeAddresscreate();
                $e_address = $ethaddress->address;
                $ethtable = new UserEvmAddress;
                $ethtable->user_id = $id;
                $ethtable->address = $e_address;
                $pvtk = Crypt::encryptString($ethaddress->privateKey);
                $pubk = Crypt::encryptString($e_address);
                $ethtable->narcanru = $pvtk.','.$pubk;
                $ethtable->balance = 0.00000000;
                $ethtable->save();
            }            
        }
        else
        {
           $e_address = $address;
        }
        $this->walletEVMCoin($id,$e_address);       
        $this->walletEVMToken($id,$e_address);       
        return $e_address;
            
    }
    public function createPaymentAddressETH(){
        $ethaddress = $this->evmcreate();
        if(isset($ethaddress->address)){
            $address = "0x".$ethaddress->address;
            $pvtk = Crypt::encryptString($ethaddress->private);
            $pubk = Crypt::encryptString($ethaddress->public);
        }else{
            $ethaddress = $this->evmNodeAddresscreate();
            $address = $ethaddress->address;
            $pvtk = Crypt::encryptString($ethaddress->privateKey);
            $pubk = Crypt::encryptString($address);
        }
        $credential = $pvtk.','.$pubk;
        $data['address'] = $address;
        $data['pvtkey'] = $credential;
        return $data;
    }
    public function walletEVMCoin($uid,$address)
    {
        $coins = Commission::whereIn('source',['ETH','MATIC','BNB','WFI'])->get();
        foreach($coins as $coin){
            $symbol = $coin->source;
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
        }
        return  $address;
    }
    function walletEVMToken($uid,$address){
        $coins = Commission::whereIn('type',['bsctoken','erctoken','polytoken','token'])->get();
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
                   // $walletaddress->tokentype   = 'bsctoken';
                    $walletaddress->created_at = date('Y-m-d H:i:s',time()); 
                }
                $walletaddress->mukavari       = $address; 
                $walletaddress->balance        = $walletaddress->balance + $balance; 
                $walletaddress->escrow_balance = $walletaddress->escrow_balance + $escrow;               
                $walletaddress->updated_at     = date('Y-m-d H:i:s',time()); 
                $walletaddress->save();
            }
        }
        return true;
    }



    function createAdminTransactionEVMToken($network,$contractaddress,$toaddress,$eth_amount)
    {
        $dataEVM = $this->getEVMDetails($network);
        $chainId = $dataEVM['chainId'];
        $rpcUrl = $dataEVM['rpcUrl'];
        
        $token = Commission::where('contractaddress',$contractaddress)->first();
        $toaddress = $toaddress;        
        $private = AdminFeeWallet::where([['coinname', '=',$network]])->first(); 
        $fromaddress = $private->address;
        $credential = explode(',',$private->narcanru);
        $pvk = Crypt::decryptString($credential[0]); 
		$length = strlen($pvk);
		if($length == 62){
			$pvk = '00'.$pvk;
		}
        $params = array(
            "method"        => "create_rawtx_token",
            "formaddr"      => $fromaddress,
            "pvk"           => $pvk,
            "toddr"         => $toaddress,
            "amount"        => $eth_amount,
            "contract"      => $token->contractaddress,
            "abiarray"      => $token->abiarray,
            "chainId"       => $chainId,
            "url"           => $rpcUrl
        );
        $result = $this->evmCall($params);
        return $result;
    }

    function createTransactionEVMToken($network,$uid,$contractaddress,$toaddress,$eth_amount)
    {
        $dataEVM = $this->getEVMDetails($network);
        $chainId = $dataEVM['chainId'];
        $rpcUrl = $dataEVM['rpcUrl'];

        $token = Commission::where('contractaddress',$contractaddress)->first();
        $toaddress = $toaddress;        
        $private = UserEvmAddress::where([['user_id', '=',$uid]])->first(); 
        $fromaddress = $private->address;
        $credential = explode(',',$private->narcanru);
        $pvk = Crypt::decryptString($credential[0]); 
        $length = strlen($pvk);
        if($length == 62){
            $pvk = '00'.$pvk;
        }

        $params = array(
            "method"        => "create_rawtx_token",
            "formaddr"      => $fromaddress,
            "pvk"           => $pvk,
            "toddr"         => $toaddress,
            "amount"        => $eth_amount,
            "contract"      => $token->contractaddress,
            "abiarray"      => $token->abiarray,
            "chainId"       => $chainId,
            "url"           => $rpcUrl
        );
        $result = $this->evmCall($params);
        return $result;
    }
    function getGasAmountForContractCall($network,$uid,$contractaddress,$toaddress,$eth_amount)
    {
        $dataEVM = $this->getEVMDetails($network);
        $chainId = $dataEVM['chainId'];
        $rpcUrl = $dataEVM['rpcUrl'];

        $token = Commission::where('contractaddress',$contractaddress)->first();
        $toaddress = $toaddress;
        
        $private = UserEvmAddress::where([['user_id', '=',$uid]])->first(); 
        $fromaddress = $private->address;
        $credential = explode(',',$private->narcanru);
        $pvk = Crypt::decryptString($credential[0]); 
        $length = strlen($pvk);
        if($length == 62){
            $pvk = '00'.$pvk;
        }
        
        $params = array(
            "method"        => "getGasAmountForContractCall",
            "formaddr"      => $fromaddress,
            "pvk"           => $pvk,
            "toddr"         => $toaddress,
            "amount"        => $eth_amount,
            "contract"      => $token->contractaddress,
            "abiarray"      => $token->abiarray,
            "decimals"      => $token->decimal_value,
            "chainId"       => $chainId,
            "url"           => $rpcUrl
        );
        $result = $this->evmCall($params);
        return $result;
    }

    function getEVMBalanceAddressNode($network,$address)
    {
        $dataEVM = $this->getEVMDetails($network);
        $chainId = $dataEVM['chainId'];
        $rpcUrl = $dataEVM['rpcUrl'];
        
        $params = array(
            "method"      => "getBalance",
            "address"     => $address,
            "chainId"     => $chainId,
            "url"         => $rpcUrl
        );
        $result = $this->evmCall($params);
        return $result;       
    }
    function getEVMBlockTransaction($network,$start,$end="")
    {
        $dataEVM = $this->getEVMDetails($network);
        $chainId = $dataEVM['chainId'];
        $rpcUrl  = $dataEVM['rpcUrl'];
        
        $params = array(
            "method"      => "getBlockTransaction",
            "startblock"  => $start,
            "endblock"    => $end,
            "chainId"     => $chainId,
            "url"         => $rpcUrl
        );
        $result = $this->evmCall($params);
        return $result;       
    }

    function SendEVMUser($network,$uid,$toaddress,$amount)
    {
        $dataEVM = $this->getEVMDetails($network);
        $chainId = $dataEVM['chainId'];
        $rpcUrl = $dataEVM['rpcUrl'];

        $private = UserEvmAddress::where([['user_id', '=',$uid]])->first(); 
        $fromaddress = $private->address;
        $credential = explode(',',$private->narcanru);
        $pvk = Crypt::decryptString($credential[0]); 
        $length = strlen($pvk);
        if($length == 62){
            $pvk = '00'.$pvk;
        }
        
        $params = array(
            "method"        => "create_rawtx_adminfee",
            "formaddr"      => $fromaddress,
            "pvk"           => $pvk,
            "toddr"         => $toaddress,
            "amount"        => $amount,
            "chainId"       => $chainId,
            "url"           => $rpcUrl
        );
        $result = $this->evmCall($params);
        return $result;       
    }

    function SendEVMAdmin($network,$toaddress,$amount)
    {
        $dataEVM = $this->getEVMDetails($network);
        $chainId = $dataEVM['chainId'];
        $rpcUrl = $dataEVM['rpcUrl'];

        $private = AdminFeeWallet::where([['coinname', '=',$network]])->first(); 
        $fromaddress = $private->address;
        $credential = explode(',',$private->narcanru);
        $pvk = Crypt::decryptString($credential[0]); 
        $length = strlen($pvk);
        if($length == 62){
            $pvk = '00'.$pvk;
        }
        $params = array(
            "method"        => "create_rawtx_adminfee",
            "formaddr"      => $fromaddress,
            "pvk"           => $pvk,
            "toddr"         => $toaddress,
            "amount"        => $amount,
            "chainId"       => $chainId,
            "url"           => $rpcUrl
        );
        $result = $this->evmCall($params);
        return $result;       
    }

    function getEVMBalanceAddress($network,$address){
        $dataEVM = $this->getEVMDetails($network);
        $apiKey = $dataEVM['apiKey'];
        $networkUrl = $dataEVM['networkUrl'];
                   
        $data = $this->cUrlss($networkUrl."/api?module=account&action=balance&address=$address&apikey=$apiKey");
        if(isset($data['result'])){
            $balance = weitoeth($data['result']);
            return $balance;
        }else{
            return 0;
        } 
    }

    function getEVMBalance($network,$uid){
        $dataEVM = $this->getEVMDetails($network);
        $apiKey = $dataEVM['apiKey'];
        $networkUrl = $dataEVM['networkUrl'];

        $address = UserEvmAddress::where('user_id',$uid)->value('address');
        if($address){            
            $data = $this->cUrlss($networkUrl."/api?module=account&action=balance&address=$address&apikey=$apiKey");
            if(isset($data['result'])){
                $balance = weitoeth($data['result']);
                $coin = strtolower($network);
                $updateData = array(
                    $coin.'_balance' => $balance,
                    'updated_at' => date('Y-m-d H:i:s')
                );
                UserEvmAddress::where([['user_id', '=', $uid]])->update($updateData);
                return $balance;
            }else{
                return $data;
            }            
        }else{
            return false;
        }
    }

    function getEVM20Balance($network,$uid,$contractaddress){
        $dataEVM = $this->getEVMDetails($network);
        $apiKey = $dataEVM['apiKey'];
        $networkUrl = $dataEVM['networkUrl'];

        $address = UserEvmAddress::where('user_id',$uid)->value('address');
        if($address){
            $token = Commission::where('contractaddress',$contractaddress)->first();
            $coin = $token->source;
            $decimal = $token->decimal_value; 
            $ethurl = $networkUrl."/api?module=account&action=tokenbalance&contractaddress=".$contractaddress."&address=".$address."&tag=latest&apikey=".$apiKey;
            $data = $this->cUrlss($ethurl);
            if(isset($data['result'])){
                $balance = weitousdt($data['result'],$decimal);
                return $balance;
            }else{
                return $data;
            }            
        }else{
            return false;
        }
    }
    function getEVM20BalanceAddress($network,$address,$contractaddress){
        $dataEVM = $this->getEVMDetails($network);
        $apiKey = $dataEVM['apiKey'];
        $networkUrl = $dataEVM['networkUrl'];

        $token = Commission::where('contractaddress',$contractaddress)->first();
        $coin = $token->source;
        $decimal = $token->decimal_value; 
        $ethurl = $networkUrl."/api?module=account&action=tokenbalance&contractaddress=".$contractaddress."&address=".$address."&tag=latest&apikey=".$apiKey;
        $data = $this->cUrlss($ethurl);
        if(isset($data['result'])){
            $balance = weitousdt($data['result'],$decimal);
            return $balance;
        }else{
            return 0;
        }
    }
    function updateTransactionEVM($network,$uid){
        $dataEVM = $this->getEVMDetails($network);
        $apiKey = $dataEVM['apiKey'];
        $networkUrl = $dataEVM['networkUrl'];
        $coinType = $dataEVM['coinType'];
        $coinSymbol = $dataEVM['coinSymbol'];

        $user = UserEvmAddress::where('user_id',$uid)->first();        
        if(is_object($user)){
            $uid = $user->user_id;
            $useraddress = $user->address;      
            $url = $networkUrl."/api?module=account&action=txlist&address=".$useraddress."&startblock=0&endblock=99999999&sort=asc&apikey=$apiKey";
            $balance = $this->cUrlss($url);
            if(isset($balance['result']) && is_array($balance['result'])){
                $count = count($balance['result']);
            }else{
                $count = 0;
            }
            if($count > 0)
            {
               $result_data = $balance['result'];
                for($i = 0; $i < $count; $i++)
                {
                    $data     = $result_data[$i];
                    $txid     = $data['hash'];
                    $confirm  = $data['confirmations'];
                    $from     = $data['from'];
                    $to       = $data['to'];               
                    $time     = date('Y-m-d H:i:s',$data['timeStamp']);               
                    $total    = weitoeth($data['value']);
                    $order_no = TransactionString().$uid;
                    $amount   = number_format($total,8);
                    if(strtolower($to) == strtolower($useraddress)){
                        CryptoTransactions::createTransaction($uid,$coinSymbol,$txid,$from,$to,$amount,$confirm,$time,$coinType);
                    }
                }
            }
            return true;
        }
        return false;
    }
    function updateTransactionEVM20($network,$uid){
        $dataEVM = $this->getEVMDetails($network);
        $apiKey = $dataEVM['apiKey'];
        $networkUrl = $dataEVM['networkUrl'];
        $tokenType = $dataEVM['tokenType'];
        $coinSymbol = $dataEVM['coinSymbol'];

        $user = UserEvmAddress::where('user_id',$uid)->first();                
        if(is_object($user)){
            $useraddress = $user->address;
            $url = $networkUrl."/api?module=account&action=tokentx&address=".$useraddress."&startblock=0&endblock=999999999&sort=asc&apikey=".$apiKey;
            $result_data = $this->cUrlss($url);                
            if(isset($result_data['result']) && is_array($result_data['result'])){
                if(count($result_data['result']) > 0){                         
                    foreach ($result_data['result'] as $data) { 
                        $tokenSymbol    = $data['tokenSymbol'];
                        $contractAddress = $data['contractAddress'];
                        $txid           = $data['hash'];
                        $time           = date('Y-m-d H:i:s',$data['timeStamp']);
                        $from           = $data['from'];
                        $to             = $data['to'];
                        $confirmations  = $data['confirmations'];
                        $total          = weitousdt($data['value'],$data['tokenDecimal']);
                        //print_r($useraddress.' -'.$to.' total:'.$total.' decimal:'.$data['tokenDecimal']);
                        $total = sprintf('%.8f',$total);
                        $coins = Commission::where(['contractaddress' => $contractAddress])->first();
                        if(is_object($coins)){
                            $tokenSymbol = $coins->source;
                            if(strtolower($useraddress) == strtolower($to)){
                            $type = 'received';
                                CryptoTransactions::createTransaction($uid,$tokenSymbol,$txid,$from,$to,$total,$confirmations,$time,$tokenType);
                                
                            }
                        }
                    }
                }
            }
            return true;
        }
        return false;
    }
    public function transactionAdminEVM($network,$useraddress){
        $dataEVM = $this->getEVMDetails($network);        
        $apiKey = $dataEVM['apiKey'];
        $networkUrl = $dataEVM['networkUrl'];
        $coinType = $dataEVM['coinType'];
        $coinSymbol = $dataEVM['coinSymbol'];

        if($useraddress){       
            $url = $networkUrl."/api?module=account&action=txlist&address=".$useraddress."&startblock=0&endblock=99999999&sort=asc&apikey=".$apiKey;
            $balance = $this->cUrlss($url);
            if(isset($balance['result'])){
                $count = count($balance['result']);
            }else{
                $count = 0;
            }
            if($count > 0)
            {
               $result_data = $balance['result'];
                for($i = 0; $i < $count; $i++)
                {
                    $data     = $result_data[$i];
                    $txid     = $data['hash'];
                    $confirm  = $data['confirmations'];
                    $from     = $data['from'];
                    $to       = $data['to'];               
                    $time     = date('Y-m-d H:i:s',$data['timeStamp']);               
                    $total    = weitoeth($data['value']);
                    $order_no = TransactionString();
                    $amount   = display_format($total,8);
                    if(strtolower($useraddress) == strtolower($to)){
                        $type = 'Received';
                    }else{
                        $type = 'Send';
                    }
                    $tran = FeeWalletTransaction::where(['currency' => $coinSymbol,'txid' => $txid])->first();
                    if(!$tran){
                        $tran = new FeeWalletTransaction();
                        $tran->currency = $coinSymbol;
                        $tran->network = 'coin';
                        $tran->txtype = $type;
                        $tran->txid = $txid;
                        $tran->from_addr = $from;
                        $tran->to_addr = $to;
                        $tran->amount = $amount;            
                        $tran->status = 2;
                        $tran->created_at = $time;
                    }
                    $tran->confirmation = $confirm;
                    $tran->updated_at = date('Y-m-d H:i:s',time());
                    $tran->save();
                }
            }
        }
    }
    public function transactionAdminEVMToken($network,$useraddress){
        $dataEVM = $this->getEVMDetails($network);
        $apiKey = $dataEVM['apiKey'];
        $networkUrl = $dataEVM['networkUrl'];
        $tokenType = $dataEVM['tokenType'];
        $coinSymbol = $dataEVM['coinSymbol'];

        if($useraddress){
            $url = $networkUrl."/api?module=account&action=tokentx&address=".$useraddress."&startblock=0&endblock=999999999&sort=asc&apikey=".$apiKey;
            $result_data = $this->cUrlss($url);
            if(isset($result_data['result'])){
                if(count($result_data['result']) > 0){
                    foreach ($result_data['result'] as $data) { 
                        $tokenSymbol    = $data['tokenSymbol'];
                        $contractAddress = $data['contractAddress'];
                        $txid           = $data['hash'];
                        $time           = date('Y-m-d H:i:s',$data['timeStamp']);
                        $from           = $data['from'];
                        $to             = $data['to'];
                        $confirmations  = $data['confirmations'];
                        $total          = self::weitousdt($data['value'],$data['tokenDecimal']);
                        //print_r($useraddress.' -'.$to.' total:'.$total.' decimal:'.$data['tokenDecimal']);
                        $total = sprintf('%.8f',$total);
                        if(strtolower($useraddress) == strtolower($to)){
                            $type = 'Received';
                        }else{
                            $type = 'Send';
                        }
                        $coins = Commission::where(['contractaddress' => $contractAddress])->first();
                        if(is_object($coins)){
                            $tokenSymbol = $coins->source;
                        }

                        $tran = FeeWalletTransaction::where(['currency' => $tokenSymbol,'txid' => $txid])->first();
                        if(!$tran){
                            $tran = new FeeWalletTransaction();
                            $tran->currency = $tokenSymbol;
                            $tran->txtype = $type;
                            $tran->network = $tokenType;
                            $tran->txid = $txid;
                            $tran->from_addr = $from;
                            $tran->to_addr = $to;
                            $tran->amount = $total;            
                            $tran->status = 2;
                            $tran->created_at = $time;
                        }
                        $tran->confirmation = $confirmations;
                        $tran->updated_at = date('Y-m-d H:i:s',time());
                        $tran->save();
                    }
                }
            }
        }
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
}