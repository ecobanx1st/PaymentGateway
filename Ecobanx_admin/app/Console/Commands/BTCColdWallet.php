<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CryptoTransactions;
use App\Models\UserWallet;
use App\Traits\BtcClass;

class BTCColdWallet extends Command
{
    use BtcClass;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'coldwallet:btc';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Move BTC balance to admin cold wallet';

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
        $trans = CryptoTransactions::where(['nirvaki_nilai' => 0,'currency' => 'BTC'])->get();
        if(count($trans) > 0){
            foreach ($trans as $tran) {
                $uid    = $tran->uid;
                $amount = $tran->amount;
				if($amount <= 0.0001){
                    $fee = 0.00001;
                }else if($amount <= 0.0002){
                    $fee = 0.0001;
                }else if($amount <= 0.0005){
                    $fee = 0.0002;
                }else{
                    $fee  = 0.0005;
                }
                $total  = ncSub($amount,$fee,8);
                $send   = $this->createUserBTCTransaction($uid,$total,$fee);
                if($send){
					if(isset($send->txid)){
						$txnid = $send->txid;
					}else{
						$txnid = "No";
					}
					
                    CryptoTransactions::where(['id'=> $tran->id])->update(['nirvaki_nilai' => 100, 'atxid' => $txnid,'updated_at' => date('Y-m-d H:i:s',time())]);
                }
            }
        }

        /*$reverts = CryptoTransactions::where(['nirvaki_nilai' => 90])->get();
        foreach ($reverts as $revert) {
           $balance = UserWallet::on('mysql2')->where(['uid' => $revert->uid, 'currency' => $revert->currency])->first();
            if(is_object($balance))
            {
                $balance->balance = ncSub($balance->balance,$revert->amount);
                $balance->site_balance = ncSub($balance->balance,$revert->amount);
                $balance->save();
            }
            CryptoTransactions::where('id',$revert->id)->delete(); 
        }*/
        $this->info('Balance moved to admin BTC address');
    }
}
