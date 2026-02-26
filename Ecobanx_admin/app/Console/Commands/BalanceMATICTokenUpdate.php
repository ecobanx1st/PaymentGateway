<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\UserEvmAddress;
use App\Models\CryptoTransactions;
use App\Models\UserWallet;
use App\Models\Commission;
use App\Traits\EvmClass;

class BalanceMATICTokenUpdate extends Command
{
    use EvmClass;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:polytoken';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update polytoken transaction for logged Users';

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
        $useraddress = UserEvmAddress::where(['polytoken_status' => 0])->orderBy('id', 'desc')->get();
        if(count($useraddress) > 0){
			$limit = 1;
            foreach ($useraddress as $user) {
                echo $uid = $user->user_id;
                $this->updateTransactionEVM20('MATIC',$uid);
				if($limit % 4 == 0){
					sleep(2);
				}             
                $limit++;
				UserEvmAddress::where(['id' => $user->id])->update(['polytoken_status' => 1,'updated_at' => date('Y-m-d H:i:s',time())]);
            }
        }else{
            $users = UserEvmAddress::where('polytoken_status',1)->orderBy('user_id','Desc')->get();
            foreach ($users as $user) {
                UserEvmAddress::where('user_id',$user->user_id)->update(['polytoken_status' => 0, 'updated_at' => date('Y-m-d H:i:s',time())]);
            }
        }
        $this->info('POLYGON Token transaction updated to All Users');
    }

}
