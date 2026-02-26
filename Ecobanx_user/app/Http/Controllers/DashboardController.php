<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\User;
use App\Models\UsersApi;
use App\Models\UserLogin;
use App\Models\Kyc;

use Auth;
use Mail;
use App\Mail\SendOtpVerification;
use App\Traits\GoogleAuthenticator;

class DashboardController extends Controller
{
    use GoogleAuthenticator;

	public function __construct()
    {
        $this->middleware('auth');
    }

   	public function dashboard()
    {
        $user_id = Auth::user()->id;
        $security = User::where(['id' => $user_id, 'email_verify' => 1])->first();
        if(is_null($security))
        {
             auth()->logout();
            return back()->with('warning', 'You need to confirm your account. We have sent you an activation code, please check your email.');

        }
        elseif($security->status == 1)
        {
            auth()->logout();
            return back()->with('warning', 'Your account has been deactivated for the '. $security->reason);
        }
        elseif($security->twofa!=""){
            if($security->twofa == 'email_otp')
            {
                $user = Auth::user();
                $rand = rand(100000,999999);
                $security->profile_otp = $rand;
                $security->save();
                try
                {
                    \Session::flash('status', 'Check your email inbox/spam folder for verification code!');
                    Mail::to($user->email)->send(new SendOtpVerification($rand));
                    return redirect('twofaverfication');
                }
                catch (Exception $e)
                {
                    dd($e);
                }
            }elseif($security->twofa == 'google_otp'){
                if($security->google2fa_verify == 3){
                    \Session::put('otpstatus', 1);
                    return redirect('/trade');
                }else{
                    return redirect('/twofaverfication');
                }
            }else{
                \Session::put('otpstatus', 1);
                return redirect('/profile');
            }
        }
        else
        {
            \Session::put('otpstatus', 1);
            //return view('dashboard');
            return redirect('/dashboard');
        }

    }

    public function TwoFaEnable(){
        $kyc = "";
        $user = Auth::user();
        $login = UserLogin::where('user_id',$user->id)->orderBy('id','Desc')->first();
        $kyc = Kyc::where('uid',$user->id)->orderBy('id','desc')->first();

        return view('2faverification',['user'=>$user,'login' => $login,'kycdetail' => is_object($kyc) ? $kyc->status : ""]);
    }

    public function TwoFactorVerfication(){
        $user_id = Auth::user()->id;
        $security = User::where(['id' => $user_id, 'email_verify' => 1])->first();

       // dd($security->twofastatus);
        if(is_object($security)){
            if($security->status == 1){
                auth()->logout();
                return redirect('/login')->with('warning', 'Your account has been deactivated for the '. $security->reason);
            }elseif($security->twofa == 'google_otp' || $security->twofa == 'email_otp'){
                if($security->twofa == 'google_otp'){
                    $secret = $security->google2fa_secret;
                    if($security->google2fa_verify == 0 ){

                        $QR_Image = $this->getQRCodeGoogleUrl('paymentgatewaydemoment-('.$security->email.')', $secret);
                        return view('otp-googleauth',['image' => $QR_Image, 'secret' => $secret]);
                    }
                    else{
                        if($security->twofastatus == 1)
                        {
                           return view('otp-googleauth');
                        }
                        else{
                        \Session::put('otpstatus', 1);
                        return redirect('/userpanel');
                        }

                    }

                }elseif($security->twofa == 'email_otp'){

                      if($security->twofastatus == 1)
                        {

                            return view('otp-email');
                        }
                        else{
                        \Session::put('otpstatus', 1);
                        return redirect('/userpanel');
                        }

                }
            }else{
                \Session::put('otpstatus', 1);
                return redirect('/userpanel');
            }
        }
    }

    public function EnableGoogleAuth(){
        $user = Auth::user();
        $user->twofa = 'google_otp';
        $user->twofastatus = 1;
        $user->save();
        $QR_Image = "";

        if($user->google2fa_verify == 0){
            $secret = $user->google2fa_secret;
            $QR_Image = $this->getQRCodeGoogleUrl('paymentgatewaydemoment-('.$user->email.')', $secret);
            return view('otp-googleauth',['image' => $QR_Image, 'secret' => $secret]);
        }else{
            return back()->with('success', 'successfully enable google authenticator!');
        }
    }

