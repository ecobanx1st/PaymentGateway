<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\User;
use App\Models\Commission;
use App\Models\UsersWallet;
use App\Traits\Fireblock;

class CreateVault extends Command
{
    use Fireblock;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'create:uservault';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

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
        $users = User::where('email_verify',1)->whereNull('vault_id')->get();
        if(count($users) > 0){
            foreach($users as $user){
                $name = $user->email;
                $customerRefId = $user->referral_id;
                $data = $this->fireGerenateVault($name,$customerRefId);
                if($data){
                    $valutID = $data->id;
                    User::where('id',$user->id)->update(['vault_id' => $valutID]);
                }
                sleep(4);
            }
        }

        $users = User::where(['email_verify' => 1,'is_address' => 0])->whereNotNull('vault_id')->get();
        if(count($users) > 0){
            foreach($users as $user){
                $name = $user->email;
                $vault_id = $user->vault_id;

                $coins = Commission::whereNotNull('f_symbol')->get();
                foreach($coins as $coin){
                    $asset = $coin->f_symbol;
                    $symbol = $coin->source;
                    if($coin->f_symbol !=""){
                        $data = $this->createVaultAsset($vault_id,$asset);
                        if($data){
                            $address = $data->address;
                            UsersWallet::CreateWallet($user->id, $symbol, $address,$vault_id);
                        }
                    }
                    sleep(4);
                }
                User::where('id',$user->id)->update(['is_address' => 1]);
                
                sleep(4);
            }
        }

        $this->info('Vault created all verified users');
    }
}
