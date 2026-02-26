<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
     protected $table = 'transactions';

    protected $connection = 'mysql2';

    public static function depsoitList($currency)
    {
    	$list = Transaction::on('mysql2')->where('currency',$currency)->orderBy('id', 'desc')->paginate(10); 
    	
    	return $list;
    }

    public static function createTransaction($uid,$coin,$txid,$from,$to,$amount,$confirm=3,$time){
        $tran = Transaction::on('mysql2')->where(['uid' => $uid, 'currency' => $coin,'txid' => $txid])->first();
        if(!$tran){
            $tran = new Transaction();
            $tran->uid = $uid;
            $tran->currency = $coin;
            $tran->txtype = $uid;
            $tran->txid = $txid;
            $tran->from_addr = $from;
            $tran->to_addr = $to;
            $tran->amount = $amount;            
            $tran->status = 0;
            $tran->nirvaki_nilai = 0;
            $tran->created_at = $time;
        }
        $tran->confirmation = $confirm;
        $tran->updated_at = date('Y-m-d H:i:s',time());
        $tran->save();
        return $tran;

    }

    public static function depsoitList_user($uid)
    {
        $list = Transaction::on('mysql2')->where('uid',$uid)->orderBy('id', 'desc')->paginate(10); 
        
        return $list;
    }



    public static function depsoitView($id)
    {
    	$list = Transaction::on('mysql2')->where('id',$id)->first(); 
    	
    	return $list;
    }

    public static function depsoitUpdate($request)
    { 
    	$list = Transaction::on('mysql2')->where(['id' => $request->id, 'status' => 0])->first();


        if($list){
        	if($request->status == 2)
        	{
        		$list->status = 2;
        		$list->save();
        		$balance = UserWallet::on('mysql2')->where(['uid' => $list->uid, 'currency' => $list->currency])->first();

        		if(is_object($balance))
        		{
        			$balance->balance = ncAdd($balance->balance,$request->amount);
        			$balance->site_balance = ncAdd($balance->balance,$request->amount);
        			$balance->save();
        		}
        		else
        		{
        			$bal = new UserWallet;
        			$bal->setConnection('mysql2');
        			$bal->uid            = $list->uid;
        			$bal->currency       = $list->currency;
        			$bal->escrow_balance = 0;
        			$bal->site_balance   = $list->amount;
        			$bal->balance        = $list->amount;
        			$bal->save();
        		} 
        		
        		$status = 'Accept'; 
        	}
        	elseif($request->status == 3)
        	{
        		$list->status = 3;
        		$list->save();

        		$status = 'Cancel';
        	}

            elseif($request->status == 0)
            {
                $status = 'Pending';
            }



            $user = User::on('mysql2')->where('id',$list->uid)->first(); 
           
        	$details = array(
        			'status'     => $status,
        			'coin'       => $list->currency,
        			'amount'     => $request->amount,
                    'user'       => $user->name 
        	); 
        	
        	Mail::to($user->email)->send(new DepositEmail($details));
            return $list;
        }else{
            return false;
        }
    }

    public function user() {
        return $this->belongsTo('App\Models\User', 'uid', 'id');
    }
}
