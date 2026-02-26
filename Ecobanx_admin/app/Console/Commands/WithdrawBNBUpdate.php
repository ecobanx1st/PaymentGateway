<?php

namespace App\Console\Commands;

use Illuminate\Support\Facades\Mail;
use App\Mail\WithdrawEmail;
use Illuminate\Console\Command;
use App\Models\CryptoTransactions;
use App\Traits\EvmClass;
use App\Models\CoinWithdraw;
use App\Models\User;

class WithdrawBNBUpdate extends Command
{
    use EvmClass;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'withdraw:bnb';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Withdraw BNB transaction for all Users';

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
        $trans = CoinWithdraw::where(['coin_name' => 'BNB','status' => 0])->get();
        if(count($trans) > 0){
            foreach ($trans as $tran) {
                $id = $tran->id;
                $uid = $tran->uid;
                $toaddress = $tran->reciever;
                $amount = $tran->request_amount;
                $network = 'BNB';
                $txnid = $this->SendEVMAdmin($network,$toaddress,$amount);
                if(isset($txnid->txid)){
                    $txid = $txnid->txid;
                    $txid_url = "https://bscscan.com/tx/".$txid;
                    CoinWithdraw::where(['id'=> $id])->update(['status' => 1,'txid' => $txid,'txid_url' => $txid_url,'updated_at' => date('Y-m-d H:i:s',time())]);

                    $user = User::on('mysql2')->where('id',$uid)->first();       
                    $details = array(
                        'status'    => "Accept",
                        'coin'      => 'BNB',
                        'amount'    => $tran->amount,
                        'user'      => $user->first_name.' '.$user->last_name 
                    ); 
                    
                    Mail::to($user->email)->send(new WithdrawEmail($details));
                }
            
                sleep(2); // this should halt for 2 seconds for every loop
            }
        }
        $this->info('BNB Withdraw transaction updated to All Users');
    }
}
