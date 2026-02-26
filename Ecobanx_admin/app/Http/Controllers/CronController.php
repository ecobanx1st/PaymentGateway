<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Traits\BtcClass;
use App\Traits\LtcClass;
use App\Traits\EthClass;

class CronController extends Controller
{
    use BtcClass,LtcClass,EthClass;
    
    public function Btc_balance_update()
    {
        $users = User::where('is_logged',1)->get();
        foreach ($users as $user) {
            $dd = $this->btcUserTransactions($user->id);
            sleep(3);
        }
        echo "BTC balance updated successfully!";
    }
    public function Eth_balance_update()
    {
        $users = User::where('is_logged',1)->get();
        foreach ($users as $user) {
            $this->ethUserTransactions($user->id);
            sleep(3);
        }
        echo "ETH balance updated successfully!";
    }

    public function Ltc_balance_update()
    {
        $users = User::where('is_logged',1)->get();
        foreach ($users as $user) {
            $this->ltcUserTransactions($user->id);
            sleep(3);
        }
        echo "LTC balance updated successfully!";
    }

    public function sendtest(){
        $send   = $this->createUserEthTransaction(3,2.58626473);
        dd($send);        
    }

}
