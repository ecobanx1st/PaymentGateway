<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminTransaction extends Model
{
    protected $table ='admintransactions';
    public static function createTransaction($uid,$coin,$txid,$from,$to,$amount,$confirm=3,$time,$fees){
        $tran = AdminTransaction::where(['uid' => $uid,'currency' => $coin,'txn_id' => $txid])->first();
        if(!$tran){
            $tran = new AdminTransaction();
            $tran->uid = $uid;
            $tran->txn_id = $txid;
            $tran->from_address = $from;
            $tran->to_address = $to;
            $tran->status = 100;
            $tran->status_text = 'confirmed/complete';
            $tran->txtype = $uid;
            $tran->currency = $coin;
            $tran->confirms = $confirm;
            $tran->amount = $amount;            
            $tran->amounti = self::sathosi($amount);            
            $tran->fee = $fees;            
            $tran->feei = self::sathosi($fees);            
            $tran->nirvaki_nilai = 0;
            $tran->created_at = $time;

            //UsersWallet::creditAmount($uid, $coin, $amount, 8);

            $type = "transaction";
            $remark = "Payment success";
            $insertid = $tran->id;

           // UsersWallet::creditAmount($uid, $coin, $amount, 8,$type,$remark,$insertid);
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
