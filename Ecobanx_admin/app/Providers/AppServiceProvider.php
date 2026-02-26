<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Contracts\Auth\Guard;
use App\Models\Admin;
use App\Models\AdminProfile;
use View;
use Session;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot(Guard $guard)
    {
        View::composer('*', function($view) use($guard) {             
            $Admindetails = Admin::where('id',\Session::get('adminId'))->first();
            $AdminProfiledetails = AdminProfile::adminprofile();
            $view->with('Admindetails', $Admindetails)->with('AdminProfiledetails', $AdminProfiledetails);           
        });
        Schema::defaultStringLength(191);
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
