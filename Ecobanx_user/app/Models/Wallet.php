<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    protected $table = 'wallets';
    protected $fillable = ['uid', 'currency',	'balance',	'escrow_balance','created_at', 'updated_at' ];

    public static function getAddress($uid, $currency){
        $address = Wallet::where([['uid', '=', $uid], ['currency', '=', $currency]])->value('mukavari');
        return $address;
    }

    public static function getBalance($uid, $currency){
        $balance = Wallet::where([['uid', '=', $uid], ['currency', '=', $currency]])->value('balance');
        if(!$balance){
            return 0;
        }
        return $balance;
    }

  
    public static function debitAmount($uid, $currency, $amount, $decimal,$type=null,$remark=null,$insertid)
    {
        $userbalance = Wallet::where([['uid', '=', $uid], ['currency', '=', $currency]])->first();
        if($userbalance) {
            $oldbalance = $userbalance->balance;
            $total = ncSub($userbalance->balance, $amount, $decimal);
            $walletbalance =  $total;
            $site_balance = 0;
            if($userbalance->site_balance > 0)
            {
                $site_balance = ncSub($userbalance->site_balance,$amount, $decimal);
            }
            $userbalance->balance = $total;
            $userbalance->site_balance = $site_balance;
            $userbalance->updated_at = date('Y-m-d H:i:s',time());
            $userbalance->save();
            self::AllcoinUpdateBalanceTrack($uid,$currency,0,$amount,$walletbalance,$oldbalance,$type,$remark,$insertid);
            return $userbalance;
        }else{
            return false;
        }
    }
    public static function creditAmount($uid, $currency, $amount, $decimal,$type=null,$remark=null,$insertid)
    {
        $userbalance = Wallet::where([['uid', '=', $uid], ['currency', '=',$currency]])->first();        
        if($userbalance) {
            $oldbalance = $userbalance->balance;
            $total = ncAdd($amount, $userbalance->balance, $decimal);

            $walletbalance =  $total;
            $site_balance = ncAdd($amount, $userbalance->site_balance, $decimal);
            $userbalance->balance = $total;
            $userbalance->site_balance = $site_balance;
            $userbalance->updated_at = date('Y-m-d H:i:s',time());
            $userbalance->save();
        } else {    
            $oldbalance = 0;
            $walletbalance =  $amount;      
            Wallet::insert(['uid' => $uid, 'currency' => $currency, 'balance' => $amount, 'site_balance' => $amount, 'created_at' => date('Y-m-d H:i:s',time()), 'updated_at' => date('Y-m-d H:i:s',time())]);
        }
        self::AllcoinUpdateBalanceTrack($uid,$currency,$amount,0,$walletbalance,$oldbalance,$type,$remark,$insertid);
    }

    public static function creditEscrowAmount($uid, $currency, $amount, $decimal,$type=null,$remark=null,$insertid)
    {
        $userbalance = Wallet::where([['uid', '=', $uid], ['currency', '=',$currency]])->first();        
        if($userbalance) {
            $oldbalance = $userbalance->balance;
            $total = ncSub($userbalance->balance, $amount,$decimal);

            $walletbalance =  $total;
            $escrow_balance = ncAdd($userbalance->escrow_balance, $amount, $decimal);
            $userbalance->balance = $total;
            $userbalance->escrow_balance = $escrow_balance;
            $userbalance->updated_at = date('Y-m-d H:i:s',time());
            $userbalance->save();

            self::AllcoinUpdateBalanceTrack($uid,$currency,0,$amount,$walletbalance,$oldbalance,$type,$remark,$insertid);
        } else {    
            return false;
        }
    }

    public static function debitEscrowAmount($uid, $currency, $amount, $decimal,$type=null,$remark=null,$insertid)
    {
        $userbalance = Wallet::where([['uid', '=', $uid], ['currency', '=',$currency]])->first();        
        if($userbalance) {
            $oldbalance = $userbalance->balance;
            $total = ncAdd($userbalance->balance, $amount,$decimal);

            $walletbalance =  $total;
            $escrow_balance = ncSub($userbalance->escrow_balance, $amount, $decimal);
            $userbalance->balance = $total;
            $userbalance->escrow_balance = $escrow_balance;
            $userbalance->updated_at = date('Y-m-d H:i:s',time());
            $userbalance->save();

            self::AllcoinUpdateBalanceTrack($uid,$currency,$amount,0,$walletbalance,$oldbalance,$type,$remark,$insertid);
        } else {    
            return false;
        }
    }

    public static function clearEscrowAmount($uid, $currency, $amount, $decimal)
    {
        $userbalance = Wallet::where([['uid', '=', $uid], ['currency', '=',$currency]])->first();       
        if($userbalance) {
            $escrow_balance = ncSub($userbalance->escrow_balance, $amount, $decimal);
            $userbalance->escrow_balance = $escrow_balance;
            $userbalance->updated_at = date('Y-m-d H:i:s',time());
            $userbalance->save();
        } else {    
            return false;
        }
    }


    public static function AllcoinUpdateBalanceTrack($uid,$currency,$creditamount=0,$debitamount=0,$walletbalance=0,$oldbalance=null,$tradetype=null,$remark=null,$insertid)
    {

        if($creditamount > 0 || $debitamount > 0)
        {
            $Models = '\App\Models\OverallTransaction';
            $Models::AddTransaction($uid,$currency,$tradetype,$creditamount,$debitamount,$walletbalance,$oldbalance,$remark,'web',$insertid);
        }        
        return true;
    }


    public static function checkEscrowbalance($uid, $currency){
        $userbalance = Wallet::where([['uid', '=', $uid], ['currency', '=',$currency]])->value('escrow_balance');        
        return $userbalance;
    }
}
