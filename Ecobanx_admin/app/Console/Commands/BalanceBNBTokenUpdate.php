<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\UserEvmAddress;
use App\Models\CryptoTransactions;
use App\Models\UserWallet;
use App\Models\Commission;
use App\Traits\EvmClass;

class BalanceBNBTokenUpdate extends Command
{
    use EvmClass;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:bsctoken';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update bsctoken transaction for logged Users';

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
        $useraddress = UserEvmAddress::where(['bnbtoken_status' => 0])->orderBy('id', 'desc')->get();
		$limit = 1;
        if(count($useraddress) > 0){            
            foreach ($useraddress as $user) {
                echo $uid = $user->user_id;
                $useraddress = $user->address;
                $this->updateTransactionEVM20('BNB',$uid);
				if($limit % 30 == 0){
					sleep(2);
				}
				sleep(1);
				$limit++;
				UserEvmAddress::where(['id' => $user->id])->update(['bnbtoken_status' => 1,'updated_at' => date('Y-m-d H:i:s',time())]);
            }
        }else{
            $users = UserEvmAddress::where('bnbtoken_status',1)->orderBy('user_id','Desc')->get();
            foreach ($users as $user) {
                UserEvmAddress::where('user_id',$user->user_id)->update(['bnbtoken_status' => 0, 'updated_at' => date('Y-m-d H:i:s',time())]);
            }
        }
        $this->info('BNB Token transaction updated to All Users');
    }   

    public function wallet_eth_balance_update($coin,$uid,$ethbalance)
     {

        $wallet =  UserWallet::where(['uid' => $uid ,'currency' => $coin])->update(['eth_mathippu' => $ethbalance ]);
        return $wallet;
     }

    public function debitamount($coin,$uid,$amount,$decimal=8){
        $userbalance = UserWallet::where([['uid', '=', $uid], ['currency', '=',$coin]])->first();
        if($userbalance){
            $total = ncSub($userbalance->balance,$amount, $decimal);
            $site_balance = ncSub($userbalance->site_balance,$amount, $decimal);
            $userbalance->balance = $total;
            $userbalance->site_balance = $site_balance;
            $userbalance->updated_at = date('Y-m-d H:i:s',time());
            $userbalance->save();
            return $userbalance;
        }
    }


}
