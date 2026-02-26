<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use App\Models\Admin;

class MustBeAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next, $guard = 'admin')
    {

        $admin = Admin::where('id', \Session::get('adminId'))->exists();

        if($admin > 0)
        {
            return $next($request);
        }

        return redirect('/');
        
    }
}
