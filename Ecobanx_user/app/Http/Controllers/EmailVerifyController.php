<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;
use Illuminate\Support\Facades\Crypt;
use Mail;
use Auth;
use App\Mail\EmailVerification;


class EmailVerifyController extends Controller
{
    public function sendEmailDone($email)
    {
        $email = \Crypt::decryptString($email);
    	$user = User::where(['email' => $email])->first();
        if($user)
        {
           User::where(['email' => $email])->update(['email_verify'=> 1,'email_verified_at' => date('Y-m-d H:i:s',time())]);
            \Session::flash('status', 'Your mail ID is now verified and account activated.Please sign in to get started');
            return redirect('login');
        } else {
            \Session::flash('status', 'Faild!. User Not Found');
            return redirect('register');
        }

    }
    public function registerSuccess()
    {
        Auth::logout();
        return view('auth.registersuccess');    
    }
     
}
