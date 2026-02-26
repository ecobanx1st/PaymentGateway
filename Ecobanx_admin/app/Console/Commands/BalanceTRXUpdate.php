<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\UserTrxAddress;
use App\Models\CryptoTransactions;
use App\Traits\TrcClass;

class BalanceTRXUpdate extends Command
{
    use TrcClass;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:trx';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update TRX transaction for logged Users';

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
        $users = UserTrxAddress::where(['api_status' => 0])->orderBy('user_id', 'desc')->get();
        if(count($users) > 0){            
            foreach ($users as $user) {
                $uid = $user->user_id;
				echo $uid.' ';
                $useraddress = $user->address;
                if($useraddress){
                    $this->userTransactionTrx($useraddress);
                    sleep(3);
                    $this->userTransactionTrxToken($useraddress);
                }
				sleep(2); // this should halt for 2 seconds for every loop
                UserTrxAddress::where(['id' => $user->id])->update(['api_status' => 1,'updated_at' => date('Y-m-d H:i:s',time())]);
            }
        }else{
            $users = UserTrxAddress::where('api_status',1)->orderBy('user_id','Desc')->get();
            foreach ($users as $user) {
                UserTrxAddress::where('user_id',$user->user_id)->update(['api_status' => 0, 'updated_at' => date('Y-m-d H:i:s',time())]);
            }
        }    

        $this->info('TRX transaction updated to All Users');
    }
}
