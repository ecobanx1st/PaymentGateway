<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CryptoTransactions;
use App\Models\UserTrxAddress;
use App\Traits\TrcClass;
use App\Models\Commission;
use Illuminate\Support\Facades\DB;
use App\Models\GasPrice;

class TRXFeewalletMove extends Command
{
     use TrcClass;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'trxfeewallet:amount';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Move Fee wallet  balance to admin cold wallet';

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
        $coins = Commission::where('type','trxtoken')->get();
        if(count($coins) > 0){
            foreach ($coins as $token) {
                $coin = $token->source;
                $trans = CryptoTransactions::select('to_addr',DB::raw('SUM(amount) as amt'), DB::raw("GROUP_CONCAT(id) AS ids"),DB::raw("GROUP_CONCAT(uid) AS uids"))->where(['feestatus' => 0,'currency' => $coin,'nirvaki_nilai' => 0,'usdt_deposit_type' => 'trxtoken'])->groupBy('to_addr')->get();
				//dd($trans);
                if(count($trans) > 0){
                    foreach ($trans as $tran) {
                        $ids = explode(',',$tran->ids);
                        $uids = explode(',',$tran->uids);
                        echo $uid    = $uids[0];
                        $useraddress = $tran->to_addr;
                        $amount = $tran->amt;
                        $fee    = 0;
                        $total  = ncSub($amount,$fee,8);
        				if($total > 0){
                            $toaddress = '';

                           $send   = $this->UserTrcFeeMoveAmount($uid);
        					if($send){
                                foreach ($ids as $id) {
        						  CryptoTransactions::where(['id'=> $id])->update(['feestatus' => 100,'updated_at' => date('Y-m-d H:i:s',time())]);
                                }
        					}
        				}
                    }
                }
            }
        }
        $this->info('Trx Fee wallet amount updated to All Users');
    }
}
