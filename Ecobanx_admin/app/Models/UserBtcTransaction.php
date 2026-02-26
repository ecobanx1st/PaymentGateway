<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\UserWallet;
use App\Models\BtcAdminAddress;
use Illuminate\Support\Facades\Mail;
use App\Mail\DepositEmail;
use App\Mail\WithdrawEmail;

class UserBtcTransaction extends Model
{
  
	public static function depsoitList()
    {
    	$list = UserBtcTransactions::on('mysql2')->where('type','received')->where('status','!=','0')->orderBy('id', 'desc')->paginate(10); 
    	
    	return $list;
    }

    public static function depsoitView($id)
    {
    	$list = UserBtcTransactions::on('mysql2')->where('id',$id)->first(); 
    	
    	return $list;
    }

    public static function depsoitUpdate($request)
    { 
    	$list = UserBtcTransactions::on('mysql2')->where('id',$request->id)->first();

    	if($request->status == 2)
    	{
    		$list->status = 2;
    		$list->save();

    		$balance = UserWallet::on('mysql2')->where('uid',$request->user_id)->where('currency','BTC')->first();

    		if(isset($balance->balance))
    		{
    			$balance->balance = number_format($balance->balance+$request->amount,8);
    			$balance->site_balance = number_format($balance->balance+$request->amount,8);
    			$balance->save();
    		}
    		else
    		{
    			$bal = new UserWallet;
    			$bal->setConnection('mysql2');
    			$bal->uid = $request->user_id;
    			$bal->currency = 'BTC';
    			$bal->escrow_balance = 0;
    			$bal->main_balance = 0;
    			$bal->site_balance = number_format($request->amount,8);
    			$bal->balance = number_format($request->amount,8);
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

        $user = User::on('mysql2')->where('id',$request->user_id)->first(); 
       
    	$details = array(
    			'status'=>$status,
    			'coin'=>'BTC',
    			'amount'=>$request->amount,
                'user' => $user->name 
    			); 
    	
    	Mail::to($user->email)->send(new DepositEmail($details));
    }


    public static function withdraw()
    {
    	$history = UserBtcTransaction::on('mysql2')->where('type','send')->orderBy('id','desc')->get();

    	return $history;
    }

    public static function withdrawEdit($id)
    {
    	$withdraw = UserBtcTransaction::on('mysql2')->where('id',$id)->first();

    	return $withdraw;
    } 

    public static function withdrawUpdate($request)
    {
    	$withdraw = UserBtcTransaction::on('mysql2')->where('id',$request->id)->first();

        if($request->status == 2)
        { 
            $balanceUpdate = UserWallet::on('mysql2')->where('uid',$withdraw->user_id)->where('currency','BTC')->first(); 
            $balanceUpdate->balance = $balanceUpdate->balance + $withdraw->total_amount;
            $balanceUpdate->site_balance = $balanceUpdate->site_balance + $withdraw->total_amount;
            $balanceUpdate->save(); 

            $withdraw->status = 2 ;
            $withdraw->save();

            $status = 'Cancel';

        }
        elseif($request->status == 1)
        {
            $withdraw->status = 1;
            $withdraw->save();
            
            $status = 'Accept'; 
        } 

        $user = User::on('mysql2')->where('id',$withdraw->user_id)->first(); 
       
        $details = array(
                'status'=>$status,
                'coin'=>'BTC',
                'amount'=>$withdraw->amount,
                'user' => $user->name 
                ); 
        
        Mail::to($user->email)->send(new WithdrawEmail($details));

        return 'Withdrawn status updated successfully';
    }

    public function user() {
        return $this->belongsTo('App\Models\User', 'user_id', 'id');
    }
    
}
