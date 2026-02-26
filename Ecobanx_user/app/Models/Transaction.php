<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\UsersWallet;

class Transaction extends Model
{
    public function userdetails() 
    {
        return $this->belongsTo('App\User', 'uid', 'id');
    }

     public function BuyerInformation() 
    {
        return $this->belongsTo('App\Models\BuyerInformation', 'uid', 'oid');
    }
    public static function createTransaction($uid,$coin,$cointype,$txid,$from,$to,$amount,$confirm=3,$time,$fees = 0,$type='deposit',$remark=null){

        //dd($confirm);
        $tran = Transaction::where(['uid' => $uid,'currency' => $coin,'txn_id' => $txid])->first();
        if(!$tran){
            $tran = new Transaction();
            $tran->uid = $uid;
            $tran->txn_id = $txid;
            $tran->from_address = $from;
            $tran->to_address = $to;
            $tran->status = 100;
            $tran->status_text = 'confirmed/complete';
            $tran->txtype = $cointype;
            $tran->currency = $coin;
            $tran->confirms = $confirm;
            $tran->amount = $amount;            
            $tran->amounti = self::sathosi($amount);            
            $tran->fee = $fees;            
            $tran->feei = self::sathosi($fees);            
            $tran->nirvaki_nilai = 0;
            $tran->created_at = $time;

            //UsersWallet::creditAmount($uid, $coin, $amount, 8);

            //$type = "transaction";
            //$remark = "Payment success";
            $insertid = $tran->id;

            UsersWallet::creditAmount($uid, $coin, $amount, 8,$type,$remark,$insertid);
        }

        $tran->confirms = $confirm;
        $tran->updated_at = date('Y-m-d H:i:s',time());
        $tran->save();
        return $tran;

    }

    public static function sathosi($amount){
		if(!empty($amount)){
			return 100000000 * $amount;
		}
	}

}
