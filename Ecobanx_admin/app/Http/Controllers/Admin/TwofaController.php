<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Session;
use App\Models\Admin;
use Auth;
use App\Traits\GoogleAuthenticator;

class TwofaController extends Controller
{
    use GoogleAuthenticator;

    public function __construct()
    {
        $this->middleware('admin');
    }

    public function enableGoogleTwoFactor()
    {
        $user_id = Session::get('adminId');
        $user = Admin::where('id',$user_id)->first();

        if($user->google2fa_secret == ""){
            $secret = $this->createSecret();
            $user->google2fa_secret = $secret;
            $user->save();
        }else if($user->google2fa_verify==0){
            $secret = $user->google2fa_secret;
        }else{
            $secret = $user->google2fa_secret;
        }
        $sitename = seoUrl(config('app.name'));
        $QR_Image = $this->getQRCodeGoogleUrl($sitename.'_admin-('.$user->email.')', $secret);

        return view('qrcodeview', ['image' => $QR_Image, 'secret' => $secret, 'user' => $user]);
    
    }
    
  
    public function google_admin_verfiy(Request $request) 
    {
        $adminId = Session::get('adminId');
        $user = Admin::where('id', $adminId)->first();
        $secret = $user->google2fa_secret;
        $one_time_password = $request->input('otp');

        //dd($one_time_password);
        $data = $this->verifyCode($secret, $one_time_password, 3); 
        if($data)
        {
            \Session::put('otpstatus', 1);
            $user->google2fa_verify  = 1;
            $user->save();
            return redirect('/admin/dashboard');
        } 
        else 
        {
           return redirect('/admin/googe2faenable')->with('warning','Invalid OTP Please try again.');
        }
    }

}
