<?php

namespace App\Http\Middleware;

use Closure;
use Auth;
use Session;
class TwoFaMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $user = Auth::user();        
        if($user->email_verify ==1)
        {
            if (\Session::get('otpstatus') == 1){
                    return $next($request);
            }else{               
                return redirect('/twofaverfication');
            }
        }
        else
        {
            Auth()->logout();
            return redirect('/login'); 
        }
    }
}
