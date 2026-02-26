<?php

namespace App\Http\Middleware;

use Closure;
use Auth;
use App\Models\Admin;
use Session;
class twofaMiddleware
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
      
        $user_id = Session::get('adminId');
        $security = Admin::where('id',$user_id)->first();
        
        if(is_null($security))
        {
        return Redirect('/')->with('error','Incorrect email or password!');
        }else{
          $auth=\Session::get('otpstatus');
          if($auth==1){
          return $next($request);
          }else{
          return redirect('/admin/googe2faenable');
          }
        }
    }
}
