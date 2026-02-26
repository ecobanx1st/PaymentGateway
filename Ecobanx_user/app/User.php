<?php

namespace App;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Mail;

class User extends Authenticatable  
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name','first_name','last_name','business_name','company_website', 'username','role','email', 'password','google2fa_secret','referral_id','parent_id',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function sendPasswordResetNotification($token){

        $data = [
            $this->email
        ];

        Mail::send('email.reset-password', [
            'fullname'      => $this->first_name.' '.$this->last_name,
            'reset_url'     => route('password.reset', ['token' => $token, 'email' => $this->email]),
        ], function($message) use($data){
            $message->subject('Reset Password Request');
            $message->to($data[0]);
        });
    }
    public static function getUserDetails($id){
        $data = User::where('id', $id)->first();
        return $data;
    }
}
