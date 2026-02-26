<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Traits\AddressCreation;

class AddressUserUpdate extends Command
{
    use AddressCreation;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:addressuser';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update Address Users to admin dashboard';

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
        $users = User::where(['is_address' => 0])->get();
        if(count($users) > 0){
            foreach ($users as $user) {
			//echo $user->id;
                $this->userAddressCreation($user->id);
                $data = User::where(['id' => $user->id])->first();
                $data->is_address = 1;
                $data->updated_at = date('Y-m-d H:i:s',time());
                $data->save();
                sleep(4);
            }
        } 
    
        $this->info('updated to All Users address');
    }
}