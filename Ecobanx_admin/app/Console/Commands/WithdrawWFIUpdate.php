<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Mail\WithdrawEmail;
use App\Models\CryptoTransactions;
use App\Traits\EvmClass;
use App\Models\UsersWithdraw;
use App\Models\User;

class WithdrawWFIUpdate extends Command
{
    use EvmClass;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'withdraw:wfi';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Withdraw WFI transaction for all Users';

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
        $trans = UsersWithdraw::where(['coin_name' => 'WFI','status' => 0])->get();
        if(count($trans) > 0){
            foreach ($trans as $tran) {
                $id = $tran->id;
                $uid = $tran->user_id;
                $toaddress = $tran->reciever;
                $amount = $tran->request_amount;
                $network = 'WFI';
                //$txnid = $this->SendEVMAdmin($network,$toaddress,$amount);
                $txnid = $this->SendEVMUser($network,$uid,$toaddress,$amount);
                if(isset($txnid->txid)){
                    $txid = $txnid->txid;
                    $txid_url = "https://scan.wficoin.io/tx/".$txid;
                    UsersWithdraw::where(['id'=> $id])->update(['status' => 1,'autowithdrawstatus'=> 1,'transaction_id' => $txid,'txid_url' => $txid_url,'updated_at' => date('Y-m-d H:i:s',time())]);

                    $user = User::on('mysql2')->where('id',$uid)->first();       
                    $details = array(
                        'status'    => "Accept",
                        'coin'      => 'WFI',
                        'amount'    => $tran->amount,
                        'user'      => $user->first_name.' '.$user->last_name 
                    ); 
                    
                    Mail::to($user->email)->send(new WithdrawEmail($details));
                }
            
                sleep(2); // this should halt for 2 seconds for every loop
            }
        }
        $this->info('WFI Withdraw transaction updated to All Users');
    }
}
