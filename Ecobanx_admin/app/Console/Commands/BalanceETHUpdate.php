<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\UserEvmAddress;
use App\Models\CryptoTransactions;
use App\Models\UserWallet;
use App\Traits\EvmClass;

class BalanceETHUpdate extends Command
{
    use EvmClass;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:eth';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update ETH transaction for logged Users';

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
         
        $useraddress = UserEvmAddress::where(['eth_status' => 0])->get();
        if(count($useraddress) > 0){
			$limit = 1;
			foreach ($useraddress as $user) {
				$uid = $user->user_id;
				$this->updateTransactionEVM('ETH',$uid);
				if($limit % 4 == 0){
					sleep(2);
				}
				sleep(1);	// this should halt for 2 seconds for every loop
				UserEvmAddress::where(['id' => $user->id])->update(['eth_status' => 1,'updated_at' => date('Y-m-d H:i:s',time())]);
			}
		}else{
            $users = UserEvmAddress::where('eth_status',1)->orderBy('user_id','Desc')->get();
            foreach ($users as $user) {
                UserEvmAddress::where('user_id',$user->user_id)->update(['eth_status' => 0, 'updated_at' => date('Y-m-d H:i:s',time())]);
            }
        } 
          
      

        $this->info('ETH transaction updated to All Users');
    }
    public function wei($amount){
        return number_format((1000000000000000000 * $amount), 0,'.','');
    }

    public function weitoeth($amount){
        return $amount / 1000000000000000000;
    }


}
