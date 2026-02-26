<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;

use App\Models\Commission;
use App\Models\UserWallet;
use App\Models\User;

class UserWallet extends Model
{
    protected $table = 'wallets';

    public static function userWalletDetails($id)
    {
    	$wallets = UserWallet::on('mysql')->where('uid', $id)->get();
    	$coins = Commission::index(); 
    	if(count($wallets) > 0 ){
    		foreach($wallets as $balance)
	        {
	            $currency[$balance->currency]['balance'] = sprintf("%.8f", $balance->balance);
	            $currency[$balance->currency]['escrow'] = sprintf("%.8f", $balance->escrow_balance);
	            $currency[$balance->currency]['address'] = $balance->mukavari;
	        }
	        $currency = $currency;
    	}else{
    		$currency ="";
    	}
    	$details = array(
            'coin' 		=> $coins,
            'balance' 	=> $currency,
        );
        return $details;
        
    }

    public static function balanceupdate($request,$uid)
    {
        $exits =  User::on('mysql')->where('id',$uid)->count();

        if($exits > 0)
        {
            $lists = Commission::get();
            $balance = 0;
            if(count($lists) > 0){
                foreach ($lists as $list) {
                    $coin           = $list->source;
                    $requestcoin    = 'balance_'.$coin;
                    $balance        = $request->$requestcoin;
                    if(!isset($balance)){
                        $balance = 0;
                    }
                    $wallet = UserWallet::on('mysql')->where(['uid' => $uid,'currency' => $coin])->first();
                    if($wallet){
                        $wallet->balance = $balance;
                        $wallet->updated_at = date('Y-m-d H:i:s',time());
                    }else {
                        $wallet = new UserWallet; 
                        $wallet->setConnection('mysql');
                        $wallet->uid            = $uid;
                        $wallet->currency       = $coin;         
                        $wallet->balance        = $balance;         
                        $wallet->site_balance   = $balance;
                        $wallet->created_at     = date('Y-m-d H:i:s',time());
                        $wallet->updated_at     = date('Y-m-d H:i:s',time()); 
                    }
                    $wallet->save();
                }
            }
        }

       return true;

    }
    public static function debitAmount($uid, $currency, $amount, $decimal,$type=null,$remark=null,$insertid)
    {
        $userbalance = UserWallet::where([['uid', '=', $uid], ['currency', '=', $currency]])->first();
        if($userbalance) {
            $oldbalance = $userbalance->balance;
            $total = ncSub($userbalance->balance, $amount, $decimal);
            $site_balance = 0;
            if($userbalance->site_balance > 0)
            {
                $site_balance = ncSub($userbalance->site_balance,$amount, $decimal);
            }
            $userbalance->balance = $total;
            $userbalance->site_balance = $site_balance;
            $userbalance->updated_at = date('Y-m-d H:i:s',time());
            $userbalance->save();
            self::AllcoinUpdateBalanceTrack($uid,$currency,$amount,0,$total,$oldbalance,$type,$remark,$insertid);
            return $userbalance;
        }else{
            return false;
        }
    }
    public static function creditAmount($uid, $currency, $amount, $decimal,$type=null,$remark=null,$insertid=null)
    {
        $userbalance = UserWallet::where([['uid', '=', $uid], ['currency', '=',$currency]])->first();

        if($userbalance) {
            $total = ncAdd($amount, $userbalance->balance, $decimal);
            $walletbalance = $total;
            $oldbalance = $userbalance->balance;
            $site_balance = ncAdd($amount, $userbalance->site_balance, $decimal);
            $userbalance->balance = $total;
            $userbalance->site_balance = $site_balance;
            $userbalance->updated_at = date('Y-m-d H:i:s',time());
            $userbalance->save();            
        } else {
            $walletbalance = $amount;
            $oldbalance =  0;            
            UserWallet::insert(['uid' => $uid, 'currency' => $currency, 'balance' => $amount, 'site_balance' => $amount, 'created_at' => date('Y-m-d H:i:s',time()), 'updated_at' => date('Y-m-d H:i:s',time())]);
        }
        self::AllcoinUpdateBalanceTrack($uid,$currency,$amount,0,$walletbalance,$oldbalance,$type,$remark,$insertid);
        return $walletbalance;
    }
    public static function clearEscrowAmount($uid, $currency, $amount, $decimal)
    {
        $userbalance = UserWallet::where([['uid', '=', $uid], ['currency', '=',$currency]])->first();       
        if($userbalance) {
            $escrow_balance = ncSub($userbalance->escrow_balance, $amount, $decimal);
            $userbalance->escrow_balance = $escrow_balance;
            $userbalance->updated_at = date('Y-m-d H:i:s',time());
            $userbalance->save();
        } else {    
            return false;
        }
    }
    public static function rewardCreditAmount($uid, $currency, $amount, $decimal)
    {
        $userbalance = UserWallet::where([['uid', '=', $uid], ['currency', '=',$currency]])->first();
        if($userbalance) {
            $total = ncAdd($amount, $userbalance->reward, $decimal);
            $userbalance->reward = $total;
            $userbalance->updated_at = date('Y-m-d H:i:s',time());
            $userbalance->save();
            return $userbalance;
        } else {            
            UserWallet::insert(['uid' => $uid, 'currency' => $currency, 'reward' => $amount, 'created_at' => date('Y-m-d H:i:s',time()), 'updated_at' => date('Y-m-d H:i:s',time())]);
        }
    }
    public static function AllcoinUpdateBalanceTrack($uid,$currency,$creditamount=0,$debitamount=0,$walletbalance=0,$oldbalance=null,$tradetype=null,$remark=null,$insertid)
    {

        if($creditamount > 0 || $debitamount > 0)
        {
            $Models = '\App\Models\OverallTransaction';
            $Models::AddTransaction($uid,$currency,$tradetype,$creditamount,$debitamount,$walletbalance,$oldbalance,$remark,'user',$insertid);
        }        
        return true;
    }
}
