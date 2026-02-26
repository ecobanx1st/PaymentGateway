<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\User;
use App\Models\Commission;
use App\Models\UsersPaymentAddress;

use App\Models\UsersWallet;
use App\Models\OrderTransaction;
use App\Models\Transaction;
use App\Traits\Fireblock;

class UpdateTransaction extends Command
{
    use Fireblock;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:fireblocktrans';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Transaction updated from fireblock';

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
        $params = array('sort' => 'DESC');
        $trans = $this->getFirblockTransactions(json_encode($params));
        if($trans){
            foreach($trans as $tran){
                $assetId = $tran->assetId;
                $toaddress = $tran->destinationAddress;
                $fromaddress = $tran->sourceAddress;
                $txHash = $tran->txHash;
                $amount = $tran->amount;
                $fee = $tran->fee;
                $createdAt = $tran->createdAt /1000;
                $time = date('Y-m-d H:i:s',$createdAt);
                $coinDetails = Commission::where('f_symbol',$assetId)->first();
                if(is_object($coinDetails)){
                    $currency = $coinDetails->source;
                    $is_exits= UsersPaymentAddress::where(['address' => $toaddress,'paymentstatus' => 0])->first();
                    if(is_object($is_exits)){                    
                        $oid = $is_exits->o_txid;
                        $order = OrderTransaction::where(['txn_id' => $oid,'status' => 0])->first();
                        if(is_object($order)){
                            $type = "pos";
                            $remark = "Payment success";
                            $received_confirms = 100;
                            $received_amount = $amount;
                            $insertid = $order->id;
                            $uid = $order->uid;
                            //$currency = $order->currency2;
                            if($order->status == 0){
                                UsersWallet::creditAmount($uid, $currency, $amount, 8,$type,$remark,$insertid);
                            }                            
                            $status     = 100;
                            $statustext = 'Payment completed successfully';
                            $order->received_amount      = $received_amount;
                            $order->received_confirms      = $received_confirms;
                            $order->status      = $status;
                            $order->status_text = $statustext;         
                            $order->save();
                        }
                        $is_exits->paymentstatus = 100;                   
                        $is_exits->balance = $amount;
                        $is_exits->save();                   

                    }else{
                        $is_userwallet = UsersWallet::where(['mukavari' => $toaddress,'currency' => $currency])->first();
                        if(is_object($is_userwallet)){
                            $uid = $is_userwallet->uid;
                            Transaction::createTransaction($uid,$currency,$txHash,$fromaddress,$toaddress,$amount,3,$time,$fee,'deposit');
                        }
                    }                    
                }
                
            }
        }
        $this->info('Fireblock order transaction updated successfully');
    }
}
