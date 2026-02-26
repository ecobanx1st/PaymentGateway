<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\User;
use App\Traits\EvmClass;
use App\Models\TransactionBlock;
use App\Models\OrderTransaction;
use App\Models\UsersWallet;
use App\Models\Transaction;
use App\Models\UserEvmAddress;
use App\Models\UsersPaymentAddress;

class WFIUpdate extends Command
{
    use EvmClass;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:wfi';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update WFI Blocks transaction for all Users';

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
        $blocks = TransactionBlock::where('coin','WFI')->first();
        $startBlock = $blocks->blocks;
        $data = $this->getEVMBlockTransaction('WFI',$startBlock);        
        if(isset($data->status) && isset($data->lastblock)){
            $lastblock = $data->lastblock;
            $usersEVMAddress = UserEvmAddress::pluck('address')->toArray();
            $usersEVMAddr = array_map('strtolower', $usersEVMAddress);

            $usrPaymentAddress = UsersPaymentAddress::where(['coin' => 'WFI','paymentstatus' => 0])->pluck('address')->toArray();
            $usersPayAddr = array_map('strtolower', $usrPaymentAddress);
            if(isset($data->data) && count($data->data) > 0){
                $trans = $data->data;
                foreach($trans as $tran){
                    $txid = $tran->hash;
                    $amount = $tran->amount;
                    $timestamp = $tran->timestamp;
                    $time = date('Y-m-d H:i:s',$timestamp);
                    $fromaddress = $tran->from;
                    $toaddress = $tran->to;
                    $value = $tran->value;
                    $fee = self::weitoeth($tran->gasPrice * $tran->gas);
                    //echo "$txid $timestamp $fromaddress $toaddress $amount ";
                    if(in_array(strtolower($toaddress), $usersEVMAddr)){
                        $type = "Received";
                        $uid = UserEvmAddress::where(DB::raw('LOWER(address)'),strtolower($toaddress))->value('user_id');
                        Transaction::createTransaction($uid,"WFI","wficoin",$txid,$fromaddress,$toaddress,$amount,3,$time,$fee,'deposit','WFI coin deposit');
                    }else if(in_array(strtolower($toaddress), $usersPayAddr)){
                        $this->updateTransaction($toaddress,"WFI",$amount);
                    }elseif (in_array(strtolower($fromaddress), $usersEVMAddr)) {                        
                        $type = "Send";
                    }
                }                
            }
            $blocks->blocks = $lastblock + 1;
            $blocks->last_blocks = $lastblock;
            $blocks->start_blocks = $startBlock;
            $blocks->save();
        }
        $this->info('Blocks transaction updated to All Users');   
    }
    public function wei($amount){
        return number_format((1000000000000000000 * $amount), 0,'.','');
    }

    public function weitoeth($amount){
        return $amount / 1000000000000000000;
    }

    public function weitousdt($amount,$tokenDecimal=null){
        if($tokenDecimal){
            if($tokenDecimal > 0){
               $tokenDecimal = 1 + $tokenDecimal;
                $number = 1;
                $number = str_pad($number, $tokenDecimal, '0', STR_PAD_RIGHT);  
            }else{
                $number = 1;
            }         
            return $amount / $number;
        }else{
            return $amount / 1;
        }
    }

    public function updateTransaction($toaddress,$currency,$amount){
        $is_exits= UsersPaymentAddress::where(DB::raw('LOWER(address)'),strtolower($toaddress))->where(['paymentstatus' => 0])->first();
        if(is_object($is_exits)){                    
            $oid = $is_exits->o_txid;
            $order = OrderTransaction::where(['txn_id' => $oid,'status' => 0])->first();
            if(is_object($order)){
                $type = $order->cmd;
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
        }
    }
}
