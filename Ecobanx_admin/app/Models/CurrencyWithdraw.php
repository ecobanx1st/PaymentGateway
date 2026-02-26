<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Mail; 
use App\Models\OverallTransaction;
use App\Mail\WithdrawEmail; 

class CurrencyWithdraw extends Model
{
	protected $table = 'withdraw_request';

    public static function histroy($type)
    {
    	$histroy = CurrencyWithdraw::on('mysql2')->where('type', $type)->orderBy('id', 'desc')->paginate(15);

    	return $histroy;
    }

     public static function user_histroy_fiat($id)
    {
        $histroy = CurrencyWithdraw::on('mysql2')->where('uid', $id)->orderBy('id', 'desc')->paginate(15);

        return $histroy;
    }

    public static function edit($id)
    {
    	$histroy = CurrencyWithdraw::on('mysql2')->where('id', $id)->first();

    	return $histroy;
    }

    public static function withdrawUpdate($request)
    {
        $id = $request->id;
        $status = $request->status;
        $currency = $request->currency;
        
        $deposit_data = CurrencyWithdraw::on('mysql2')->where('id', $request->id)->first();

        if($deposit_data)
        {
            $amount = $deposit_data->request_amount;
            $uid = $deposit_data->uid;

            if($status == 2)
            {
                $user = UserWallet::on('mysql2')->where('uid',$deposit_data->uid)->where('currency',$deposit_data->type)->first();
                $user->balance = $user->balance + $deposit_data->request_amount;
                $user->save();

                $status1 = 'Cancel'; 
            } else {
                $status1 = 'Accept'; 
                $user = UserWallet::on('mysql2')->where('uid',$deposit_data->uid)->where('currency',$deposit_data->type)->first();
                $oldbalance = $user->balance + $deposit_data->request_amount;
                OverallTransaction::AddTransaction($deposit_data->uid,$deposit_data->type,'Withdraw',0,$deposit_data->request_amount,$user->balance,$oldbalance,'Withdraw request Accepted','admin',$deposit_data->id);
            }

            $deposit_data->status = $status;
            $deposit_data->save();
            
        }

        $user = User::on('mysql2')->where('id',$deposit_data->uid)->first(); 
       
        $details = array(
            'status'=>$status1,
            'coin'=> $deposit_data->type,
            'amount'=>$deposit_data->request_amount,
            'user' => $user->name 
        ); 
        
        Mail::to($user->email)->send(new WithdrawEmail($details));

        return true;
    }
    public function user() {
        return $this->belongsTo('App\Models\User', 'uid', 'id');
    }
}
