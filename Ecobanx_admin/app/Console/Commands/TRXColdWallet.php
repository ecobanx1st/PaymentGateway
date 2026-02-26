<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CryptoTransactions;
use App\Models\UserTrxAddress;
use App\Traits\TrcClass;
use App\Models\Commission;
use App\Models\AdminFeeWallet;

class TRXColdWallet extends Command
{
    use TrcClass;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'coldwallet:trx';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Move TRX balance to admin cold wallet';

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
        $trans = CryptoTransactions::where(['nirvaki_nilai' => 0,'usdt_deposit_type' => 'trxtoken'])->orWhere(['nirvaki_nilai' => 0,'currency' => 'TRX'])->get();
        if(count($trans) > 0){
            $limit = 1;
            //$trxAddress = "TE6L5M82aTVQjeNHUUVVZiKr8Cnw2nttH7";
            $trxAddress = AdminFeeWallet::where([['coinname', '=','TRX']])->value('address');
            foreach ($trans as $tran) {
                $uid    = $tran->uid;
                echo "uid: $uid - ";
                $amount = $tran->amount;
                $useraddress = UserTrxAddress::where('user_id',$uid)->value('address');
                $balance = $this->getBalanceTRX($uid);

                $coins = Commission::where('type','trxtoken')->get();
                if(count($coins) > 0){
                    foreach ($coins as $token) {
                        $coin = $token->source;
                        sleep(5);
                        $tokenbalance = $this->getTRC20Balance($uid,$token->contractaddress);
                        //echo  "User ID :".$uid." $coin tokenbalance: ".$tokenbalance."-";                        
                        if($tokenbalance > 1 && $balance > 15){
                            //$tokenbalance = ncSub($tokenbalance,1,0);
                            echo  "User ID :".$uid." $coin tokenbalance: ".$tokenbalance."-<br>";
                            $txid = $this->SendTRC20UserToken($uid,$tokenbalance,$trxAddress,$token->contractaddress);
                            CryptoTransactions::where(['currency'=> $coin,'uid' => $uid,'usdt_deposit_type' => 'trxtoken'])->update(['nirvaki_nilai' => 100, 'atxid' => $txid,'updated_at' => date('Y-m-d H:i:s',time())]);
                            echo $txid."- $coin vinoth-";                     
                        }else if($tokenbalance > 2 && $balance <= 15){
                            echo  "Fee User ID : $uid $coin tokenbalance: ".$tokenbalance."-<br>";                            
                            $txid = $this->UserTrcFeeMoveAmount($uid);
                            CryptoTransactions::where(['currency'=> $coin,'uid' => $uid,'usdt_deposit_type' => 'trxtoken'])->update(['feestatus' => 100, 'updated_at' => date('Y-m-d H:i:s',time())]);                    
                            echo $txid."-vinoth-";
                        }                       
                        if($tokenbalance > 1){
                            sleep(2);
                        }
                        sleep(2);
                    }
                }
                if($balance > 20){
                    echo  "User ID :".$uid." TRX balance: ".$balance."-";
                    $amount = ncSub($balance,1);
                    if($amount > 0){
                        $txid = $this->SendTRXUser($uid,$amount,$trxAddress);
                        CryptoTransactions::where(['currency'=> 'TRX','uid' => $uid])->update(['nirvaki_nilai' => 100, 'atxid' => $txid,'updated_at' => date('Y-m-d H:i:s',time())]);
                        echo $txid."-TRX-";
                    }
                    sleep(2);   
                }
            }
        }
        $this->info('TRX cold wallet updated to All Users');
    }
}
