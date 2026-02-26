<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Mail\WithdrawEmail;

class UsersWithdraw extends Model
{
    protected $table = 'users_withdraws';
    protected $connection = 'mysql2';

      public static function histroy($type)
    {
    	$histroy = UsersWithdraw::on('mysql2')->where('coin_name', $type)->orderBy('created_at', 'desc')->paginate(15);

    	return $histroy;
    }


   public static function userhistroy($id)
    {
        $histroy = UsersWithdraw::on('mysql2')->where('user_id', $id)->orderBy('id', 'desc')->paginate(15);

        return $histroy;
    }


    public static function user_histroy($user_id)
    {
        $histroy = UsersWithdraw::on('mysql2')->where('user_id', $user_id)->orderBy('id', 'desc')->paginate(15);

        return $histroy;
    }



    public static function edit($id)
    {
    	$histroy = UsersWithdraw::on('mysql2')->where('id', $id)->first();
    	return $histroy;
    }

    public static function withdrawUpdate($request)
    {
        $id         = $request->id;
        $status     = $request->status;
        $currency   = $request->currency;
        $status1 = "";
        $deposit_data = UsersWithdraw::on('mysql2')->where('id', $request->id)->first();

        if($deposit_data)
        {
            $coin       = $deposit_data->coin_name;
            $amount     = $deposit_data->amount;
            $admin_fee  = $deposit_data->admin_fee;
            $uid        = $deposit_data->user_id;

            if($status == 3)
            {
                $user = UserWallet::on('mysql2')->where('uid',$deposit_data->user_id)->where('currency',$coin)->first();
                $return_amt         = ncAdd($amount,$admin_fee);
                $user->balance      = ncAdd($user->balance, $return_amt);
                $user->save();

                $status1 = 'Cancel';
            }
            else if($status == 2) {
                $status1 = 'Accept';
            }
            else if($status == 0) {
                $status1 = 'Waiting';
            }

            $deposit_data->status = $status;
            $deposit_data->save();

        }

        $user = User::on('mysql2')->where('id',$deposit_data->user_id)->first();


        $details = array(
            'status'    => $status1,
            'coin'      => $coin,
            'amount'    => $deposit_data->amount,
            'user'      => $user->name
        );

        \Mail::to($user->email)->send(new WithdrawEmail($details));

        return true;
    }
    public function user() {
        return $this->belongsTo('App\Models\User', 'user_id', 'id');
    }
}

