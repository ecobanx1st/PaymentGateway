<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use Illuminate\Support\Facades\Redirect;
use App\Models\Admin;
use Session;

class AdminLoginController extends Controller
{
    public function login(LoginRequest $request)
    {
    	$login = Admin::login($request);
    	if($login)
    	{
        	Session::put('adminId',$login);
			Session::put('otpstatus', 1);
    		return Redirect('admin/dashboard');
    	}else{
            return Redirect('/')->with('error','Incorrect email or password!');
        }

    }

    public function logout()
    {
    	Session()->flush();
    	return redirect('/');
    }
}
