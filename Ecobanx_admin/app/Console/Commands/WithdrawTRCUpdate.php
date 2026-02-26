<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Mail\WithdrawEmail; 
use App\Models\User;
use App\Models\UserTrxAddress;
use App\Models\CoinWithdraw;
use App\Models\AdminFeeWallet;
use App\Models\Commission;
use App\Traits\TrcClass;

class WithdrawTRCUpdate extends Command
{
    use TrcClass;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'withdraw:trc';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Withdraw TRC10 & TRC20 transaction for all Users';

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
        $trans = CoinWithdraw::where(['status' => 0,'network' => 'TRC20'])->get();
        if(count($trans) > 0){
            foreach ($trans as $tran) {
                $id = $tran->id;
                $uid = $tran->uid;
                $coin = $tran->coin_name;
                $toaddress = $tran->reciever;
                $amount = $tran->request_amount;
                $token = Commission::where(['source' => $coin,'type' => 'trxtoken'])->first();
                if(!is_object($token)){
                    return false;
                }
                $contract =  $token->contractaddress;              
                $txid = $this->withdrawTRC20($amount,$toaddress,$contract);
                if($txid){
                    $txid_url = "https://tronscan.org/#/transaction/".$txid;
                    CoinWithdraw::where(['id'=> $id])->update(['status' => 1,'txid' => $txid,'txid_url' => $txid_url,'updated_at' => date('Y-m-d H:i:s',time())]);

                    $user = User::on('mysql2')->where('id',$uid)->first(); 
       
                    $details = array(
                        'status'    => "Accept",
                        'coin'      => $coin,
                        'amount'    => $tran->amount,
                        'user'      => $user->first_name.' '.$user->last_name 
                    ); 
                    
                    Mail::to($user->email)->send(new WithdrawEmail($details));
                }               
            
                sleep(2); // this should halt for 2 seconds for every loop
            }
        }
        $this->info('TRC10 & TRC20 Withdraw transaction updated to All Users');
    }
}
