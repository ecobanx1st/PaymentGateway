<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\User;
use App\Traits\TrcClass;
use App\Models\OrderTransaction;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\UserEvmAddress;
use App\Models\UsersPaymentAddress;

class BalanceUpdateTRXToken extends Command
{
   use TrcClass;
   /**
    * The name and signature of the console command.
    *
    * @var string
    */
   protected $signature = 'update:trx';

   /**
    * The console command description.
    *
    * @var string
    */
   protected $description = 'Update Trx transaction for all Users';

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
       $users = UserTrxAddress::where(['api_status' => 0])->orderBy('user_id', 'desc')->get();
       if(count($users) > 0){            
           foreach ($users as $user) {
               $uid = $user->user_id;
               echo $uid.' ';
               $useraddress = $user->address;
               if($useraddress){
                   $this->userTransactionTrx($useraddress);
                   sleep(3);
                   $this->userTransactionTrxToken($useraddress);
               }
               sleep(2); // this should halt for 2 seconds for every loop
               UserTrxAddress::where(['id' => $user->id])->update(['api_status' => 1,'updated_at' => date('Y-m-d H:i:s',time())]);
           }
       }else{
           $users = UserTrxAddress::where('api_status',1)->orderBy('user_id','Desc')->get();
           foreach ($users as $user) {
               UserTrxAddress::where('user_id',$user->user_id)->update(['api_status' => 0, 'updated_at' => date('Y-m-d H:i:s',time())]);
           }
       } 

       $users = UsersPaymentAddress::where(['coin' => 'TRX'])->get();
       if(count($users) > 0){            
           foreach ($users as $user) {
               $uid = $user->user_id;
               echo $uid.' ';
               $useraddress = $user->address;
               if($useraddress){
                   $this->userOrderTransactionTrx($useraddress);
                   sleep(3);
                   // $this->userTransactionTrxToken($useraddress);
               }
               sleep(2); // this should halt for 2 seconds for every loop
               UserTrxAddress::where(['id' => $user->id])->update(['api_status' => 1,'updated_at' => date('Y-m-d H:i:s',time())]);
           }
       }else{
           $users = UserTrxAddress::where('api_status',1)->orderBy('user_id','Desc')->get();
           foreach ($users as $user) {
               UserTrxAddress::where('user_id',$user->user_id)->update(['api_status' => 0, 'updated_at' => date('Y-m-d H:i:s',time())]);
           }
       } 


       $users = UsersPaymentAddress::where(['coin_type' => 'TRX20'])->get();
       if(count($users) > 0){            
           foreach ($users as $user) {
               $uid = $user->user_id;
               echo $uid.' ';
               $useraddress = $user->address;
               if($useraddress){
                   // $this->userOrderTransactionTrx($useraddress);
                   sleep(3);
                   $this->userOrderTransactionTrxToken($useraddress);
               }
               sleep(2); // this should halt for 2 seconds for every loop
               UserTrxAddress::where(['id' => $user->id])->update(['api_status' => 1,'updated_at' => date('Y-m-d H:i:s',time())]);
           }
       }else{
           $users = UserTrxAddress::where('api_status',1)->orderBy('user_id','Desc')->get();
           foreach ($users as $user) {
               UserTrxAddress::where('user_id',$user->user_id)->update(['api_status' => 0, 'updated_at' => date('Y-m-d H:i:s',time())]);
           }
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
                   Wallet::creditAmount($uid, $currency, $amount, 8,$type,$remark,$insertid);
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
