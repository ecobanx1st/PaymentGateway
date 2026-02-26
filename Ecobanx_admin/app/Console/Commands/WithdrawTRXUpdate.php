<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Mail\WithdrawEmail; 
use App\Models\User;
use App\Models\UserTrxAddress;
use App\Models\CoinWithdraw;
use App\Models\AdminFeeWallet;
use App\Traits\TrcClass;

class WithdrawTRXUpdate extends Command
{
    use TrcClass;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'withdraw:trx';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Withdraw TRX transaction for all Users';

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
        $trans = CoinWithdraw::where(['coin_name' => 'TRX','status' => 0])->get();
        if(count($trans) > 0){
            foreach ($trans as $tran) {
                $id = $tran->id;
                $uid = $tran->uid;
                $toaddress = $tran->reciever;
                $amount = $tran->request_amount;
                $txid = $this->withdrawTRX($amount,$toaddress);
                if($txid){
                    $txid_url = "https://tronscan.org/#/transaction/".$txid;
                    CoinWithdraw::where(['id'=> $id])->update(['status' => 1,'txid' => $txid,'txid_url' => $txid_url,'updated_at' => date('Y-m-d H:i:s',time())]);

                    $user = User::on('mysql2')->where('id',$uid)->first();       
                    $details = array(
                        'status'    => "Accept",
                        'coin'      => 'TRX',
                        'amount'    => $tran->amount,
                        'user'      => $user->first_name.' '.$user->last_name 
                    ); 
                    
                    Mail::to($user->email)->send(new WithdrawEmail($details));
                }
            
                sleep(2); // this should halt for 2 seconds for every loop
            }
        }
        $this->info('TRX Withdraw transaction updated to All Users');
    }
}
