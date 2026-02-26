<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\UserWallet;
use Illuminate\Support\Facades\Mail;
use App\Mail\DepositEmail; 

class CurrencyDeposit extends Model
{
	protected $table = 'deposits';

    public static function depsoitList($currency)
    {
    	$currency_trasnaction = CurrencyDeposit::on('mysql2')->where('currency', $currency)->orderBy('id', 'desc')->where([['currency', '=', $currency]])->paginate(10);

    	return $currency_trasnaction;
    }

    public static function fiatdepsoitList_user($uid)
    {
        $currency_trasnaction = CurrencyDeposit::on('mysql2')->where('uid', $uid)->orderBy('id', 'desc')->paginate(10);

        return $currency_trasnaction;
    }

    public static function edit($id)
    {
    	$currency_trasnaction = CurrencyDeposit::on('mysql2')->where('id', $id)->first();

    	return $currency_trasnaction;
    }

    public static function statusUpdate($request)
    {
    	$id = $request->id;
        $amount = $request->amount;
        $status = $request->status;
        $credit_amount = $request->credit_amount;
        
        $deposit_data = CurrencyDeposit::on('mysql2')->where('id', $id)->first();

        if($deposit_data)
        { 
            if($status == 1)
            {
                $updateBal = UserWallet::on('mysql2')->where('uid',$deposit_data->uid)->where('currency',$deposit_data->currency)->first();

                if(isset($updateBal->balance))
                {
                    $oldbalance  =  $updateBal->balance;
                    $updateBal->balance = ncAdd($updateBal->balance , $request->credit_amount); 
                    //$updateBal->site_balance = ncAdd($updateBal->site_balance , $request->credit_amount); 
                    $updateBal->save();
                    $walletbalance  =  $updateBal->balance;
                } else {
                    $oldbalance  =  0;
                    $balance = new UserWallet;
                    $balance->setConnection('mysql2');
                    $balance->uid = $deposit_data->uid;
                    $balance->currency = $deposit_data->currency;
                    $balance->balance = $request->credit_amount;
                    $balance->escrow_balance = 0;
                    //$balance->site_balance = $request->credit_amount;
                    $balance->save();
                    $walletbalance  =   $request->credit_amount;                    
                }                   

                $status1 = 'Accept'; 
                $uid = $deposit_data->uid;
                $currency = $deposit_data->currency;
                $amount = $deposit_data->credit_amount;              
                OverallTransaction::AddTransaction($uid,$currency,'Deposit',0,$amount,$walletbalance,$oldbalance,'Deposit request Accepted','admin',$deposit_data->id);                 
            } else {
                 $status1 = 'Cancel'; 
            }
            $deposit_data->credit_amount = $request->credit_amount;
            $deposit_data->status = $status;
            $deposit_data->save();

        }

        $user = User::on('mysql2')->where('id',$deposit_data->uid)->first(); 
       
        $details = array(
            'status'    => $status1,
            'coin'      => $deposit_data->currency,
            'amount'    => $deposit_data->credit_amount,
            'user'      => $user->name 
        ); 
        
        Mail::to($user->email)->send(new DepositEmail($details));

        return true;
    }
    
    public function user() {
        return $this->belongsTo('App\Models\User', 'uid', 'id');
    }
    
}
