<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\KycSubmit;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use App\Traits\AddressCreation;
use App\AdminsUser;

class CreateUserDetails extends Command
{
    use AddressCreation;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'create:userdetails';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backup user details to admin! & address create';

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
        $users = User::where(['email_verify' => 1,'is_address' => 0])->get();
        if(count($users) > 0){
            foreach ($users as $user) {
                //$admin = AdminUsers::Createuser($user);
				echo $user->id.' ';
                $this->userAddressCreation($user->id);
                User::where(['id'=> $user->id])->update(['is_address' => 1, 'updated_at' => date('Y-m-d H:i:s',time())]);
                AdminsUser::updateadmin($user);

            }
        }
        $this->info('Details moved and address created!');
    }

}
