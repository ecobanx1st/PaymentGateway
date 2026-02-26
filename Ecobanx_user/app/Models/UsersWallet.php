<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\OverallTransaction;

class UsersWallet extends Model
{
    protected $table = "wallets";
    public static function GetUserAddress($uid,$coin){
    	$data = UsersWallet::where(['uid' => $uid,'currency' => $coin])->value('mukavari');
    	if($data){
    		return $data;
    	}else{
    		return false;
    	}
    }
    public static function GetUserBalance($uid,$coin){
    	$data = UsersWallet::where(['uid' => $uid,'currency' => $coin])->value('balance');
    	if($data){
    		return $data;
    	}else{
    		return 0;
    	}
    }
 
    public static function debitAmount($uid, $currency, $amount, $decimal=8,$type,$remark,$insertid)
    {
        $userbalance = UsersWallet::where([['uid', '=', $uid], ['currency', '=', $currency]])->first();
        if($userbalance) {
            $oldbalance = $userbalance->balance;
            $total = ncSub($userbalance->balance, $amount, $decimal);
            $userbalance->balance = $total;
            $userbalance->updated_at = date('Y-m-d H:i:s',time());
            $userbalance->save();
            OverallTransaction::AddTransaction($uid,$currency,$type,0,$amount,$total,$oldbalance,$remark,'web',$insertid);
            return $userbalance;
        }else{
            return false;
        }
    }

    public static function creditAmount($uid, $currency, $amount, $decimal=8,$type,$remark,$insertid)
    {
        $userbalance = UsersWallet::where([['uid', '=', $uid], ['currency', '=', $currency]])->first();
        if($userbalance) {
            $oldbalance = $userbalance->balance;
            $total = ncAdd($userbalance->balance, $amount, $decimal);
            $userbalance->balance = $total;
            $userbalance->updated_at = date('Y-m-d H:i:s',time());
            $userbalance->save();
            //  return $userbalance;
        }else{

            $oldbalance = 0;
            $total = ncAdd(0, $amount, $decimal);
            $userbalance = new UsersWallet();
            $userbalance->uid = $uid;
            $userbalance->currency = $currency;
            $userbalance->mukavari = '';
            $userbalance->balance = $amount;
            $userbalance->escrow_balance = 0;
            $userbalance->created_at = date('Y-m-d H:i:s',time());
            $userbalance->updated_at = date('Y-m-d H:i:s',time());
            $userbalance->save();
            //return $userbalance;
        }
            OverallTransaction::AddTransaction($uid,$currency,$type,$amount,0,$total,$oldbalance,$remark,'web',$insertid);
            return $userbalance;
    }

    public static function CreateWallet($uid, $currency, $address,$vault_id=null)
    {
        $wallet = UsersWallet::where(['uid' => $uid, 'currency' => $currency])->first();
        if(is_object($wallet)){
            $wallet->mukavari = $address;
            $wallet->updated_at = date('Y-m-d H:i:s',time());
            $wallet->save();
        }else{
            $wallet = new UsersWallet();
            $wallet->uid = $uid;
            $wallet->currency = $currency;
            $wallet->vault_id = $vault_id;
            $wallet->mukavari = $address;
            $wallet->balance = 0;
            $wallet->escrow_balance = 0;
            $wallet->created_at = date('Y-m-d H:i:s',time());
            $wallet->updated_at = date('Y-m-d H:i:s',time());
            $wallet->save();
        }
        return $wallet;
    }

    public static function ApiWallet($uid)
    {
        $data = UsersWallet::where(['uid' => $uid])->get();
        if($data){
            return $data;
        }else{
            return false;
        }
    }



}
