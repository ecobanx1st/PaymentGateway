<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsersWithdraw extends Model
{
	
    public static function createTransaction($uid,$coin,$fromaddress,$toaddress,$amount,$fee,$ramount,$sathosiamount,$autowithdrawstatus,$network=null){
    	$Withdraw 					  = new UsersWithdraw();
    	$Withdraw->user_id 			  = $uid;
    	$Withdraw->coin_name		  = $coin;
        $Withdraw->network            = $network;
    	$Withdraw->sender 			  = $fromaddress;
    	$Withdraw->reciever 		  = $toaddress;
    	$Withdraw->amount 			  = $amount;
    	$Withdraw->request_amount 	  = $ramount;
        $Withdraw->amounti            = $sathosiamount;
        $Withdraw->autowithdrawstatus = $autowithdrawstatus;
    	$Withdraw->admin_fee 		  = $fee;
    	$Withdraw->transaction_id 	  = TransactionString(15);
    	$Withdraw->remark 			  = 'Transfer created with no email confirmation needed.';
    	$Withdraw->status 			  = 0;
    	$Withdraw->created_at 		  = date('Y-m-d H:i:s',time());
    	$Withdraw->updated_at 		  = date('Y-m-d H:i:s',time());
    	$Withdraw->save();
    	return $Withdraw->id;
    }
}
