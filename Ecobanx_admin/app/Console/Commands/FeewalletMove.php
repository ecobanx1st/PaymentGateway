<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CryptoTransactions;
use App\Models\UserEvmAddress;
use App\Traits\TokenERCClass;
use App\Models\Commission;
use Illuminate\Support\Facades\DB;
use App\Models\GasPrice;

class FeewalletMove extends Command
{
     use TokenERCClass;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'feewallet:amount';

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
        $coins = Commission::where('type','token')->get();
        if(count($coins) > 0){
            foreach ($coins as $token) {
                $coin = $token->source;
                $trans = CryptoTransactions::select('to_addr',DB::raw('SUM(amount) as amt'), DB::raw("GROUP_CONCAT(id) AS ids"),DB::raw("GROUP_CONCAT(uid) AS uids"))->where(['feestatus' => 0,'currency' => $coin,'nirvaki_nilai' => 0,'networkchain' => 'erctoken'])->groupBy('to_addr')->get();
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
                            $toaddress = '0xABF3d44F8e2598f45541dB55b84f425BdE813EDd';
                            $price = GasPrice::where('id',1)->first();
                            $gasprice    = $price->gasprice;
                            $getGasAmt = $this->getGasAmountForContractCall($uid,$coin,$toaddress,$amount);
                            $usdfee = $getGasAmt->gasAmount * $gasprice;
                            $fee = $this->weitoeth($usdfee);
                          // $send   = $this->AdminfeeTransaction($useraddress,0.0021);
                           $send   = $this->AdminfeeTransaction($useraddress,$fee,$gasprice);
                           //$send   = $this->AdminfeeTransaction($useraddress,0.00048594);
        					if($send){
                                foreach ($ids as $id) {
        						  CryptoTransactions::where(['id'=> $id])->update(['feestatus' => 100, 'gasprice' => $gasprice,'gasamount'=>$getGasAmt->gasAmount,'updated_at' => date('Y-m-d H:i:s',time())]);
                                }
        					}
        				}
                    }
                }
            }
        }
        $this->info('Fee wallet amount updated to All Users');
    }
    public function weitoeth($amount){
        return $amount / 1000000000000000000;
    }
}
