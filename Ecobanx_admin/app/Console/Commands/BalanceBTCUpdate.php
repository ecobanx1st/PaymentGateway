<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\CryptoTransactions;
use App\Models\UserBtcAddress;
use App\Traits\BtcClass;

class BalanceBTCUpdate extends Command
{
    use BtcClass;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:btc';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update BTC transaction for logged Users';

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
    public function handle()
    {       
        //$users = User::on('mysql2')->get();
        $users = UserBtcAddress::where(['api_status' => 0])->orderBy('user_id','Desc')->get();
        if(count($users) > 0){
            $i=1;       
            foreach ($users as $user) {
                $uid = $user->user_id;
                $useraddress = $user->address;
                //$useraddress = UserBtcAddress::where('user_id',$uid)->orderBy('id','Desc')->value('address');
                echo $useraddress.' - ';
                $tokenblock = "18e614dc-8c14-4f92-bb78-f413c0d39b45";
                $url = 'https://api.blockcypher.com/v1/btc/main/addrs/'.$useraddress.'/full?token='.$tokenblock;
                $sends = $this->getTrans($url);
                $send = json_decode($sends);
                if(isset($send->final_balance)){
                    if($send->final_balance <= 0)
                    {  
                        $update_balance = UserBtcAddress::where(['user_id' => $uid])->update(['balance' => 0,'api_status' => 1,'updated_at' => date('Y-m-d H:i:s',time())]); 
                        echo $uid."  -";
                        //return true;
                    }else{
                        echo $useraddress;
                        $uncofirm_count = $send->unconfirmed_n_tx;
                        $final_balance = $this->sathositobtc($send->final_balance);
                        $update_balance = UserBtcAddress::where(['user_id' => $uid])->update(['balance' => $final_balance,'api_status' => 1,'updated_at' => date('Y-m-d H:i:s',time())]);

                        if($update_balance)
                        {
                            if(isset($send->txs)){
                                foreach ($send->txs as $key => $tran) {
                                    $tx_hash = $tran->hash;
                                    $confirmations = $tran->confirmations;
                                    $time     = date('Y-m-d H:i:s',strtotime($tran->received));
                                    foreach ($tran->inputs as $key => $inputs) {
                                        if(isset($inputs->addresses)){
                                            if(in_array($useraddress , $inputs->addresses)){
                                                $sender = $useraddress;
                                                break;
                                            }else{
                                                $sender = $inputs->addresses[0];
                                            }
                                        }else if(isset($inputs->prev_addresses)){
                                            if(in_array($useraddress , $inputs->prev_addresses)){
                                                $sender = $useraddress;
                                                break;
                                            }else{
                                                $sender = $inputs->prev_addresses[0];
                                            }                        
                                        }else{
                                            $sender = "";
                                        }
                                        //$sender = $inputs->addresses[0];
                                    }
                                    foreach ($tran->outputs as $outputs) {
                                        if(isset($outputs->addresses)){
                                            if(in_array($useraddress , $outputs->addresses)){
                                                $receiver = $useraddress;
                                                $amount = $this->sathositobtc($outputs->value);
                                                echo "$receiver $amount : ";
                                                break;
                                            }else{
                                                $receiver = $outputs->addresses[0];
                                            }
                                        }else{
                                            $receiver = "";
                                        }
                                    }
                                    if($receiver == $useraddress && $sender != $useraddress){
                                        $is_txn = CryptoTransactions::where('txid',$tx_hash)->first();
                                        if(!$is_txn)
                                        {
                                            CryptoTransactions::createTransaction($uid,'BTC',$tx_hash,$sender,$receiver,$amount,$confirmations,$time,'coin');
                                           // return true;                                    
                                        }else{
                                            //return false;
                                        }
                                    }else{
                                        $this->AlterUpdate($useraddress);
                                    }
                                }
                            }
                        }
                    }
                    if($i % 1000 == 0){
                        sleep(2);
                    }
                    $i++;
                }else{
                    $dd = $this->AlterUpdate($useraddress);
                    if($i % 5 == 0){
                        sleep(2);
                    }
                    $i++;
                    //echo "API stop $sends";
                    //return true;
                }
                
            }
        }else{
            $users = UserBtcAddress::where('api_status',1)->orderBy('user_id','Desc')->get();
            foreach ($users as $user) {
                UserBtcAddress::where('user_id',$user->user_id)->update(['api_status' => 0, 'updated_at' => date('Y-m-d H:i:s',time())]);
            }
        }
        $this->info('BTC transaction updated to All Users');
    }
    public function AlterUpdate($useraddress)
    {   
        //echo $useraddress.' - ';
        $url = 'https://chain.api.btc.com/v3/address/'.$useraddress.'/tx';
        $tran = $this->getTrans($url);
        $tran = json_decode($tran);
        if(isset($tran->data)){
            $data = $tran->data;
            if($data->list){
            foreach ($data->list as $tran) {
                $uid = UserBtcAddress::where(['address' => $useraddress])->value('user_id');
                echo $txid = $tran->hash;
                $confirmations = $tran->confirmations;
                $time = date('Y-m-d H:i:s',$tran->block_time);
                foreach ($tran->inputs as $key => $inputs) {                    
                    if(isset($inputs->addresses)){
                        if(in_array($useraddress , $inputs->addresses)){
                            $sender = $useraddress;
                            break;
                        }else{
                            $sender = $inputs->addresses[0];
                        }
                    }else if(isset($inputs->prev_addresses)){
                        if(in_array($useraddress , $inputs->prev_addresses)){
                            $sender = $useraddress;
                            break;
                        }else{
                            $sender = $inputs->prev_addresses[0];
                        }                        
                    }else{
                        $sender = "";
                    }
                }
                foreach ($tran->outputs as $outputs) {
                    if(isset($outputs->addresses)){
                        if(in_array($useraddress , $outputs->addresses)){
                            $receiver = $useraddress;
                            $amount = $this->sathositobtc($outputs->value);
                            break;
                        }else{
                            $receiver = $outputs->addresses[0];
                        }
                    }else{
                        $receiver = "";
                    }
                }
                if($receiver == $useraddress && $sender != $useraddress){
                    $is_txn = CryptoTransactions::where('txid',$txid)->first();
                    if(!$is_txn)
                    {
                        CryptoTransactions::createTransaction($uid,'BTC',$txid,$sender,$receiver,$amount,$confirmations,$time,'coin');
                       // return true;                                    
                    }else{
                        //return false;
                    }
                }


            }
            }
        }
        $update_balance = UserBtcAddress::where(['address' => $useraddress])->update(['api_status' => 1,'updated_at' => date('Y-m-d H:i:s',time())]);
    }
    public function handle1()
    {           
            
        $users = UserBtcAddress::get();
        if(count($users) > 0){
            $i=1;
            foreach ($users as $user) {
            $uid = $user->user_id;
            $useraddress = $user->address;
            if($useraddress){
                $url = 'https://insight.bitpay.com/api/txs/?address='.$useraddress;
                $tran = crul($url);
                $tran = json_decode($tran);
                if($tran){      
                if(count($tran->txs) > 0){
                  foreach($tran->txs as $addr){
                    $order_no   = TransactionString().$uid;
                    $txid       = $addr->txid;
                    $sender     = $addr->vin[0]->addr;
                    $confirm    = $addr->confirmations;
                    $fees       = $addr->fees;
                    $time       = $addr->time;
                    foreach ($addr->vout as $vout) {
                        if(isset($vout->scriptPubKey->addresses)){
                            if(in_array($useraddress , $vout->scriptPubKey->addresses)){
                                $receiver = $useraddress;
                                $amount = $vout->value;
                                break;
                            }else{
                                $receiver = "";
                            }
                        }else{
                            $receiver = "";
                        }                 
                    }
                    if($sender != $receiver){
                        if($receiver == $useraddress)
                        {
                          CryptoTransactions::createTransaction($uid,'BTC',$txid,$sender,$receiver,$amount,$confirm,$time,'coin');
                        }
                    }
                  }
                }
              }            
            }
            if($i % 4 == 0){
                sleep(2);
            }
            $i++;
            //sleep(2); // this should halt for 2 seconds for every loop
        }
    }
          
        

        $this->info('BTC transaction updated to All Users');
    }

    
    public function getTrans($url){
        $curl = curl_init();

        curl_setopt_array($curl, array(
          CURLOPT_URL => $url,
          CURLOPT_RETURNTRANSFER => true,
          CURLOPT_ENCODING => "",
          CURLOPT_MAXREDIRS => 10,
          CURLOPT_TIMEOUT => 0,
          CURLOPT_FOLLOWLOCATION => true,
          CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
          CURLOPT_CUSTOMREQUEST => "GET",
          CURLOPT_HTTPHEADER => array(
            "Cookie: __cfduid=ddcb961b22bbc1a177b842e7a955638491596203691"
          ),
        ));

        $result = curl_exec($curl);

        curl_close($curl);
        return $result;
    }
}
