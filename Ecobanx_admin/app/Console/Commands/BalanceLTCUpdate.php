<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\UserLtcAddress;
use App\Models\CryptoTransactions;


class BalanceLTCUpdate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:ltc';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update LTC transaction for logged Users';

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
                 
            $users = UserLtcAddress::get();
            if(count($users) > 0){            
                foreach ($users as $user) {
                    $uid = $user->user_id;
                    $useraddress = $user->address;
                    if($useraddress){
                        $url = 'https://insight.litecore.io/api/txs/?address='.$useraddress;
                        $tran = json_decode($this->getTrans($url));
                        if($tran)
                        {
                            if(count($tran->txs) > 0){
							//echo $useraddress;
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
                                    if($receiver == $useraddress)
                                    {
										CryptoTransactions::createTransaction($uid,'LTC',$txid,$sender,$receiver,$amount,$confirm,$time);
                                    }
                                }
                            }
                        }
                    }
					sleep(2); // this should halt for 2 seconds for every loop
                }
            }

     

        $this->info('LTC transaction updated to All Users');
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
