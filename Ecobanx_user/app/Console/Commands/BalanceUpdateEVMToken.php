<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\UserEvmAddress;
use App\Models\UsersPaymentAddress;
use App\Models\Commission;
use App\Models\OrderTransaction;
use App\Models\UsersWallet;
use App\Models\Transaction;


class BalanceUpdateEVMToken extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:evmtoken';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update all token transaction for logged Users';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */

    public function handle(){
        // $users = Session::distinct()->whereNotNull('user_id')->pluck('user_id')->toArray();

        $userEVmaddress = UserEvmAddress::get();
        $limit = 1;
        if(count($userEVmaddress) > 0){            
            foreach ($userEVmaddress as $user) {
                $uid = $user->user_id;
                $useraddress = $user->address;
                //echo "$uid -";
                $tokensTypes = array('bsctoken','erctoken','polytoken');
                foreach($tokensTypes as $tokenType){
                    if($tokenType == 'bsctoken'){
                        $apiKey = \Config::get('app.BNB_API_Key');
                        $url = "http://api.bscscan.com/api?module=account&action=tokentx&address=".$useraddress."&startblock=0&endblock=999999999&sort=asc&apikey=".$apiKey;
                    }elseif($tokenType == 'erctoken'){
                        $apiKey = \Config::get('app.ETH_API_Key'); 
                        $url = "https://api.etherscan.io/api?module=account&action=tokentx&address=".$useraddress."&startblock=0&endblock=999999999&sort=asc&apikey=".$apiKey;
                    }elseif($tokenType == 'polytoken'){
                        $apiKey = \Config::get('app.MATIC_API_Key');
                        $url = "https://api.polygonscan.com/api?module=account&action=tokentx&address=".$useraddress."&startblock=0&endblock=999999999&sort=asc&apikey=".$apiKey;
                    }else{
                        return false;
                    }               
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
                                    if(strtolower($to) == strtolower($useraddress)){
										$type = 'received';
                                        // CryptoTransactions::createTransaction($uid,$tokenSymbol,$txid,$from,$to,$total,$confirmations,$time,$tokenType);
                                        Transaction::createTransaction($uid,$tokenSymbol,$tokenType,$txid,$from,$to,$total,3,$time,$fee,'deposit','ETH coin deposit');
                                        
                                    }
                                }
                            }
                        }
                    }   
                }
                $coinTypes = array('bnbcoin','ethcoin','maticcoin');
                foreach($coinTypes as $coinType){
                    if($coinType == 'bnbcoin'){
                        $coinSymbol = 'BNB';
                        $apiKey = \Config::get('app.BNB_API_Key');
                        $url = "http://api.bscscan.com/api?module=account&action=txlist&address=".$useraddress."&startblock=0&endblock=99999999&sort=asc&apikey=$apiKey";
                    }elseif($coinType == 'ethcoin'){
                        $coinSymbol = 'ETH';
                        $apiKey = \Config::get('app.ETH_API_Key'); 
                        $url = "http://api.etherscan.io/api?module=account&action=txlist&address=".$useraddress."&startblock=0&endblock=99999999&sort=asc&apikey=$apiKey";
                    }elseif($coinType == 'maticcoin'){
                        $coinSymbol = 'MATIC';
                        $apiKey = \Config::get('app.MATIC_API_Key');
                        $url = "https://api.polygonscan.com/api?module=account&action=txlist&address=".$useraddress."&startblock=0&endblock=99999999&sort=asc&apikey=$apiKey";
                    }else{
                        return false;
                    }

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
                            $total    = self::weitoeth($data['value']);
                            $order_no = TransactionString().$uid;
                            $amount   = number_format($total,8);
                            if(strtolower($to) == strtolower($useraddress)){
                                // CryptoTransactions::createTransaction($uid,$coinSymbol,$txid,$from,$to,$amount,$confirm,$time,$coinType);
                                Transaction::createTransaction($uid,$coinSymbol,$coinType,$txid,$from,$to,$total,3,$time,"0.00041",'deposit',$coinSymbol.' coin deposit');
                            }
                        }
                    }
                }
                
                if($limit % 3 == 0){
                    sleep(2);
                }
                //sleep(1);
                $limit++;
            }
        }
		
		$userPaymentaddress =  UsersPaymentAddress::whereIn('coin_type',['ERC20','BEP20','MATIC20'])->where(['paymentstatus' => 0])->get();
		if(count($userPaymentaddress) > 0){
			foreach ($userPaymentaddress as $user) {
				$o_txid = $user->o_txid;
				$useraddress = $user->address;
				$assertype = $user->coin_type;
				$is_present = true;
				if($assertype == 'BEP20'){
					$apiKey = \Config::get('app.BNB_API_Key');
					$url = "http://api.bscscan.com/api?module=account&action=tokentx&address=".$useraddress."&startblock=0&endblock=999999999&sort=asc&apikey=".$apiKey;
				}elseif($assertype == 'ERC20'){
					$apiKey = \Config::get('app.ETH_API_Key'); 
					$url = "https://api.etherscan.io/api?module=account&action=tokentx&address=".$useraddress."&startblock=0&endblock=999999999&sort=asc&apikey=".$apiKey;
				}elseif($assertype == 'MATIC20'){
					$apiKey = \Config::get('app.MATIC_API_Key');
					$url = "https://api.polygonscan.com/api?module=account&action=tokentx&address=".$useraddress."&startblock=0&endblock=999999999&sort=asc&apikey=".$apiKey;
				}else{
					$is_present = false;
				}
				if($is_present)	{					
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
									if(strtolower($to) == strtolower($useraddress)){
									$type = 'received';
										$this->updateTransaction($to,$tokenSymbol,$total);											
									}
								}
							}
						}
					}
					if($limit % 3 == 0){
						sleep(2);
					}
					//sleep(1);
					$limit++;
				}
			}
		}
				
				
        $userPaymentaddress =  UsersPaymentAddress::whereIn('coin',['ETH','BNB','MATIC'])->where(['paymentstatus' => 0])->get();
		if(count($userPaymentaddress) > 0){
			foreach ($userPaymentaddress as $user) {
				$o_txid = $user->o_txid;
				$useraddress = $user->address;
				$assertype = $user->coin;
				$is_present = true;
				if($assertype == 'BNB'){
					$coinSymbol = 'BNB';
					$apiKey = \Config::get('app.BNB_API_Key');
					$url = "http://api.bscscan.com/api?module=account&action=txlist&address=".$useraddress."&startblock=0&endblock=99999999&sort=asc&apikey=$apiKey";
				}elseif($assertype == 'ETH'){
					$coinSymbol = 'ETH';
					$apiKey = \Config::get('app.ETH_API_Key'); 
					$url = "http://api.etherscan.io/api?module=account&action=txlist&address=".$useraddress."&startblock=0&endblock=99999999&sort=asc&apikey=$apiKey";
				}elseif($assertype == 'MATIC'){
					$coinSymbol = 'MATIC';
					$apiKey = \Config::get('app.MATIC_API_Key');
					$url = "https://api.polygonscan.com/api?module=account&action=txlist&address=".$useraddress."&startblock=0&endblock=99999999&sort=asc&apikey=$apiKey";
				}else{
					$is_present = false;
				}
				if($is_present)	{
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
							$total    = self::weitoeth($data['value']);
							$order_no = TransactionString().$uid;
							$amount   = number_format($total,8);
							if(strtolower($to) == strtolower($useraddress)){
								$this->updateTransaction($to,$coinSymbol,$total);
							}
						}
					}
				}
                
                if($limit % 3 == 0){
                    sleep(2);
                }
                //sleep(1);
                $limit++;
            }
        }

        $this->info('All Token transaction updated to All Users');
    }


    public function updateTransaction($toaddress,$currency,$amount){
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
    public function wei($amount){
        return number_format((1000000000000000000 * $amount), 0,'.','');
    }

    public function weitoeth($amount){
        return $amount / 1000000000000000000;
    }



    public function weitousdt($amount,$tokenDecimal=null){
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
}