    public function EnableEmail(){
        $user = Auth::user();
        $user->twofa = 'email_otp';
        $user->twofastatus = 1;
        $user->save();
        return back()->with('success', 'Successfully enable 2FA Code!');
    }

    public function DisableEmail(){
        $user = Auth::user();
        if($user->twofa = 'email_otp'){
            $user->twofastatus = 0;
            $user->save();
            return back()->with('sucess', 'Email OTP disable successfully!');
        }else{
            return back()->with('error', 'Something went wrong!');
        }
    }

    public function DisableGoogleAuth(){
        $user = Auth::user();
        if($user->twofa = 'google_otp'){
            $user->twofastatus = 0;
            $user->save();
            return back()->with('sucess', 'Google authenticator disable successfully!');
        }else{
            return back()->with('error', 'Something went wrong!');
        }
    }

    public function VerifyGoogleAuth(Request $request){
        $this->validate($request, [
            'code' => 'required|numeric'
        ]);

        $user = Auth::user();
        $secret = $user->google2fa_secret;
        $one_time_password = $request->code;
        $oneCode = $this->getCode($secret);
        $data = $this->verifyCode($secret, $one_time_password, 2);
        if($data){
            $user->google2fa_verify = 1;
            $user->save();
            \Session::put('otpstatus', 1);
            \Session::flash('activatedstatus', 'Successfully enabled 2FA.');
            return redirect('userpanel');
        }elseif ($user->google2fa_verify == 1) {
            return back()->with('error', 'Incorrect OTP!');
        } else {
            return back()->with('error','You entered wrong google code. Please scan above QR Code again!');
        }
    }

    public function VerifyEmail(Request $request){
        $this->validate($request, [
            'code' => 'required|numeric'
        ]);

        $user = Auth::user();
        $code = $request->code;
        if($user->profile_otp == $code){
            $user->profile_otp = rand(100000,999999);
            $user->save();
            \Session::put('otpstatus', 1);
            \Session::flash('activatedstatus', 'Successfully enabled 2FA.');
            return redirect('userpanel');
        }else {
            \Session::flash('error', 'Incorrect OTP!');
            return redirect('/twofaverfication');
        }
    }


      public function Ajaxapikeyshow()
        {
            $user_id = Auth::user()->id;
            $security = User::where(['id' => $user_id, 'email_verify' => 1])->first();
            if($security->twofa!=""){
                if($security->twofa == 'email_otp')
                {
                    $user = Auth::user();
                    $rand = rand(100000,999999);
                    $security->profile_otp = $rand;
                    $security->save();
                    try
                    {
                        Mail::to($user->email)->send(new SendOtpVerification($rand));
                        $data =1;

                    }
                    catch (Exception $e)
                    {
                        dd($e);

                    }

                }
                 return json_encode($data);

            }
        }

        public function Otpkeycheck(Request $request)
        {

            $user_id = Auth::user()->id;
            $security = User::where(['id' => $user_id, 'email_verify' => 1])->first();
            $user = Auth::user();
             $code =$request->OTPCode;
            $keyidencrypt =\Hashids::decode($request->keyidencrypt);
             if($security->twofa == 'email_otp')
            {
                    if($user->profile_otp == $code){
                         $user->profile_otp = rand(100000,999999);
                        $user->save();
                        $private_key = UsersApi::where('id',$keyidencrypt)->value('private_key');

                        $data = $private_key;

                    }
                    else
                    {
                            $data = false;
                    }
            }
            else
            {
                    $secret = $user->google2fa_secret;
                    $oneCode = $this->getCode($secret);
                    $data1 = $this->verifyCode($secret, $code, 2);
                    if($data1){

                         $private_key = UsersApi::where('id',$keyidencrypt)->value('private_key');

                        $data = $private_key;

                    }
                    else
                    {
                            $data = false;
                    }
            }


            return json_encode($data);


        }
}
