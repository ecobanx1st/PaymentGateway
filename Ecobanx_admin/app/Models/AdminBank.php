<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminBank extends Model
{
    protected $table = 'admin_bank_details';
    protected $connection = 'mysql2';

    public static function index($fiat)
    {
        $bank = AdminBank::on('mysql2')->where('coin',$fiat)->orderBy('id', 'desc')->get();
        
        return $bank;
    }

     public static function bankadd($request)
    {   
        if($request->coin !="" && $request->company_bank !="" )
        {
            $bank = new AdminBank(); 
            $bank->coin = $request->coin;
            $bank->account = $request->company_bank;
            $bank->save();
        }
    }


    public static function edit($id)
    {
        $bank = AdminBank::on('mysql2')->where('id',$id)->first(); 

        return $bank;
    }

    public static function bankUpdate($request)
    {   
        if($request->coin !="" && $request->company_bank !="" )
        {
            $bank = AdminBank::on('mysql2')->where('id',$request->id)->first(); 
            $bank->coin = $request->coin;
            $bank->account = $request->company_bank;
            $bank->save();
        }
    }
}
