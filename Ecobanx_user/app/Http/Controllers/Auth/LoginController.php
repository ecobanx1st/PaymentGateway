<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use App\User;
use Auth;
use App\Models\UserLogin;
use Illuminate\Http\Request;
use Mail;
use Session;
use Illuminate\Support\Str;

class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = '/dashboard';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }
    /**
     * [reconfirm_account description]
     * @param  Request $request [description]
     * @return [type]           [return]
     */
    public function reconfirm_account($email) {
        $check = User::where('email', $email)->first();
        if ($check) {
            // $this->sendEmail($check);
            \Session::flash('status', 'You need to confirm your account. We have resent you an activation link, please check your email inbox/spam');
        } else {
            \Session::flash('error', 'Invalid email id, please check your email');
        }
        return redirect('/login');
    }
    protected function authenticated($request, $user){


        if($user->email_verify==1){

            if($user->referral_id == "" || $user->referral_id == NULL)
            {
                $ref ='FC'.\Str::random(8);
                User::where(['id'=> $user->id])->update(['referral_id' => $ref]);
            }

            // $ip =$request->getClientIp();
            // $ip1 = $_SERVER['REMOTE_ADDR'];


            // $details = json_decode(crul("http://ipinfo.io/{$ip1}/json"));

            // if(isset($details->country)){
            //     $location = $details->city.', '.$details->region.', '.$details->country;
            // }else{
            //     $location = "";
            // }

            //User login
            // $UserLogin = UserLogin::where(['user_id' => \Auth::id(),'login_ip' => $ip])->first();

            // if($UserLogin)
            // {
            //      $UserLogin->status = 1;
            //      $UserLogin->save();

            // }
            // else
            // {
            //     $data =array();
            //     $data['user_id'] =\Auth::id();
            //     $data['login_ip'] = $ip;
            //     $data['location'] = $location;
            //     $data['status'] = 1;
            //     UserLogin::attemptSave($data);
            // }
            $userupdate = User::where('id',\Auth::id())->first();
            // $userupdate->ipaddr = $ip;
            // $userupdate->location = $location;
            $userupdate->save();
            return redirect('/verify-access');

        }else{
            $email = $user->email;
            auth()->logout();
            $url = url('reconfirm_account') . '/' . $email;
            return back()->with('status', 'You need to confirm your account. We have sent you an activation link, please check your mail inbox / spam.To resend activation mail.' . '<a href="' . $url . '"> click here </a>');
        }
    }
    public function sendEmail($thisUser)
    {
        try {
            Mail::send('email.sendEmail', ['user' => $thisUser], function($message) use ($thisUser) {
                $message->subject("Account Activation");
                $message->to($thisUser['email']);
            });
        } catch (Exception $e){
        dd($e);
        }
    }

    public function logout(Request $request) {

        //User
        $user = Auth::user();

        $user->is_logged = 0;
        $user->updated_at = date('Y-m-d H:i:s',time());
        $user->save();

        //User api
        $userapi = UserLogin::where('user_id',$user->id)->first();
        if($userapi){
            $userapi->status = 0;
            $userapi->save();
        }

        Session::flush();

        Auth::logout();
      return redirect('/login');
    }
    protected function validateLogin(Request $request)
    {

        $this->validate($request, [
            'email' => 'required|email|max:120',
            'password' => 'required|string',
            'g-recaptcha-response' => 'required|captcha',
        ],[],[
            'g-recaptcha-response' => 'ReCaptcha',
        ]);

    }
}
