<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\User;

class WithdrawMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    protected $withdraw_amount;
    protected $currency;
    protected $ipaddr;

    public function __construct($withdraw_amount,$currency,$ipaddr)
    {
         $this->withdraw_amount = $withdraw_amount;
        $this->currency = $currency;
        $this->ipaddr = $ipaddr;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        //return $this->subject('Withdraw Confirmation')->view('email.withdrawMail');

        $user = User::where('id', \Auth::id())->first();
        return $this->markdown('email.withdrawMail')
                    ->with([
                        'username' => $user->name,
                        'userEmail' => $user->email,
                        'amount' => $this->withdraw_amount,
                        'currency' => $this->currency,                       
                        'ipaddr' => $this->ipaddr,                       
                        'signature' => '<p>Regards</p>CI Payment Trade Team'
                    ]);


    }
}
