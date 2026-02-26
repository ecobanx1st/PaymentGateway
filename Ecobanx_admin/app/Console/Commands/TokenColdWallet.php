<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Transaction;
use App\Models\UserEthAddress;
use App\Traits\TokenERCClass;
use App\Models\Commission;
use Illuminate\Support\Facades\DB;
use App\Libraries\BinanceClass;
use App\Models\GasPrice;

class TokenColdWallet extends Command
{
     use TokenERCClass;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'coldwallet:token';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Move Token balance to admin cold wallet';

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
        $coins = Commission::where('type','token')->get();
        if(count($coins) > 0){
            foreach ($coins as $token) {
                $coin = $token->source;

                $trans = Transaction::select('to_address',DB::raw('SUM(amount) as amt'), DB::raw("GROUP_CONCAT(id) AS ids"),DB::raw("GROUP_CONCAT(uid) AS uids"),DB::raw("GROUP_CONCAT(gasprice) AS gasprices"))->where(['nirvaki_nilai' => 0,'currency' => $coin])->groupBy('to_address')->get();
                if(count($trans) > 0){
                    foreach ($trans as $tran) {
                        $ids = explode(',',$tran->ids);
                        $uids = explode(',',$tran->uids);

                        $uid    = $uids[0];
                        $amount = $tran->amt;
                        $gasprices = explode(',',$tran->gasprices);
                        $gasprice    = $gasprices[0];   
						$price = GasPrice::where('id',1)->first();
						if(!isset($gasprices[0])){
							$gasprice    = $price->gasprice;
						}
                        $fee    = 0.00000001;
                        $total  = ncSub($amount,$fee,6);
						print_r($ids);
						echo $total;
        				if($total > 0){
							
							$toaddress = '0x727c82493ac4E7833D8f3e25a4Ca55CD12da2f92';
                            $send   = $this->createTransactionERCToken($uid,$coin,$toaddress,$total,$gasprice);
        					if($send){
                                if(isset($send->txid)){
                                    $txnid = $send->txid;
                                }else{
                                    $txnid = "No";
                                }
                                foreach ($ids as $id) {
        						  Transaction::where(['id'=> $id])->update(['nirvaki_nilai' => 100, 'txtype' => $txnid,'updated_at' => date('Y-m-d H:i:s',time())]);
                                }
        					}
        				}
                    }
                }
            }
        }
        $this->info('TOKEN cold wallet updated to All Users');
    }
}
