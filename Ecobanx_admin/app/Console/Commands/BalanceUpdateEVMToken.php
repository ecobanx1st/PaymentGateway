<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\UserEvmAddress;
use App\Models\CryptoTransactions;
use App\Models\UserWallet;
use App\Models\Commission;
use App\Models\Session;

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
        $users = Session::distinct()->whereNotNull('user_id')->pluck('user_id')->toArray();
       // dd($users);
        $useraddress = UserEvmAddress::whereIn('user_id',$users)->orderBy('id', 'desc')->get();
        $limit = 1;
        if(count($useraddress) > 0){            
            foreach ($useraddress as $user) {
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
                                    if(strtolower($useraddress) == strtolower($to)){
                                    $type = 'received';
                                        CryptoTransactions::createTransaction($uid,$tokenSymbol,$txid,$from,$to,$total,$confirmations,$time,$tokenType);
                                        
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
                            if(strtolower($useraddress) == strtolower($to)){
                                CryptoTransactions::createTransaction($uid,$coinSymbol,$txid,$from,$to,$amount,$confirm,$time,$coinType);
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
