<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\UserTrxAddress;
use App\Models\CryptoTransactions;
use App\Traits\TrcClass;

class BalanceTRCUpdate extends Command
{
    use TrcClass;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:trc';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update TRC transaction for logged Users';

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
                 
            $users = UserTrxAddress::get();
            if(count($users) > 0){            
                foreach ($users as $user) {
                    $uid = $user->user_id;
                    $useraddress = $user->address;
                    if($useraddress){
                        $this->userTransactionTrxToken($useraddress);
                    }
					sleep(2); // this should halt for 2 seconds for every loop
                }
            }

     

        $this->info('TRC transaction updated to All Users');
    }
}
